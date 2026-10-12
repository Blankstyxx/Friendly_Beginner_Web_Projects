const todoForm = document.querySelector(".todo-form");
const todoInput = document.querySelector(".todo-input");
const todoList = document.querySelector(".todo-list");
const emptyMessage = document.querySelector(".empty-message");

const taskCount = document.querySelector(".task-count");
const completedCount = document.querySelector(".completed-count");

const clearButton = document.querySelector(".clear-btn");
const filterButtons = document.querySelectorAll(".filter-btn");
const categoryInput = document.querySelector(".task-category");
const dueInput = document.querySelector(".task-due");
const priorityInput = document.querySelector(".task-priority");
const searchInput = document.querySelector(".task-search");
const categoryFilter = document.querySelector(".category-filter");

const STORAGE_KEY = "todo-tasks";

let currentFilter = "all";

let tasks = loadTasks();

/* ==============================
LOCAL STORAGE
================================ */

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  if (savedTasks) {
    try {
      const parsedTasks = JSON.parse(savedTasks);
      if (!Array.isArray(parsedTasks)) return [];
      return parsedTasks
        .filter((task) => task && typeof task.text === "string")
        .map((task, index) => ({
          id: Number.isFinite(Number(task.id))
            ? Number(task.id)
            : Date.now() + index,
          text: task.text,
          completed: Boolean(task.completed),
          category:
            typeof task.category === "string" ? task.category : "Personal",
          dueDate: typeof task.dueDate === "string" ? task.dueDate : "",
          priority: ["low", "normal", "high"].includes(task.priority)
            ? task.priority
            : "normal",
        }));
    } catch (error) {
      console.error("Could not load saved tasks:", error);
      return [];
    }
  }

  return [
    {
      id: Date.now(),
      text: 'Contact "Blankstyxx" for his Awesome project',
      completed: false,
      category: "Personal",
      dueDate: "",
      priority: "normal",
    },
  ];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* ==============================
ADD TASK
================================ */

function addTask(taskText) {
  taskText = taskText.trim();

  if (taskText === "") {
    return;
  }

  const task = {
    id: Date.now(),
    text: taskText,
    completed: false,
    category: categoryInput.value,
    dueDate: dueInput.value,
    priority: priorityInput.value,
  };

  tasks.push(task);

  saveTasks();
  renderTasks();

  todoInput.value = "";
  dueInput.value = "";
  todoInput.focus();
}

/* ==============================
DELETE TASK
================================ */

function deleteTask(id) {
  tasks = tasks.filter((task) => {
    return task.id !== id;
  });

  saveTasks();
  renderTasks();
}

/* ==============================
TOGGLE TASK
================================ */

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        completed: !task.completed,
      };
    }

    return task;
  });

  saveTasks();
  renderTasks();
}

/* ==============================
CLEAR ALL TASKS
================================ */

function clearTasks() {
  if (tasks.length === 0) {
    return;
  }

  const confirmed = confirm("Are you sure you want to delete all tasks?");

  if (!confirmed) {
    return;
  }

  tasks = [];

  saveTasks();
  renderTasks();
}

/* ==============================
FILTER TASKS
================================ */

function getFilteredTasks() {
  const query = searchInput.value.trim().toLowerCase();
  return tasks.filter((task) => {
    const matchesStatus =
      currentFilter === "all" ||
      (currentFilter === "active" ? !task.completed : task.completed);
    const matchesCategory =
      categoryFilter.value === "all" ||
      (task.category || "Personal") === categoryFilter.value;
    const matchesSearch = !query || task.text.toLowerCase().includes(query);
    return matchesStatus && matchesCategory && matchesSearch;
  });
}

/* ==============================
RENDER TASKS
================================ */

function renderTasks() {
  todoList.innerHTML = "";

  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    emptyMessage.style.display = "block";

    if (currentFilter === "active") {
      emptyMessage.textContent = "No active tasks.";
    } else if (currentFilter === "completed") {
      emptyMessage.textContent = "No completed tasks.";
    } else {
      emptyMessage.textContent = "No tasks yet. Add your first task!";
    }
  } else {
    emptyMessage.style.display = "none";
  }

  filteredTasks.forEach((task) => {
    const listItem = document.createElement("li");

    listItem.classList.add("todo-item");
    listItem.draggable = true;
    listItem.dataset.taskId = task.id;
    listItem.classList.add(`priority-${task.priority || "normal"}`);

    if (task.completed) {
      listItem.classList.add("completed");
    }

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.classList.add("todo-checkbox");
    checkbox.checked = task.completed;

    checkbox.setAttribute("aria-label", `Mark "${task.text}" as completed`);

    const text = document.createElement("span");

    text.classList.add("todo-text");
    text.textContent = task.text;

    const details = document.createElement("small");
    details.className = "task-details";
    details.textContent = `${task.category || "Personal"} · ${task.priority || "normal"} priority · ${task.dueDate ? `Due ${task.dueDate}` : "No due date"}`;

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.classList.add("delete-btn");
    deleteButton.textContent = "Delete";

    deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);

    checkbox.addEventListener("change", () => {
      toggleTask(task.id);
    });

    listItem.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", String(task.id));
      event.dataTransfer.effectAllowed = "move";
      listItem.classList.add("dragging");
    });
    listItem.addEventListener("dragend", () =>
      listItem.classList.remove("dragging"),
    );
    listItem.addEventListener("dragover", (event) => event.preventDefault());
    listItem.addEventListener("drop", (event) => {
      event.preventDefault();
      const draggedId = Number(event.dataTransfer.getData("text/plain"));
      const fromIndex = tasks.findIndex((item) => item.id === draggedId);
      const toIndex = tasks.findIndex((item) => item.id === task.id);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
      const [moved] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, moved);
      saveTasks();
      renderTasks();
    });

    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });

    listItem.appendChild(checkbox);
    listItem.appendChild(text);
    listItem.appendChild(details);
    listItem.appendChild(deleteButton);

    todoList.appendChild(listItem);
  });

  updateCounters();
}

/* ==============================
UPDATE COUNTERS
================================ */

function updateCounters() {
  const completedTasks = tasks.filter((task) => task.completed);

  taskCount.textContent = tasks.length;

  completedCount.textContent = completedTasks.length;
}

/* ==============================
FILTER BUTTONS
================================ */

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    renderTasks();
  });
});

/* ==============================
FORM SUBMIT
================================ */

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  addTask(todoInput.value);
});

/* ==============================
CLEAR BUTTON
================================ */

clearButton.addEventListener("click", () => {
  clearTasks();
});

searchInput.addEventListener("input", renderTasks);
categoryFilter.addEventListener("change", renderTasks);

/* ==============================
INITIAL RENDER
================================ */

renderTasks();
