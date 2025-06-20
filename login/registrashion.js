document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('login');
    const registerSection = document.getElementById('register');
    const goToRegisterLink = document.getElementById('goToRegister');
    const goToLoginLink = document.getElementById('goToLogin');
    const forgotPasswordLink = document.getElementById('forgot-password');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.registration-form');
    
    // Элементы формы входа
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    
    // Элементы формы регистрации
    const registerName = document.getElementById('register-name');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const registerPhone = document.getElementById('register-phone');

    // Переключение между формами
    goToRegisterLink.addEventListener('click', function(event) {
        event.preventDefault();
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
    });

    goToLoginLink.addEventListener('click', function(event) {
        event.preventDefault();
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
    });
    
    // Восстановление пароля
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();
        const email = prompt('Введите ваш email для восстановления пароля:');
        if (email) {
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    alert('Письмо для сброса пароля отправлено на ' + email);
                })
                .catch(error => {
                    alert('Ошибка: ' + error.message);
                });
        }
    });

    // Обработка входа
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const email = loginEmail.value;
        const password = loginPassword.value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Перенаправляем в кабинет после успешного входа
                window.location.href = '../cabinet/cabinet.html';
            })
            .catch((error) => {
                alert('Ошибка входа: ' + error.message);
            });
    });

    // Обработка регистрации
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const email = registerEmail.value;
        const password = registerPassword.value;
        const name = registerName.value;
        const phone = registerPhone.value;
        
        // Создаем пользователя
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // Сохраняем дополнительные данные в Realtime Database
                return firebase.database().ref('parents/' + user.uid).set({
                    name: name,
                    login: email,
                    phone: phone,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    updatedAt: firebase.database.ServerValue.TIMESTAMP
                });
            })
            .then(() => {
                // Перенаправляем в кабинет после успешной регистрации
                window.location.href = '../cabinet/cabinet.html';
            })
            .catch((error) => {
                alert('Ошибка регистрации: ' + error.message);
            });
    });
    
    // Проверяем, авторизован ли пользователь
    auth.onAuthStateChanged(user => {
        if (user) {
            // Если пользователь уже авторизован, перенаправляем в кабинет
            window.location.href = '../cabinet/cabinet.html';
        }
    });
});