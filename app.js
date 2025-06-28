document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) window.location.href = "index.html";
  
    const usernameEl = document.getElementById("username");
    const avatarEl = document.getElementById("avatar");
    const signoutBtn = document.getElementById("signout");
    const taskText = document.getElementById("task-text");
    const addTaskBtn = document.getElementById("add-task");
    const toast = document.getElementById("toast");
  
    const stages = ["todo", "completed", "archived"];
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
    usernameEl.textContent = user.name;
    avatarEl.src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user.name}`;
  
    // Tab switching
    document.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".task-stage").forEach(s => s.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
      });
    });
  
    signoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  
    addTaskBtn.addEventListener("click", () => {
      const text = taskText.value.trim();
      if (text) {
        tasks.push({ text, stage: "todo", updated: new Date().toLocaleString() });
        saveTasks();
        render();
        taskText.value = "";
        showToast("Task added to Todo.");
      }
    });
  
    if (!tasks.length) {
      fetch("https://dummyjson.com/todos")
        .then(res => res.json())
        .then(data => {
          tasks = data.todos.slice(0, 5).map(t => ({
            text: t.todo,
            stage: "todo",
            updated: new Date().toLocaleString()
          }));
          saveTasks();
          render();
        });
    } else {
      render();
    }
  
    function saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  
    function showToast(message) {
      toast.textContent = message;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 2500);
    }
  
    function render() {
      stages.forEach(stage => {
        const container = document.getElementById(stage);
        container.innerHTML = "";
        const stageTasks = tasks.filter(t => t.stage === stage);
        document.getElementById(`${stage}-count`).textContent = stageTasks.length;
  
        stageTasks.forEach((task, index) => {
          const card = document.createElement("div");
          card.className = "task-card";
          card.innerHTML = `
            <div>
              <p>${task.text}</p>
              <small>Last modified at: ${task.updated}</small>
            </div>
            <div class="actions"></div>
          `;
          const actions = card.querySelector(".actions");
          actions.append(...getActionButtons(task.stage, index));
          container.appendChild(card);
        });
      });
    }
  
    function getActionButtons(stage, index) {
      const btns = [];
      const updateStage = (newStage) => {
        tasks[index].stage = newStage;
        tasks[index].updated = new Date().toLocaleString();
        saveTasks();
        render();
        showToast(`Task moved to ${capitalize(newStage)}.`);
      };
  
      const createBtn = (label, callback, color = '#4ade80') => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.style.margin = "0 5px";
        btn.style.background = color;
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.padding = "0.5rem 0.75rem";
        btn.style.borderRadius = "6px";
        btn.style.cursor = "pointer";
        btn.onclick = callback;
        return btn;
      };
  
      if (stage === "todo") {
        btns.push(createBtn("Mark as completed", () => updateStage("completed"), "#22c55e"));
        btns.push(createBtn("Archive", () => updateStage("archived"), "#6b7280"));
      } else if (stage === "completed") {
        btns.push(createBtn("Archive", () => updateStage("archived"), "#6b7280"));
      } else if (stage === "archived") {
        btns.push(createBtn("Todo", () => updateStage("todo"), "#3b82f6"));
        btns.push(createBtn("Complete", () => updateStage("completed"), "#22c55e"));
      }
  
      return btns;
    }
  
    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  });
  