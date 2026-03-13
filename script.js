let currentSelected = null;

async function init() {
  await loadNavigation();
  setupNavigationClick();
}

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

function setupNavigationClick() {

  const navTree = document.getElementById("nav-tree");

  navTree.addEventListener("click", function(e) {

    const item = e.target.closest(".nav-item");

    if (!item) return;

    const lessonPath = item.dataset.lesson;

    if (!lessonPath) return;

    console.log("Loading lesson:", lessonPath);

    loadLesson(lessonPath);

    if (currentSelected) {
      currentSelected.classList.remove("active");
    }

    item.classList.add("active");
    currentSelected = item;

  });

}

async function loadLesson(path) {

  try {

    const res = await fetch(path);

    if (!res.ok) throw new Error("Lesson not found");

    const lesson = await res.json();

    displayLesson(lesson);

  } catch (err) {

    console.error(err);

    document.getElementById("content").innerHTML =
      "<p style='color:red'>Failed to load lesson</p>";

  }

}

function displayLesson(lesson) {

  const content = document.getElementById("content");
  content.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = lesson.title;

  content.appendChild(title);

  if (lesson.rules) {

    const header = document.createElement("h3");
    header.textContent = "Rules";
    content.appendChild(header);

    lesson.rules.forEach(rule => {

      const div = document.createElement("div");
      div.className = "rule";

      div.innerHTML = `
        <h4>${rule.title}</h4>
        <p>${rule.text}</p>
      `;

      content.appendChild(div);

    });

  }

  if (lesson.vocab) {

    const header = document.createElement("h3");
    header.textContent = "Vocabulary";
    content.appendChild(header);

    lesson.vocab.forEach(word => {

      const div = document.createElement("div");
      div.className = "vocab-item";

      div.innerHTML = `<strong>${word.sk}</strong> — ${word.en}`;

      content.appendChild(div);

    });

  }

}

init();
