document.addEventListener('DOMContentLoaded', () => {
    
    // ১. ম্যাপ সেটআপ (ডিফল্ট: ড্যাফোডিল ক্যাম্পাস)
    const map = L.map('map').setView([23.8760, 90.3160], 15);

    // ২. ম্যাপের লেয়ার (রাস্তাঘাট)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // ৩. ক্যাম্পাসের মার্কার
    L.marker([23.8760, 90.3160]).addTo(map)
        .bindPopup('<b>Daffodil International University</b>');

    // ইউজারের লোকেশন রাখার ভেরিয়েবল
    let userLat = null;
    let userLng = null;
    let userMarker = null;

    // ৪. ইউজারের লোকেশন বের করা (লাইভ ট্র্যাকিং)
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLng = position.coords.longitude;
                
                // প্রথমবার লোড হলে জুম ইন করবে
                if (!userMarker) {
                    map.flyTo([userLat, userLng], 15, { animate: true, duration: 1.5 });
                }

                // ইউজারের মার্কার আপডেট করা
                if (userMarker) {
                    userMarker.setLatLng([userLat, userLng]);
                } else {
                    userMarker = L.marker([userLat, userLng]).addTo(map)
                        .bindPopup("<b>আপনি এখানে আছেন</b>")
                        .openPopup();
                }
            },
            (error) => {
                console.log("Location access denied.");
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
    }

    // ৫. বাসের আইকন ডিজাইন
    const busIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/64/3448/3448339.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
        tooltipAnchor: [20, 0] // টুলটিপ একটু ডানে দেখাবে
    });

    let busMarkers = {};

    // --- Socket.IO কানেকশন ---
    // ⚠️ আপনার Render লিংকটি ঠিক আছে কিনা নিশ্চিত করুন
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

    // --- ৬. দূরত্ব মাপার সূত্র (km) ---
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // পৃথিবীর ব্যাসার্ধ
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return (R * c).toFixed(2); // ২ ঘর পর্যন্ত (যেমন: 2.50 km)
    }

    // ৭. মার্কার আপডেট করা
    function updateMarker(data, busId) {
        const { lat, lng, timestamp } = data;
        const newPosition = [lat, lng];

        // দূরত্ব বের করা
        let distanceText = "";
        if (userLat && userLng) {
            const dist = getDistance(userLat, userLng, lat, lng);
            distanceText = ` (${dist} km)`;
        }

        // পপ-আপ মেসেজ (ক্লিক করলে দেখাবে)
        const popupContent = `
            <div style="text-align: center;">
                <b style="font-size: 1.1em;">${busId}</b><br>
                <span style="color: red; font-weight: bold;">দূরত্ব: ${distanceText || 'হিসাব করা যাচ্ছে না'}</span><br>
                <small>আপডেট: ${new Date(timestamp).toLocaleTimeString()}</small>
            </div>
        `;

        if (busMarkers[busId]) {
            // মার্কার আগেই থাকলে আপডেট করো
            busMarkers[busId].setLatLng(newPosition);
            busMarkers[busId].setPopupContent(popupContent);
            // টুলটিপ আপডেট (ম্যাপের ওপর লেখা)
            busMarkers[busId].setTooltipContent(`<b>${busId}</b> ${distanceText}`);
        } else {
            // নতুন মার্কার বানাও
            const marker = L.marker(newPosition, { icon: busIcon })
                .addTo(map)
                .bindPopup(popupContent);
            
            // টুলটিপ যোগ করা (স্থায়ীভাবে বাসের নামের পাশে দূরত্ব দেখাবে)
            marker.bindTooltip(`<b>${busId}</b> ${distanceText}`, {
                permanent: true, // সবসময় দেখা যাবে
                direction: 'right', // ডান পাশে থাকবে
                className: 'bus-tooltip' // স্টাইলের জন্য ক্লাস
            }).openTooltip();

            busMarkers[busId] = marker;
        }
    }
});
