document.addEventListener('DOMContentLoaded', function() {
    // DOM элементы
    const childrenList = document.getElementById('children-list');
    const addChildButton = document.querySelector('.add-child-button');
    const addChildModal = document.getElementById('add-child-modal');
    const cancelAddChild = document.getElementById('cancel-add-child');
    const confirmAddChild = document.getElementById('confirm-add-child');
    const childNameInput = document.getElementById('child-name-input');
    const childAgeInput = document.getElementById('child-age-input');
    const currentChildName = document.getElementById('current-child-name');
    const totalLessonsElement = document.getElementById('total-lessons');
    const activeChildLessonsElement = document.getElementById('active-child-lessons');
    const saveButton = document.querySelector('.save-button');
    const logoutButton = document.getElementById('logout-button');
    
    // Инициализация Firebase
    const db = firebase.database();
    const auth = firebase.auth();
    
    // Текущий пользователь и данные
    let currentUser = null;
    let children = [];
    let currentChildId = null;
    
    // Инициализация приложения
    function initApp() {
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                console.log('User authenticated:', user.uid);
                loadAllData();
            } else {
                console.log('User not authenticated, redirecting...');
                window.location.href = '../login/registrashion.html';
            }
        });
    }
    
    // Загрузка всех данных
    function loadAllData() {
        Promise.all([
            loadParentData(),
            loadChildrenData()
        ]).catch(error => {
            console.error('Error loading data:', error);
            showToast('Ошибка загрузки данных');
        });
    }
    
    // Загрузка данных родителя
    function loadParentData() {
        return db.ref('parents/' + currentUser.uid).once('value').then(snapshot => {
            const parentData = snapshot.val() || {
                name: '',
                login: currentUser.email,
                phone: ''
            };
            
            document.getElementById('parent-name').value = parentData.name;
            document.getElementById('parent-login').value = parentData.login || currentUser.email;
            document.getElementById('parent-phone').value = parentData.phone;
        });
    }
    
    // Загрузка данных детей
    function loadChildrenData() {
        return new Promise((resolve, reject) => {
            const childrenRef = db.ref('children').orderByChild('parentId').equalTo(currentUser.uid);
            
            childrenRef.on('value', snapshot => {
                children = [];
                snapshot.forEach(childSnapshot => {
                    const child = childSnapshot.val();
                    child.id = childSnapshot.key;
                    children.push(child);
                });
                
                console.log('Loaded children:', children);
                
                loadCurrentChild().then(resolve).catch(reject);
            }, error => {
                console.error('Error loading children:', error);
                if (error.code === 'PERMISSION_DENIED') {
                    showToast('Недостаточно прав для доступа к данным. Пожалуйста, войдите снова.');
                    auth.signOut().then(() => window.location.href = 'login.html');
                } else {
                    showToast('Ошибка загрузки данных детей');
                    reject(error);
                }
            });
        });
    }
    
    // Загрузка текущего ребенка
    function loadCurrentChild() {
        return db.ref('currentChildren/' + currentUser.uid).once('value').then(snapshot => {
            currentChildId = snapshot.val();
            updateCurrentChildDisplay();
            renderChildrenList();
            updateStats();
        });
    }
    
    // Обновление отображения текущего ребенка
    function updateCurrentChildDisplay() {
        if (currentChildId) {
            const currentChild = children.find(c => c.id === currentChildId);
            currentChildName.textContent = currentChild ? currentChild.name : 'Не выбран';
        } else {
            currentChildName.textContent = 'Не выбран';
        }
    }
    
    // Обработчики событий
    function setupEventListeners() {
        addChildButton.addEventListener('click', showAddChildModal);
        cancelAddChild.addEventListener('click', hideAddChildModal);
        confirmAddChild.addEventListener('click', handleAddChild);
        saveButton.addEventListener('click', saveParentData);
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Выход из системы
    function handleLogout() {
        if (!confirm('Вы уверены, что хотите выйти из аккаунта?')) return;
        
        auth.signOut()
            .then(() => {
                showToast('Вы успешно вышли из системы');
                setTimeout(() => {
                    window.location.href = '../login/registrashion.html';
                }, 1000);
            })
            .catch(error => {
                console.error('Error signing out:', error);
                showToast('Ошибка при выходе из системы');
            });
    }
    
    // Модальное окно добавления ребенка
    function showAddChildModal() {
        childNameInput.value = '';
        childAgeInput.value = '';
        addChildModal.style.display = 'flex';
    }
    
    function hideAddChildModal() {
        addChildModal.style.display = 'none';
    }
    
    function handleAddChild() {
        const name = childNameInput.value.trim();
        const age = parseInt(childAgeInput.value);
        
        if (!name || age < 3 || age > 12 || isNaN(age)) {
            showToast('Пожалуйста, введите корректные данные (имя и возраст от 3 до 12 лет)');
            return;
        }
        
        addChild(name, age)
            .then(() => hideAddChildModal())
            .catch(error => {
                console.error('Error adding child:', error);
                showToast('Ошибка при добавлении ребенка');
            });
    }
    
    // Добавление ребенка
    function addChild(name, age) {
        return new Promise((resolve, reject) => {
            const newChildRef = db.ref('children').push();
            const newChild = {
                parentId: currentUser.uid,
                name: name,
                age: age,
                lessonsCompleted: 0,
                completedLevels: {},
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            };
            
            newChildRef.set(newChild)
                .then(() => {
                    console.log('Child added:', newChildRef.key);
                    showToast('Ребенок успешно добавлен');
                    
                    // Если это первый ребенок, устанавливаем его как текущего
                    if (children.length === 0) {
                        return setCurrentChild(newChildRef.key);
                    }
                    return Promise.resolve();
                })
                .then(resolve)
                .catch(reject);
        });
    }
    
    // Удаление ребенка
    function deleteChild(childId) {
        if (!confirm('Вы уверены, что хотите удалить этого ребенка?')) return;
        
        const updates = {};
        updates['children/' + childId] = null;
        updates['progress/' + childId] = null;
        updates['completedLevels/' + childId] = null;
        
        // Если удаляем текущего ребенка, сбрасываем выбор
        if (currentChildId === childId) {
            updates['currentChildren/' + currentUser.uid] = null;
            currentChildId = null;
            updateCurrentChildDisplay();
        }
        
        db.ref().update(updates)
            .then(() => {
                showToast('Ребенок удален');
                // Фильтруем локальный массив детей
                children = children.filter(c => c.id !== childId);
                renderChildrenList();
                updateStats();
            })
            .catch(error => {
                console.error('Error deleting child:', error);
                showToast('Ошибка при удалении ребенка');
            });
    }
    
    // Установка текущего ребенка
    function setCurrentChild(childId) {
        return db.ref('currentChildren/' + currentUser.uid).set(childId)
            .then(() => {
                currentChildId = childId;
                updateCurrentChildDisplay();
                updateStats();
                renderChildrenList();
            })
            .catch(error => {
                console.error('Error setting current child:', error);
                showToast('Ошибка при выборе ребенка');
            });
    }
    
    // Отрисовка списка детей
    function renderChildrenList() {
        childrenList.innerHTML = '';
        
        if (!children || children.length === 0) {
            childrenList.innerHTML = '<p class="no-children">Добавьте ребенка</p>';
            return;
        }
        
        // Сортируем детей по дате создания (новые внизу)
        children.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        
        children.forEach(child => {
            const isCurrent = child.id === currentChildId;
            const childElement = document.createElement('div');
            childElement.className = `child-item ${isCurrent ? 'current' : ''}`;
            childElement.dataset.id = child.id;
            
            // Формируем список пройденных уровней
            let levelsHtml = '';
            if (child.completedLevels && Object.keys(child.completedLevels).length > 0) {
                const sortedLevels = Object.keys(child.completedLevels)
                    .map(level => parseInt(level.replace('level', '')))
                    .sort((a, b) => a - b);
                
                levelsHtml = sortedLevels.map(level => 
                    `<span class="level-badge">Урок ${level}</span>`
                ).join('');
            } else {
                levelsHtml = '<span class="no-levels">Еще нет пройденных уроков</span>';
            }
            
            childElement.innerHTML = `
                <div class="child-info">
                    <span class="child-name">${child.name}</span>
                    <span class="child-age">${child.age} лет</span>
                    <div class="child-levels">${levelsHtml}</div>
                </div>
                <div class="child-stats">
                    <span class="child-lessons">${child.lessonsCompleted || 0}</span>
                    <span class="lessons-label">уроков</span>
                </div>
                <div class="child-actions">
                    <button class="child-button select-button">${isCurrent ? 'Выбран' : 'Выбрать'}</button>
                    <button class="child-button delete-button">Удалить</button>
                </div>
            `;
            
            // Добавляем обработчики событий
            const selectBtn = childElement.querySelector('.select-button');
            const deleteBtn = childElement.querySelector('.delete-button');
            
            selectBtn.addEventListener('click', () => setCurrentChild(child.id));
            deleteBtn.addEventListener('click', () => deleteChild(child.id));
            
            childrenList.appendChild(childElement);
        });
    }
    
    // Обновление статистики
    function updateStats() {
        const totalLessons = children.reduce((sum, child) => sum + (child.lessonsCompleted || 0), 0);
        totalLessonsElement.textContent = totalLessons;
        
        if (currentChildId) {
            const currentChild = children.find(c => c.id === currentChildId);
            activeChildLessonsElement.textContent = currentChild ? (currentChild.lessonsCompleted || 0) : '0';
        } else {
            activeChildLessonsElement.textContent = '0';
        }
    }

    // Глобальная функция для обновления статистики ребенка
    window.updateChildStats = function(childId) {
        // Обновляем данные конкретного ребенка
        db.ref('children/' + childId).once('value').then(snapshot => {
            const updatedChild = snapshot.val();
            if (updatedChild) {
                // Находим ребенка в локальном массиве и обновляем его данные
                const childIndex = children.findIndex(c => c.id === childId);
                if (childIndex !== -1) {
                    children[childIndex] = {
                        ...children[childIndex],
                        lessonsCompleted: updatedChild.lessonsCompleted || 0,
                        completedLevels: updatedChild.completedLevels || {}
                    };
                    
                    // Если это текущий ребенок, обновляем его отображение
                    if (currentChildId === childId) {
                        updateCurrentChildDisplay();
                    }
                    
                    // Перерисовываем список детей и статистику
                    renderChildrenList();
                    updateStats();
                }
            }
        }).catch(error => {
            console.error('Error updating child stats:', error);
        });
    };

    
    // Сохранение данных родителя
    function saveParentData() {
        const parentData = {
            name: document.getElementById('parent-name').value,
            login: document.getElementById('parent-login').value,
            phone: document.getElementById('parent-phone').value,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        db.ref('parents/' + currentUser.uid).update(parentData)
            .then(() => showToast('Данные сохранены'))
            .catch(error => {
                console.error('Error saving parent data:', error);
                showToast('Ошибка сохранения данных');
            });
    }
    
    // Показать уведомление
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }, 100);
    }
    
    // Глобальная функция для обновления статистики
    window.updateChildStats = function(childId, lessonsCompleted, levelNumber) {
        const updates = {};
        updates['children/' + childId + '/lessonsCompleted'] = lessonsCompleted;
        updates['children/' + childId + '/updatedAt'] = firebase.database.ServerValue.TIMESTAMP;
        
        if (levelNumber) {
            updates['children/' + childId + '/completedLevels/level' + levelNumber] = {
                completionDate: firebase.database.ServerValue.TIMESTAMP
            };
        }
        
        db.ref().update(updates)
            .catch(error => console.error('Error updating child stats:', error));
    };
    
    // Запуск приложения
    initApp();
    setupEventListeners();
});