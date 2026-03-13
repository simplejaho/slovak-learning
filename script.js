async function loadNavigation() {

  const res = await fetch("data/navigation.json")
  const data = await res.json()

  const navTree = document.getElementById("nav-tree")
  navTree.innerHTML = ""

  data.topics.forEach((topic, index) => {

    const numbering = `${index + 1}`
    navTree.appendChild(createNode(topic, numbering))

  })

}

function createNode(node, numbering, level = 0) {

  const container = document.createElement("div")
  container.className = "nav-node"

  const item = document.createElement("div")
  item.className = "nav-item"

  item.style.paddingLeft = `${level * 20}px`

  item.innerText = `${numbering}. ${node.title}`

  container.appendChild(item)

  // lesson click
  if (node.lesson) {

    item.style.cursor = "pointer"

    item.addEventListener("click", () => {
      loadLesson(node.lesson)
    })

  }

  // children
  if (node.children) {

    node.children.forEach((child, index) => {

      const childNumber = `${numbering}.${index + 1}`

      container.appendChild(
        createNode(child, childNumber, level + 1)
      )

    })

  }

  return container

}

async function loadLesson(path) {

  const res = await fetch(path)
  const lesson = await res.json()

  displayLesson(lesson)

}

function displayLesson(lesson) {

  const content = document.getElementById("content")

  content.innerHTML = `<h2>${lesson.title}</h2>`

  if (lesson.rules) {

    content.innerHTML += `<h3>Rules</h3>`

    lesson.rules.forEach(rule => {

      content.innerHTML += `
      <div class="rule">
        <h4>${rule.title}</h4>
        <p>${rule.text}</p>
      </div>
      `

      if (rule.examples) {

        content.innerHTML += "<ul>"

        rule.examples.forEach(ex => {
          content.innerHTML += `<li>${ex}</li>`
        })

        content.innerHTML += "</ul>"

      }

    })

  }

  if (lesson.vocab) {

    content.innerHTML += `<h3>Vocabulary</h3>`

    lesson.vocab.forEach(word => {

      content.innerHTML += `
      <div class="vocab-item">
        <strong>${word.sk}</strong> – ${word.en}
      </div>
      `

    })

  }

}

loadNavigation()
