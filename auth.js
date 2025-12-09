document.addEventListener('DOMContentLoaded', () => {
    const navList = document.getElementById('nav-list');
    const token = localStorage.getItem('diuBusToken');
    const userName = localStorage.getItem('diuUserName');

    if (token && userName) {
        // User is logged in
        const authLi = document.createElement('li');
        authLi.classList.add('auth-active');
        
        authLi.innerHTML = `
            <span class="welcome-message">Welcome, ${userName}</span>
            <button id="logout-button" class="logout-button">Log Out</button>
        `;
        
        navList.appendChild(authLi);

        // Add logout functionality
        const logoutButton = document.getElementById('logout-button');
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('diuBusToken');
            localStorage.removeItem('diuUserName');
            localStorage.removeItem('diuUserRole');
            window.location.reload(); // Reload page to update navbar
        });

    } else {
        // User is logged out
        const authLi = document.createElement('li');
        authLi.innerHTML = `<a href="login.html" class="login-button">Login / Sign Up</a>`;
        navList.appendChild(authLi);
    }
});