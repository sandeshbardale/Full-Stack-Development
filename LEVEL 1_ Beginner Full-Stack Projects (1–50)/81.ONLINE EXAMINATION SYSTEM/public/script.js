let questions=[]
let current=0
let score=0
let selected=null

async function startExam(){
let name=document.getElementById("name").value
if(!name)return alert("Enter name")

let res=await fetch("http://localhost:3000/questions")
questions=await res.json()

document.getElementById("login").classList.add("hidden")
document.getElementById("exam").classList.remove("hidden")

loadQuestion()
}

function loadQuestion(){
selected=null
let q=questions[current]
document.getElementById("qText").innerText=q.question

let optionsHTML=""
q.options.forEach((opt,i)=>{
optionsHTML+=`<div class="option" onclick="selectOption(${i})">${opt}</div>`
})

document.getElementById("options").innerHTML=optionsHTML
}

function selectOption(i){
selected=i
}

function nextQuestion(){
if(selected===null)return alert("Select option")

if(selected===questions[current].answer)score++

current++

if(current<questions.length){
loadQuestion()
}else{
finishExam()
}
}

function finishExam(){
document.getElementById("exam").classList.add("hidden")
document.getElementById("result").classList.remove("hidden")
document.getElementById("score").innerText=score
}