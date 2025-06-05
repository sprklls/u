

// I LOVE TYPESCRIPT!!!!
// javascript is so ass

// ts declaration

// Math in ES6+

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const globalCircleRadius = 10;

const ctx = canvas.getContext("2d")!; // not null assertion
let mouseDown = false;
let minOffset = 1;  
let maxOffset = 5;
let scaleFactor = 0.05; 

let all_lines: Line[] = []; 
let dot_color = "rgb(255, 150, 150)"
let line_color = 'rgb(255, 150, 150)';

let afc: AFC[] = [];

let loadedAssets= false;

let simMode = 0;


let alldrips: Drip[] = [];
let dots: Dot[] = [];
ctx.lineJoin = "round";
ctx.lineCap = "round";
const initV = 2;

function math_sign(x: number): number {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
}

class AFC {
    public centerpoint: { x: number, y: number };
    public active = false;
    private type: string;
    private rad: number = Math.PI / 10;
    private imgWidth: number = -1;
    private imgHeight: number = -1;
    
    private IMG = new Image();

    public leftGlobal: { x: number, y: number } | null = null;
    public rightGlobal: { x: number, y: number } | null = null;

    public leftDot: Dot | null = null;
    public rightDot: Dot | null = null;
    public centerDot: Dot | null = null;

    constructor(centerpoint: { x: number, y: number }, type: string) {
        this.centerpoint = centerpoint;
        this.type = type;

        this.loadAssetEtc();
    }

    private loadAssetEtc(): void {
        if (this.type === "plaster") {

            this.IMG.src = "plaster.png"; // or your desired file path


            this.IMG.onload = () => {
                this.imgWidth = this.IMG.width;
                this.imgHeight = this.IMG.height;

                this.updateBoundary();
            } 

        } else {
            console.warn("Unknown AFC type: ", this.type);
        }
    }

    private updateBoundary(): void {

        const leftLocal = { x: -this.imgWidth / 2, y: 0 };
        const rightLocal = { x: this.imgWidth / 2, y: 0 };

        const sin = Math.sin(this.rad);
        const cos = Math.cos(this.rad);

        this.leftGlobal = {
            x: this.centerpoint.x + leftLocal.x * cos - leftLocal.y * sin,
            y: this.centerpoint.y + leftLocal.x * sin + leftLocal.y * cos
        };
        this.rightGlobal = {
            x: this.centerpoint.x + rightLocal.x * cos - rightLocal.y * sin,
            y: this.centerpoint.y + rightLocal.x * sin + rightLocal.y * cos
        };

        
        
        if (!this.leftDot || !this.rightDot || !this.centerDot) {
            this.leftDot = new Dot(this.leftGlobal.x, this.leftGlobal.y, globalCircleRadius);
            this.rightDot = new Dot(this.rightGlobal.x, this.rightGlobal.y, globalCircleRadius);
            this.centerDot = new Dot(this.centerpoint.x, this.centerpoint.y, globalCircleRadius*3);

            this.leftDot.setColor("rgb(150, 100, 255, 0.25)");
            this.rightDot.setColor("rgb(150, 100, 255, 0.25)");
            this.centerDot.setColor("rgb(150, 100, 255, 0.25)");

        } else {
            this.leftDot.setX(this.leftGlobal.x);
            this.leftDot.setY(this.leftGlobal.y);
            this.rightDot.setX(this.rightGlobal.x);
            this.rightDot.setY(this.rightGlobal.y);  
            this.centerDot.setX(this.centerpoint.x);
            this.centerDot.setY(this.centerpoint.y);    
        }

    }

    getType(): string {
        return this.type;
    }
    getCenterPoint(): { x: number, y: number } {
        return this.centerpoint;
    }
    setCenterPoint(point: { x: number, y: number }): void {
        this.centerpoint = point;
        this.updateBoundary();
    }   

    draw(ctx: CanvasRenderingContext2D): void {

        const imgWidth = this.IMG.width;
        const imgHeight = this.IMG.height;

        ctx.save();
        ctx.translate(this.centerpoint.x, this.centerpoint.y);
        ctx.rotate(this.rad); 

        ctx.drawImage(
            this.IMG,
            -imgWidth / 2,
            -imgHeight / 2,
            imgWidth,
            imgHeight
        );

        ctx.restore();  


    
    }

    draw2(ctx: CanvasRenderingContext2D): void {


        if ( this.leftGlobal && this.rightGlobal &&
            !isNaN(this.leftGlobal.x) && !isNaN(this.leftGlobal.y) &&
            !isNaN(this.rightGlobal.x) && !isNaN(this.rightGlobal.y)
        ) {  
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(this.leftGlobal.x, this.leftGlobal.y);
            ctx.lineTo(this.rightGlobal.x, this.rightGlobal.y);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.stroke();

            if (this.leftDot) this.leftDot.draw();
            if (this.rightDot) this.rightDot.draw();  
            if (this.centerDot) this.centerDot.draw();
            ctx.restore();

        } else {
            console.warn("skipped boundary, img hasn't loaded");
            console.log("Left Global: ", this.leftGlobal);
            console.log("Right Global: ", this.rightGlobal);
        }
    }

    setRad(r: number): void {
        this.rad = r;
        this.updateBoundary();
    }

    getRad(): number {
        return this.rad;
    }

}

class Dot {
    x: number;
    y: number;
    radius: number;
    
    public color_override : string | null = null;

    constructor(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    public setX(x: number): void {
        this.x = x;
    }

    public setY(y: number): void {
        this.y = y;
    }

    public draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.color_override == null) ctx.fillStyle = dot_color;
        else ctx.fillStyle = this.color_override;
        ctx.fill();
    }

    public setColor(s: string) {
        this.color_override = s;
    }

    public isTouching({x, y}: { x: number, y: number }): boolean {
        const dx = this.x - x;
        const dy = this.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }
}

class Drip {
    x: number;
    startX: number;
    y: number;
    radius: number;
    vy: number;
    slowdown: number;
    minSpeed: number;
    maxDrift: number;
    isStopped: boolean;

    constructor(x_ = 10, y_ = 10) {
        this.x = x_;
        this.startX = x_;
        this.y = y_;
        this.radius = 4;
        this.vy = initV;
        this.slowdown = 0.99;
        this.minSpeed = 0.5;
        this.maxDrift = 20;
        this.isStopped = false;
    }
}

class Line {
    private points: { x: number, y: number }[];
    private up: { x: number, y: number }[];
    private down: { x: number, y: number }[];

    private upbb: { x: number, y: number }[][];
    private downbb: { x: number, y: number }[][];

    constructor() {
        this.points = [];
        this.up = [];
        this.down = [];

        this.upbb = [[]];
        this.downbb = [[]];
    }

    public addPoint(xVal: number, yVal: number): void {
        //console.log(`Adding point: (${xVal}, ${yVal})`);
        this.points.push({x: xVal, y: yVal});

        this.updatePerpendiculars(this.points.length - 1);
        // update the last point

        // it has to be at least 1 length, where it will try to update 0 which won't work
        // if it's 2 length it will try to update which we dont want
    }

    private updatePerpendiculars(cur: number): void {    

        console.log(this.points);
        console.log(this.up);
        console.log(this.down);
        // console.log(this.upbb);
        // console.log(this.downbb);

        let p0 = this.points[cur];

        if (cur ==0 ) { //  0
            this.up.push({x: -1, y: -1});
            this.down.push({x: -1, y: -1});
            return;  
        }

        let p1 = this.points[cur - 1];
        
        let dx = p1.x - p0.x;
        let dy = p1.y - p0.y;

        let len = Math.sqrt(dx * dx + dy * dy);

        if (len < 0.0001) { // if the length is too small, skip
            console.warn("Skipping perpendicular calculation due to small length");
            return;
        }

        // normalize
        let nx = dx / len;
        let ny = dy / len;

        // perpendcular
        let px = -ny;
        let py = nx;

        let offsetDistance = Math.min(maxOffset, Math.max(minOffset, len * scaleFactor));

        let p0_up = { x: p0.x + px * offsetDistance, y: p0.y + py * offsetDistance };
        let p0_down = { x: p0.x - px * offsetDistance, y: p0.y - py * offsetDistance };


        this.up.push(p0_up);
        this.down.push(p0_down);

        // ---bb

        let offsetDistance2 = Math.min(maxOffset, Math.max(minOffset, len * scaleFactor) * 0.25); // magic number

        //console.log("offsetDistance2: ", offsetDistance2);

        if (offsetDistance2 < 2)  {
            this.upbb.push([]);
            this.downbb.push([]); ///its ok
        } else {

            let p0_up2 = { x: p0.x + px * offsetDistance2, y: p0.y + py * offsetDistance2 };

            let p0_down2 = { x: p0.x - px * offsetDistance2, y: p0.y - py * offsetDistance2 };

          
            this.upbb[this.upbb.length - 1].push(p0_up2);
            this.downbb[this.downbb.length - 1].push(p0_down2);  
        }

    }  

    public drawLine(): void {
        if (this.points.length < 2) return;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        // ctx.moveTo(this.points[0].x, this.points[0].y);

        
        for (let i = 0; i < this.points.length; i++) {
            /*ctx.lineTo(this.points[i].x, this.points[i].y);*/
            ctx.beginPath();
            ctx.arc(this.points[i].x, this.points[i].y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
        }

        // ctx.stroke();
    }



    public fill_line() {
        ctx.fillStyle = line_color;
        ctx.beginPath();

        let L = this.points.length;

        if (L  <= 1) return; 


        ctx.moveTo(this.points[0].x, this.points[0].y);

        let sd =1;
    
        for (let i = sd; i < this.up.length - 1; i++) { // dont do the last one
        

            ctx.lineTo(this.up[i].x, this.up[i].y); 
        }

        ctx.lineTo(this.points[L - 1].x, this.points[L - 1].y);
    
        for (let i = this.down.length - 2 ; i >= sd; i--) { // start from 2nd last

            ctx.lineTo(this.down[i].x,this.down[i].y); 
        }

        ctx.lineTo(this.points[0].x, this.points[0].y);
    
        ctx.closePath();
        ctx.fill();
    }

    public fill_linebb() {
        ctx.fillStyle = "rgb(254, 220, 126)";
        ctx.beginPath();

        let L = this.points.length;
        if (L <= 1) return;


        // For each chunk, draw the filled shape
        for (let i = 0; i < this.upbb.length; i++) {
            const upChunk = this.upbb[i];
            const downChunk = this.downbb[i];

            if (upChunk.length < 2) continue;

            let haventFoundFirstPoint = true;
            let avgX = 0, avgY = 0;
            let s = 2;

            // Up chunk (forward)
            for (let i = 0; i <= upChunk.length - s; i++) {
                if (haventFoundFirstPoint) {
                    avgX = (upChunk[i].x + downChunk[i].x) / 2;
                    avgY = (upChunk[i].y + downChunk[i].y) / 2;
                    ctx.moveTo(avgX, avgY);
                    haventFoundFirstPoint = false;
                    continue;
                }
                ctx.lineTo(upChunk[i].x, upChunk[i].y);
            }

            // Down chunk (reverse)
            let haventFoundFirstPoint2 = true;

  

            for (let i = downChunk.length - s; i >= 0; i--) { // -1 usual
                if (haventFoundFirstPoint2) {
                    const avgX2 = (upChunk[i].x + downChunk[i].x) / 2;
                    const avgY2 = (upChunk[i].y + downChunk[i].y) / 2;
                    ctx.lineTo(avgX2, avgY2);
                    haventFoundFirstPoint2 = false;
                    continue;
                }
                ctx.lineTo(downChunk[i].x, downChunk[i].y);
            }

            ctx.lineTo(avgX, avgY);
            ctx.closePath();
        }

        ctx.fill();
    }



    public getPoints() {
        return this.points;
    }

    public getUpPts() {
        return this.up;
    }

    public getDownPts() {
        return this.down;
    }


    public findLengthOfLine(): number {
        if (this.points.length <= 1) return 0; 
    
        let totalLength = 0;
    
        for (let i = 1; i < this.points.length; i++) {
            const p0 = this.points[i - 1];
            const p1 = this.points[i];
    
            const dx = p1.x - p0.x;
            const dy = p1.y - p0.y;
    
            totalLength += Math.sqrt(dx * dx + dy * dy); 
        }
        return totalLength;
    }
      


}

let currentLine: Line = new Line();

function newLine() {
    currentLine = new Line(); // clear this var of the last reference
    all_lines.push(currentLine); // add the reference to the array
} 

function dotsChecker() {   
    for (let drip of alldrips) {

        if (!drip.isStopped) {
            drip.y += drip.vy;
            drip.vy *= drip.slowdown;
        
            const drift = (Math.random() - 0.5) * 1.2 * (drip.vy / initV);
        
            drip.x += drift;
        
            // uh
            const dx = drip.x - drip.startX;
            if (Math.abs(dx) > drip.maxDrift) {
              drip.x = drip.startX + math_sign(dx) * drip.maxDrift;
            }
        
            if (drip.vy < drip.minSpeed) {
              drip.isStopped = true;
            }
        
            // initialize dots
            let dot = new Dot(drip.x, drip.y, drip.radius);
        
              dots.push(dot);
          }
        
          if (dots.length > 500) {
            dots.shift(); // keep the array size manageable
          } // what??  
    }

    
    
}

/** returns a bunch of values where you drip */
function dripSortHelper(line: Line): 
{
    p0: { x: number, y: number }, 
    p1: { x: number, y: number } 
}[][] 

{

    let validSegments: { p0: { x: number, y: number }, p1: { x: number, y: number } }[][] = [];

    const points = line.getPoints();
    if (line.getPoints().length <= 1) return validSegments;


    let currentgroup: { p0: { x: number, y: number }, p1: { x: number, y: number } }[] = [];

    for (let i = 2; i < points.length - 1; i++) {
        // skip the first and last point

        const pointsArr = line.getPoints();
        const p0 = pointsArr[i - 1];
        const p1 = pointsArr[i];

        // find the corresponding index in up and down arrays (use i-1)
        // cuz line could be                   [a a a a a]
        // but the updown segments are just      [a a a]
        const upPt = line.getUpPts()[i - 1];
        const downPt = line.getDownPts()[i - 1];
        if (!upPt || !downPt) continue;

        // calculate the distance between up and down points
        const dx = upPt.x - downPt.x;
        const dy = upPt.y - downPt.y;
        const width = Math.sqrt(dx * dx + dy * dy);
    
        if (width >3) { 
            currentgroup.push({ p0, p1 });

        } else {
            if (currentgroup.length > 0) {
                validSegments.push(currentgroup);
                currentgroup = []; // clear it out for the next one
            }
        }
    }

    // leftover group, if all the way till the end, segments are all valid
    if (currentgroup.length > 0) {
        validSegments.push(currentgroup);
    }

    return validSegments;
}

function randomDripFinder(line: Line): { x: number, y: number }[]  | null{

    let returnedPoints: { x: number, y: number }[] = [];

    let validSegments: 
    { 
        p0: { x: number, y: number }, 
        p1: { x: number, y: number } 
    }[][] = dripSortHelper(line); // has to return it in that format anyway

    if (validSegments.length == 0) {
        //console.log("nothing to bleed");
        return null; 
    }

    ///// process valid segments

    for (let i = 0; i < validSegments.length; i++) {
        const seggroup = validSegments[i];

        let randomSegment: { p0: { x: number, y: number }, p1: { x: number, y: number } };

        if (seggroup.length == 1) {
            randomSegment = seggroup[0];

        }  else {
            randomSegment = seggroup[Math.floor(Math.random() * seggroup.length)];
        }
        
        const minX = Math.min(randomSegment.p0.x, randomSegment.p1.x);
        const maxX = Math.max(randomSegment.p0.x, randomSegment.p1.x);

        // Avoid division by zero for vertical segments
        if (maxX === minX) {
            // For vertical segments, interpolate y between p0 and p1
            const minY = Math.min(randomSegment.p0.y, randomSegment.p1.y);
            const maxY = Math.max(randomSegment.p0.y, randomSegment.p1.y);
            const randomY = minY + Math.random() * (maxY - minY);
            returnedPoints.push({ x: minX, y: randomY });
            continue;
        }

        const randomX = minX + Math.random() * (maxX - minX);

        const dx = randomSegment.p1.x - randomSegment.p0.x;
        const dy = randomSegment.p1.y - randomSegment.p0.y;
        const slope = dy / dx;

        const interpolatedY = randomSegment.p0.y + slope * (randomX - randomSegment.p0.x);
        let randomPoint = { x: randomX, y: interpolatedY }

        returnedPoints.push(randomPoint);
    }
    
    return returnedPoints;
}

function randomlyAddADrip() {

    const cur = all_lines.length > 0 ? all_lines[all_lines.length - 1] : null;
    if (!cur) return;

    const drip_pts = randomDripFinder(cur);
    if (drip_pts == null) return; 

    for (let pair of drip_pts) {
        alldrips.push(new Drip(pair.x, pair.y));
    }
}


function animate() {
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // updating and drawing each Line
    for (const line of all_lines) {

        line.fill_line();
       // line.drawLine(); 
    }

    for (const line of all_lines) {

        line.fill_linebb();
       // line.drawLine(); 
    }


    for (const dot of dots) {
        dot.draw();
    }
    
    dotsChecker();
    drawAfc();
}

// mouse detector

//** start animation */
window.onload = () => {
    animate();
    //console.log("canvas loaded");
};
    
//*** Canvas crap */
canvas.addEventListener("mouseout", (e) => {
    mouseDown = false;

});

canvas.addEventListener("mousemove", (e) => {
    let pos = getMousePos(e);
    if (!mouseDown) return;

    if (simMode == 0) {
        currentLine.addPoint(pos.x, pos.y);
    }

});


let currentAFC: AFC | null = null;
let currentMode: string | null = null;

let originalDotCenter: { x: number, y: number } | null = null;
let initialMouseCenter: { x: number, y: number } | null = null;

canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;

    if (simMode == 0) {
        newLine();

    } else if (simMode == 1) {
        let pos = getMousePos(e);

        let reset = true;

        if (currentAFC) {
            let item = currentAFC;
            if (item.leftDot && item.leftDot.isTouching(pos)) {
                console.log("Touched left dot of AFC at", item.getCenterPoint());
                reset = false;

                currentMode = "rotate-left"; // doesnt work rn

            }
            else if (item.rightDot && item.rightDot.isTouching(pos)) {
                console.log("Touched right dot of AFC at", item.getCenterPoint());
                reset = false;

                currentMode = "rotate";

            } 
            else if (item.centerDot && item.centerDot.isTouching(pos)) {
                console.log("Touched center dot of AFC at", item.getCenterPoint());
                reset = false;

                currentMode = "center";

                originalDotCenter = item.getCenterPoint(); // Save original dot position
                initialMouseCenter = pos; // Save initial mouse position

            }
        } else {

            for (let item of afc) {
                if (item.centerDot && item.centerDot.isTouching(pos)) {
                    console.log("Touched center dot of AFC at", item.getCenterPoint());
                    reset = false;

                    currentAFC=item;
                    currentAFC.active = true;
        
                }
            }
        }

        if (reset == true) {
            if (currentAFC) {
                currentAFC.active = false;
                currentAFC = null;
                currentMode = null;
            }
        }
    }

    // let pos = getMousePos(e);
    // currentLine.addPoint(pos.x, pos.y);
    ////console.log("mouse down at: ", pos.x, pos.y);
});


canvas.addEventListener("mouseup", (e) => {
    mouseDown = false;

    if (simMode == 0) {
        randomlyAddADrip();
    } else if (simMode == 1) {
        currentMode = null;
    }

    ////console.log("new line created");

});

function getMousePos(event: MouseEvent): { x: number, y: number } {
    const rect = canvas.getBoundingClientRect(); // Get the canvas's bounding box
    return {
        x: event.clientX - rect.left, // Mouse X relative to the canvas
        y: event.clientY - rect.top  // Mouse Y relative to the canvas
    };
}

let offsetX = 8;
let offsetY = -52;

document.body.style.cursor = "none";

function moveMouseImage({ x, y }: { x: number, y: number }): void {
    if (simMode == 0) {
        const img = (document.getElementById("cursor") as HTMLImageElement)!; 

        img.style.position = "absolute";
        img.style.left = `${x + offsetX}px`;
        img.style.top = `${y + offsetY}px`;
    }
}

// window mousemove
window.addEventListener("mousemove", (e) => {
    let pos = getMousePos(e);

    moveMouseImage(pos);

    if (simMode == 1) {
        if (currentAFC) {
            if (currentMode === "rotate") {
                const mouseX = pos.x;
                const mouseY = pos.y;

                const dx = mouseX - currentAFC.getCenterPoint().x;
                const dy = mouseY - currentAFC.getCenterPoint().y;

                const angle = Math.atan2(dy, dx);
                currentAFC.setRad(angle);

            } else if (currentMode === "center") {
                /*
                currentAFC.setCenterPoint({ x: pos.x, y: pos.y });
                */

                if (originalDotCenter && initialMouseCenter) {
                    // Calculate offset
                    const offsetX = pos.x - initialMouseCenter.x;
                    const offsetY = pos.y - initialMouseCenter.y;

                    // Apply offset to center position
                    currentAFC.setCenterPoint({
                        x: originalDotCenter.x + offsetX,
                        y: originalDotCenter.y + offsetY,
                    });
                }
            }
        }
    }
});



function setCursorImg(s: string | null): void {

    let cElement = document.getElementById("cursor");
    
    if (s) {
        document.body.style.cursor = "none";

        if (!cElement) {
            const img: HTMLImageElement = document.createElement("img");
            img.src = s;
            img.id = "cursor";
            img.style.position = "absolute";
            img.style.pointerEvents = "none"; 

            document.body.appendChild(img); 
        } else {
            (cElement as HTMLImageElement).src = s;
        }

    } else if (s == null) {


        if (cElement) {
            cElement.remove();
            document.body.style.cursor = "pointer";
        }
    }
}



document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("btn-e")?.addEventListener("click", () => {
        simMode = 0; // it doesn't matter
        fadeDots();
     }); 

    document.getElementById("btn-f")?.addEventListener("click", () => {

        simMode = 1;
        setCursorImg(null);

        // plaster cursor


        afc.push(new AFC({ x: 100, y: 100 }, "plaster"));
        //console.log("added plaster at 100, 100");
    });

    document.getElementById("btn-a")?.addEventListener("click", () => {
        simMode = 0;
        setCursorImg("dithered.png");

        offsetX = 8;
        offsetY = -52;

        minOffset = 1;  
        maxOffset = 5;
        scaleFactor = 0.05; 
    });

    document.getElementById("btn-b")?.addEventListener("click", () => {
        setCursorImg("img2.png");
        simMode = 0;

        offsetX = 10;
        offsetY = 10;

        minOffset = 1;  
        maxOffset = 30;
        scaleFactor = 0.4; 
    });

    document.getElementById("btn-c")?.addEventListener("click", () => {
        setCursorImg("gat.png");
        simMode = 0;
        //console.log("cat image set");

        minOffset = 0.5;  
        maxOffset = 5;
        scaleFactor = 0.01; 

        offsetX = 0;
        offsetY = 0;
    }); 

    document.getElementById("btn-d")?.addEventListener("click", () => {
        setCursorImg("sharp.png");
        simMode = 0;

        minOffset = 0.5;  
        maxOffset = 5;
        scaleFactor = 0.03; 

        offsetX = 7;
        offsetY = -7;

    }); 
});

// copilot wanted linear interp so yea
function fadeDots() {
    let iterations = 0;
    let maxIterations = 30;
    let startAlpha = 1;
    let endAlpha = 0;

    function animateFade() {
        iterations++;
        let t = Math.min(iterations / maxIterations, 1);

        let alpha = startAlpha + (endAlpha - startAlpha) * t;
        dot_color = `rgba(255, 150, 150, ${alpha})`;

        if (iterations < maxIterations) {
            requestAnimationFrame(animateFade);

        } else {
            dots = [];
            dot_color = "rgb(255, 150, 150)";
        }
    }

        animateFade();

}

function drawAfc() {
    for (let item of afc) {
        if (!(item instanceof AFC)) continue; // Ensure item is of type AFC
        item.draw(ctx);

        if (item.active) item.draw2(ctx);
    }
}

function addAfc(point: { x: number, y: number }, type: string) {
    afc.push(new AFC(point, type));
    //console.log(`Added AFC of type ${type} at (${point.x}, ${point.y})`);
}

