let currentSelected = null;

async function loadNavigation() {

  const res = await fetch("data/navigation.json");
  const data = await res.json();

  const navTree = document.getElementById("nav-tree");
  navTree.innerHTML = "";

  data.topics.forEach((topic, i) => {

    const number = `${i + 1}`;
    navTree.appendChild(createNode(topic, number));

  });

}

function createNode(node, number, level = 0) {

  const container = document.createElement("div");

  const item = document.createElement("div");
  item.className = "nav-item";
  item.style.paddingLeft = `${level * 18}px`;

  item.textContent = `${number}. ${node.title}`;

  container.appendChild(item);

  // lesson click
  if (node.lesson) {

    item.classList.add("clickable");

    item.addEventListener("click", (e) => {

      e.stopPropagation();

      loadLesson(node.lesson);

      if (currentSelected) {
        currentSelected.classList.remove("active");
      }

      item.classList.add("active");
      currentSelected = item;

    });

  }

  // children
  if (node.children) {

    node.children.forEach((child, index) => {

      const childNumber = `${number}.${index + 1}`;

      const childNode = createNode(child, childNumber, level + 1);

      container.appendChild(childNode);

    });

  }

  return container;

}

async function loadLesson(path) {

  const res = await fetch(path);
  const lesson = await res.json();

  displayLesson(lesson);

}

function displayLesson(lesson) {

  const content = document.getElementById("content");

  content.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = lesson.title;

  content.appendChild(title);

  if (lesson.rules) {

    const rulesHeader = document.createElement("h3");
    rulesHeader.textContent = "Rules";
    content.appendChild(rulesHeader);

    lesson.rules.forEach(rule => {

      const ruleDiv = document.createElement("div");
      ruleDiv.className = "rule";

      const ruleTitle = document.createElement("h4");
      ruleTitle.textContent = rule.title;

      const ruleText = document.createElement("p");
      ruleText.textContent = rule.text;

      ruleDiv.appendChild(ruleTitle);
      ruleDiv.appendChild(ruleText);

      if (rule.examples) {

        const ul = document.createElement("ul");

        rule.examples.forEach(ex => {

          const li = document.createElement("li");
          li.textContent = ex;

          ul.appendChild(li);

        });

        ruleDiv.appendChild(ul);

      }

      content.appendChild(ruleDiv);

    });

  }

  if (lesson.vocab) {

    const vocabHeader = document.createElement("h3");
    vocabHeader.textContent = "Vocabulary";

    content.appendChild(vocabHeader);

    lesson.vocab.forEach(word => {

      const vocabItem = document.createElement("div");
      vocabItem.className = "vocab-item";

      vocabItem.innerHTML = `<strong>${word.sk}</strong> — ${word.en}`;

      content.appendChild(vocabItem);

    });

  }

}

loadNavigation();
