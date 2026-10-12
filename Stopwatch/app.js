const hoursDisplay = document.querySelector(".hours");
const minutesDisplay = document.querySelector(".minutes");
const secondsDisplay = document.querySelector(".seconds");
const millisecondsDisplay = document.querySelector(".milliseconds");

const startButton = document.querySelector(".start-btn");
const pauseButton = document.querySelector(".pause-btn");
const resetButton = document.querySelector(".reset-btn");
const lapButton = document.querySelector(".lap-btn");
const lapList = document.querySelector(".lap-list");
const timerForm = document.querySelector(".timer-form");
const timerList = document.querySelector(".timer-list");

let startTime = 0;
let elapsedTime = 0;

let timer = null;
let isRunning = false;
let previousLap = 0;
let lapCount = 0;
let countdowns = [];

function formatTime(time) {
  return time.toString().padStart(2, "0");
}

function updateDisplay() {
  const milliseconds = elapsedTime % 1000;

  const totalSeconds = Math.floor(elapsedTime / 1000);

  const seconds = totalSeconds % 60;

  const totalMinutes = Math.floor(totalSeconds / 60);

  const minutes = totalMinutes % 60;

  const hours = Math.floor(totalMinutes / 60);

  // Hours
  hoursDisplay.textContent = formatTime(hours);

  // Minutes
  minutesDisplay.textContent = formatTime(minutes);

  // Seconds
  secondsDisplay.textContent = formatTime(seconds);

  // Milliseconds
  millisecondsDisplay.textContent =
    "." +
    Math.floor(milliseconds / 10)
      .toString()
      .padStart(2, "0");
}

function startStopwatch() {
  // Prevent multiple timers
  if (isRunning) {
    return;
  }

  isRunning = true;

  // Calculate where the stopwatch should continue from
  startTime = Date.now() - elapsedTime;
  timer = setInterval(() => {
    elapsedTime = Date.now() - startTime;

    updateDisplay();
  }, 10);
}

function pauseStopwatch() {
  if (!isRunning) {
    return;
  }
  isRunning = false;
  clearInterval(timer);
  timer = null;
}

function resetStopwatch() {
  isRunning = false;
  clearInterval(timer);
  timer = null;
  elapsedTime = 0;
  startTime = 0;
  previousLap = 0;
  lapCount = 0;
  lapList.replaceChildren();
  updateDisplay();
}

function formatElapsed(time) {
  const centiseconds = Math.floor((time % 1000) / 10)
    .toString()
    .padStart(2, "0");
  const totalSeconds = Math.floor(time / 1000);
  return `${formatTime(Math.floor(totalSeconds / 60))}:${formatTime(totalSeconds % 60)}.${centiseconds}`;
}

function recordLap() {
  if (elapsedTime === 0) return;
  lapCount += 1;
  const lapTime = elapsedTime - previousLap;
  previousLap = elapsedTime;
  const item = document.createElement("li");
  item.textContent = `Lap ${lapCount}  ${formatElapsed(lapTime)}  (total ${formatElapsed(elapsedTime)})`;
  lapList.prepend(item);
}

function renderCountdowns() {
  timerList.replaceChildren();
  countdowns.forEach((timer) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = `${timer.name}: ${formatElapsed(timer.remaining * 1000)}`;
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = timer.interval
      ? "Pause"
      : timer.remaining > 0
        ? "Start"
        : "Done";
    toggle.disabled = timer.remaining <= 0;
    toggle.addEventListener("click", () => {
      if (timer.interval) {
        clearInterval(timer.interval);
        timer.interval = null;
      } else {
        timer.lastTick = Date.now();
        timer.interval = setInterval(() => {
          const now = Date.now();
          timer.remaining = Math.max(
            0,
            timer.remaining - (now - timer.lastTick) / 1000,
          );
          timer.lastTick = now;
          if (timer.remaining <= 0) {
            clearInterval(timer.interval);
            timer.interval = null;
            label.textContent = `${timer.name}: Complete`;
            toggle.textContent = "Done";
            toggle.disabled = true;
          } else {
            label.textContent = `${timer.name}: ${formatElapsed(timer.remaining * 1000)}`;
          }
        }, 200);
      }
      toggle.textContent = timer.interval ? "Pause" : "Start";
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      clearInterval(timer.interval);
      countdowns = countdowns.filter((entry) => entry !== timer);
      renderCountdowns();
    });
    item.append(label, toggle, remove);
    timerList.appendChild(item);
  });
}

startButton.addEventListener("click", () => {
  startStopwatch();
});

pauseButton.addEventListener("click", () => {
  pauseStopwatch();
});

resetButton.addEventListener("click", () => {
  resetStopwatch();
});

lapButton.addEventListener("click", recordLap);
timerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const duration = Number(document.querySelector(".timer-duration").value);
  if (!Number.isFinite(duration) || duration < 1) return;
  countdowns.push({
    name:
      document.querySelector(".timer-name").value.trim() ||
      `Timer ${countdowns.length + 1}`,
    remaining: duration,
    interval: null,
    lastTick: Date.now(),
  });
  document.querySelector(".timer-name").value = "";
  renderCountdowns();
});

updateDisplay();
