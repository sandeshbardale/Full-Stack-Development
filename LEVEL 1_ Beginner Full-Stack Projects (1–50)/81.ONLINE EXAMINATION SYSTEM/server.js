const express=require("express")
const cors=require("cors")

const app=express()
app.use(cors())

const questions=[
{
question:"What is 2 + 2?",
options:["2","4","6","8"],
answer:1
},
{
question:"Capital of India?",
options:["Mumbai","Delhi","Pune","Chennai"],
answer:1
},
{
question:"Which language runs in browser?",
options:["Python","Java","C","JavaScript"],
answer:3
}
]

app.get("/questions",(req,res)=>{
res.json(questions)
})

app.listen(3000,()=>{
console.log("Server running on port 3000")
})