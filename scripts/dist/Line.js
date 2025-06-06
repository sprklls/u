import { globals } from './globals.js';
export class Line {
    constructor() {
        this.points = [];
        this.up = [];
        this.down = [];
        this.upbb = [[]];
        this.downbb = [[]];
    }
    addPoint(xVal, yVal) {
        this.points.push({ x: xVal, y: yVal });
        this.updatePerpendiculars(this.points.length - 1);
        // update the last point
        // it has to be at least 1 length, where it will try to update 0 which won't work
        // if it's 2 length it will try to update which we dont want
    }
    updatePerpendiculars(cur) {
        // console.log(this.points);
        // console.log(this.up);
        // console.log(this.down);
        // console.log(this.upbb);
        // console.log(this.downbb);
        let p0 = this.points[cur];
        if (cur == 0) { //  0
            this.up.push({ x: -1, y: -1 });
            this.down.push({ x: -1, y: -1 });
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
        let offsetDistance = Math.min(globals.constants.maxOffset, Math.max(globals.constants.minOffset, len * globals.constants.scaleFactor));
        let p0_up = { x: p0.x + px * offsetDistance, y: p0.y + py * offsetDistance };
        let p0_down = { x: p0.x - px * offsetDistance, y: p0.y - py * offsetDistance };
        this.up.push(p0_up);
        this.down.push(p0_down);
        // ---bb
        let offsetDistance2 = Math.min(globals.constants.maxOffset, Math.max(globals.constants.minOffset, len * globals.constants.scaleFactor) * 0.25); // magic number
        if (offsetDistance2 < 2) {
            this.upbb.push([]);
            this.downbb.push([]); ///its ok
        }
        else {
            let p0_up2 = { x: p0.x + px * offsetDistance2, y: p0.y + py * offsetDistance2 };
            let p0_down2 = { x: p0.x - px * offsetDistance2, y: p0.y - py * offsetDistance2 };
            this.upbb[this.upbb.length - 1].push(p0_up2);
            this.downbb[this.downbb.length - 1].push(p0_down2);
        }
    }
    drawLine() {
        if (this.points.length < 2)
            return;
        globals.constants.ctx.strokeStyle = "black";
        globals.constants.ctx.lineWidth = 2;
        globals.constants.ctx.beginPath();
        // globals.constants.ctx!.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 0; i < this.points.length; i++) {
            /*globals.constants.ctx!.lineTo(this.points[i].x, this.points[i].y);*/
            globals.constants.ctx.beginPath();
            globals.constants.ctx.arc(this.points[i].x, this.points[i].y, 2, 0, Math.PI * 2);
            globals.constants.ctx.fillStyle = "black";
            globals.constants.ctx.fill();
        }
        // globals.constants.ctx!.stroke();
    }
    fill_line() {
        if (!globals.constants.ctx) {
            console.error("CanvasRenderingContext2D is not initialized.");
            return;
        }
        globals.constants.ctx.fillStyle = globals.dependent.line_color;
        globals.constants.ctx.beginPath();
        let L = this.points.length;
        if (L <= 1)
            return;
        globals.constants.ctx.moveTo(this.points[0].x, this.points[0].y);
        let sd = 1;
        for (let i = sd; i < this.up.length - 1; i++) { // dont do the last one
            globals.constants.ctx.lineTo(this.up[i].x, this.up[i].y);
        }
        globals.constants.ctx.lineTo(this.points[L - 1].x, this.points[L - 1].y);
        for (let i = this.down.length - 2; i >= sd; i--) { // start from 2nd last
            globals.constants.ctx.lineTo(this.down[i].x, this.down[i].y);
        }
        globals.constants.ctx.lineTo(this.points[0].x, this.points[0].y);
        globals.constants.ctx.closePath();
        globals.constants.ctx.fill();
    }
    fill_linebb() {
        globals.constants.ctx.fillStyle = "rgb(254, 220, 126)";
        globals.constants.ctx.beginPath();
        let L = this.points.length;
        if (L <= 1)
            return;
        // For each chunk, draw the filled shape
        for (let i = 0; i < this.upbb.length; i++) {
            const upChunk = this.upbb[i];
            const downChunk = this.downbb[i];
            if (upChunk.length < 2)
                continue;
            let haventFoundFirstPoint = true;
            let avgX = 0, avgY = 0;
            let s = 2;
            // Up chunk (forward)
            for (let i = 0; i <= upChunk.length - s; i++) {
                if (haventFoundFirstPoint) {
                    avgX = (upChunk[i].x + downChunk[i].x) / 2;
                    avgY = (upChunk[i].y + downChunk[i].y) / 2;
                    globals.constants.ctx.moveTo(avgX, avgY);
                    haventFoundFirstPoint = false;
                    continue;
                }
                globals.constants.ctx.lineTo(upChunk[i].x, upChunk[i].y);
            }
            // Down chunk (reverse)
            let haventFoundFirstPoint2 = true;
            for (let i = downChunk.length - s; i >= 0; i--) { // -1 usual
                if (haventFoundFirstPoint2) {
                    const avgX2 = (upChunk[i].x + downChunk[i].x) / 2;
                    const avgY2 = (upChunk[i].y + downChunk[i].y) / 2;
                    globals.constants.ctx.lineTo(avgX2, avgY2);
                    haventFoundFirstPoint2 = false;
                    continue;
                }
                globals.constants.ctx.lineTo(downChunk[i].x, downChunk[i].y);
            }
            globals.constants.ctx.lineTo(avgX, avgY);
            globals.constants.ctx.closePath();
        }
        globals.constants.ctx.fill();
    }
    getPoints() {
        return this.points;
    }
    getUpPts() {
        return this.up;
    }
    getDownPts() {
        return this.down;
    }
    findLengthOfLine() {
        if (this.points.length <= 1)
            return 0;
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
