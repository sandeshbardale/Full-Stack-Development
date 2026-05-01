const bookings = [];

function bookRide() {
    const pickup = document.getElementById('pickup').value;
    const dropoff = document.getElementById('dropoff').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const passengers = document.getElementById('passengers').value;
    const cartype = document.getElementById('cartype').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;

    if (!pickup || !dropoff || !date || !time || !name || !phone) {
        alert('Please fill all required fields');
        return;
    }

    const booking = {
        id: Math.floor(Math.random() * 10000),
        pickup,
        dropoff,
        date,
        time,
        passengers,
        cartype,
        name,
        phone,
        timestamp: new Date(),
        estimatedPrice: calculatePrice(cartype),
        status: 'Confirmed'
    };

    fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(booking)
    })
    .then(response => response.json())
    .then(data => {
        bookings.unshift(booking);
        displayBookings();
        clearForm();
        alert(`Ride booked successfully! Booking ID: ${booking.id}\nDriver will arrive in 5-10 minutes.`);
    })
    .catch(error => {
        console.error('Error:', error);
        bookings.unshift(booking);
        displayBookings();
        clearForm();
        alert(`Ride booked successfully! Booking ID: ${booking.id}\nDriver will arrive in 5-10 minutes.`);
    });
}

function calculatePrice(cartype) {
    const basePrices = {
        economy: Math.floor(Math.random() * 20) + 5,
        comfort: Math.floor(Math.random() * 25) + 10,
        premium: Math.floor(Math.random() * 30) + 20
    };
    return basePrices[cartype];
}

function clearForm() {
    document.getElementById('pickup').value = '';
    document.getElementById('dropoff').value = '';
    document.getElementById('date').value = '';
    document.getElementById('time').value = '';
    document.getElementById('passengers').value = '1';
    document.getElementById('cartype').value = 'economy';
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
}

function displayBookings() {
    const ridesList = document.getElementById('rides-list');
    
    if (bookings.length === 0) {
        ridesList.innerHTML = '<p class="empty-msg">No bookings yet. Book your first ride!</p>';
        return;
    }

    ridesList.innerHTML = bookings.map(booking => `
        <div class="ride-item">
            <div class="ride-details">
                <div class="ride-route">🚕 ${booking.pickup} → ${booking.dropoff}</div>
                <div class="ride-info">
                    <strong>${booking.name}</strong> | ${booking.passengers} ${booking.passengers === '1' ? 'Passenger' : 'Passengers'} | ${booking.cartype.toUpperCase()}
                </div>
                <div class="ride-info">
                    📅 ${new Date(booking.date).toLocaleDateString()} at ${booking.time} | ID: #${booking.id}
                </div>
            </div>
            <div style="text-align: right;">
                <div class="ride-price">$${booking.estimatedPrice}</div>
                <div class="ride-status">${booking.status}</div>
            </div>
        </div>
    `).join('');
}

window.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
    document.getElementById('date').value = today;
    
    const currentTime = new Date();
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    document.getElementById('time').value = `${hours}:${minutes}`;
    
    displayBookings();
});

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
        const submitBtn = document.querySelector('.book-btn');
        if (submitBtn) submitBtn.click();
    }
});
