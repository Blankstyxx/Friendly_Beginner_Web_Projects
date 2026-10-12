const noteForm = document.querySelector(".note-form");
const noteTitle = document.querySelector(".note-title");
const noteContent = document.querySelector(".note-content");
const notesList = document.querySelector(".notes-list");
const emptyMessage = document.querySelector(".empty-message");
const searchInput = document.querySelector(".note-search");
const categoryInput = document.querySelector(".note-category");
const categoryFilter = document.querySelector(".note-category-filter");
const markdownEnabled = document.querySelector(".markdown-enabled");
const themeButton = document.querySelector(".note-theme-toggle");
const addButton = document.querySelector(".add-note-btn");
let editingId = null;

const NOTES_KEY = "notes";
let notes = [];
try {
  notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
  if (!Array.isArray(notes)) notes = [];
} catch {
  notes = [];
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function addNote(title, content) {
  title = title.trim();
  content = content.trim();

  // Don't allow completely empty notes
  if (title === "" && content === "") {
    return;
  }

  // Use default title if none was provided
  if (title === "") {
    title = "Untitled note";
  }

  const note = {
    id: editingId || Date.now() + Math.random(),
    title: title,
    content: content,
    date: new Date().toLocaleDateString(),
    category: categoryInput.value,
    pinned: editingId
      ? Boolean(notes.find((item) => item.id === editingId)?.pinned)
      : false,
    markdown: markdownEnabled.checked,
  };
  if (editingId)
    notes = notes.map((item) => (item.id === editingId ? note : item));
  else notes.unshift(note);
  editingId = null;
  addButton.textContent = "Add Note";

  saveNotes();

  renderNotes();

  // Clear form
  noteTitle.value = "";
  noteContent.value = "";
  noteTitle.focus();
}

function deleteNote(id) {
  if (editingId === id) {
    editingId = null;
    noteForm.reset();
    addButton.textContent = "Add Note";
  }
  notes = notes.filter((note) => {
    return note.id !== id;
  });

  saveNotes();

  renderNotes();
}

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
}

function renderMarkdown(value) {
  const lines = escapeHtml(value).split("\n");
  let inList = false;
  const output = [];
  lines.forEach((line) => {
    if (line.startsWith("- ")) {
      if (!inList) output.push("<ul>");
      inList = true;
      line = `<li>${line.slice(2)}</li>`;
    } else if (inList) {
      output.push("</ul>");
      inList = false;
    }
    line = line
      .replace(/^### (.*)$/, "<h4>$1</h4>")
      .replace(/^## (.*)$/, "<h3>$1</h3>")
      .replace(/^# (.*)$/, "<h2>$1</h2>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>");
    if (line && !line.startsWith("<li>") && !line.startsWith("<h"))
      line = `<p>${line}</p>`;
    output.push(line);
  });
  if (inList) output.push("</ul>");
  return output.join("");
}

function editNote(note) {
  editingId = note.id;
  noteTitle.value = note.title;
  noteContent.value = note.content;
  categoryInput.value = note.category || "Personal";
  markdownEnabled.checked = note.markdown !== false;
  addButton.textContent = "Save Changes";
  noteTitle.focus();
}

function togglePin(id) {
  notes = notes.map((note) =>
    note.id === id ? { ...note, pinned: !note.pinned } : note,
  );
  saveNotes();
  renderNotes();
}

function renderNotes() {
  // Clear existing notes
  notesList.innerHTML = "";

  // Show empty message
  const query = searchInput.value.trim().toLowerCase();
  const visibleNotes = notes
    .filter((note) => {
      const matchesSearch =
        !query || `${note.title} ${note.content}`.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter.value === "all" ||
        (note.category || "Personal") === categoryFilter.value;
      return matchesSearch && matchesCategory;
    })
    .sort(
      (first, second) =>
        Number(Boolean(second.pinned)) - Number(Boolean(first.pinned)),
    );

  if (visibleNotes.length === 0) {
    emptyMessage.style.display = "block";
    emptyMessage.textContent = notes.length
      ? "No notes match your search."
      : "No notes yet. Create your first note!";

    return;
  }

  emptyMessage.style.display = "none";

  // Create note cards
  visibleNotes.forEach((note) => {
    const card = document.createElement("article");
    card.classList.add("note-card");
    if (note.pinned) card.classList.add("pinned");

    // Title
    const title = document.createElement("h2");
    title.textContent = note.title;

    // Content
    const content = document.createElement("div");
    content.classList.add("note-content-preview");
    if (note.markdown !== false)
      content.innerHTML = renderMarkdown(note.content || "No content");
    else content.textContent = note.content || "No content";

    const category = document.createElement("small");
    category.className = "note-meta";
    category.textContent = `${note.pinned ? "Pinned · " : ""}${note.category || "Personal"} · ${note.date || ""}`;

    const pinButton = document.createElement("button");
    pinButton.classList.add("pin-note");
    pinButton.textContent = note.pinned ? "Unpin" : "Pin";
    pinButton.addEventListener("click", () => togglePin(note.id));

    const editButton = document.createElement("button");
    editButton.classList.add("edit-note");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editNote(note));

    // Delete button
    const deleteButton = document.createElement("button");

    deleteButton.classList.add("delete-note");
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete note");

    // Delete event
    deleteButton.addEventListener("click", () => {
      deleteNote(note.id);
    });

    // Add elements
    card.appendChild(title);
    card.appendChild(category);
    card.appendChild(content);
    card.appendChild(pinButton);
    card.appendChild(editButton);
    card.appendChild(deleteButton);

    // Add card to list
    notesList.appendChild(card);
  });
}

noteForm.addEventListener("submit", (event) => {
  // Prevent page reload
  event.preventDefault();

  addNote(noteTitle.value, noteContent.value);
});

searchInput.addEventListener("input", renderNotes);
categoryFilter.addEventListener("change", renderNotes);

function setTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  themeButton.textContent = theme === "light" ? "Dark theme" : "Light theme";
  localStorage.setItem("notes-theme", theme);
}
themeButton.addEventListener("click", () =>
  setTheme(document.body.classList.contains("light-theme") ? "dark" : "light"),
);
setTheme(localStorage.getItem("notes-theme") || "dark");

renderNotes();
