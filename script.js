async function loadNavigation() {

  const res = await fetch("data/navigation.json");
  const data = await res.json();

  const navTree = document.getElementById("nav-tree");
  navTree.innerHTML = "";

  data.topics.forEach(topic => {
    navTree.appendChild(createNode(topic));
  });

}

function createNode(node, level = 0) {

  const container = document.createElement("div");
  container.className = "nav-node";

  const header = document.createElement("div");
  header.className = "nav-header";
  header.style.paddingLeft = `${level * 15}px`;

  container.appendChild(header);

  // Expand button
  let childContainer = null;

  if (node.children) {

    const expandBtn = document.createElement("span");
    expandBtn.textContent = "▶ ";
    expandBtn.style.cursor = "pointer";

    header.appendChild(expandBtn);

    childContainer = document.createElement("div");
    childContainer.style.display = "none";

    expandBtn.addEventListener("click", (e) => {

      e.stopPropagation();

      if (childContainer.style.display === "none") {
        childContainer.style.display = "block";
        expandBtn.textContent = "▼ ";
      } else {
        childContainer.style.display = "none";
        expandBtn.textContent = "▶ ";
      }

    });

  } else {

    const spacer = document.createElement("span");
    spacer.textContent = "  ";
    header.appendChild(spacer);

  }

  // Title
  const title = document.createElement("span");
  title.textContent = node.title;
  title.style.cursor = "pointer";

  header.appendChild(title);

  // Lesson click
  if (node.lesson) {

    title.addEventListener("click", () => {
      loadLesson(node.lesson);
    });

  }

  // Children
  if (node.children) {

    node.children.forEach(child => {
      childContainer.appendChild(createNode(child, level + 1));
    });

    container.appendChild(childContainer);

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

  content.innerHTML = `<h2>${lesson.title}</h2>`;

  if (lesson.rules) {

    content.innerHTML += `<h3>Rules</h3>`;

    lesson.rules.forEach(rule => {

      content.innerHTML += `
      <div class="rule">
        <h4>${rule.title}</h4>
        <p>${rule.text}</p>
      </div>
      `;

      if (rule.examples) {

        content.innerHTML += "<ul>";

        rule.examples.forEach(ex => {
          content.innerHTML += `<li>${ex}</li>`;
        });

        content.innerHTML += "</ul>";

      }

    });

  }

  if (lesson.vocab) {

    content.innerHTML += `<h3>Vocabulary</h3>`;

    lesson.vocab.forEach(word => {

      content.innerHTML += `
      <div class="vocab-item">
        <strong>${word.sk}</strong> – ${word.en}
      </div>
      `;

    });

  }

}

loadNavigation();
