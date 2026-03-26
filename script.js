
let currentSelected=null;
let cards=[];
let index=0;
let revealed=false;
let direction="sk-en";
const counter=document.getElementById("card-counter");

// Track all lessons in order for cumulative vocab
let allLessons = [];
let currentLessonIndex = -1;

/* INIT */
init();

async function init(){
	await loadNavigation();
	setupMenu();
	setupNavigationClick();
}

/* SIDEBAR TOGGLE */
function setupMenu(){
	const sidebar=document.getElementById("sidebar");
	document.getElementById("menu-toggle").onclick=()=>{
		sidebar.classList.toggle("closed");
	};
}

/* LOAD NAV */
async function loadNavigation(){
	const res=await fetch("data/navigation.json");
	const data=await res.json();
	const nav=document.getElementById("nav-tree");
	nav.innerHTML="";
	
	// Flatten lessons in order
	allLessons = [];
	function collectLessons(node) {
		if (node.lesson) {
			allLessons.push(node.lesson);
		}
		if (node.children) {
			node.children.forEach(collectLessons);
		}
	}
	data.topics.forEach(collectLessons);
	
	data.topics.forEach(topic=>{
		nav.appendChild(createNode(topic,0));
	});
}

/* CREATE NODE */
function createNode(node,level){
	const wrapper=document.createElement("div");
	const item=document.createElement("div");
	item.className=`nav-item level-${level}`;
	if(node.children){
		const arrow=document.createElement("span");
		arrow.textContent="▶";
		arrow.className="expand";
		arrow.onclick=(e)=>{
			e.stopPropagation();
			children.classList.toggle("hidden");
			arrow.textContent=children.classList.contains("hidden")?"▶":"▼";
		};
		item.appendChild(arrow);
	}
	item.append(node.title);
	if(node.lesson){
		item.dataset.lesson=node.lesson;
	}
	wrapper.appendChild(item);
	let children;
	if(node.children){
		children=document.createElement("div");
		node.children.forEach(child=>{
			children.appendChild(createNode(child,level+1));
		});
		wrapper.appendChild(children);
	}
	return wrapper;
}

/* NAV CLICK */
function setupNavigationClick(){
	document.getElementById("nav-tree").addEventListener("click",e=>{
		const item=e.target.closest(".nav-item");
		if(!item) return;
		const lesson=item.dataset.lesson;
		if(!lesson) return;
		const title=item.textContent.trim();
		document.getElementById("lesson-title").textContent=title;
		
		// Find current lesson index
		currentLessonIndex = allLessons.indexOf(lesson);
		
		loadLesson(lesson);
		if(currentSelected) currentSelected.classList.remove("active");
		item.classList.add("active");
		currentSelected=item;
	});
}

/* LOAD LESSON */
async function loadLesson(path){
	const res=await fetch(path);
	const lesson=await res.json();
	displayLesson(lesson);
}

/* DISPLAY LESSON */
async function displayLesson(lesson){
	renderRules(lesson);
	await renderVocab(lesson);
	setupExercises(lesson);
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

/* VOCAB - WITH CUMULATIVE LOADING */
async function renderVocab(lesson){
	const vocab=document.getElementById("vocab");
	vocab.innerHTML="";
	
	// Load cumulative vocabulary
	let cumulativeVocab = [];
	let currentLessonVocab = lesson.vocab || [];
	
	// Load all previous lessons' vocab
	if (currentLessonIndex >= 0) {
		for (let i = 0; i <= currentLessonIndex; i++) {
			try {
				const res = await fetch(allLessons[i]);
				const lessonData = await res.json();
				if (lessonData.vocab) {
					cumulativeVocab = cumulativeVocab.concat(lessonData.vocab);
				}
			} catch (e) {
				console.error("Error loading lesson:", allLessons[i], e);
			}
		}
	} else {
		cumulativeVocab = currentLessonVocab;
	}
	
	// Remove duplicates (based on Slovak word)
	const uniqueVocab = [];
	const seen = new Set();
	cumulativeVocab.forEach(w => {
		if (!seen.has(w.sk)) {
			seen.add(w.sk);
			uniqueVocab.push(w);
		}
	});
	
	// Create filter controls
	const controls = document.createElement("div");
	controls.style.cssText = "display:flex; gap:10px; align-items:center; margin-bottom:12px;";
	
	const filterLabel = document.createElement("span");
	filterLabel.textContent = "Show: ";
	filterLabel.style.fontWeight = "600";
	controls.appendChild(filterLabel);
	
	const currentBtn = document.createElement("button");
	currentBtn.textContent = "Current Lesson";
	currentBtn.className = "vocab-filter-btn active";
	currentBtn.style.cssText = "padding:6px 12px; border:1px solid #667eea; border-radius:4px; cursor:pointer; background:#667eea; color:white; font-weight:600;";
	
	const allBtn = document.createElement("button");
	allBtn.textContent = "All Vocabulary";
	allBtn.className = "vocab-filter-btn";
	allBtn.style.cssText = "padding:6px 12px; border:1px solid #667eea; border-radius:4px; cursor:pointer; background:white; color:#667eea; font-weight:600;";
	
	const wordCounter = document.createElement("span");
	wordCounter.id = "vocab-word-count";
	wordCounter.style.cssText = "margin-left:auto; font-weight:600; color:#667eea;";
	
	controls.appendChild(currentBtn);
	controls.appendChild(allBtn);
	controls.appendChild(wordCounter);
	vocab.appendChild(controls);
	
	// Search box
	const search=document.createElement("input");
	search.id="vocab-search";
	search.placeholder="Search vocabulary";
	vocab.appendChild(search);
	
	// Table
	const table=document.createElement("table");
	table.id="vocab-table";
	table.innerHTML="<thead><tr><th>Slovak</th><th>English</th></tr></thead><tbody></tbody>";
	vocab.appendChild(table);
	
	const body=table.querySelector("tbody");
	
	let activeVocab = currentLessonVocab;
	let showingAll = false;
	
	function renderTable(vocabList) {
		body.innerHTML = "";
		vocabList.forEach(w=>{
			const tr=document.createElement("tr");
			tr.innerHTML=`<td>${w.sk}</td><td>${w.en}</td>`;
			body.appendChild(tr);
		});
		updateCounter();
	}
	
	function updateCounter() {
		const visible = Array.from(body.querySelectorAll("tr")).filter(r => r.style.display !== "none").length;
		wordCounter.textContent = `${visible} word${visible !== 1 ? 's' : ''}`;
	}
	
	// Filter button handlers
	currentBtn.onclick = () => {
		showingAll = false;
		activeVocab = currentLessonVocab;
		renderTable(activeVocab);
		currentBtn.style.background = "#667eea";
		currentBtn.style.color = "white";
		allBtn.style.background = "white";
		allBtn.style.color = "#667eea";
		search.value = "";
	};
	
	allBtn.onclick = () => {
		showingAll = true;
		activeVocab = uniqueVocab;
		renderTable(activeVocab);
		allBtn.style.background = "#667eea";
		allBtn.style.color = "white";
		currentBtn.style.background = "white";
		currentBtn.style.color = "#667eea";
		search.value = "";
	};
	
	// Search handler
	search.oninput=()=>{
		const f=search.value.toLowerCase();
		body.querySelectorAll("tr").forEach(r=>{
			r.style.display=
				r.innerText.toLowerCase().includes(f)?"":"none";
		});
		updateCounter();
	};
	
	// Initial render (current lesson only)
	renderTable(currentLessonVocab);
}

/* EXERCISES */
function setupExercises(lesson){
	const front=document.querySelector(".flash-front");
	const back=document.querySelector(".flash-back");
	cards=lesson.exercises?[...lesson.exercises]:[];
	index=0;
	revealed=false;
	function show(){
		if(cards.length===0){
			front.textContent="";
			back.textContent="";
			counter.textContent="0 / 0";
			return;
		}
		const c=cards[index];
		counter.textContent = `${index + 1} / ${cards.length}`;
		if(direction==="sk-en"){
			front.textContent=c.sk;
			back.textContent=c.en;
		}else{
			front.textContent=c.en;
			back.textContent=c.sk;
		}
		back.classList.add("hidden");
		revealed=false;
	}
	document.getElementById("next-card").onclick=()=>{
		if(!revealed){
			back.classList.remove("hidden");
			revealed=true;
		}else{
			index=(index+1)%cards.length;
			show();
		}
	};
	document.getElementById("shuffle-cards").onclick=()=>{
		cards.sort(()=>Math.random()-.5);
		index=0;
		show();
	};
	document.getElementById("flip-direction").onclick=()=>{
		direction=direction==="sk-en"?"en-sk":"sk-en";
		show();
	};
	show();
}

