async function book() {
const name = document.getElementById("name").value
const email = document.getElementById("email").value
const checkin = document.getElementById("checkin").value
const checkout = document.getElementById("checkout").value
const room = document.getElementById("room").value

await fetch("http://localhost:3000/book", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ name, email, checkin, checkout, room })
})

loadBookings()
}

async function loadBookings() {
const res = await fetch("http://localhost:3000/bookings")
const data = await res.json()

const list = document.getElementById("list")
list.innerHTML = ""

data.forEach(b => {
const li = document.createElement("li")
li.innerText = `${b.name} - ${b.room} (${b.checkin} to ${b.checkout})`
list.appendChild(li)
})
}

loadBookings()