// Конфигурация Firebase (та же, что и раньше)
const firebaseConfig = {
    apiKey: "AIzaSyD97XC87A5ceWQqD1h9hHhVFCH9xW0fhBk",
    authDomain: "rina-afb33.firebaseapp.com",
    databaseURL: "https://rina-afb33-default-rtdb.firebaseio.com",
    projectId: "rina-afb33",
    storageBucket: "rina-afb33.firebasestorage.app",
    messagingSenderId: "80189541038",
    appId: "1:80189541038:web:fea16be10ce25b9073bb3f",
    measurementId: "G-R25C670FPV"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.querySelector('.registration-form');
    const submitBtn = document.getElementById('submit-btn');
    
    registrationForm.addEventListener('submit', function(event) {
        event.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Регистрируем...';
        
        const parentName = registrationForm.querySelector('input[placeholder="Имя родителя"]').value.trim();
        const email = registrationForm.querySelector('input[placeholder="Email"]').value.trim();
        const password = registrationForm.querySelector('input[placeholder="Пароль"]').value;
        const phone = registrationForm.querySelector('input[placeholder="Номер телефона"]').value.trim();
        
        // Валидация
        if (!parentName || !email || !password || !phone) {
            alert('Заполните все поля!');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Зарегистрироваться';
            return;
        }

        if (password.length < 6) {
            alert('Пароль должен быть не менее 6 символов');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Зарегистрироваться';
            return;
        }

        // Регистрация через Firebase Auth
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // Сохранение данных в Realtime Database
                return database.ref('parents/' + user.uid).set({
                    parentName: parentName,
                    email: email,
                    phone: phone,
                    createdAt: new Date().toISOString()
                });
            })
            .then(() => {
                alert('Регистрация успешна!');
                window.location.href = '../cabinet/cabinet.html'; // Исправьте путь, если нужно
            })
            .catch((error) => {
                console.error("Ошибка:", error);
                let errorMessage = "Ошибка регистрации";
                
                if (error.code === "auth/email-already-in-use") {
                    errorMessage = "Email уже используется";
                } else if (error.code === "auth/invalid-email") {
                    errorMessage = "Некорректный email";
                } else if (error.code === "auth/weak-password") {
                    errorMessage = "Пароль слишком простой";
                }
                
                alert(errorMessage);
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Зарегистрироваться';
            });
    });
});