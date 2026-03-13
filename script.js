let currentSelected = null;

// Initialize app
async function init() {
  await loadNavigation();
  setupNavigationClick();
}

// Load navigation JSON
async function loadNavigation() {
  const res = await fetch("data/navigation.json");
  const data = await res.json();

  const navTree = document.getElementById("nav-tree");
  navTree.innerHTML = "";

  data.topics.forEach((topic, i) => {
    const node = createNode(topic, `${i + 1}`, 0);
    navTree.appendChild(node);
  });
}

// Recursive node creation with level classes
function createNode(node, number, level) {
  const container = document.createElement("div");

  const item = document.createElement("div");
  item.className = `nav-item level-${level}`;
  item.style.paddingLeft = `${level * 18}px`;
  item.textContent = `${number}. ${node.title}`;

  if (node.lesson) {
    item.dataset.lesson = node.lesson;
    item.classList.add("clickable");
  }

  container.appendChild(item);

  if (node.children) {
    node.children.forEach((child, index) => {
      const childNode = createNode(child, `${number}.${index + 1}`, level + 1);
      container.appendChild(childNode);
    });
  }

  return container;
}

// Event delegation for clicks
function setupNavigationClick() {
  const navTree = document.getElementById("nav-tree");

  navTree.addEventListener("click", function (e) {
    const item = e.target.closest(".nav-item");
    if (!item || !item.classList.contains("clickable")) return;

    const lessonPath = item.dataset.lesson;
    if (!lessonPath) return;

    loadLesson(lessonPath);

    if (currentSelected) currentSelected.classList.remove("active");
    item.classList.add("active");
    currentSelected = item;
  });
}

// Load lesson JSON
async function loadLesson(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error("Lesson not found");
    const lesson = await res.json();
    displayLesson(lesson);
  } catch (err) {
    console.error(err);
    document.getElementById("rules").innerHTML =
      "<p style='color:red'>Failed to load lesson</p>";
    document.getElementById("vocab").innerHTML = "";
  }
}

// Display lesson in rules + vocab panels
function displayLesson(lesson) {
  const rulesPanel = document.getElementById("rules");
  const vocabPanel = document.getElementById("vocab");

  // Clear old content
  rulesPanel.innerHTML = "";
  vocabPanel.innerHTML = "";

  // Lesson title
  const title = document.createElement("h2");
  title.textContent = lesson.title;
  rulesPanel.appendChild(title);

  // === Rules Section ===
  if (lesson.rules) {
    const header = document.createElement("h3");
    header.textContent = "Rules";
    rulesPanel.appendChild(header);

    lesson.rules.forEach((rule) => {
      const div = document.createElement("div");
      div.className = "rule";
      div.innerHTML = `<h4>${rule.title}</h4><p>${rule.text}</p>`;

      if (rule.examples) {
        const ul = document.createElement("ul");
        rule.examples.forEach((ex) => {
          const li = document.createElement("li");
          li.textContent = ex;
          ul.appendChild(li);
        });
        div.appendChild(ul);
      }

      rulesPanel.appendChild(div);
    });
  }

  // === Vocabulary Section ===
  if (lesson.vocab) {
    // create search input
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search vocabulary...";
    searchInput.id = "vocab-search";
    searchInput.style.marginBottom = "10px";
    searchInput.style.width = "100%";
    searchInput.style.padding = "8px";
    searchInput.style.borderRadius = "4px";
    searchInput.style.border = "1px solid #ccc";
    vocabPanel.appendChild(searchInput);

    // create table
    const table = document.createElement("table");
    table.id = "vocab-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Slovak</th>
          <th>English</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    vocabPanel.appendChild(table);

    const tableBody = table.querySelector("tbody");

    // populate table
    lesson.vocab.forEach((word) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${word.sk}</td><td>${word.en}</td>`;
      tableBody.appendChild(tr);
    });

    // attach search filter
    searchInput.addEventListener("input", function () {
      const filter = this.value.toLowerCase();
      tableBody.querySelectorAll("tr").forEach((row) => {
        const sk = row.cells[0].textContent.toLowerCase();
        const en = row.cells[1].textContent.toLowerCase();
        row.style.display = sk.includes(filter) || en.includes(filter) ? "" : "none";
      });
    });
  }
}

// Initialize app
init();
