let currentSelected=null;
let cards=[];
let index=0;
let revealed=false;
let direction="sk-en";

const counter=document.getElementById("card-counter");

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

function displayLesson(lesson){

renderRules(lesson);
renderVocab(lesson);
setupExercises(lesson);

}

/* RULES */

function renderRules(lesson){

const rules=document.getElementById("rules");
rules.innerHTML="";
  
if(!lesson.rules) return;

lesson.rules.forEach(r=>{

const div=document.createElement("div");
div.className="rule";

div.innerHTML=`<h4>${r.title}</h4><p>${r.text}</p>`;

if(r.examples){

const ul=document.createElement("ul");

r.examples.forEach(ex=>{
const li=document.createElement("li");
li.textContent=ex;
ul.appendChild(li);
});

div.appendChild(ul);

}

rules.appendChild(div);

});

}

/* VOCAB */

function renderVocab(lesson){

const vocab=document.getElementById("vocab");
vocab.innerHTML="";

if(!lesson.vocab) return;

const search=document.createElement("input");
search.id="vocab-search";
search.placeholder="Search vocabulary";

vocab.appendChild(search);

const table=document.createElement("table");
table.id="vocab-table";

table.innerHTML="<thead><tr><th>Slovak</th><th>English</th></tr></thead><tbody></tbody>";

vocab.appendChild(table);

const body=table.querySelector("tbody");

lesson.vocab.forEach(w=>{
const tr=document.createElement("tr");
tr.innerHTML=`<td>${w.sk}</td><td>${w.en}</td>`;
body.appendChild(tr);
});

search.oninput=()=>{
const f=search.value.toLowerCase();
body.querySelectorAll("tr").forEach(r=>{
r.style.display=
r.innerText.toLowerCase().includes(f)?"":"none";
});
};

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
