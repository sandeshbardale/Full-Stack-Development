const express = require("express")
const app = express()
const path = require("path")

app.use(express.json())
app.use(express.static("public"))

let bookings = []

app.get("/api/movies", (req, res) => {
    res.json([
        { id: 1, name: "Avengers", price: 250 },
        { id: 2, name: "Inception", price: 200 },
        { id: 3, name: "Interstellar", price: 220 },
        { id: 4, name: "Batman", price: 180 }
    ])
})

app.post("/api/book", (req, res) => {
    bookings.push(req.body)
    res.json({ message: "Booking Successful" })
})

app.get("/api/bookings", (req, res) => {
    res.json(bookings)
})

app.listen(3000)