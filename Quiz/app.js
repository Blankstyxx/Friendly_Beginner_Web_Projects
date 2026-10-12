const questionElement = document.querySelector(".question");
const optionButtons = document.querySelectorAll(".option");
const messageElement = document.querySelector(".message");
const nextButton = document.querySelector(".next-btn");
const scoreElement = document.querySelector(".score-value");

const questions = [
    {
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyperlink Text Management Language",
            "Home Tool Markup Language"
        ],
        answer: "Hyper Text Markup Language"
    },

    {
        question: "What does CSS stand for?",
        options: [
            "Computer Style Sheets",
            "Cascading Style Sheets",
            "Creative Style System",
            "Colorful Style Sheets"
        ],
        answer: "Cascading Style Sheets"
    },

    {
        question: "Which language is used to make a webpage interactive?",
        options: [
            "HTML",
            "CSS",
            "JavaScript",
            "SQL"
        ],
        answer: "JavaScript"
    }
];

let currentQuestion = 0;
let score = 0;
let answered = false;


// Display question
function showQuestion() {
    const question = questions[currentQuestion];

    questionElement.textContent = question.question;

    optionButtons.forEach((button, index) => {
        button.textContent = question.options[index];

        button.disabled = false;

        button.classList.remove("correct", "wrong");
    });

    messageElement.textContent = "";
    answered = false;

    nextButton.style.display = "none";
}


// Check answer
function checkAnswer(selectedButton) {
    if (answered) return;

    answered = true;

    const selectedAnswer = selectedButton.textContent;
    const correctAnswer = questions[currentQuestion].answer;

    optionButtons.forEach((button) => {
        button.disabled = true;

        if (button.textContent === correctAnswer) {
            button.classList.add("correct");
        }
    });

    if (selectedAnswer === correctAnswer) {
        score++;

        scoreElement.textContent = score;
        messageElement.textContent = "Correct! ";
        selectedButton.classList.add("correct");
    } else {
        messageElement.textContent = "Wrong answer!";
        selectedButton.classList.add("wrong");
    }

    nextButton.style.display = "block";
}


// Next question
function nextQuestion() {
    currentQuestion++;

    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        questionElement.textContent = "Quiz completed! 🎉";

        messageElement.textContent =
            `You scored ${score} out of ${questions.length}.`;

        optionButtons.forEach((button) => {
            button.style.display = "none";
        });

        nextButton.style.display = "none";
    }
}


// Option button events
optionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        checkAnswer(button);
    });
});


// Next button event
nextButton.addEventListener("click", nextQuestion);


// Start quiz
showQuestion();
