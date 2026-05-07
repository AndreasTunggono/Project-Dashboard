let projects = JSON.parse(localStorage.getItem("projects")) || [];

function save() {
  localStorage.setItem("projects", JSON.stringify(projects));
}

function addProject() {
  const p = {
    names: names.value,
    category: category.value,
    type: type.value,
    start: start.value,
    end: end.value,
    statusproject: statusproject.value,
    progress: progress.value
  };

  projects.push(p);
  save();
  render();
}

function render() {
  const tbody = document.querySelector("#projectTable tbody");
  tbody.innerHTML = "";

  let statusCount = {};
  let typeCount = {};
  let progressData = [];

  projects.forEach(p => {
    const tr = document.createElement("tr");

    const duration = p.start && p.end ? (new Date(p.end) - new Date(p.start)) / (1000*60*60*24) + " days" : "-";

    tr.innerHTML = `
      <td>${p.names}</td>
      <td>${p.category}</td>
      <td>${p.type}</td>
      <td><span class="status ${p.statusproject}">${p.statusproject}</span></td>
      <td>${p.progress}% <div class="progress-bar" style="width:${p.progress}%"></div></td>
      <td>${duration}</td>
    `;

    tbody.appendChild(tr);

    statusCount[p.statusproject] = (statusCount[p.statusproject] || 0) + 1;
    typeCount[p.type] = (typeCount[p.type] || 0) + 1;
    progressData.push(p.progress);
  });

  renderChart("statusChart", "pie", statusCount);
  renderChart("typeChart", "doughnut", typeCount);
  renderChart("progressChart", "bar", {labels: projects.map(p=>p.names), data: progressData});
}

let charts = {};

function renderChart(id, type, dataObj) {
  const ctx = document.getElementById(id);

  if (charts[id]) charts[id].destroy();

  let data;

  if (type === "bar") {
    data = {
      labels: dataObj.labels,
      datasets: [{ data: dataObj.data }]
    };
  } else {
    data = {
      labels: Object.keys(dataObj),
      datasets: [{ data: Object.values(dataObj) }]
    };
  }

  charts[id] = new Chart(ctx, { type, data });
}

render();
