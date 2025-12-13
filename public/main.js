const canvas = document.querySelector("canvas"),
  ctx = canvas.getContext("2d");

//global variabels wiht default values
let prevX,
  prevY,
  isDrawing = false,
  selectedColor = "#000";

function drawCenterLine() {
  ctx.save();
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
  ctx.restore();
}

const setCanvasBackground = () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor;
  drawCenterLine();
};

const startDrawing = (e) => {
  if (e.pressure === 0) return;
  canvas.setPointerCapture(e.pointerId);
  isDrawing = true;
  ctx.save();
  ctx.setLineDash([]);
  ctx.beginPath();
  calculateValue(e);
};

const drawing = (e) => {
  if (!isDrawing || e.pressure === 0) return;
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
  calculateValue(e);
};

const stopDrawing = (e) => {
  if (e.pressure === 0) return;
  if (e.clientX >= canvas.width) {
    canvas.releasePointerCapture(e.pointerId);
    ctx.closePath();
    ctx.restore();
    isDrawing = false;
    calculateValue(e);
  }
};

function clearCanvas() {
  setCanvasBackground();
}

function saveCanvas() {
  const link = document.createElement("a");
  link.download = `${Date.now()}`.jpg;
  link.href = canvas.toDataURL();
  link.click();
}
/* canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchmove", drawing);
canvas.addEventListener("touchend", stopDrawing); */

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
});

canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointermove", drawing);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);

//Sending and calculating the values

const url = "http://localhost:3000/save/";

function calculateValue(e) {
  const rect = canvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  console.log("y:", y);

  let picoValue = 0;
  let roundedPicoValue = Math.round(picoValue);

  if (y <= canvas.height / 2) {
    picoValue = y * (-180 / (canvas.height / 2));
    roundedPicoValue = Math.round(picoValue);
    console.log("roundedPicoValue :", roundedPicoValue);
  } else {
    picoValue = (y - canvas.height / 2) * (180 / (canvas.height / 2));
    roundedPicoValue = Math.round(picoValue);
    console.log("roundedPicoValue :", roundedPicoValue);
  }
  fetch(url + roundedPicoValue).catch((err) =>
    console.error("Fetch error:", err)
  );
}
