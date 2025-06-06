import { globals } from './globals.js';
export class Drip {
    constructor(x_ = 10, y_ = 10) {
        this.x = x_;
        this.startX = x_;
        this.y = y_;
        this.radius = 4;
        this.vy = globals.constants.initV;
        this.slowdown = 0.99;
        this.minSpeed = 0.5;
        this.maxDrift = 20;
        this.isStopped = false;
    }
}
export class Dot {
    constructor(x, y, radius) {
        this.color_override = null;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    setX(x) {
        this.x = x;
    }
    setY(y) {
        this.y = y;
    }
    draw() {
        let context = globals.constants.ctx;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.color_override == null)
            context.fillStyle = globals.dependent.dot_color;
        else
            context.fillStyle = this.color_override;
        context.fill();
    }
    setColor(s) {
        this.color_override = s;
    }
    isTouching({ x, y }) {
        const dx = this.x - x;
        const dy = this.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }
}
