let lessons = []

async function loadLessons() {

 const res = await fetch("data/lessons.json")
 const data = await res.json()

 lessons = data.lessons

 buildSidebar()

}

function buildSidebar() {

 const sidebar = document.getElementById("nav-tree")
 sidebar.innerHTML = ""

 lessons.forEach(lesson => {

  const div = document.createElement("div")
  div.className = "lesson-item"

  div.innerText = lesson.title

  div.onclick = () => loadLesson(lesson)

  sidebar.appendChild(div)

 })

}

async function loadLesson(lesson) {

 const res = await fetch(lesson.file)
 const data = await res.json()

 displayLesson(data)

}

function displayLesson(lesson) {

 const content = document.getElementById("content")

 content.innerHTML = `<h2>${lesson.title}</h2>`

 if (lesson.rules) {

  content.innerHTML += `<h3>Rules</h3>`

  lesson.rules.forEach(rule => {

   content.innerHTML += `<div class="rule">`

   content.innerHTML += `<h4>${rule.title}</h4>`

   content.innerHTML += `<p>${rule.text}</p>`

   if (rule.examples) {

    content.innerHTML += `<ul>`

    rule.examples.forEach(ex => {
     content.innerHTML += `<li>${ex}</li>`
    })

    content.innerHTML += `</ul>`

   }

   content.innerHTML += `</div>`

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

loadLessons()
