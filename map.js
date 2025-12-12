document.addEventListener('DOMContentLoaded', () => {
    
    // ১. ম্যাপ সেটআপ
    const map = L.map('map').setView([23.8760, 90.3160], 15);

    // ২. ম্যাপের লেয়ার
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // ৩. ক্যাম্পাসের মার্কার
    L.marker([23.8760, 90.3160]).addTo(map)
        .bindPopup('<b>Daffodil International University</b>');

    let userLat = null;
    let userLng = null;
    let userMarker = null;

    // ৪. ইউজারের লোকেশন বের করা
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLng = position.coords.longitude;
                
                if (!userMarker) {
                    map.flyTo([userLat, userLng], 15, { animate: true, duration: 1.5 });
                }

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

    // ৫. বাসের আইকন
    const busIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/64/3448/3448339.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
        tooltipAnchor: [20, 0]
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

    // ৬. দূরত্ব মাপার সূত্র
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return (R * c).toFixed(2);
    }

    // ৭. মার্কার আপডেট করা
    function updateMarker(data, busId) {
        const { lat, lng, timestamp } = data;
        const newPosition = [lat, lng];

        // দূরত্ব বের করা
        let distanceText = "";
        let tooltipText = ""; // ম্যাপের ওপর যা ভেসে থাকবে

        if (userLat && userLng) {
            const dist = getDistance(userLat, userLng, lat, lng);
            distanceText = `${dist} km`;
            
            // ✅ ফিক্স: ম্যাপের ওপর শুধু দূরত্ব দেখাবে (নাম দেখাবে না)
            tooltipText = `<b style="font-size: 14px;">${distanceText}</b>`;
        }

        // পপ-আপ মেসেজ (ক্লিক করলে নামসহ সব দেখাবে)
        const popupContent = `
            <div style="text-align: center;">
                <b style="font-size: 1.2em; color: #007bff;">${busId}</b><br>
                ${distanceText ? `<span>দূরত্ব: <b>${distanceText}</b></span><br>` : ''}
                <small style="color: grey;">Last update: ${new Date(timestamp).toLocaleTimeString()}</small>
            </div>
        `;

        if (busMarkers[busId]) {
            // মার্কার আপডেট
            busMarkers[busId].setLatLng(newPosition);
            busMarkers[busId].setPopupContent(popupContent);
            
            // টুলটিপ আপডেট (শুধু দূরত্ব)
            if (tooltipText) {
                busMarkers[busId].setTooltipContent(tooltipText);
            }
        } else {
            // নতুন মার্কার তৈরি
            const marker = L.marker(newPosition, { icon: busIcon })
                .addTo(map)
                .bindPopup(popupContent);
            
            // টুলটিপ বাইন্ড করা (যদি ইউজার লোকেশন অন থাকে, তবেই দূরত্ব দেখাবে)
            if (tooltipText) {
                marker.bindTooltip(tooltipText, {
                    permanent: true, 
                    direction: 'right', 
                    className: 'bus-tooltip'
                }).openTooltip();
            }

            busMarkers[busId] = marker;
        }
    }
});
