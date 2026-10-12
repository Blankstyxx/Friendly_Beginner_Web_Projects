const currentOperand = document.querySelector(".current-operand");
const previousOperand = document.querySelector(".previous-operand");

const numberButtons = document.querySelectorAll(".number");
const operatorButtons = document.querySelectorAll(".operator");

const clearButton = document.querySelector(".clear");
const deleteButton = document.querySelector(".delete");
const percentButton = document.querySelector(".percent");
const equalsButton = document.querySelector(".equals");
const historyList = document.querySelector(".calculation-history");
const themeButton = document.querySelector(".theme-toggle");
const HISTORY_KEY = "calculator-history";
const THEME_KEY = "calculator-theme";

let currentValue = "";
let previousValue = "";
let operator = null;
let calculationHistory = [];
try {
  const savedHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  if (Array.isArray(savedHistory))
    calculationHistory = savedHistory
      .filter((entry) => typeof entry === "string")
      .slice(0, 12);
} catch {
  calculationHistory = [];
}

function updateDisplay() {
  currentOperand.textContent = currentValue || "0";

  if (previousValue && operator) {
    previousOperand.textContent = `${previousValue} ${operator}`;
  } else {
    previousOperand.textContent = "";
  }
}

function addNumber(number) {
  // Prevent multiple decimal points
  if (number === "." && currentValue.includes(".")) {
    return;
  }

  // Prevent multiple leading zeros
  if (currentValue === "0" && number !== ".") {
    currentValue = number;
  } else {
    currentValue += number;
  }

  updateDisplay();
}

function chooseOperator(selectedOperator) {
  // Don't allow an operator without a number
  if (currentValue === "" && previousValue === "") {
    return;
  }

  // If an operation already exists,
  // calculate it first
  if (previousValue !== "" && currentValue !== "" && operator !== null) {
    calculate();
  }

  // Move current value to previous value
  if (currentValue !== "") {
    previousValue = currentValue;
    currentValue = "";
  }

  operator = selectedOperator;

  updateDisplay();
}

function calculate() {
  if (previousValue === "" || currentValue === "" || operator === null) {
    return;
  }

  const firstNumber = Number(previousValue);
  const secondNumber = Number(currentValue);
  const expression = `${previousValue} ${operator} ${currentValue}`;

  let result;

  switch (operator) {
    case "+":
      result = firstNumber + secondNumber;
      break;

    case "−":
      result = firstNumber - secondNumber;
      break;

    case "×":
      result = firstNumber * secondNumber;
      break;

    case "÷":
      // Prevent division by zero
      if (secondNumber === 0) {
        currentValue = "Error";
        previousValue = "";
        operator = null;

        updateDisplay();

        return;
      }

      result = firstNumber / secondNumber;
      break;

    default:
      return;
  }

  // Remove unnecessary decimal places
  currentValue = Number(result.toFixed(10)).toString();
  addHistory(`${expression} = ${currentValue}`);

  previousValue = "";
  operator = null;

  updateDisplay();
}

function addHistory(entry) {
  calculationHistory.unshift(entry);
  calculationHistory = calculationHistory.slice(0, 12);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(calculationHistory));
  renderHistory();
}

function renderHistory() {
  historyList.replaceChildren();
  calculationHistory.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    item.addEventListener("click", () => {
      currentValue = entry.split(" = ").pop();
      previousValue = "";
      operator = null;
      updateDisplay();
    });
    historyList.appendChild(item);
  });
}

function calculateScientific(name) {
  const value = Number(currentValue || previousValue);
  if (!Number.isFinite(value)) return;
  let result;
  if (name === "sqrt" && value < 0) {
    currentValue = "Error";
    previousValue = "";
    operator = null;
    updateDisplay();
    return;
  }
  if (["sin", "cos", "tan"].includes(name)) {
    const radians = (value * Math.PI) / 180;
    result = Math[name](radians);
  } else if (name === "sqrt") {
    result = Math.sqrt(value);
  } else {
    result = value ** 2;
  }
  const formatted = Number(result.toFixed(10)).toString();
  addHistory(`${name}(${value}) = ${formatted}`);
  currentValue = formatted;
  previousValue = "";
  operator = null;
  updateDisplay();
}

function deleteNumber() {
  // If display says Error
  // reset calculator
  if (currentValue === "Error") {
    clearCalculator();
    return;
  }

  currentValue = currentValue.slice(0, -1);

  updateDisplay();
}

function calculatePercentage() {
  if (currentValue === "") {
    return;
  }

  currentValue = (Number(currentValue) / 100).toString();

  updateDisplay();
}

function clearCalculator() {
  currentValue = "";
  previousValue = "";
  operator = null;

  updateDisplay();
}

numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    addNumber(button.textContent);
  });
});

operatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    chooseOperator(button.textContent);
  });
});

clearButton.addEventListener("click", () => {
  clearCalculator();
});

deleteButton.addEventListener("click", () => {
  deleteNumber();
});

percentButton.addEventListener("click", () => {
  calculatePercentage();
});

equalsButton.addEventListener("click", () => {
  calculate();
});

document.querySelectorAll("[data-function]").forEach((button) => {
  button.addEventListener("click", () =>
    calculateScientific(button.dataset.function),
  );
});

document.querySelector(".clear-history").addEventListener("click", () => {
  calculationHistory = [];
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
});

function setTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  themeButton.textContent = theme === "light" ? "Dark theme" : "Light theme";
  localStorage.setItem(THEME_KEY, theme);
}

themeButton.addEventListener("click", () => {
  setTheme(document.body.classList.contains("light-theme") ? "dark" : "light");
});

// Keyboard

document.addEventListener("keydown", (event) => {
  const key = event.key;

  // Numbers
  if (/^[0-9.]$/.test(key)) {
    addNumber(key);
  }

  // Addition
  if (key === "+") {
    chooseOperator("+");
  }

  // Subtraction
  if (key === "-") {
    chooseOperator("−");
  }

  // Multiplication
  if (key === "*") {
    chooseOperator("×");
  }

  // Division
  if (key === "/") {
    event.preventDefault();

    chooseOperator("÷");
  }

  // Equals
  if (key === "Enter" || key === "=") {
    calculate();
  }

  // Delete
  if (key === "Backspace") {
    deleteNumber();
  }

  // Clear
  if (key === "Escape") {
    clearCalculator();
  }

  // Percentage
  if (key === "%") {
    calculatePercentage();
  }
});

updateDisplay();
renderHistory();
setTheme(localStorage.getItem(THEME_KEY) || "dark");
