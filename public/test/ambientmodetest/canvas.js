const video = document.getElementById("ambientvideo");
const canvas = document.getElementById("ambientcanvas");
const ctx = canvas.getContext("2d");
    
let step; // Keep track of requestAnimationFrame id

ctx.filter = "blur(10px)";

const draw = () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
};

const drawLoop = () => {
    draw();
    step = window.requestAnimationFrame(drawLoop);
};

const drawPause = () => {
    window.cancelAnimationFrame(step);
    step = undefined;
};  

const init = () => {
    video.addEventListener("loadeddata", draw, false);
    video.addEventListener("seeked", draw, false);
    video.addEventListener("play", drawLoop, false);
    video.addEventListener("pause", drawPause, false);
    video.addEventListener("ended", drawPause, false);
};
  
const cleanup = () => {
    video.removeEventListener("loadeddata", draw);
    video.removeEventListener("seeked", draw);
    video.removeEventListener("play", drawLoop);
    video.removeEventListener("pause", drawPause);
    video.removeEventListener("ended", drawPause);
};
  
const initcheck = () => {
    init()
}

window.addEventListener("load", initcheck);
window.addEventListener("unload", cleanup);