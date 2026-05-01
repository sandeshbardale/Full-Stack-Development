let selectedMovie = null

fetch("/api/movies")
.then(res => res.json())
.then(data => {
    let container = document.getElementById("movies")
    data.forEach(movie => {
        let div = document.createElement("div")
        div.className = "movie"
        div.innerHTML = movie.name + "<br>₹" + movie.price
        div.onclick = () => {
            document.querySelectorAll(".movie").forEach(m => m.classList.remove("selected"))
            div.classList.add("selected")
            selectedMovie = movie
        }
        container.appendChild(div)
    })
})

function bookTicket() {
    let name = document.getElementById("name").value
    let seats = document.getElementById("seats").value

    if (!selectedMovie || !name || !seats) return

    fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name,
            seats,
            movie: selectedMovie.name,
            price: selectedMovie.price
        })
    })
    .then(res => res.json())
    .then(() => {
        loadBookings()
    })
}

function loadBookings() {
    fetch("/api/bookings")
    .then(res => res.json())
    .then(data => {
        let box = document.getElementById("bookings")
        box.innerHTML = ""
        data.forEach(b => {
            let div = document.createElement("div")
            div.innerHTML = `${b.name} booked ${b.seats} seats for ${b.movie}`
            box.appendChild(div)
        })
    })
}

loadBookings()