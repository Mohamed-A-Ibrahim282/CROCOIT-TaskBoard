document.addEventListener('DOMContentLoaded', () => {
    const avatar = document.getElementById('profileAvatar');
    const nameDisplay = document.getElementById('profileNameDisplay');
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const phoneInput = document.getElementById('userPhone');

    const profile = JSON.parse(localStorage.getItem('user_profile')) || {};

    if (profile.avatar) avatar.src = profile.avatar;
    if (profile.name) { nameInput.value = profile.name; nameDisplay.textContent = profile.name; }
    if (profile.email) emailInput.value = profile.email;
    if (profile.phone) phoneInput.value = profile.phone;

    document.getElementById('avatarInput').onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const url = ev.target.result;
            avatar.src = url;
            profile.avatar = url;
            localStorage.setItem('user_profile', JSON.stringify(profile));
            if (window.opener) {
                window.opener.document.getElementById('sidebarAvatar').src = url;
            }
        };
        reader.readAsDataURL(file);
    };

    document.getElementById('profileForm').onsubmit = e => {
        e.preventDefault();
        profile.name = nameInput.value.trim() || 'Your Name';
        profile.email = emailInput.value.trim();
        profile.phone = phoneInput.value.trim();
        localStorage.setItem('user_profile', JSON.stringify(profile));
        nameDisplay.textContent = profile.name;
        if (window.opener) {
            window.opener.document.getElementById('sidebarName').textContent = profile.name;
        }
        alert('Profile saved successfully!');
    };
});