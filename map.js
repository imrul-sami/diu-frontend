document.addEventListener('DOMContentLoaded', () => {
    
    // ১. ম্যাপ ইনিশিয়ালাইজ করা (ডিফল্ট: ড্যাফোডিল ক্যাম্পাস)
    const map = L.map('map').setView([23.8760, 90.3160], 15);

    // ২. ওপেনস্ট্রিটম্যাপ লেয়ার
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // ৩. DIU ক্যাম্পাসের পার্মানেন্ট মার্কার
    L.marker([23.8760, 90.3160]).addTo(map)
        .bindPopup('<b>Daffodil International University (Main Campus)</b>');

    // ইউজারের বর্তমান লোকেশন সেভ রাখা
    let userLat = null;
    let userLng = null;

    // ৪. ইউজারের লোকেশন বের করা (অটোমেটিক)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLng = position.coords.longitude;
                
                // ম্যাপকে ইউজারের লোকেশনে নিয়ে যাওয়া
                map.flyTo([userLat, userLng], 15, { animate: true, duration: 1.5 });

                // ইউজারের লোকেশনে নীল মার্কার বসানো
                L.marker([userLat, userLng]).addTo(map)
                    .bindPopup("<b>আপনি এখানে আছেন</b>")
                    .openPopup();
            },
            (error) => {
                console.log("Location permission denied. Showing default campus view.");

            },
            {
                enableHighAccuracy: true // সর্বোচ্চ সঠিক লোকেশন পাওয়ার জন্য
            }
        );
    }

    // ৫. বাসের আইকন ডিজাইন
    const busIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/64/3448/3448339.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });

    let busMarkers = {};

    // --- Socket.IO কানেকশন ---
    const socket = io('https://diu-backend.onrender.com'); 

    socket.on('connect', () => {
        socket.emit('requestAllLocations');
    });

    socket.on('allLocations', (locations) => {
        for (const busId in locations) {
            updateMarker(locations[busId], busId);
        }
    });

    socket.on('locationUpdate', (data) => {
        updateMarker(data, data.busId);
    });

    // --- ৬. দূরত্ব বের করার ফাংশন (Haversine Formula) ---
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // পৃথিবীর ব্যাসার্ধ (km)
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const d = R * c; // দূরত্ব (km)
        return d.toFixed(2); // দশমিকের পর ২ ঘর পর্যন্ত দেখাবে
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // ৭. মার্কার আপডেট এবং দূরত্ব দেখানো
    function updateMarker(data, busId) {
        const { lat, lng, timestamp } = data;
        const newPosition = [lat, lng];

        // বাসের পপ-আপ মেসেজ তৈরি করা
        let popupContent = `<b>${busId}</b><br>`;
        
        // যদি ইউজারের লোকেশন জানা থাকে, তবে দূরত্ব দেখাবে
        if (userLat && userLng) {
            const distance = getDistanceFromLatLonInKm(userLat, userLng, lat, lng);
            popupContent += `আপনার থেকে দূরত্ব: <b>${distance} km</b><br>`;
        }
        
        popupContent += `<small>Last updated: ${new Date(timestamp).toLocaleTimeString()}</small>`;

        if (busMarkers[busId]) {
            busMarkers[busId].setLatLng(newPosition);
            busMarkers[busId].setPopupContent(popupContent);
        } else {
            busMarkers[busId] = L.marker(newPosition, { icon: busIcon })
                .addTo(map)
                .bindPopup(popupContent);
        }
    }
});