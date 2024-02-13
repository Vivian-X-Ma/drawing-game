let seedPath; 
let seedPoints;
let personDrawing;
let sketchRNN;
let currentStroke;
let x, y;
let nextPen;

function preload() {
  sketchRNN = ml5.sketchRNN("backpack"); 
}

function startDrawing() {
  personDrawing = true;
  x = mouseX;
  y = mouseY;
}

function startSketchRNN() {
  personDrawing = false;
  // Perform RDP Line Simplification
  const rdpPoints = [];
  const total = seedPoints.length;
  const start = seedPoints[0];
  const end = seedPoints[total - 1];
  rdpPoints.push(start);
  rdp(0, total - 1, seedPoints, rdpPoints);
  rdpPoints.push(end);
  //Draw Simplified Path
  background(220);
  beginShape();
  noFill();
  for (let v of rdpPoints) {
    vertex(v.x, v.y);
  }
  endShape();
  x = rdpPoints[rdpPoints.length - 1].x;
  y = rdpPoints[rdpPoints.length - 1].y;
  seedPath = [];
  //Convert to Sketch RNN States
  for (let i = 1; i < rdpPoints.length; i++) {
    let strokePath = {
    dx: rdpPoints[i].x - rdpPoints[i - 1].x,
    dy: rdpPoints[i].y - rdpPoints[i - 1].y,
    pen: "down"
    };
    seedPath.push(strokePath);
  }
  sketchRNN.generate(seedPath, gotStrokePath);
}


function setup() {
  let canvas = createCanvas(600, 600);
  personDrawing = false;
  seedPath = [];
  seedPoints = [];
  canvas.mousePressed(startDrawing);
  canvas.mouseReleased(startSketchRNN);
  background(220);
  stroke(0);
  strokeWeight(4);
  nextPen = "down";
}

function gotStrokePath(error, strokePath) {
  currentStroke = strokePath;
}


function draw() {
  if (personDrawing) {
    seedPoints.push(createVector(mouseX, mouseY));
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
  if (currentStroke) {
    if (nextPen == "end") {
      sketchRNN.reset();
      startSketchRNN();
      currentStroke = null;
      nextPen = "down";
      return;
    }
    if (nextPen == "down") {
      line(x, y, x + currentStroke.dx, y + currentStroke.dy);
    }
    x += currentStroke.dx;
    y += currentStroke.dy;
    nextPen = currentStroke.pen;
    currentStroke = null;
    sketchRNN.generate(gotStrokePath);
  }
}
