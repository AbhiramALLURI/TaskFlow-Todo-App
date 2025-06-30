// app.js - Enhanced for Full Feature Set

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) window.location.href = "index.html";

  const usernameEl = document.getElementById("username");
  const avatarEl = document.getElementById("avatar");
  const signoutBtn = document.getElementById("signout");
  const addTaskBtn = document.getElementById("add-task");
  const taskText = document.getElementById("task-text");
  const taskDate = document.getElementById("task-date");
  const taskPriority = document.getElementById("task-priority");
  const searchBar = document.getElementById("search-bar");
  const themeToggle = document.getElementById("theme-toggle");
  const toast = document.getElementById("toast");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  usernameEl.textContent = user.name;
  avatarEl.src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user.name}`;

  // Theme switch
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");
  });

  // Sidebar tab switching
  document.querySelectorAll(".sidebar button").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".sidebar button").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".task-stage").forEach(s => s.classList.remove("active"));
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add("active");
      render();
    });
  });

  signoutBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.clear();
      window.location.href = "index.html";
    }
  });

  addTaskBtn.addEventListener("click", () => {
    const text = taskText.value.trim();
    if (!text) return showToast("Task cannot be empty.");
    tasks.push({
      text,
      stage: "todo",
      updated: new Date().toLocaleString(),
      due: taskDate.value,
      priority: taskPriority.value
    });
    saveTasks();
    render();
    taskText.value = "";
    taskDate.value = "";
    taskPriority.value = "medium";
    showToast("Task added.");
  });

  searchBar.addEventListener("input", render);

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  }

  function render() {
    const query = searchBar.value.toLowerCase();
    ["todo", "completed", "archived"].forEach(stage => {
      const el = document.getElementById(stage);
      if (!el.classList.contains("active")) return;

      el.innerHTML = "";
      const filtered = tasks.filter(t => t.stage === stage && t.text.toLowerCase().includes(query));
      document.getElementById(`${stage}-count`).textContent = filtered.length;

      if (filtered.length === 0) {
        const msg = document.createElement("p");
        msg.textContent = "No tasks in this section.";
        msg.style.color = "#888";
        msg.style.textAlign = "center";
        el.appendChild(msg);
        return;
      }

      filtered.forEach(task => {
        const index = tasks.findIndex(t => t.text === task.text && t.stage === task.stage && t.updated === task.updated);

        const card = document.createElement("div");
        card.className = "task-card";

        const priorityLabel = {
          high: "🔴 High",
          medium: "🟡 Medium",
          low: "🟢 Low"
        }[task.priority];

        const taskTextEl = document.createElement("p");
        taskTextEl.className = "task-text";
        taskTextEl.setAttribute("contenteditable", "false");
        taskTextEl.textContent = task.text;

        const modifiedEl = document.createElement("small");
        modifiedEl.textContent = `Last modified: ${task.updated}`;

        const dueEl = document.createElement("small");
        dueEl.textContent = `Due: ${task.due || "N/A"}`;

        const priorityEl = document.createElement("small");
        priorityEl.textContent = `Priority: ${priorityLabel}`;

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "actions";

        card.appendChild(taskTextEl);
        card.appendChild(modifiedEl);
        card.appendChild(dueEl);
        card.appendChild(priorityEl);
        card.appendChild(actionsDiv);

        if (stage !== "archived") {
          const editBtn = btn("✏️ Edit", () => {
            taskTextEl.setAttribute("contenteditable", true);
            taskTextEl.focus();
            editBtn.textContent = "💾 Save";
            editBtn.onclick = () => {
              tasks[index].text = taskTextEl.textContent.trim();
              tasks[index].updated = new Date().toLocaleString();
              saveTasks();
              render();
              showToast("Task updated.");
            };
          });
          actionsDiv.appendChild(editBtn);
        }

        if (stage === "todo") {
          actionsDiv.appendChild(btn("✔ Complete", () => updateStage(index, "completed")));
        }

        if (stage !== "archived") {
          actionsDiv.appendChild(btn("🗃 Archive", () => confirmAction(() => updateStage(index, "archived"))));
        }

        if (stage === "archived") {
          actionsDiv.appendChild(btn("↩ Restore", () => updateStage(index, "todo")));
        }

        el.appendChild(card);
      });
    });
  }

  function btn(label, action) {
    const b = document.createElement("button");
    b.textContent = label;
    b.onclick = action;
    return b;
  }

  function confirmAction(fn) {
    if (confirm("Are you sure?")) fn();
  }

  function updateStage(index, newStage) {
    tasks[index].stage = newStage;
    tasks[index].updated = new Date().toLocaleString();
    saveTasks();
    render();
    showToast(`Task moved to ${capitalize(newStage)}.`);
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  render();
});
