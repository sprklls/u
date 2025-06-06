import { globals } from './globals.js'; // browsers have to use js
import { Dot } from './Drippy.js';
export class AFC {
    constructor(centerpoint, type) {
        this.active = false;
        this.rad = Math.PI / 10;
        this.imgWidth = -1;
        this.imgHeight = -1;
        // public id = 0;
        this.IMG = new Image();
        this.hasLoaded = false;
        this.leftGlobal = null;
        this.rightGlobal = null;
        this.leftDot = null;
        this.rightDot = null;
        this.centerDot = null;
        this.centerpoint = centerpoint;
        this.type = type;
        // this.id = ++globalLayer; 
        this.loadAssetEtc();
    }
    loadAssetEtc() {
        this.IMG.src = this.type; // or your desired file path
        this.IMG.onload = () => {
            this.imgWidth = this.IMG.width;
            this.imgHeight = this.IMG.height;
            this.hasLoaded = true;
            this.updateBoundary();
        };
    }
    updateBoundary() {
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
            this.leftDot = new Dot(this.leftGlobal.x, this.leftGlobal.y, globals.constants.globalCircleRadius);
            this.rightDot = new Dot(this.rightGlobal.x, this.rightGlobal.y, globals.constants.globalCircleRadius);
            this.centerDot = new Dot(this.centerpoint.x, this.centerpoint.y, globals.constants.globalCircleRadius * 3);
            this.leftDot.setColor("rgb(150, 100, 255, 0.25)");
            this.rightDot.setColor("rgb(150, 100, 255, 0.25)");
            this.centerDot.setColor("rgb(150, 100, 255, 0.25)");
        }
        else {
            this.leftDot.setX(this.leftGlobal.x);
            this.leftDot.setY(this.leftGlobal.y);
            this.rightDot.setX(this.rightGlobal.x);
            this.rightDot.setY(this.rightGlobal.y);
            this.centerDot.setX(this.centerpoint.x);
            this.centerDot.setY(this.centerpoint.y);
        }
    }
    getType() {
        return this.type;
    }
    getCenterPoint() {
        return this.centerpoint;
    }
    setCenterPoint(point) {
        this.centerpoint = point;
        this.updateBoundary();
    }
    draw() {
        if (!globals.constants.ctx) {
            console.error("CanvasRenderingContext2D is not initialized.");
            return;
        }
        if (!this.hasLoaded)
            return;
        const imgWidth = this.IMG.width;
        const imgHeight = this.IMG.height;
        globals.constants.ctx.save();
        globals.constants.ctx.translate(this.centerpoint.x, this.centerpoint.y);
        globals.constants.ctx.rotate(this.rad);
        globals.constants.ctx.drawImage(this.IMG, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
        globals.constants.ctx.restore();
    }
    draw2() {
        if (this.leftGlobal && this.rightGlobal &&
            !isNaN(this.leftGlobal.x) && !isNaN(this.leftGlobal.y) &&
            !isNaN(this.rightGlobal.x) && !isNaN(this.rightGlobal.y)) {
            globals.constants.ctx.save();
            globals.constants.ctx.beginPath();
            globals.constants.ctx.moveTo(this.leftGlobal.x, this.leftGlobal.y);
            globals.constants.ctx.lineTo(this.rightGlobal.x, this.rightGlobal.y);
            globals.constants.ctx.strokeStyle = "red";
            globals.constants.ctx.lineWidth = 2;
            globals.constants.ctx.stroke();
            // if (this.leftDot) this.leftDot.draw();
            if (this.rightDot)
                this.rightDot.draw();
            if (this.centerDot)
                this.centerDot.draw();
            globals.constants.ctx.restore();
        }
        else {
            console.warn("skipped boundary, img hasn't loaded");
            console.log("Left Global: ", this.leftGlobal);
            console.log("Right Global: ", this.rightGlobal);
        }
    }
    setRad(r) {
        this.rad = r;
        this.updateBoundary();
    }
    getRad() {
        return this.rad;
    }
}
