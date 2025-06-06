"use strict";
// I LOVE TYPESCRIPT!!!!
// javascript is so ass
// ts declaration
var canvas = document.getElementById("canvas");
var globalCircleRadius = 10;
window.sharedData = window.sharedData || {};
window.sharedData.plasterIMG = document.getElementById('dropdownBtn').querySelector('img').src;
// let globalLayer = 0;
var ctx = canvas.getContext("2d"); // not null assertion
var mouseDown = false;
var minOffset = 1;
var maxOffset = 5;
var scaleFactor = 0.05;
var all_lines = [];
var dot_color = "rgb(255, 150, 150)";
var line_color = 'rgb(255, 150, 150)';
var afc = [];
var loadedAssets = false;
var simMode = 0;
var alldrips = [];
var dots = [];
ctx.lineJoin = "round";
ctx.lineCap = "round";
var initV = 2;
function math_sign(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
}
var AFC = /** @class */ (function () {
    function AFC(centerpoint, type) {
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
    AFC.prototype.loadAssetEtc = function () {
        var _this = this;
        this.IMG.src = this.type; // or your desired file path
        this.IMG.onload = function () {
            _this.imgWidth = _this.IMG.width;
            _this.imgHeight = _this.IMG.height;
            _this.hasLoaded = true;
            _this.updateBoundary();
        };
    };
    AFC.prototype.updateBoundary = function () {
        var leftLocal = { x: -this.imgWidth / 2, y: 0 };
        var rightLocal = { x: this.imgWidth / 2, y: 0 };
        var sin = Math.sin(this.rad);
        var cos = Math.cos(this.rad);
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
            this.centerDot = new Dot(this.centerpoint.x, this.centerpoint.y, globalCircleRadius * 3);
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
    };
    AFC.prototype.getType = function () {
        return this.type;
    };
    AFC.prototype.getCenterPoint = function () {
        return this.centerpoint;
    };
    AFC.prototype.setCenterPoint = function (point) {
        this.centerpoint = point;
        this.updateBoundary();
    };
    AFC.prototype.draw = function (ctx) {
        if (!this.hasLoaded)
            return;
        var imgWidth = this.IMG.width;
        var imgHeight = this.IMG.height;
        ctx.save();
        ctx.translate(this.centerpoint.x, this.centerpoint.y);
        ctx.rotate(this.rad);
        ctx.drawImage(this.IMG, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
        ctx.restore();
    };
    AFC.prototype.draw2 = function (ctx) {
        if (this.leftGlobal && this.rightGlobal &&
            !isNaN(this.leftGlobal.x) && !isNaN(this.leftGlobal.y) &&
            !isNaN(this.rightGlobal.x) && !isNaN(this.rightGlobal.y)) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(this.leftGlobal.x, this.leftGlobal.y);
            ctx.lineTo(this.rightGlobal.x, this.rightGlobal.y);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.stroke();
            if (this.leftDot)
                this.leftDot.draw();
            if (this.rightDot)
                this.rightDot.draw();
            if (this.centerDot)
                this.centerDot.draw();
            ctx.restore();
        }
        else {
            console.warn("skipped boundary, img hasn't loaded");
            console.log("Left Global: ", this.leftGlobal);
            console.log("Right Global: ", this.rightGlobal);
        }
    };
    AFC.prototype.setRad = function (r) {
        this.rad = r;
        this.updateBoundary();
    };
    AFC.prototype.getRad = function () {
        return this.rad;
    };
    return AFC;
}());
var Dot = /** @class */ (function () {
    function Dot(x, y, radius) {
        this.color_override = null;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    Dot.prototype.setX = function (x) {
        this.x = x;
    };
    Dot.prototype.setY = function (y) {
        this.y = y;
    };
    Dot.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.color_override == null)
            ctx.fillStyle = dot_color;
        else
            ctx.fillStyle = this.color_override;
        ctx.fill();
    };
    Dot.prototype.setColor = function (s) {
        this.color_override = s;
    };
    Dot.prototype.isTouching = function (_a) {
        var x = _a.x, y = _a.y;
        var dx = this.x - x;
        var dy = this.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    };
    return Dot;
}());
var Drip = /** @class */ (function () {
    function Drip(x_, y_) {
        if (x_ === void 0) { x_ = 10; }
        if (y_ === void 0) { y_ = 10; }
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
    return Drip;
}());
var Line = /** @class */ (function () {
    function Line() {
        this.points = [];
        this.up = [];
        this.down = [];
        this.upbb = [[]];
        this.downbb = [[]];
    }
    Line.prototype.addPoint = function (xVal, yVal) {
        this.points.push({ x: xVal, y: yVal });
        this.updatePerpendiculars(this.points.length - 1);
        // update the last point
        // it has to be at least 1 length, where it will try to update 0 which won't work
        // if it's 2 length it will try to update which we dont want
    };
    Line.prototype.updatePerpendiculars = function (cur) {
        console.log(this.points);
        console.log(this.up);
        console.log(this.down);
        // console.log(this.upbb);
        // console.log(this.downbb);
        var p0 = this.points[cur];
        if (cur == 0) { //  0
            this.up.push({ x: -1, y: -1 });
            this.down.push({ x: -1, y: -1 });
            return;
        }
        var p1 = this.points[cur - 1];
        var dx = p1.x - p0.x;
        var dy = p1.y - p0.y;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len < 0.0001) { // if the length is too small, skip
            console.warn("Skipping perpendicular calculation due to small length");
            return;
        }
        // normalize
        var nx = dx / len;
        var ny = dy / len;
        // perpendcular
        var px = -ny;
        var py = nx;
        var offsetDistance = Math.min(maxOffset, Math.max(minOffset, len * scaleFactor));
        var p0_up = { x: p0.x + px * offsetDistance, y: p0.y + py * offsetDistance };
        var p0_down = { x: p0.x - px * offsetDistance, y: p0.y - py * offsetDistance };
        this.up.push(p0_up);
        this.down.push(p0_down);
        // ---bb
        var offsetDistance2 = Math.min(maxOffset, Math.max(minOffset, len * scaleFactor) * 0.25); // magic number
        if (offsetDistance2 < 2) {
            this.upbb.push([]);
            this.downbb.push([]); ///its ok
        }
        else {
            var p0_up2 = { x: p0.x + px * offsetDistance2, y: p0.y + py * offsetDistance2 };
            var p0_down2 = { x: p0.x - px * offsetDistance2, y: p0.y - py * offsetDistance2 };
            this.upbb[this.upbb.length - 1].push(p0_up2);
            this.downbb[this.downbb.length - 1].push(p0_down2);
        }
    };
    Line.prototype.drawLine = function () {
        if (this.points.length < 2)
            return;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        // ctx.moveTo(this.points[0].x, this.points[0].y);
        for (var i = 0; i < this.points.length; i++) {
            /*ctx.lineTo(this.points[i].x, this.points[i].y);*/
            ctx.beginPath();
            ctx.arc(this.points[i].x, this.points[i].y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
        }
        // ctx.stroke();
    };
    Line.prototype.fill_line = function () {
        ctx.fillStyle = line_color;
        ctx.beginPath();
        var L = this.points.length;
        if (L <= 1)
            return;
        ctx.moveTo(this.points[0].x, this.points[0].y);
        var sd = 1;
        for (var i = sd; i < this.up.length - 1; i++) { // dont do the last one
            ctx.lineTo(this.up[i].x, this.up[i].y);
        }
        ctx.lineTo(this.points[L - 1].x, this.points[L - 1].y);
        for (var i = this.down.length - 2; i >= sd; i--) { // start from 2nd last
            ctx.lineTo(this.down[i].x, this.down[i].y);
        }
        ctx.lineTo(this.points[0].x, this.points[0].y);
        ctx.closePath();
        ctx.fill();
    };
    Line.prototype.fill_linebb = function () {
        ctx.fillStyle = "rgb(254, 220, 126)";
        ctx.beginPath();
        var L = this.points.length;
        if (L <= 1)
            return;
        // For each chunk, draw the filled shape
        for (var i = 0; i < this.upbb.length; i++) {
            var upChunk = this.upbb[i];
            var downChunk = this.downbb[i];
            if (upChunk.length < 2)
                continue;
            var haventFoundFirstPoint = true;
            var avgX = 0, avgY = 0;
            var s = 2;
            // Up chunk (forward)
            for (var i_1 = 0; i_1 <= upChunk.length - s; i_1++) {
                if (haventFoundFirstPoint) {
                    avgX = (upChunk[i_1].x + downChunk[i_1].x) / 2;
                    avgY = (upChunk[i_1].y + downChunk[i_1].y) / 2;
                    ctx.moveTo(avgX, avgY);
                    haventFoundFirstPoint = false;
                    continue;
                }
                ctx.lineTo(upChunk[i_1].x, upChunk[i_1].y);
            }
            // Down chunk (reverse)
            var haventFoundFirstPoint2 = true;
            for (var i_2 = downChunk.length - s; i_2 >= 0; i_2--) { // -1 usual
                if (haventFoundFirstPoint2) {
                    var avgX2 = (upChunk[i_2].x + downChunk[i_2].x) / 2;
                    var avgY2 = (upChunk[i_2].y + downChunk[i_2].y) / 2;
                    ctx.lineTo(avgX2, avgY2);
                    haventFoundFirstPoint2 = false;
                    continue;
                }
                ctx.lineTo(downChunk[i_2].x, downChunk[i_2].y);
            }
            ctx.lineTo(avgX, avgY);
            ctx.closePath();
        }
        ctx.fill();
    };
    Line.prototype.getPoints = function () {
        return this.points;
    };
    Line.prototype.getUpPts = function () {
        return this.up;
    };
    Line.prototype.getDownPts = function () {
        return this.down;
    };
    Line.prototype.findLengthOfLine = function () {
        if (this.points.length <= 1)
            return 0;
        var totalLength = 0;
        for (var i = 1; i < this.points.length; i++) {
            var p0 = this.points[i - 1];
            var p1 = this.points[i];
            var dx = p1.x - p0.x;
            var dy = p1.y - p0.y;
            totalLength += Math.sqrt(dx * dx + dy * dy);
        }
        return totalLength;
    };
    return Line;
}());
var currentLine = new Line();
function newLine() {
    currentLine = new Line(); // clear this var of the last reference
    all_lines.push(currentLine); // add the reference to the array
}
function dotsChecker() {
    for (var _i = 0, alldrips_1 = alldrips; _i < alldrips_1.length; _i++) {
        var drip = alldrips_1[_i];
        if (!drip.isStopped) {
            drip.y += drip.vy;
            drip.vy *= drip.slowdown;
            var drift = (Math.random() - 0.5) * 1.2 * (drip.vy / initV);
            drip.x += drift;
            // uh
            var dx = drip.x - drip.startX;
            if (Math.abs(dx) > drip.maxDrift) {
                drip.x = drip.startX + math_sign(dx) * drip.maxDrift;
            }
            if (drip.vy < drip.minSpeed) {
                drip.isStopped = true;
            }
            // initialize dots
            var dot = new Dot(drip.x, drip.y, drip.radius);
            dots.push(dot);
        }
        if (dots.length > 500) {
            dots.shift(); // keep the array size manageable
        } // what??  
    }
}
/** returns a bunch of values where you drip */
function dripSortHelper(line) {
    var validSegments = [];
    var points = line.getPoints();
    if (line.getPoints().length <= 1)
        return validSegments;
    var currentgroup = [];
    for (var i = 2; i < points.length - 1; i++) {
        // skip the first and last point
        var pointsArr = line.getPoints();
        var p0 = pointsArr[i - 1];
        var p1 = pointsArr[i];
        // find the corresponding index in up and down arrays (use i-1)
        // cuz line could be                   [a a a a a]
        // but the updown segments are just      [a a a]
        var upPt = line.getUpPts()[i - 1];
        var downPt = line.getDownPts()[i - 1];
        if (!upPt || !downPt)
            continue;
        // calculate the distance between up and down points
        var dx = upPt.x - downPt.x;
        var dy = upPt.y - downPt.y;
        var width = Math.sqrt(dx * dx + dy * dy);
        if (width > 3) {
            currentgroup.push({ p0: p0, p1: p1 });
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
    var returnedPoints = [];
    var validSegments = dripSortHelper(line); // has to return it in that format anyway
    if (validSegments.length == 0) {
        return null;
    }
    ///// process valid segments
    for (var i = 0; i < validSegments.length; i++) {
        var seggroup = validSegments[i];
        var randomSegment = void 0;
        if (seggroup.length == 1) {
            randomSegment = seggroup[0];
        }
        else {
            randomSegment = seggroup[Math.floor(Math.random() * seggroup.length)];
        }
        var minX = Math.min(randomSegment.p0.x, randomSegment.p1.x);
        var maxX = Math.max(randomSegment.p0.x, randomSegment.p1.x);
        // Avoid division by zero for vertical segments
        if (maxX === minX) {
            // For vertical segments, interpolate y between p0 and p1
            var minY = Math.min(randomSegment.p0.y, randomSegment.p1.y);
            var maxY = Math.max(randomSegment.p0.y, randomSegment.p1.y);
            var randomY = minY + Math.random() * (maxY - minY);
            returnedPoints.push({ x: minX, y: randomY });
            continue;
        }
        var randomX = minX + Math.random() * (maxX - minX);
        var dx = randomSegment.p1.x - randomSegment.p0.x;
        var dy = randomSegment.p1.y - randomSegment.p0.y;
        var slope = dy / dx;
        var interpolatedY = randomSegment.p0.y + slope * (randomX - randomSegment.p0.x);
        var randomPoint = { x: randomX, y: interpolatedY };
        returnedPoints.push(randomPoint);
    }
    return returnedPoints;
}
function randomlyAddADrip() {
    var cur = all_lines.length > 0 ? all_lines[all_lines.length - 1] : null;
    if (!cur)
        return;
    var drip_pts = randomDripFinder(cur);
    if (drip_pts == null)
        return;
    for (var _i = 0, drip_pts_1 = drip_pts; _i < drip_pts_1.length; _i++) {
        var pair = drip_pts_1[_i];
        alldrips.push(new Drip(pair.x, pair.y));
    }
}
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // updating and drawing each Line
    for (var _i = 0, all_lines_1 = all_lines; _i < all_lines_1.length; _i++) {
        var line = all_lines_1[_i];
        line.fill_line();
        // line.drawLine(); 
    }
    for (var _a = 0, all_lines_2 = all_lines; _a < all_lines_2.length; _a++) {
        var line = all_lines_2[_a];
        line.fill_linebb();
        // line.drawLine(); 
    }
    for (var _b = 0, dots_1 = dots; _b < dots_1.length; _b++) {
        var dot = dots_1[_b];
        dot.draw();
    }
    dotsChecker();
    drawAfc();
}
// mouse detector
//** start animation */
window.onload = function () {
    animate();
};
//*** Canvas crap */
canvas.addEventListener("mouseout", function (e) {
    mouseDown = false;
});
canvas.addEventListener("mousemove", function (e) {
    var pos = getMousePos(e);
    if (!mouseDown)
        return;
    if (simMode == 0) {
        currentLine.addPoint(pos.x, pos.y);
    }
});
var currentAFC = null;
var currentMode = null;
var originalDotCenter = null;
var initialMouseCenter = null;
canvas.addEventListener("mousedown", function (e) {
    mouseDown = true;
    if (simMode == 0) {
        newLine();
    }
    else if (simMode == 1) {
        var pos = getMousePos(e);
        var reset = true;
        if (currentAFC) {
            var item = currentAFC;
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
        }
        else {
            for (var i = afc.length - 1; i >= 0; i--) {
                // go through backwards because recent (top layer)
                var item = afc[i];
                console.log(item.getType());
                if (item.centerDot && item.centerDot.isTouching(pos)) {
                    //  console.log("Touched center dot of AFC at", item.getCenterPoint());
                    reset = false;
                    currentAFC = item;
                    currentAFC.active = true;
                    break;
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
});
canvas.addEventListener("mouseup", function (e) {
    mouseDown = false;
    if (simMode == 0) {
        randomlyAddADrip();
    }
    else if (simMode == 1) {
        currentMode = null;
    }
});
function getMousePos(event) {
    var rect = canvas.getBoundingClientRect(); // Get the canvas's bounding box
    return {
        x: event.clientX - rect.left, // Mouse X relative to the canvas
        y: event.clientY - rect.top // Mouse Y relative to the canvas
    };
}
var offsetX = 8;
var offsetY = -52;
document.body.style.cursor = "none";
function moveMouseImage(_a) {
    var x = _a.x, y = _a.y;
    if (simMode == 0) {
        var img = document.getElementById("cursor");
        img.style.left = "".concat(x + offsetX, "px");
        img.style.top = "".concat(y + offsetY, "px");
    }
}
// window mousemove
window.addEventListener("mousemove", function (e) {
    var pos = getMousePos(e);
    moveMouseImage(pos);
    if (simMode == 1) {
        if (currentAFC) {
            if (currentMode === "rotate") {
                var mouseX = pos.x;
                var mouseY = pos.y;
                var dx = mouseX - currentAFC.getCenterPoint().x;
                var dy = mouseY - currentAFC.getCenterPoint().y;
                var angle = Math.atan2(dy, dx);
                currentAFC.setRad(angle);
            }
            else if (currentMode === "center") {
                /*
                currentAFC.setCenterPoint({ x: pos.x, y: pos.y });
                */
                if (originalDotCenter && initialMouseCenter) {
                    // Calculate offset
                    var offsetX_1 = pos.x - initialMouseCenter.x;
                    var offsetY_1 = pos.y - initialMouseCenter.y;
                    // Apply offset to center position
                    currentAFC.setCenterPoint({
                        x: originalDotCenter.x + offsetX_1,
                        y: originalDotCenter.y + offsetY_1,
                    });
                }
            }
        }
    }
});
function setCursorImg(s) {
    var cElement = document.getElementById("cursor");
    if (s) {
        document.body.style.cursor = "none";
        if (!cElement) {
            var img = document.createElement("img");
            img.src = s;
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
document.addEventListener("DOMContentLoaded", function () {
    var _a, _b, _c, _d, _e, _f;
    (_a = document.getElementById("btn-e")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
        simMode = 0; // it doesn't matter
        fadeDots();
    });
    (_b = document.getElementById("btn-f")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
        simMode = 1;
        setCursorImg(null);
        afc.push(new AFC({ x: 100, y: 100 }, window.sharedData.plasterIMG));
    });
    (_c = document.getElementById("btn-a")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", function () {
        simMode = 0;
        setCursorImg("dithered.png");
        offsetX = 8;
        offsetY = -52;
        minOffset = 1;
        maxOffset = 5;
        scaleFactor = 0.05;
    });
    (_d = document.getElementById("btn-b")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", function () {
        setCursorImg("img2.png");
        simMode = 0;
        offsetX = 10;
        offsetY = 10;
        minOffset = 1;
        maxOffset = 30;
        scaleFactor = 0.4;
    });
    (_e = document.getElementById("btn-c")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", function () {
        setCursorImg("gat.png");
        simMode = 0;
        minOffset = 0.5;
        maxOffset = 5;
        scaleFactor = 0.01;
        offsetX = 0;
        offsetY = 0;
    });
    (_f = document.getElementById("btn-d")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", function () {
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
    var iterations = 0;
    var maxIterations = 30;
    var startAlpha = 1;
    var endAlpha = 0;
    function animateFade() {
        iterations++;
        var t = Math.min(iterations / maxIterations, 1);
        var alpha = startAlpha + (endAlpha - startAlpha) * t;
        dot_color = "rgba(255, 150, 150, ".concat(alpha, ")");
        if (iterations < maxIterations) {
            requestAnimationFrame(animateFade);
        }
        else {
            dots = [];
            dot_color = "rgb(255, 150, 150)";
        }
    }
    animateFade();
}
function drawAfc() {
    for (var _i = 0, afc_1 = afc; _i < afc_1.length; _i++) {
        var item = afc_1[_i];
        if (!(item instanceof AFC))
            continue; // Ensure item is of type AFC
        item.draw(ctx);
        if (item.active)
            item.draw2(ctx);
    }
}
function addAfc(point, type) {
    afc.push(new AFC(point, type));
}
