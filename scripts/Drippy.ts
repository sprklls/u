import { globals } from './globals.js';

export class Drip {
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
        this.vy = globals.constants.initV;
        this.slowdown = 0.99;
        this.minSpeed = 0.5;
        this.maxDrift = 20;
        this.isStopped = false;
    }
}


export class Dot {
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
        let context = globals.constants.ctx!;

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.color_override == null) context.fillStyle = globals.dependent.dot_color;
        else context.fillStyle = this.color_override;
        context.fill();
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