class VideoWithBackground {
    video;
    canvas;
    step;
    ctx;

    constructor(videoID, canvasID) {
        this.video = document.getElementById(videoID)
        this.canvas = document.getElementById(canvasID)

        window.addEventListener("load", this.initcheck, false);
        window.addEventListener("unload", this.cleanup, false);
    }

    draw = () => {
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    };

    drawLoop = () => {
        this.draw();
        this.step = window.requestAnimationFrame(this.drawLoop);
    };

    drawPause = () => {
        window.cancelAnimationFrame(this.step);
        this.step = undefined;
    };

    initcheck = () => {
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
        // console.log(`Initiated video canvas${isFirefox ? ' (firefox version)' : ''}`);
        // if (isFirefox) {
        //     this.ctx = this.canvas.getContext("2d");
        //     this.ctx.filter = "blur(50px)";
        //     setInterval(this.draw, 200)
        // } else {
        //     this.init()
        // }
        console.log("init")
        this.init()
    }

    init = () => {
        this.ctx = this.canvas.getContext("2d");
        this.ctx.filter = "blur(5px)";

        if (localStorage.ambientMode == "true" && localStorage.currentTheme == "dark"){
            this.video.addEventListener("loadeddata", this.draw, false);
            this.video.addEventListener("seeked", this.draw, false);
            this.video.addEventListener("play", this.drawLoop, false);
            this.video.addEventListener("pause", this.drawPause, false);
            this.video.addEventListener("ended", this.drawPause, false);    
        }
    };

    cleanup = () => {
        this.video.removeEventListener("loadeddata", this.draw);
        this.video.removeEventListener("seeked", this.draw);
        this.video.removeEventListener("play", this.drawLoop);
        this.video.removeEventListener("pause", this.drawPause);
        this.video.removeEventListener("ended", this.drawPause);
    };

    changeBlur = (blur) => {
        this.ctx.filter = `blur(${blur}px)`;
    }

    checkThemeStatus = () => {
        if (localStorage.getItem("currentTheme") == "dark" && localStorage.getItem("ambientMode") == "true") {
            console.log("Starting ambient mode")
            this.video.addEventListener("play", this.drawLoop, false);
            this.video.addEventListener("pause", this.drawPause, false);
            this.video.addEventListener("ended", this.drawPause, false);    
            this.drawLoop();
        } else {
            console.log("Stopping ambient mode")
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.video.removeEventListener("loadeddata", this.draw);
            this.video.removeEventListener("seeked", this.draw);
            this.video.removeEventListener("play", this.drawLoop);    
            this.drawPause()
        }
    }
}

if (!localStorage.ambientMode) {
    localStorage.setItem("ambientMode", "true");
}
const el = new VideoWithBackground("ambientvideo", "ambientcanvas");
function toggleAmbientMode() {
    if (localStorage.getItem("currentTheme") == "dark"){
        if (localStorage.ambientMode == "true"){
            localStorage.ambientMode = "false"
        } else {
            localStorage.ambientMode = "true"
        }
    }
    el.checkThemeStatus();
}

function checkAmbientTheme() {
    el.checkThemeStatus();
}