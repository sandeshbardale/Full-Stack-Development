const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

let bookings = []

app.post("/book", (req, res) => {
bookings.push(req.body)
res.send({ message: "Booked successfully" })
})

app.get("/bookings", (req, res) => {
res.json(bookings)
})

app.listen(3000, () => console.log("Server running on port 3000"))