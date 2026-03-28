let currentSelected = null;
let cards = [];
let index = 0;
let revealed = false;
let direction = "sk-en";
let exerciseMode = "exercises"; // "exercises" or "vocab"
let currentLessonData = null;
const counter = document.getElementById("card-counter");

// Add touch support for flashcards
let touchStartX = 0;
const flashcard = document.querySelector('.flashcard');
flashcard.addEventListener('touchstart', (e) => {
	touchStartX = e.touches.clientX;
});
flashcard.addEventListener('touchend', (e) => {
	const touchEndX = e.changedTouches.clientX;
	const diff = touchStartX - touchEndX;
	if (diff > 50) {
		document.getElementById('next-card').click();
	}
});

/* INIT */
init();

async function init() {
	await loadNavigation();
	setupMenu();
	setupNavigationClick();
	setupModeToggle();
}

/* SIDEBAR TOGGLE */
function setupMenu() {
	const sidebar = document.getElementById("sidebar");
	document.getElementById("menu-toggle").onclick = () => {
		sidebar.classList.toggle("closed");
	};
}

/* LOAD NAV */
async function loadNavigation() {
	const res = await fetch("data/navigation.json");
	const data = await res.json();
	const nav = document.getElementById("nav-tree");
	nav.innerHTML = "";
	data.topics.forEach(topic => {
		nav.appendChild(createNode(topic, 0));
	});
}

/* CREATE NODE */
function createNode(node, level) {
	const wrapper = document.createElement("div");
	const item = document.createElement("div");
	item.className = `nav-item level-${level}`;
	if (node.children) {
		const arrow = document.createElement("span");
		arrow.textContent = "▶";
		arrow.className = "expand";
		arrow.onclick = (e) => {
			e.stopPropagation();
			children.classList.toggle("hidden");
			arrow.textContent = children.classList.contains("hidden") ? "▶" : "▼";
		};
		item.appendChild(arrow);
	}
	item.append(node.title);
	if (node.lesson) {
		item.dataset.lesson = node.lesson;
	}
	wrapper.appendChild(item);
	let children;
	if (node.children) {
		children = document.createElement("div");
		node.children.forEach(child => {
			children.appendChild(createNode(child, level + 1));
		});
		wrapper.appendChild(children);
	}
	return wrapper;
}

/* NAV CLICK */
function setupNavigationClick() {
	document.getElementById("nav-tree").addEventListener("click", e => {
		const item = e.target.closest(".nav-item");
		if (!item) return;
		const lesson = item.dataset.lesson;
		if (!lesson) return;
		const title = item.textContent.trim();
		document.getElementById("lesson-title").textContent = title;
		loadLesson(lesson);
		if (currentSelected) currentSelected.classList.remove("active");
		item.classList.add("active");
		currentSelected = item;
	});
}

/* LOAD LESSON */
async function loadLesson(path) {
	const res = await fetch(path);
	const lesson = await res.json();
	currentLessonData = lesson;
	displayLesson(lesson);
}

/* DISPLAY LESSON */
function displayLesson(lesson) {
	renderRules(lesson);
	renderSummary(lesson);
	renderVocab(lesson);
	exerciseMode = "exercises";
	updateModeToggle();
	loadCards();
}

/* MODE TOGGLE SETUP */
function setupModeToggle() {
	const toggleContainer = document.getElementById("mode-toggle");
	if (!toggleContainer) return;

	toggleContainer.addEventListener("click", (e) => {
		const btn = e.target.closest(".mode-btn");
		if (!btn) return;
		exerciseMode = btn.dataset.mode;
		updateModeToggle();
		loadCards();
	});
}

/* UPDATE TOGGLE BUTTON STYLES */
function updateModeToggle() {
	const toggleContainer = document.getElementById("mode-toggle");
	if (!toggleContainer) return;
	toggleContainer.querySelectorAll(".mode-btn").forEach(btn => {
		if (btn.dataset.mode === exerciseMode) {
			btn.style.background = "#667eea";
			btn.style.color = "white";
		} else {
			btn.style.background = "white";
			btn.style.color = "#667eea";
		}
	});
}

/* LOAD CARDS BASED ON MODE */
function loadCards() {
	if (!currentLessonData) return;

	if (exerciseMode === "exercises") {
		cards = currentLessonData.exercises ? [...currentLessonData.exercises] : [];
	} else {
		cards = currentLessonData.vocab
			? currentLessonData.vocab.map(w => ({ sk: w.sk, en: w.en }))
			: [];
	}

	index = 0;
	revealed = false;
	showCard();
}

/* SHOW CURRENT CARD */
function showCard() {
	const front = document.querySelector(".flash-front");
	const back = document.querySelector(".flash-back");

	if (cards.length === 0) {
		front.textContent = exerciseMode === "exercises" ? "No exercises" : "No vocabulary";
		back.textContent = "";
		counter.textContent = "0 / 0";
		back.classList.add("hidden");
		return;
	}

	const c = cards[index];
	counter.textContent = `${index + 1} / ${cards.length}`;

	if (direction === "sk-en") {
		front.textContent = c.sk;
		back.textContent = c.en;
	} else {
		front.textContent = c.en;
		back.textContent = c.sk;
	}

	back.classList.add("hidden");
	revealed = false;
}

/* SUMMARY */
function renderSummary(lesson) {
	const rules = document.getElementById("rules");
	if (!lesson.summary || lesson.summary.length === 0) return;

	const container = document.createElement("div");
	container.className = "summary-box";

	const heading = document.createElement("h3");
	heading.textContent = "Quick Summary";
	container.appendChild(heading);

	const ul = document.createElement("ul");
	ul.className = "summary-list";
	lesson.summary.forEach(item => {
		const li = document.createElement("li");
		li.textContent = item;
		ul.appendChild(li);
	});
	container.appendChild(ul);

	rules.prepend(container);
}

/* RULES */
function renderRules(lesson) {
	const rules = document.getElementById("rules");
	rules.innerHTML = "";
	if (!lesson.rules) return;
	lesson.rules.forEach(r => {
		const div = document.createElement("div");
		div.className = "rule";
		div.innerHTML = `<h4>${r.title}</h4><p>${r.text}</p>`;
		if (r.table) {
			const table = document.createElement("table");
			table.className = "rule-table";
			const thead = document.createElement("thead");
			thead.innerHTML = `<tr>${r.table.headers.map(h => `<th>${h}</th>`).join("")}</tr>`;
			table.appendChild(thead);
			const tbody = document.createElement("tbody");
			r.table.rows.forEach(row => {
				const tr = document.createElement("tr");
				tr.innerHTML = row.map(cell => `<td>${cell}</td>`).join("");
				tbody.appendChild(tr);
			});
			table.appendChild(tbody);
			div.appendChild(table);
		}
		rules.appendChild(div);
	});
}

/* VOCAB — Original searchable table (current lesson only) */
function renderVocab(lesson) {
	const vocab = document.getElementById("vocab");
	vocab.innerHTML = "";
	if (!lesson.vocab) return;

	const search = document.createElement("input");
	search.id = "vocab-search";
	search.placeholder = "Search vocabulary";
	vocab.appendChild(search);

	const table = document.createElement("table");
	table.id = "vocab-table";
	table.innerHTML = "<thead><tr><th>Slovak</th><th>English</th></tr></thead><tbody></tbody>";
	vocab.appendChild(table);

	const body = table.querySelector("tbody");
	lesson.vocab.forEach(w => {
		const tr = document.createElement("tr");
		tr.innerHTML = `<td>${w.sk}</td><td>${w.en}</td>`;
		body.appendChild(tr);
	});

	search.oninput = () => {
		const f = search.value.toLowerCase();
		body.querySelectorAll("tr").forEach(r => {
			r.style.display = r.innerText.toLowerCase().includes(f) ? "" : "none";
		});
	};
}

/* EXERCISES — Button handlers */
document.getElementById("next-card").onclick = () => {
	if (!revealed) {
		document.querySelector(".flash-back").classList.remove("hidden");
		revealed = true;
	} else {
		index = (index + 1) % cards.length;
		showCard();
	}
};

document.getElementById("shuffle-cards").onclick = () => {
	cards.sort(() => Math.random() - 0.5);
	index = 0;
	showCard();
};

document.getElementById("flip-direction").onclick = () => {
	direction = direction === "sk-en" ? "en-sk" : "sk-en";
	showCard();
};
