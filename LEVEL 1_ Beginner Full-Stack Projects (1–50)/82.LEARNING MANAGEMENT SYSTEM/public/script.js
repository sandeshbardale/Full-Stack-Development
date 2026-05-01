async function loadCourses() {
    const res = await fetch("/courses")
    const data = await res.json()

    const container = document.getElementById("courses")
    if (!container) return

    container.innerHTML = ""

    data.forEach(c => {
        const div = document.createElement("div")
        div.className = "course"

        let lessonsHTML = "<ul>"
        c.lessons.forEach(l => lessonsHTML += `<li>${l}</li>`)
        lessonsHTML += "</ul>"

        div.innerHTML = `<h3>${c.title}</h3>${lessonsHTML}`
        container.appendChild(div)
    })
}

async function addCourse() {
    const title = document.getElementById("courseTitle").value
    const lessons = document.getElementById("lessons").value.split(",").map(l => l.trim())

    if (!title || !lessons.length) return

    await fetch("/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, lessons })
    })

    document.getElementById("status").innerText = "Course added!"
}

loadCourses()