// Neurodivergence is often misunderstood. What neurodivergence is really a new pespective of intearcting with the world. Even for processing time, sometimes time will pass by really fast, and sometimes each minute will feel like an hour. This stopwatch emulates what progression of time feels like. Overall, with longer time you put on the stopwatch, the time will normalize to the societal standard. But at shorter time lengths, the perception of how long each minute can vary drastically. 

//note: llm usage, admiteddly I did use llm more than I had intended to. 

let timeRemaining = 0; // in seconds, converted to min
let totalMinutes = 0; // input time
let currentMinute = 0;
let minuteDurations = []; // Array to store random duration for each minute
let isRunning = false;
let lastUpdateTime = 0;
let inputBox;
let startButton;
let pauseButton;
let resetButton;
let timerFinished = false;

//range where the expected value would be 60 seconds, aka the typically perceived time
const MIN_MINUTE_DURATION = 0; // Minimum seconds per "minute"
const MAX_MINUTE_DURATION = 120; // Maximum seconds per "minute"

function setup() {
  createCanvas(800, 600);
  
  // Create input for minutes
  inputBox = createInput('5');
  inputBox.position(width/2 - 50, 50);
  inputBox.size(100, 30);
  inputBox.attribute('placeholder', 'Minutes');
  
  // Create control buttons
  startButton = createButton('Start');
  startButton.position(width/2 - 120, 100);
  startButton.mousePressed(startTimer);
  
  pauseButton = createButton('Pause');
  pauseButton.position(width/2 - 30, 100);
  pauseButton.mousePressed(pauseTimer);
  
  resetButton = createButton('Reset');
  resetButton.position(width/2 + 60, 100);
  resetButton.mousePressed(resetTimer);
  
  // Set initial time, setting in setup since I don't want this updating per frame
  generateRandomMinutes();
  
  textAlign(CENTER, CENTER);
}

function draw() {
  background(0, 0, 0);
  
  // Update timer if running
  if (isRunning && timeRemaining > 0) {
    let currentTime = millis();
    if (lastUpdateTime > 0) {
      let deltaTime = (currentTime - lastUpdateTime) / 1000;
      timeRemaining -= deltaTime;
    }
    lastUpdateTime = currentTime;
    
    // Check if current minute finished
    if (timeRemaining <= 0 && currentMinute < minuteDurations.length - 1) {
      currentMinute++;
      timeRemaining = minuteDurations[currentMinute];
    }
    
    // Check if timer completely finished
    if (timeRemaining <= 0 && currentMinute >= minuteDurations.length - 1) {
      timeRemaining = 0;
      isRunning = false;
      timerFinished = true;
    }
  }
  
  // Draw timer displays
  drawTimerCircle();
  drawTimerCircle2();
  drawTimeText();
  drawMinuteInfo();
  
  // Draw labels
  fill(255);
  textSize(16);
  text('Enter minutes:', width/2, 30);
  
  // Flash screen if timer finished
  if (timerFinished) {
    fill(255, 0, 0, 50 + 50 * sin(millis() * 0.01));
    rect(0, 0, width, height);
    
    fill(255, 0, 0);
    textSize(32);
    text('TIME\'S UP!', width/2, height - 50);
  }
}

function drawTimerCircle() {
  let centerX = width / 2;
  let centerY = height / 2 + 20;
  let radius = 100;
  
  push();
  translate(centerX, centerY);
  
  // Background circle
  stroke(80);
  strokeWeight(8);
  noFill();
  circle(0, 0, radius * 2);
  
  // Progress arc for current minute
  if (minuteDurations.length > 0 && currentMinute < minuteDurations.length) {
    let currentMinuteDuration = minuteDurations[currentMinute];
    let progress = timeRemaining / currentMinuteDuration;
    let angle = map(progress, 0, 1, 0, TWO_PI);
    
    // Color based on remaining time in current minute
    if (progress > 0.3) {
      stroke(100, 255, 100); // Green
    } else if (progress > 0.1) {
      stroke(255, 200, 0); // Orange
    } else {
      stroke(255, 100, 100); // Red
    }
    
    strokeWeight(10);
    noFill();
    
    // Draw progress arc (clockwise from top)
    arc(0, 0, radius * 2, radius * 2, -PI/2, -PI/2 + angle);
  }
  
  pop();
}

function drawTimeText() {
  let centerY = height / 2 + 20;
  
  let minutes = Math.floor(timeRemaining / 60);
  let seconds = Math.floor(timeRemaining % 60);
  let timeString = nf(minutes, 2) + ":" + nf(seconds, 2);
  
  // Current minute time display
  fill(255);
  textSize(36);
  textFont('monospace');
  text(timeString, width / 2, centerY);
  
  // Show milliseconds for last 10 seconds
  if (timeRemaining < 10 && timeRemaining > 0) {
    let milliseconds = Math.floor((timeRemaining % 1) * 100);
    textSize(18);
    text("." + nf(milliseconds, 2), width / 2, centerY + 30);
  }
  
  // Status text
  textSize(18);
  fill(200);
  if (isRunning) {
    text('Running...', width / 2, centerY + 60);
  } else if (timeRemaining > 0) {
    text('Paused', width / 2, centerY + 60);
  } else if (timerFinished) {
    text('Finished', width / 2, centerY + 60);
  } else {
    text('Ready', width / 2, centerY + 60);
  }
}

function drawMinuteInfo() {
  let startY = height / 2 + 120;
  
  fill(255);
  textSize(16);
  text(`Minute ${currentMinute + 1} of ${totalMinutes}`, width / 2, startY);
  
  if (minuteDurations.length > 0) {
    textSize(14);
    fill(180);
    text(`Current minute duration: ${minuteDurations[currentMinute].toFixed(1)}s`, width / 2, startY + 25);
    
    // Show average duration
    let avgDuration = minuteDurations.reduce((sum, dur) => sum + dur, 0) / minuteDurations.length;
    text(`Average duration: ${avgDuration.toFixed(1)}s`, width / 2, startY + 45);
  }
  
  // Show all minute durations
  if (minuteDurations.length > 0 && minuteDurations.length <= 10) {
    textSize(12);
    fill(150);
    text('Durations: ' + minuteDurations.map(d => d.toFixed(1) + 's').join(', '), width / 2, startY + 70);
  }
}

function generateRandomMinutes() {
  //error case: when it's empty, it should be something
  totalMinutes = parseInt(inputBox.value()) || 1;
  minuteDurations = [];
  currentMinute = 0;
  
  // Generate random duration for each minute (MIN_MINUTE_DURATION to MAX_MINUTE_DURATION seconds)
  for (let i = 0; i < totalMinutes; i++) {
    minuteDurations.push(random(MIN_MINUTE_DURATION, MAX_MINUTE_DURATION));
  }
  
  // Set initial time to first minute's duration
  if (minuteDurations.length > 0) {
    timeRemaining = minuteDurations[0];
  }
  
  console.log('Generated minute durations:', minuteDurations); 
  console.log('Average duration:', minuteDurations.reduce((sum, dur) => sum + dur, 0) / minuteDurations.length); 
}

function startTimer() {
  if (!isRunning) {
    if (timeRemaining === 0 || minuteDurations.length === 0) {
      generateRandomMinutes();
    }
    isRunning = true;
    lastUpdateTime = millis();
    timerFinished = false;
  }
}

function pauseTimer() {
  isRunning = false;
  lastUpdateTime = 0;
}

function resetTimer() {
  isRunning = false;
  lastUpdateTime = 0;
  timerFinished = false;
  
  //set random minute length
  generateRandomMinutes();
}

// Handle spacebar for start/pause
function keyPressed() {
  if (key === ' ') {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }
  
  // Handle Enter to generate new random times
  if (keyCode === ENTER) {
    resetTimer();
  }
}