let selectedDoctor = null

fetch("/api/doctors")
.then(res => res.json())
.then(data => {
    let container = document.getElementById("doctors")

    data.forEach(doc => {
        let div = document.createElement("div")
        div.className = "card"
        div.innerHTML = doc.name

        div.onclick = () => {
            document.querySelectorAll(".card").forEach(c => c.classList.remove("selected"))
            div.classList.add("selected")
            selectedDoctor = doc
        }

        container.appendChild(div)
    })
})

function bookAppointment() {
    let name = document.getElementById("name").value
    let age = document.getElementById("age").value
    let date = document.getElementById("date").value

    if (!selectedDoctor || !name || !age || !date) return

    fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name,
            age,
            date,
            doctor: selectedDoctor.name
        })
    })
    .then(res => res.json())
    .then(() => {
        loadAppointments()
    })
}

function loadAppointments() {
    fetch("/api/appointments")
    .then(res => res.json())
    .then(data => {
        let box = document.getElementById("appointments")
        box.innerHTML = ""

        data.forEach(a => {
            let div = document.createElement("div")
            div.innerHTML = `${a.name}, Age ${a.age} booked ${a.doctor} on ${a.date}`
            box.appendChild(div)
        })
    })
}

loadAppointments()