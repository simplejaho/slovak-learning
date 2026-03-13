let currentSelected = null;


// ========================
// INIT
// ========================

async function init() {

  await loadNavigation();

  setupNavigationClick();

  setupMenu();

}

init();


// ========================
// SIDEBAR TOGGLE
// ========================

function setupMenu(){

  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menu-toggle");

  toggle.onclick = () => {

    sidebar.classList.toggle("closed");

  };

}


// ========================
// LOAD NAVIGATION
// ========================

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


// ========================
// CREATE NAVIGATION NODE
// ========================

function createNode(node, number, level) {

  const container = document.createElement("div");

  const item = document.createElement("div");

  item.className = "nav-item";

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


// ========================
// SIDEBAR CLICK HANDLING
// ========================

function setupNavigationClick() {

  const navTree = document.getElementById("nav-tree");

  navTree.addEventListener("click", function(e) {

    const item = e.target.closest(".nav-item");

    if (!item) return;

    const lessonPath = item.dataset.lesson;

    if (!lessonPath) return;

    loadLesson(lessonPath);

    if (currentSelected) {

      currentSelected.classList.remove("active");

    }

    item.classList.add("active");

    currentSelected = item;

  });

}


// ========================
// LOAD LESSON
// ========================

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

  }

}


// ========================
// DISPLAY LESSON
// ========================

function displayLesson(lesson) {

  const rulesPanel = document.getElementById("rules");
  const vocabPanel = document.getElementById("vocab");

  const front = document.querySelector(".flash-front");
  const back = document.querySelector(".flash-back");
  const nextBtn = document.getElementById("next-card");

  rulesPanel.innerHTML = "";
  vocabPanel.innerHTML = "";


  // ========================
  // TITLE
  // ========================

  const title = document.createElement("h2");

  title.textContent = lesson.title;

  rulesPanel.appendChild(title);


  // ========================
  // RULES
  // ========================

  if (lesson.rules) {

    const header = document.createElement("h3");

    header.textContent = "Rules";

    rulesPanel.appendChild(header);

    lesson.rules.forEach(rule => {

      const div = document.createElement("div");

      div.className = "rule";

      div.innerHTML = `
        <h4>${rule.title}</h4>
        <p>${rule.text}</p>
      `;

      if (rule.examples) {

        const ul = document.createElement("ul");

        rule.examples.forEach(ex => {

          const li = document.createElement("li");

          li.textContent = ex;

          ul.appendChild(li);

        });

        div.appendChild(ul);

      }

      rulesPanel.appendChild(div);

    });

  }


  // ========================
  // VOCAB TABLE
  // ========================

  if (lesson.vocab) {

    const search = document.createElement("input");

    search.id = "vocab-search";

    search.type = "text";

    search.placeholder = "Search vocabulary...";

    vocabPanel.appendChild(search);


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


    const tbody = table.querySelector("tbody");


    lesson.vocab.forEach(word => {

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${word.sk}</td>
        <td>${word.en}</td>
      `;

      tbody.appendChild(tr);

    });


    // SEARCH FILTER

    search.addEventListener("input", function () {

      const filter = this.value.toLowerCase();

      tbody.querySelectorAll("tr").forEach(row => {

        const sk = row.cells[0].textContent.toLowerCase();

        const en = row.cells[1].textContent.toLowerCase();

        row.style.display =
          sk.includes(filter) || en.includes(filter)
            ? ""
            : "none";

      });

    });

  }


  // ========================
  // EXERCISES
  // ========================

  if (lesson.exercises && lesson.exercises.length > 0) {

    let current = 0;

    function showCard() {

      const ex = lesson.exercises[current];

      front.textContent = ex.sk;

      back.textContent = ex.en;

    }

    showCard();

    nextBtn.onclick = () => {

      current++;

      if (current >= lesson.exercises.length) {

        current = 0;

      }

      showCard();

    };

  } else {

    front.textContent = "No exercises";

    back.textContent = "";

  }

}
