document.addEventListener('DOMContentLoaded', () => {
    const navList = document.getElementById('nav-list');
    const token = localStorage.getItem('diuBusToken');
    const userName = localStorage.getItem('diuUserName');
    const userRole = localStorage.getItem('diuUserRole');

    if (token && userName) {
        // --- ইউজার লগইন অবস্থায় আছে ---

        // ১. যদি 'admin' হয়, বাটন দেখাও
        if (userRole === 'admin') {
            const adminLi = document.createElement('li');
            adminLi.innerHTML = `<a href="admin.html" style="color: red; font-weight: bold;">Admin Panel</a>`;
            navList.appendChild(adminLi);
        }

        // ২.যদি 'driver' হয়, ট্র্যাকিং বাটন দেখাও
        if (userRole === 'driver') {
            const driverLi = document.createElement('li');
            driverLi.innerHTML = `<a href="driver.html" style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 5px; text-decoration: none;">Start Tracking</a>`;
            navList.appendChild(driverLi);
        }

        // ৩. ওয়েলকাম মেসেজ এবং লগআউট
        const authLi = document.createElement('li');
        authLi.classList.add('auth-active');
        
        authLi.innerHTML = `
            <span class="welcome-message">Hi, ${userName.split(' ')[0]}</span>
            <button id="logout-button" class="logout-button">Logout</button>
        `;
        
        navList.appendChild(authLi);

        // ৪. লগআউট লজিক
        const logoutButton = document.getElementById('logout-button');
        logoutButton.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });

    } else {
        // --- লগইন নেই ---
        const authLi = document.createElement('li');
        authLi.innerHTML = `<a href="login.html" class="login-button">Login</a>`;
        navList.appendChild(authLi);
    }
});
