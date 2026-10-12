const passwordInput = document.querySelector(".password");

const lengthInput = document.querySelector(".length");
const lengthValue = document.querySelector(".length-value");

const uppercaseCheckbox = document.querySelector(".uppercase");
const lowercaseCheckbox = document.querySelector(".lowercase");
const numbersCheckbox = document.querySelector(".numbers");
const symbolsCheckbox = document.querySelector(".symbols");

const generateButton = document.querySelector(".generate-btn");
const copyButton = document.querySelector(".copy-btn");

const message = document.querySelector(".message");
const customCharactersInput = document.querySelector(".custom-characters");
const excludeSimilarCheckbox = document.querySelector(".exclude-similar");
const strengthMeter = document.querySelector(".strength-meter");
const strengthLabel = document.querySelector(".strength-label");

const uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";

const numbers = "0123456789";

const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

lengthInput.addEventListener("input", () => {
  lengthValue.textContent = lengthInput.value;
});

function generatePassword() {
  const length = Number(lengthInput.value);

  let characters = "";

  // Add selected character types
  if (uppercaseCheckbox.checked) {
    characters += uppercaseLetters;
  }

  if (lowercaseCheckbox.checked) {
    characters += lowercaseLetters;
  }

  if (numbersCheckbox.checked) {
    characters += numbers;
  }

  if (symbolsCheckbox.checked) {
    characters += symbols;
  }
  characters += customCharactersInput.value;

  if (excludeSimilarCheckbox.checked) {
    characters = characters.replace(/[il1Lo0O]/g, "");
  }

  // Make sure at least one option is selected
  if (characters.length === 0) {
    passwordInput.value = "";

    message.textContent = "Please select at least one option.";

    message.style.color = "#ef4444";

    return;
  }

  // Generate password
  const pools = [
    uppercaseCheckbox.checked ? uppercaseLetters : "",
    lowercaseCheckbox.checked ? lowercaseLetters : "",
    numbersCheckbox.checked ? numbers : "",
    symbolsCheckbox.checked ? symbols : "",
    customCharactersInput.value,
  ]
    .map((pool) =>
      excludeSimilarCheckbox.checked ? pool.replace(/[il1Lo0O]/g, "") : pool,
    )
    .filter(Boolean);
  if (pools.length > length) {
    message.textContent =
      "Choose fewer character types or increase the length.";
    message.style.color = "#ef4444";
    return;
  }
  const randomIndex = (max) => {
    const range = 0x100000000;
    const limit = Math.floor(range / max) * max;
    const value = new Uint32Array(1);
    do {
      crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % max;
  };
  const passwordCharacters = pools.map(
    (pool) => pool[randomIndex(pool.length)],
  );
  while (passwordCharacters.length < length)
    passwordCharacters.push(characters[randomIndex(characters.length)]);
  for (let index = passwordCharacters.length - 1; index > 0; index--) {
    const swapIndex = randomIndex(index + 1);
    [passwordCharacters[index], passwordCharacters[swapIndex]] = [
      passwordCharacters[swapIndex],
      passwordCharacters[index],
    ];
  }
  const password = passwordCharacters.join("");

  // Display password
  passwordInput.value = password;

  message.textContent = "Password generated!";

  message.style.color = "#22c55e";
  updateStrength(password, characters.length);
}

function updateStrength(password, poolSize) {
  const entropy = password.length * Math.log2(Math.max(poolSize, 1));
  const level =
    entropy < 40
      ? "Weak"
      : entropy < 70
        ? "Fair"
        : entropy < 100
          ? "Strong"
          : "Excellent";
  const percentage = Math.min(100, Math.round((entropy / 120) * 100));
  strengthMeter.style.width = `${percentage}%`;
  strengthMeter.dataset.level = level.toLowerCase();
  strengthLabel.textContent = level;
}

async function copyPassword() {
  const password = passwordInput.value;

  if (password === "") {
    message.textContent = "Generate a password first.";

    message.style.color = "#ef4444";

    return;
  }

  try {
    await navigator.clipboard.writeText(password);

    message.textContent = "Password copied to clipboard!";

    message.style.color = "#22c55e";

    copyButton.textContent = "Copied!";

    setTimeout(() => {
      copyButton.textContent = "Copy";
    }, 1500);
  } catch (error) {
    // Fallback for older browsers
    passwordInput.select();

    document.execCommand("copy");

    message.textContent = "Password copied!";

    message.style.color = "#22c55e";
  }
}

generateButton.addEventListener("click", generatePassword);

copyButton.addEventListener("click", copyPassword);

generatePassword();
