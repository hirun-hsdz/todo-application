"use strict";
const todoForm = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const submitBtn = document.getElementById("submitBtn");
const formTitle = document.getElementById("formTitle");
const formHint = document.getElementById("formHint");
const searchInput = document.getElementById("searchInput");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
let todos = JSON.parse(localStorage.getItem("myTodos")) || [];
let currentFilter = "all";
let editingId = null;
// Display today's date
document.getElementById("todayDate").textContent = new Intl.DateTimeFormat(
  "en",
  {
    weekday: "short",
    month: "short",
    day: "numeric",
  },
).format(new Date());
// Save tasks in Local Storage
function saveTodos() {
  localStorage.setItem("myTodos", JSON.stringify(todos));
}
// Update task counts
function updateStats() {
  document.getElementById("totalCount").textContent = todos.length;
  document.getElementById("activeCount").textContent = todos.filter(
    (todo) => !todo.completed,
  ).length;
  document.getElementById("completedCount").textContent = todos.filter(
    (todo) => todo.completed,
  ).length;
}
// Reset form
function resetForm() {
  editingId = null;
  taskInput.value = "";
  formTitle.textContent = "Add a New Task";
  submitBtn.textContent = "+ Add Task";
  formHint.textContent = "Press Enter to add your task.";
}
// Display tasks
function renderTodos() {
  todoList.innerHTML = "";
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filteredTodos = todos.filter((todo) => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "active" && !todo.completed) ||
      (currentFilter === "completed" && todo.completed);
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });
  filteredTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " completed" : ""}`;
    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-check";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => {
      toggleTodo(todo.id);
    });
    // Task text
    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;
    // Action buttons
    const actions = document.createElement("div");
    actions.className = "todo-actions";
    // Edit button
    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn";
    editBtn.type = "button";
    editBtn.textContent = "✎";
    editBtn.title = "Edit Task";
    editBtn.addEventListener("click", () => {
      startEditing(todo.id);
    });
    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-btn delete";
    deleteBtn.type = "button";
    deleteBtn.textContent = "✕";
    deleteBtn.title = "Delete Task";
    deleteBtn.addEventListener("click", () => {
      deleteTodo(todo.id);
    });
    actions.append(editBtn, deleteBtn);
    li.append(checkbox, text, actions);
    todoList.appendChild(li);
  });
  emptyState.style.display = filteredTodos.length === 0 ? "block" : "none";
  if (todos.length === 0) {
    emptyState.querySelector("p").textContent =
      "Add a task above and get started.";
  } else if (filteredTodos.length === 0) {
    emptyState.querySelector("p").textContent =
      "Try another filter or search term.";
  }
  updateStats();
}
// Add and Edit tasks
todoForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }
  if (editingId !== null) {
    const todo = todos.find((item) => item.id === editingId);
    if (todo) {
      todo.text = text;
    }
  } else {
    const newTodo = {
      id:
        window.crypto && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      text: text,
      completed: false,
    };
    todos.unshift(newTodo);
  }
  saveTodos();
  resetForm();
  renderTodos();
  taskInput.focus();
});
// Complete / Uncomplete task
function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return {
        ...todo,
        completed: !todo.completed,
      };
    }
    return todo;
  });
  saveTodos();
  renderTodos();
}
// Edit task
function startEditing(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;
  editingId = id;
  taskInput.value = todo.text;
  formTitle.textContent = "Edit Your Task";
  submitBtn.textContent = "Save Changes";
  formHint.textContent = "Update the task and press Save Changes.";
  taskInput.focus();
  taskInput.select();
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
// Delete task
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  if (editingId === id) {
    resetForm();
  }
  saveTodos();
  renderTodos();
}
// Clear completed tasks
clearCompletedBtn.addEventListener("click", function () {
  const completedCount = todos.filter((todo) => todo.completed).length;
  if (completedCount === 0) return;
  todos = todos.filter((todo) => !todo.completed);
  if (editingId !== null && !todos.some((todo) => todo.id === editingId)) {
    resetForm();
  }
  saveTodos();
  renderTodos();
});
// Filter buttons
document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    button.classList.add("active");
    renderTodos();
  });
});
// Search tasks
searchInput.addEventListener("input", renderTodos);
// Initial render
renderTodos();
