document.addEventListener('DOMContentLoaded', () => {
    const navList = document.getElementById('nav-list');
    const token = localStorage.getItem('diuBusToken');
    const userName = localStorage.getItem('diuUserName');
    const userRole = localStorage.getItem('diuUserRole'); // রোল চেক করা হচ্ছে

    if (token && userName) {
        // --- ইউজার লগইন অবস্থায় আছে ---
        
        // ১. যদি ইউজার 'admin' হয়, তবে অ্যাডমিন বাটন দেখাও
        if (userRole === 'admin') {
            const adminLi = document.createElement('li');
            adminLi.innerHTML = `<a href="admin.html" style="color: red; font-weight: bold;">Admin Panel</a>`;
            navList.appendChild(adminLi);
        }

        // ২. ওয়েলকাম মেসেজ এবং লগআউট বাটন
        const authLi = document.createElement('li');
        authLi.classList.add('auth-active');
        
        authLi.innerHTML = `
            <span class="welcome-message">Welcome, ${userName}</span>
            <button id="logout-button" class="logout-button">Log Out</button>
        `;
        
        navList.appendChild(authLi);

        // ৩. লগআউট লজিক
        const logoutButton = document.getElementById('logout-button');
        logoutButton.addEventListener('click', () => {
            localStorage.clear(); // সব ডেটা মুছে ফেলা
            window.location.href = 'index.html'; // হোমপেজে ফেরত পাঠানো
        });

    } else {
        // --- ইউজার লগইন নেই ---
        const authLi = document.createElement('li');
        authLi.innerHTML = `<a href="login.html" class="login-button">Login / Sign Up</a>`;
        navList.appendChild(authLi);
    }
});
