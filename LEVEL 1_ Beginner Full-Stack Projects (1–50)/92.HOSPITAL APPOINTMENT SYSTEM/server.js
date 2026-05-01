const express = require("express")
const app = express()

app.use(express.json())
app.use(express.static("public"))

let appointments = []

const doctors = [
    { id: 1, name: "Dr. Sharma - Cardiologist" },
    { id: 2, name: "Dr. Mehta - Neurologist" },
    { id: 3, name: "Dr. Patil - Dermatologist" },
    { id: 4, name: "Dr. Khan - General Physician" }
]

app.get("/api/doctors", (req, res) => {
    res.json(doctors)
})

app.post("/api/book", (req, res) => {
    appointments.push(req.body)
    res.json({ message: "Appointment Booked Successfully" })
})

app.get("/api/appointments", (req, res) => {
    res.json(appointments)
})

app.listen(3000)