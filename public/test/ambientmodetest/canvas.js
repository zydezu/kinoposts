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
        this.init()
    }

    init = () => {
        this.ctx = this.canvas.getContext("2d");
        this.ctx.filter = "blur(10px)";

        this.video.addEventListener("loadeddata", this.draw, false);
        this.video.addEventListener("seeked", this.draw, false);
        this.video.addEventListener("play", this.drawLoop, false);
        this.video.addEventListener("pause", this.drawPause, false);
        this.video.addEventListener("ended", this.drawPause, false);
    };

    cleanup = () => {
        this.video.removeEventListener("loadeddata", this.draw);
        this.video.removeEventListener("seeked", this.draw);
        this.video.removeEventListener("play", this.drawLoop);
        this.video.removeEventListener("pause", this.drawPause);
        this.video.removeEventListener("ended", this.drawPause);
    };
}

const el = new VideoWithBackground("ambientvideo", "ambientcanvas");
const el2 = new VideoWithBackground("ambientvideo2", "ambientcanvas2");
const el3 = new VideoWithBackground("ambientvideo3", "ambientcanvas3");
el.initcheck()
el2.initcheck()
el3.initcheck()
