/// <reference path="window.d.ts" />
import { AFC } from './AFC.js';
import { Line } from './Line.js';
import { Dot } from './Drippy.js';
import { Drip } from './Drippy.js';
import { globals } from './globals.js';
// the dom is already loaded
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d"); // not null assertion
globals.constants.ctx = ctx;
window.sharedData = window.sharedData || {};
window.sharedData.plasterIMG = document.getElementById('dropdownBtn').querySelector('img').src;
let mouseDown = false;
let all_lines = [];
let afc = [];
let simMode = 0;
let alldrips = [];
let dots = [];
ctx.lineJoin = "round";
ctx.lineCap = "round";
function math_sign(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
}
let currentLine = new Line();
function newLine() {
    currentLine = new Line(); // clear this var of the last reference
    all_lines.push(currentLine); // add the reference to the array
}
function dotsChecker() {
    for (let drip of alldrips) {
        if (!drip.isStopped) {
            drip.y += drip.vy;
            drip.vy *= drip.slowdown;
            const drift = (Math.random() - 0.5) * 1.2 * (drip.vy / globals.constants.initV);
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
function dripSortHelper(line) {
    let validSegments = [];
    const points = line.getPoints();
    if (line.getPoints().length <= 1)
        return validSegments;
    let currentgroup = [];
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
        if (!upPt || !downPt)
            continue;
        // calculate the distance between up and down points
        const dx = upPt.x - downPt.x;
        const dy = upPt.y - downPt.y;
        const width = Math.sqrt(dx * dx + dy * dy);
        if (width > 3) {
            currentgroup.push({ p0, p1 });
        }
        else {
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
function randomDripFinder(line) {
    let returnedPoints = [];
    let validSegments = dripSortHelper(line); // has to return it in that format anyway
    if (validSegments.length == 0) {
        return null;
    }
    ///// process valid segments
    for (let i = 0; i < validSegments.length; i++) {
        const seggroup = validSegments[i];
        let randomSegment;
        if (seggroup.length == 1) {
            randomSegment = seggroup[0];
        }
        else {
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
        let randomPoint = { x: randomX, y: interpolatedY };
        returnedPoints.push(randomPoint);
    }
    return returnedPoints;
}
function randomlyAddADrip() {
    const cur = all_lines.length > 0 ? all_lines[all_lines.length - 1] : null;
    if (!cur)
        return;
    const drip_pts = randomDripFinder(cur);
    if (drip_pts == null)
        return;
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
    if (!globals.constants.ctx) {
        throw new Error("CanvasRenderingContext2D is not initialized.");
    }
    animate();
};
function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}
//*** Canvas crap */
canvas.addEventListener("mouseout", (e) => {
    mouseDown = false;
});
let currentAFC = null;
let currentMode = null;
let originalDotCenter = null;
let initialMouseCenter = null;
function resetTheOtherOnes() {
    for (let i = 0; i < afc.length; i++) {
        if (!(afc[i] == currentAFC)) {
            afc[i].active = false;
        }
    }
}
canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    mouseDown = true;
    if (simMode == 0) {
        newLine();
    }
    else if (simMode == 1) {
        let pos = getPointerPos(e);
        let clickedSomething = false;
        for (let i = afc.length - 1; i >= 0; i--) {
            let item = afc[i];
            if (item.leftDot && item.leftDot.isTouching(pos)) {
                console.log("Touched left dot of AFC at", item.getCenterPoint());
                clickedSomething = true;
                /*
                currentAFC=item;
                currentAFC.active = true;
                */
                currentMode = "rotate-left"; // doesnt work rn
                resetTheOtherOnes();
                break;
            }
            else if (item.rightDot && item.rightDot.isTouching(pos)) {
                console.log("Touched right dot of AFC at", item.getCenterPoint());
                clickedSomething = true;
                currentAFC = item;
                currentAFC.active = true;
                currentMode = "rotate";
                resetTheOtherOnes();
                break;
            }
            else if (item.centerDot && item.centerDot.isTouching(pos)) {
                console.log("Touched center dot of AFC at", item.getCenterPoint());
                clickedSomething = true;
                currentAFC = item;
                currentAFC.active = true;
                currentMode = "center";
                resetTheOtherOnes();
                originalDotCenter = item.getCenterPoint(); // Save original dot position
                initialMouseCenter = pos; // Save initial mouse position
                break;
            }
        }
        if (!clickedSomething) {
            if (currentAFC) {
                currentAFC.active = false;
                currentAFC = null;
                currentMode = null;
            }
        }
    }
}, { passive: false });
canvas.addEventListener("pointerup", (e) => {
    e.preventDefault();
    mouseDown = false;
    if (simMode == 0) {
        randomlyAddADrip();
    }
    else if (simMode == 1) {
        currentMode = null;
    }
}, { passive: false });
let offsetX = 8;
let offsetY = -52;
document.body.style.cursor = "none";
function moveMouseImage({ x, y }) {
    if (simMode == 0) {
        const img = document.getElementById("cursor");
        img.style.position = "absolute";
        img.style.left = `${x + offsetX}px`;
        img.style.top = `${y + offsetY}px`;
    }
}
// window mousemove
window.addEventListener("pointermove", (e) => {
    e.preventDefault();
    let pos = getPointerPos(e);
    moveMouseImage(pos);
    if (!mouseDown)
        return;
    if (simMode == 0) {
        currentLine.addPoint(pos.x, pos.y);
    }
    else if (simMode == 1) {
        pmove(pos);
    }
}, { passive: false });
function pmove(pos) {
    if (currentAFC) {
        if (currentMode === "rotate") {
            const mouseX = pos.x;
            const mouseY = pos.y;
            const dx = mouseX - currentAFC.getCenterPoint().x;
            const dy = mouseY - currentAFC.getCenterPoint().y;
            const angle = Math.atan2(dy, dx);
            currentAFC.setRad(angle);
        }
        else if (currentMode === "center") {
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
function setCursorImg(s) {
    let cElement = document.getElementById("cursor");
    if (s) {
        document.body.style.cursor = "none";
        if (!cElement) {
            const img = document.createElement("img");
            img.src = s; // temporary fix..
            img.id = "cursor";
            img.style.position = "absolute";
            img.style.pointerEvents = "none";
            document.body.appendChild(img);
        }
        else {
            cElement.src = s;
        }
    }
    else if (s == null) {
        if (cElement) {
            cElement.remove();
            document.body.style.cursor = "pointer";
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b, _c, _d, _e, _f;
    (_a = document.getElementById("btn-e")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        simMode = 0; // it doesn't matter
        fadeDots();
    });
    (_b = document.getElementById("btn-f")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        simMode = 1;
        setCursorImg(null);
        afc.push(new AFC({ x: 100, y: 100 }, window.sharedData.plasterIMG));
    });
    (_c = document.getElementById("btn-a")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
        simMode = 0;
        setCursorImg("assets/cursor_icons/dithered.png");
        offsetX = 8;
        offsetY = -52;
        globals.constants.minOffset = 1;
        globals.constants.maxOffset = 5;
        globals.constants.scaleFactor = 0.05;
    });
    (_d = document.getElementById("btn-b")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
        setCursorImg("assets/cursor_icons/img2.png");
        simMode = 0;
        offsetX = 10;
        offsetY = 10;
        globals.constants.minOffset = 1;
        globals.constants.maxOffset = 30;
        globals.constants.scaleFactor = 0.4;
    });
    (_e = document.getElementById("btn-c")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
        setCursorImg("assets/cursor_icons/gat.png");
        simMode = 0;
        globals.constants.minOffset = 0.5;
        globals.constants.maxOffset = 5;
        globals.constants.scaleFactor = 0.01;
        offsetX = 0;
        offsetY = 0;
    });
    (_f = document.getElementById("btn-d")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
        setCursorImg("assets/cursor_icons/sharp.png");
        simMode = 0;
        globals.constants.minOffset = 0.5;
        globals.constants.maxOffset = 5;
        globals.constants.scaleFactor = 0.03;
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
        globals.dependent.dot_color = `rgba(255, 150, 150, ${alpha})`;
        if (iterations < maxIterations) {
            requestAnimationFrame(animateFade);
        }
        else {
            dots = [];
            globals.dependent.dot_color = "rgb(255, 150, 150)";
        }
    }
    animateFade();
}
function drawAfc() {
    for (let item of afc) {
        if (!(item instanceof AFC))
            continue; // Ensure item is of type AFC
        item.draw();
        if (item.active)
            item.draw2();
    }
}
function addAfc(point, type) {
    afc.push(new AFC(point, type));
}
