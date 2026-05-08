let projects = JSON.parse(localStorage.getItem("projects")) || [];
let charts = {};

const submitBtn = document.getElementById("submitBtn");
const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");

submitBtn.addEventListener("click", addProject);
searchInput.addEventListener("input", render);
filterStatus.addEventListener("change", render);

function save() {
  localStorage.setItem("projects", JSON.stringify(projects));
}

function addProject() {
  const nameInput = document.getElementById("projectName");
  const categoryInput = document.getElementById("category");
  const typeInput = document.getElementById("type");
  const startInput = document.getElementById("start");
  const endInput = document.getElementById("end");
  const statusInput = document.getElementById("statusproject");
  const progressInput = document.getElementById("progress");

  const name = nameInput.value.trim();
  const category = categoryInput.value;
  const type = typeInput.value;
  const start = startInput.value;
  const end = endInput.value;
  const status = statusInput.value;
  const progress = Number(progressInput.value);

  if (!name) {
    alert("Project name is required");
    return;
  }

  if (isNaN(progress) || progress < 0 || progress > 100) {
    alert("Progress must be between 0 and 100");
    return;
  }

  projects.push({
    id: Date.now(),
    name,
    category,
    type,
    start,
    end,
    status,
    progress
  });

  save();

  nameInput.value = "";
  categoryInput.selectedIndex = 0;
  typeInput.selectedIndex = 0;
  startInput.value = "";
  endInput.value = "";
  progressInput.value = "";

  render();
}

function deleteProject(id) {
  projects = projects.filter(project => project.id !== id);
  save();
  render();
}

function render() {
  const tbody = document.querySelector("#projectTable tbody");
  tbody.innerHTML = "";

  const keyword = (searchInput.value || "").toLowerCase();
  const statusValue = filterStatus.value;

  const filteredProjects = projects.filter(project => {
    const safeName = (project.name || "").toLowerCase();

    const matchSearch = safeName.includes(keyword);
    const matchStatus = statusValue === "All" || project.status === statusValue;

    return matchSearch && matchStatus;
  });

  document.getElementById("totalProjects").innerText = filteredProjects.length;

  const avgProgress = filteredProjects.length
    ? Math.round(filteredProjects.reduce((a,b)=>a+b.progress,0)/filteredProjects.length)
    : 0;

  document.getElementById("avgProgress").innerText = avgProgress + "%";

  const completed = filteredProjects.filter(p => p.progress === 100).length;
  document.getElementById("completedProjects").innerText = completed;

  let statusCount = {};
  let typeCount = {};
  let categoryCount = {};

  filteredProjects.forEach(project => {

    let duration = "-";

    if(project.start && project.end){
      const diff = Math.ceil(
        (new Date(project.end) - new Date(project.start)) / (1000*60*60*24)
      );

      duration = diff + " days";
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${project.name || "-"}</td>
      <td>${project.category || "-"}</td>
      <td>${project.type || "-"}</td>
      <td>${project.status || "-"}</td>
      <td>
        ${project.progress}%
        <div class="progress-container">
          <div class="progress-bar" style="width:${project.progress}%"></div>
        </div>
      </td>
      <td>${duration}</td>
      <td>
        <button class="delete-btn" onclick="deleteProject(${project.id})">
          Delete
        </button>
      </td>
    `;

    tbody.appendChild(tr);

    statusCount[project.status] = (statusCount[project.status] || 0) + 1;
    typeCount[project.type] = (typeCount[project.type] || 0) + 1;
    categoryCount[project.category] = (categoryCount[project.category] || 0) + 1;
  });

  renderChart("statusChart", "pie", statusCount);
  renderChart("typeChart", "doughnut", typeCount);
  renderChart("categoryChart", "polarArea", categoryCount);
  renderBarChart(filteredProjects);
}

function renderChart(id, type, dataObject) {
  const ctx = document.getElementById(id);

  if (!ctx) return;

  if (charts[id]) {
    charts[id].destroy();
  }

  charts[id] = new Chart(ctx, {
    type: type,
    data: {
      labels: Object.keys(dataObject),
      datasets: [{
        data: Object.values(dataObject),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function renderBarChart(data) {
  const ctx = document.getElementById("progressChart");

  if (!ctx) return;

  if (charts["progressChart"]) {
    charts["progressChart"].destroy();
  }

  charts["progressChart"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(p => p.name),
      datasets: [{
        label: "Progress",
        data: data.map(p => p.progress)
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

render();
