// SELECT CVS
var cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "img/flappyklaas_-_sprites_v5.png";


// RESIZE
var w = 320;
var h = 480;
var canvas_w = 320;
var canvas_h = 480

let resizeBird = function(){
    canvas_w = window.innerWidth - 20;
    canvas_h = window.innerHeight - 20;
    let ratio = 320 / 480;
    if(canvas_h < canvas_w / ratio)
        canvas_w = canvas_h * ratio;
    else 
        canvas_h = canvas_w / ratio;
    cvs.width = w;
    cvs.height = h;

    cvs.style.width = '' + canvas_w + 'px';
    cvs.style.heigth = '' + canvas_h + 'px';
}
resizeBird();

window.addEventListener('resize', function(){
    resizeBird();
})

// GAME VARS AND CONSTS
let frames = 0;
const DEGREE = Math.PI/180;

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

// GAME STATE
const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
}

// CTA BUTTON COORD
const ctaBtn = {
    x : 83 / 320 * canvas_w,
    y : 208 / 480 * canvas_h,
    w : 83 / 320 * canvas_w,
    h : 29 / 480 * canvas_h
}

// START BUTTON COORD
const startBtn = {
    x : 120 / 320 * canvas_w,
    y : 263 / 480 * canvas_h,
    w : 83 / 320 * canvas_w,
    h : 29 / 480 * canvas_h
}

// CONTROL THE GAME
cvs.addEventListener("click", function(evt){
    switch(state.current){
        case state.getReady:
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game:
            if(bird.y - bird.radius <= 0) return;
            bird.flap();
            FLAP.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;
            
            // CHECK IF WE CLICK ON THE START BUTTON
            if(clickX >= ctaBtn.x && clickX <= ctaBtn.x + ctaBtn.w && clickY >= ctaBtn.y && clickY <= ctaBtn.y + ctaBtn.h){
                window.location.href="https://www.vvd.nl/standpuntenoverzicht/?utm_source=Game&utm_medium=Game&utm_campaign=Klaasy_Bird";
                break;
                };
            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
                    pipes.reset();
                    food1.reset();
                    food2.reset();
                    food3.reset();
                    bird.speedReset();
                    score.reset();
                    state.current = state.getReady;
                    break;
                };
            
    }
});


// BACKGROUND
const bg1 = {
    sX : 92,
    sY : 0,
    w : 274 - 92,
    h : 226,
    x : 0,
    y : cvs.height - 226,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
    
}

const bg2 = {
    sX : 0,
    sY : 0,
    w : 274,
    h : 226,
    x : 0,
    y : cvs.height - 226,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
    
}

// FOREGROUND
const fg = {
    sX: 277,
    sY: 0,
    w: 222,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    
    dx : 2.5,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    
    update: function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx)%(this.w/2);
        }
    }
}

// BIRD
const bird = {
    animation : [
        {sX: 278, sY : 114},
        {sX: 278, sY : 153},
        {sX: 278, sY : 192},
        {sX: 278, sY : 153}
    ],
    x : 50,
    y : 150,
    w : 48,
    h : 32,
    
    radius : 12,
    
    frame : 0,
    
    gravity : 0.24,
    jump : 4,
    speed : 0,
    rotation : 0,
    
    draw : function(){
        let bird = this.animation[this.frame];
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h,- this.w/2, - this.h/2, this.w, this.h);
        
        ctx.restore();
    },
    
    flap : function(){
        this.speed = - this.jump;
    },
    
    update: function(){
        // IF THE GAME STATE IS GET READY STATE, THE BIRD MUST FLAP SLOWLY
        this.period = state.current == state.getReady ? 10 : 5;
        // WE INCREMENT THE FRAME BY 1, EACH PERIOD
        this.frame += frames%this.period == 0 ? 1 : 0;
        // FRAME GOES FROM 0 To 4, THEN AGAIN TO 0
        this.frame = this.frame%this.animation.length;
        
        if(state.current == state.getReady){
            this.y = 150; // RESET POSITION OF THE BIRD AFTER GAME OVER
        }else{
            this.speed += this.gravity;
            this.y += this.speed;
            
            if(this.y + this.h/2 >= cvs.height - fg.h){
                this.y = cvs.height - fg.h - this.h/2;
                if(state.current == state.game){
                    state.current = state.over;
                    DIE.play();
                }
            }
            
            // IF THE SPEED IS GREATER THAN THE JUMP MEANS THE BIRD IS FALLING DOWN
            if(this.speed >= this.jump){
                this.frame = 1;
        }   }
        
    },
    speedReset : function(){
        this.speed = 0;
    }
}


// GET READY MESSAGE
const getReady = {
    sX : 0,
    sY : 228,
    w : 173,
    h : 152,
    x : cvs.width/2 - 173/2,
    y : 80,
    
    draw: function(){
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
    
}

// GAME OVER MESSAGE
const gameOver = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 202,
    x : cvs.width/2 - 225/2,
    y : 90,
    
    draw: function(){
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
    }
    
}

// PIPES
const pipes = {
    position : [],
    
    top : {
        sX : 553,
        sY : 0
    },
    bottom:{
        sX : 502,
        sY : 0
    },
    
    w : 53,
    h : 400,
    gap : 120,
    maxYPos : -200,
    dx : 2.5,
    
    draw : function(){
        for(let i  = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;
            
            // top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);  
            
            // bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);  
        }
    },
    
    update: function(){
        if(state.current !== state.game) return;
        
        if(frames%100 == 0){
            this.position.push({
                x : cvs.width,
                y : this.maxYPos * ( Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let bottomPipeYPos = p.y + this.h + this.gap;
            
            // COLLISION DETECTION
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h || (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h)){
                state.current = state.over;
                HIT.play();
            }

            // MOVE THE PIPES TO THE LEFT
            p.x -= this.dx;
            
            // if the pipes go beyond canvas, we delete them from the array
            if(p.x + this.w <= 0){
                this.position.shift();
                score.value += 1;
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },
    
    reset : function(){
        this.position = [];
    }
    
}

// FOOD 1
const food1 = {
    position : [],
    sX : 334,
    sY : 116,
    w : 29,
    h : 20,
    dxx : 2.5,
    maxYPos : 150,
    draw : function(){
        for(let i  = 0; i < this.position.length; i++){
            let q = this.position[i];
            let topYPos = q.y;
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, q.x, topYPos, this.w, this.h);  
        }
    },
    
    update: function(){
        if(state.current !== state.game) return;
        
        if(frames%900 == 0){
            this.position.push({
                x : cvs.width/2 + pipes.w,
                y : this.maxYPos * ( Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let q = this.position[i];
            q.x -= this.dxx;
            if(bird.x + bird.radius > q.x && bird.x - bird.radius < q.x + this.w && bird.y + bird.radius > q.y && bird.y - bird.radius < q.y + this.h){
                this.position.shift();
                score.value += 11;
                SCORE_S.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            };
            if(q.x + this.w <= 0){
                this.position.shift();
            }
        }
    },
    reset : function(){
        this.position = [];
    }
    
}

// FOOD 2
const food2 = {
    position : [],
    sX : 340,
    sY : 139,
    w : 21,
    h : 29,
    dxx : 2.5,
    maxYPos : 150,
    draw : function(){
        for(let i  = 0; i < this.position.length; i++){
            let q = this.position[i];
            let topYPos = q.y;
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, q.x, topYPos, this.w, this.h);  
        }
    },
    
    update: function(){
        if(state.current !== state.game) return;
        
        if(frames%900 == 300){
            this.position.push({
                x : cvs.width/2 + pipes.w,
                y : this.maxYPos * ( Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let q = this.position[i];
            q.x -= this.dxx;
            if(bird.x + bird.radius > q.x && bird.x - bird.radius < q.x + this.w && bird.y + bird.radius > q.y && bird.y - bird.radius < q.y + this.h){
                this.position.shift();
                score.value += 11;
                SCORE_S.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            };
            if(q.x + this.w <= 0){
                this.position.shift();
            }
        }
    },
    reset : function(){
        this.position = [];
    }
    
}

// FOOD 3
const food3 = {
    position : [],
    sX : 339,
    sY : 169,
    w : 20,
    h : 28,
    dxx : 2.5,
    maxYPos : 150,
    draw : function(){
        for(let i  = 0; i < this.position.length; i++){
            let q = this.position[i];
            let topYPos = q.y;
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, q.x, topYPos, this.w, this.h);  
        }
    },
    
    update: function(){
        if(state.current !== state.game) return;
        
        if(frames%900 == 600){
            this.position.push({
                x : cvs.width/2 + pipes.w,
                y : this.maxYPos * ( Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let q = this.position[i];
            q.x -= this.dxx;
            if(bird.x + bird.radius > q.x && bird.x - bird.radius < q.x + this.w && bird.y + bird.radius > q.y && bird.y - bird.radius < q.y + this.h){
                this.position.shift();
                score.value += 11;
                SCORE_S.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            };
            if(q.x + this.w <= 0){
                this.position.shift();
            }
        }
    },
    reset : function(){
        this.position = [];
    }
    
}

// SCORE
const score= {
    best : parseInt(localStorage.getItem("best")) || 0,
    value : 0,
    
    draw : function(){
        ctx.fillStyle = "black";
        ctx.strokeStyle = "#000";
        
        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = "35px Arial";
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
            
        }else if(state.current == state.over){
            // SCORE VALUE
            ctx.font = "23px Arial";
            ctx.fillText(this.value, 207, 186);
            ctx.strokeText(this.value, 207, 186);
            // BEST SCORE
            ctx.fillText(this.best, 207, 228);
            ctx.strokeText(this.best, 207, 228);
        }
    },
    
    reset : function(){
        this.value = 0;
    }
}

// DRAW
function draw(){
    ctx.fillStyle = "#639BFF";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    
    bg1.draw();
    bg2.draw();
    pipes.draw();
    food1.draw();
    food2.draw();
    food3.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// UPDATE
function update(){
    bird.update();
    fg.update();
    pipes.update();
    food1.update();
    food2.update();
    food3.update();
}

// LOOP
function loop(){
    update();
    draw();
    frames++;
    
    requestAnimationFrame(loop);
}
loop();
