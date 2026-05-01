const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static("public"))

let courses = [
    { id: 1, title: "JavaScript Basics", lessons: ["Intro", "Variables", "Functions"] },
    { id: 2, title: "Python Fundamentals", lessons: ["Intro", "Loops", "Functions"] }
]

app.get("/courses", (req, res) => res.json(courses))

app.post("/courses", (req, res) => {
    const newCourse = { id: Date.now(), ...req.body }
    courses.push(newCourse)
    res.json({ success: true })
})

app.listen(3000, () => console.log("Server running on http://localhost:3000"))