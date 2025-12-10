/* ================= TIMER ================= */
const birth = new Date("2006-01-14T08:30:00");
const els = {
    d: document.getElementById("d"),
    h: document.getElementById("h"),
    m: document.getElementById("m"),
    s: document.getElementById("s")
};

function pad(n) { return (n < 10 && n >= 0) ? "0" + n : n; }

function updateTimer() {
    let diff = (new Date() - birth) / 1000;
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff / 3600) % 24);
    const minutes = Math.floor((diff / 60) % 60);
    const seconds = Math.floor(diff % 60);
    
    if (els.d.innerText !== days.toString()) els.d.innerHTML = `<span class="pulse">${days}</span>`;
    if (els.h.innerText !== pad(hours).toString()) els.h.innerHTML = `<span class="pulse">${pad(hours)}</span>`;
    if (els.m.innerText !== pad(minutes).toString()) els.m.innerHTML = `<span class="pulse">${pad(minutes)}</span>`;
    els.s.innerHTML = `<span class="pulse">${pad(seconds)}</span>`;
}

setInterval(updateTimer, 1000);
updateTimer();

/* ================= HEART TREE ENGINE ================= */
const canvas = document.getElementById("c");
const container = document.getElementById("mainContainer");
const ctx = canvas.getContext("2d");
let w, h;
let branches = [];
let leaves = [];
let fallingHearts = [];
let trunkHeight = 0;
let maxTrunkHeight = 0;
let branchesCreated = false;
let frameCount = 0;

// Detect Mobile
const isMobile = window.innerWidth < 768;

const palette = ["#ff0080", "#ff6b9d", "#ffa07a", "#ffb347", "#ff1493", "#ff69b4", "#ff85c1", "#ffc0cb"];

// Physics
const GRAVITY = 0.05;
const WIND_FORCE = 0.05;
const TURBULENCE_STRENGTH = 0.02;

function resize() {
    w = canvas.width = container.offsetWidth;
    h = canvas.height = container.offsetHeight;
    
    // Scale Tree Logic:
    if(isMobile) {
        maxTrunkHeight = (w / 22) * 10; 
    } else {
        maxTrunkHeight = window.innerHeight * 0.35; 
    }
}
window.addEventListener("resize", resize);

function getHeartPoint(t, scale, filled = false) {
    let x = 16 * Math.pow(Math.sin(t), 3);
    let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    if (filled) {
        let r = Math.sqrt(Math.random());
        return { x: x * scale * r, y: -y * scale * r };
    }
    return { x: x * scale, y: -y * scale };
}

class Branch {
    constructor(startX, startY, endX, endY, thickness) {
        this.startX = startX; this.startY = startY;
        this.endX = endX; this.endY = endY;
        this.thickness = thickness;
        this.progress = 0;
        this.speed = 0.02 + Math.random() * 0.02;
        let dx = endX - startX, dy = endY - startY;
        this.cp1x = startX + dx * 0.25 + (Math.random() - 0.5) * 25;
        this.cp1y = startY + dy * 0.25 - Math.abs(dx) * 0.12;
        this.cp2x = startX + dx * 0.75 + (Math.random() - 0.5) * 25;
        this.cp2y = startY + dy * 0.75 - Math.abs(dx) * 0.08;
    }
    update() { if (this.progress < 1) this.progress += this.speed; }
    draw() {
        if (this.progress === 0) return;
        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = this.thickness;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        let t = this.progress;
        let cx = Math.pow(1-t,3)*this.startX + 3*Math.pow(1-t,2)*t*this.cp1x + 3*(1-t)*t*t*this.cp2x + t*t*t*this.endX;
        let cy = Math.pow(1-t,3)*this.startY + 3*Math.pow(1-t,2)*t*this.cp1y + 3*(1-t)*t*t*this.cp2y + t*t*t*this.endY;
        ctx.bezierCurveTo(
            this.startX+(this.cp1x-this.startX)*t, this.startY+(this.cp1y-this.startY)*t,
            this.startX+(this.cp2x-this.startX)*t, this.startY+(this.cp2y-this.startY)*t,
            cx, cy
        );
        ctx.stroke();
    }
}

class HeartLeaf {
    constructor(tx, ty) {
        this.tx = tx; this.ty = ty;
        this.x = w/2; this.y = h - maxTrunkHeight;
        this.progress = 0; this.speed = 0.02 + Math.random() * 0.03;
        this.delay = Math.random() * 40;
        this.size = (isMobile ? 4 : 7) + Math.random() * 6;
        this.color = palette[Math.floor(Math.random() * palette.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.sway = Math.random() * Math.PI * 2;
    }
    update() {
        if (this.delay > 0) { this.delay--; return; }
        if (this.progress < 1) {
            this.progress += this.speed;
            this.x += (this.tx - this.x) * 0.08;
            this.y += (this.ty - this.y) * 0.08;
        } else {
            this.sway += 0.02;
            this.x = this.tx + Math.sin(this.sway) * 2.5;
            this.y = this.ty + Math.cos(this.sway * 0.5) * 1.5;
        }
    }
    draw() {
        if (this.delay > 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        
        if(!isMobile) {
            ctx.shadowBlur = 5; ctx.shadowColor = this.color;
        }
        let sz = this.size * Math.min(1, this.progress * 1.5);
        ctx.beginPath();
        ctx.moveTo(0, sz*0.3);
        ctx.bezierCurveTo(0,0, -sz/2,0, -sz/2, sz*0.3);
        ctx.bezierCurveTo(-sz/2, (sz+sz*0.3)/2, 0, sz, 0, sz);
        ctx.bezierCurveTo(0, sz, sz/2, (sz+sz*0.3)/2, sz/2, sz*0.3);
        ctx.bezierCurveTo(sz/2, 0, 0, 0, 0, sz*0.3);
        ctx.fill();
        ctx.restore();
    }
}

class FallingHeart {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.vx = 0.33 + Math.random() * 0.33;
        this.vy = -0.33 + Math.random() * 0.2;
        this.size = (isMobile ? 8 : 10) + Math.random() * 8;
        this.color = palette[Math.floor(Math.random() * palette.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.opacity = 1;
    }
    update() {
        this.vy += GRAVITY;
        this.vx += WIND_FORCE + Math.sin(frameCount * 0.03 + this.y * 0.01) * TURBULENCE_STRENGTH;
        this.x += this.vx; this.y += this.vy;
        this.angle += 0.05;
        if (this.y > h * 0.96) this.opacity = Math.max(0, 1 - (this.y - h*0.96)/(h*0.04));
    }
    isDead() { return this.y > h + 30 || this.x > w + 30; }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        let sz = this.size;
        ctx.beginPath();
        ctx.moveTo(0, sz*0.3);
        ctx.bezierCurveTo(0,0, -sz/2,0, -sz/2, sz*0.3);
        ctx.bezierCurveTo(-sz/2, (sz+sz*0.3)/2, 0, sz, 0, sz);
        ctx.bezierCurveTo(0, sz, sz/2, (sz+sz*0.3)/2, sz/2, sz*0.3);
        ctx.bezierCurveTo(sz/2, 0, 0, 0, 0, sz*0.3);
        ctx.fill();
        ctx.restore();
    }
}

function createBranches() {
    let scale;
    if (isMobile) {
        scale = w / 24; 
    } else {
        scale = Math.min(w, window.innerHeight) / 28;
    }

    let cx = w / 2;
    // Calculate position from bottom of long page
    let cy = h - maxTrunkHeight - scale * 8 - 80;

    for (let i = 0; i < (isMobile ? 25 : 30); i++) {
        let p = getHeartPoint((i/(isMobile?25:30))*Math.PI*2, scale * 0.88);
        branches.push(new Branch(cx, cy + scale*8, cx + p.x, cy + p.y, 3 + Math.random() * 2));
    }
    
    // 3500 Leaves
    for (let i = 0; i < 3500; i++) {
        let p = getHeartPoint(Math.random()*Math.PI*2, scale * 0.92, true);
        leaves.push(new HeartLeaf(cx + p.x, cy + p.y));
    }
}

function drawBackgroundElements() {
    ctx.fillStyle = "white";
    // Stars cover full height
    let starCount = isMobile ? 30 : 60;
    for (let i = 0; i < starCount; i++) {
        let sx = (Math.sin(i * 123.4) * 10000) % w; if(sx<0) sx+=w;
        let sy = (Math.cos(i * 234.5) * 10000) % (h * 0.95); if(sy<0) sy+=h*0.95;
        ctx.fillRect(sx, sy, Math.random()*(isMobile?1.5:2), Math.random()*(isMobile?1.5:2));
    }
    
    // Moon - at top
    ctx.save();
    let mx = w * 0.15, my = 100, r = isMobile ? 50 : 70;
    ctx.fillStyle = "#e8e8ff"; 
    if(!isMobile) { ctx.shadowBlur = 40; ctx.shadowColor = "rgba(255,255,255,0.6)"; }
    ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = 'destination-out'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(mx+20, my-10, r-8, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    
    // Ground - at bottom
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2;
    ctx.beginPath(); 
    let groundY = h - 130;
    ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); 
    ctx.stroke();
}

function drawTrunk() {
    if (trunkHeight < maxTrunkHeight) trunkHeight += 2;
    let trunkBaseY = h - 130;
    
    let grad = ctx.createLinearGradient(w/2, trunkBaseY, w/2, trunkBaseY-trunkHeight);
    grad.addColorStop(0, "#ffc8dd"); grad.addColorStop(1, "#ffafcc");
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(w/2-25, trunkBaseY); ctx.lineTo(w/2+25, trunkBaseY);
    ctx.lineTo(w/2+12, trunkBaseY-trunkHeight); ctx.lineTo(w/2-12, trunkBaseY-trunkHeight);
    ctx.fill();
}

function loop() {
    frameCount++;
    ctx.clearRect(0,0,w,h);
    
    drawBackgroundElements();
    drawTrunk();

    if (trunkHeight >= maxTrunkHeight && !branchesCreated) {
        createBranches();
        branchesCreated = true;
    }

    if (branchesCreated) {
        branches.forEach(b => { b.update(); b.draw(); });
        leaves.forEach(l => { l.update(); l.draw(); });

        if (frameCount % (isMobile ? 6 : 4) === 0) {
            let scale;
            if (isMobile) scale = w / 24;
            else scale = Math.min(w, window.innerHeight) / 28;

            let trunkBaseY = h - 130;
            let cx = w/2; 
            let cy = trunkBaseY - maxTrunkHeight - scale * 8;
            let p = getHeartPoint(Math.random()*Math.PI*2, scale*0.85, true);
            fallingHearts.push(new FallingHeart(cx + p.x, cy + p.y));
        }

        for (let i = fallingHearts.length - 1; i >= 0; i--) {
            fallingHearts[i].update();
            fallingHearts[i].draw();
            if (fallingHearts[i].isDead()) fallingHearts.splice(i, 1);
        }
    }
    requestAnimationFrame(loop);
}

// === NEW NAVIGATION FUNCTION ===
function triggerCelebration() {
    window.location.href = "cause.html";
}

document.getElementById("start").onclick = () => {
    document.getElementById("intro").classList.add("hidden");
    document.getElementById("mainContainer").classList.add("show");
    resize();
    loop();
};
