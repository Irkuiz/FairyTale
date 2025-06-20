document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Firebase
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
    
    // Инициализируем Firebase, если еще не инициализирован
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    const db = firebase.database();
    const auth = firebase.auth();

    // Основные элементы
    const levelNodes = document.querySelectorAll('.node[data-level]');
    const closeButtons = document.querySelectorAll('.close');
    const nextButtons = document.querySelectorAll('.next-btn, .complete-level');
    const modals = {
        1: document.getElementById('level1Modal'),
        2: document.getElementById('level2Modal'),
        3: document.getElementById('level3Modal')
    };

    // Состояние игры
    let currentLevel = null;
    let draggedItem = null;
    let currentNumber = 1;
    let correctAnswers = 0;

    // Инициализация модальных окон
    function initModals() {
        Object.values(modals).forEach(modal => {
            if (modal) {
                modal.style.display = 'none';
                modal.querySelectorAll('.complete-level').forEach(btn => {
                    btn.style.display = 'none';
                });
            }
        });
    }

    // Показать шаг в модальном окне
    function showStep(modal, stepId) {
        if (!modal || !stepId) return;
        
        const steps = modal.querySelectorAll('.level-step');
        steps.forEach(step => {
            step.classList.remove('active');
            if (step.id === stepId) {
                step.classList.add('active');
                modal.scrollTop = 0;
            }
        });
    }

    // Открыть модальное окно
    function openModal(levelId) {
        const modal = modals[levelId];
        if (!modal) return;
        
        currentLevel = levelId;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Показываем первый шаг для уровня
        const firstStepId = `levelIntro${levelId}`;
        showStep(modal, firstStepId);
        
        // Инициализация игр для уровня
        if (levelId === '1') {
            setupShapeGame();
        } else if (levelId === '2') {
            setupNumberGrid();
        } else if (levelId === '3') {
            setupHabitatsGame();
        }
    }

    // Закрыть модальное окно
    function closeModal(modal) {
        if (!modal) return;
        
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            resetCurrentLevel(modal);
            currentLevel = null;
        }, 300);
    }

    // Сброс текущего уровня
    function resetCurrentLevel(modal) {
        if (!modal) return;
        
        if (modal === modals[1]) {
            resetLevel1();
        } else if (modal === modals[2]) {
            resetLevel2();
        } else if (modal === modals[3]) {
            resetLevel3();
        }
    }

    // Перемешивание массива
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // ================= Уровень 1: Фигуры =================
    function resetLevel1() {
        // Сброс игры с фигурами
        const dragItemsContainer = document.querySelector('#level1Modal .drag-items');
        const dropTargets = document.querySelectorAll('#level1Modal .drop-target');
        const completeButton = document.querySelector('#level1Modal .complete-level');
        
        if (dragItemsContainer) {
            dragItemsContainer.classList.remove('hidden');
            document.querySelectorAll('#level1Modal .drag-item').forEach(item => {
                item.classList.remove('hidden');
                dragItemsContainer.appendChild(item);
            });
        }
        
        if (dropTargets) {
            dropTargets.forEach(target => target.innerHTML = '');
        }
        
        if (completeButton) {
            completeButton.style.display = 'none';
        }
        
        // Сброс других игр уровня 1
        resetPairGame();
        resetOddOneOut();
        resetSizeGame();
    }

    function setupShapeGame() {
        const dragItems = document.querySelectorAll('#level1Modal .drag-item');
        const dropTargets = document.querySelectorAll('#level1Modal .drop-target');
        const completeButton = document.querySelector('#level1Modal .complete-level');
        const dragItemsContainer = document.querySelector('#level1Modal .drag-items');

        if (!dragItems || !dropTargets || !completeButton || !dragItemsContainer) return;

        // Перемешиваем фигуры
        dragItemsContainer.innerHTML = '';
        shuffleArray(Array.from(dragItems)).forEach(item => dragItemsContainer.appendChild(item));

        // Настройка drag and drop
        dragItems.forEach(item => {
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', function(e) {
                draggedItem = this;
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.dataset.shape);
            });

            item.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                draggedItem = null;
                checkShapeGameCompletion();
            });
        });

        dropTargets.forEach(target => {
            target.addEventListener('dragover', function(e) {
                e.preventDefault();
                if (draggedItem && this.dataset.shape === draggedItem.dataset.shape) {
                    this.style.borderColor = '#8BFF73';
                }
            });

            target.addEventListener('dragleave', function() {
                this.style.borderColor = '#8a9a9b';
            });

            target.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = '#8a9a9b';
                
                if (draggedItem && this.dataset.shape === draggedItem.dataset.shape) {
                    this.innerHTML = '';
                    this.appendChild(draggedItem);
                    draggedItem.classList.remove('dragging');
                    checkShapeGameCompletion();
                }
            });
        });

        function checkShapeGameCompletion() {
            const allPlaced = Array.from(dropTargets).every(target => target.children.length > 0);
            completeButton.style.display = allPlaced ? 'inline-block' : 'none';
        }
    }

    function setupPairGame() {
        const leftColumn = document.querySelector('#levelGame1-1 .left-column');
        const rightColumn = document.querySelector('#levelGame1-1 .right-column');
        const nextButton = document.querySelector('#levelGame1-1 .complete-level');
        
        if (!leftColumn || !rightColumn || !nextButton) return;
        
        leftColumn.innerHTML = '';
        rightColumn.innerHTML = '';
        nextButton.style.display = 'none';
        
        const shapes = ['circle', 'square', 'triangle'];
        const leftShapes = shuffleArray([...shapes]);
        const rightShapes = shuffleArray([...shapes]);
        
        // Создаем фигуры в колонках
        leftShapes.forEach(shape => {
            const shapeElem = document.createElement('div');
            shapeElem.className = 'shape-pair';
            shapeElem.dataset.shape = shape;
            leftColumn.appendChild(shapeElem);
        });
        
        rightShapes.forEach(shape => {
            const shapeElem = document.createElement('div');
            shapeElem.className = 'shape-pair';
            shapeElem.dataset.shape = shape;
            rightColumn.appendChild(shapeElem);
        });
        
        let firstSelected = null;
        let foundPairs = 0;
        
        document.querySelectorAll('#levelGame1-1 .shape-pair').forEach(shape => {
            shape.addEventListener('click', function() {
                if (firstSelected === null) {
                    firstSelected = this;
                    this.style.boxShadow = '0 0 0 4px #467470';
                } else if (firstSelected === this) {
                    firstSelected.style.boxShadow = '';
                    firstSelected = null;
                } else {
                    // Удаляем все старые линии
                    document.querySelectorAll('.pair-line').forEach(line => line.remove());
                    
                    if (firstSelected.dataset.shape === this.dataset.shape) {
                        // Создаем линию между фигурами
                        const line = document.createElement('div');
                        line.className = 'pair-line';
                        
                        const rect1 = firstSelected.getBoundingClientRect();
                        const rect2 = this.getBoundingClientRect();
                        
                        const x1 = rect1.left + rect1.width / 2;
                        const y1 = rect1.top + rect1.height / 2;
                        const x2 = rect2.left + rect2.width / 2;
                        const y2 = rect2.top + rect2.height / 2;
                        
                        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                        
                        line.style.width = `${length}px`;
                        line.style.left = `${x1}px`;
                        line.style.top = `${y1}px`;
                        line.style.transform = `rotate(${angle}deg)`;
                        
                        document.body.appendChild(line);
                        
                        this.style.backgroundColor = '#8BFF73';
                        this.style.borderColor = '#457770';
                        firstSelected.style.backgroundColor = '#8BFF73';
                        firstSelected.style.borderColor = '#457770';
                        foundPairs++;
                        
                        if (foundPairs === shapes.length) {
                            nextButton.style.display = 'inline-block';
                        }
                    } else {
                        this.classList.add('shake');
                        firstSelected.classList.add('shake');
                        setTimeout(() => {
                            this.classList.remove('shake');
                            firstSelected.classList.remove('shake');
                        }, 500);
                    }
                    firstSelected.style.boxShadow = '';
                    firstSelected = null;
                }
            });
        });
    }

    function resetPairGame() {
        const nextButton = document.querySelector('#levelGame1-1 .complete-level');
        if (nextButton) nextButton.style.display = 'none';
        document.querySelectorAll('.pair-line').forEach(line => line.remove());
    }

    function setupOddOneOut() {
        const nextButton = document.querySelector('#levelGame1-2 .complete-level');
        if (!nextButton) return;
        
        correctAnswers = 0;
        nextButton.style.display = 'none';
        
        const rowColors = ['#9BF6FF', '#FFADAD', '#FDFFB6'];
        document.querySelectorAll('#levelGame1-2 .odd-row').forEach((row, rowIndex) => {
            const shapes = row.querySelectorAll('.shape-odd');
            const shapeType = ['circle', 'square', 'triangle'][rowIndex % 3];
            const rowColor = rowColors[rowIndex % 3];
            const oddProperty = Math.random() < 0.5 ? 'size' : 'color';
            const oddIndex = Math.floor(Math.random() * 4);
            
            shapes.forEach((shape, index) => {
                shape.className = `shape-odd ${shapeType}`;
                shape.style.backgroundColor = rowColor;
                shape.style.borderColor = shapeType === 'circle' ? '#57E7F5' :
                                         shapeType === 'square' ? '#FF7979' :
                                         '#FCFF8F';
                
                if (index === oddIndex) {
                    shape.dataset.odd = 'true';
                    if (oddProperty === 'size') {
                        shape.classList.add('large');
                    } else {
                        shape.style.backgroundColor = rowColors[(rowIndex + 1) % 3];
                    }
                } else {
                    shape.dataset.odd = 'false';
                }
                
                shape.addEventListener('click', function() {
                    if (shape.dataset.checked === 'true') return;
                    
                    if (shape.dataset.odd === 'true') {
                        shape.dataset.checked = 'true';
                        shape.style.backgroundColor = '#8BFF73';
                        shape.style.borderColor = '#457770';
                        correctAnswers++;
                        
                        if (correctAnswers === 3) {
                            nextButton.style.display = 'inline-block';
                        }
                    } else {
                        shape.classList.add('incorrect');
                        setTimeout(() => {
                            shape.classList.remove('incorrect');
                        }, 500);
                    }
                });
            });
        });
    }

    function resetOddOneOut() {
        const nextButton = document.querySelector('#levelGame1-2 .complete-level');
        if (nextButton) nextButton.style.display = 'none';
        
        document.querySelectorAll('#levelGame1-2 .shape-odd').forEach(shape => {
            shape.style.backgroundColor = '';
            shape.style.borderColor = '';
            shape.classList.remove('large', 'incorrect');
            shape.removeAttribute('data-odd');
            shape.removeAttribute('data-checked');
        });
    }

    function setupSizeGame() {
        const sizeItems = document.querySelectorAll('#levelGame1-3 .size-item');
        const sizeTargets = document.querySelectorAll('#levelGame1-3 .size-target');
        const completeButton = document.querySelector('#levelGame1-3 .complete-level');
        const itemsContainer = document.querySelector('#levelGame1-3 .size-items');
        
        if (!sizeItems || !sizeTargets || !completeButton || !itemsContainer) return;

        // Устанавливаем размеры элементов
        sizeItems.forEach(item => {
            const size = parseInt(item.dataset.size);
            item.style.width = `${60 + (size - 1) * 30}px`;
            item.style.height = `${60 + (size - 1) * 30}px`;
            item.setAttribute('draggable', 'true');
        });

        // Перемешиваем элементы
        itemsContainer.innerHTML = '';
        shuffleArray(Array.from(sizeItems)).forEach(item => itemsContainer.appendChild(item));

        // Настройка drag and drop
        sizeItems.forEach(item => {
            item.addEventListener('dragstart', function(e) {
                draggedItem = this;
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.dataset.size);
            });

            item.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                draggedItem = null;
                checkSizeGameCompletion();
            });
        });

        sizeTargets.forEach(target => {
            target.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('highlight');
            });

            target.addEventListener('dragleave', function() {
                this.classList.remove('highlight');
            });

            target.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('highlight');
                
                if (draggedItem) {
                    if (this.firstChild) {
                        itemsContainer.appendChild(this.firstChild);
                    }
                    this.appendChild(draggedItem);
                    draggedItem.classList.remove('dragging');
                    checkSizeGameCompletion();
                }
            });
        });

        function checkSizeGameCompletion() {
            const allFilled = Array.from(sizeTargets).every(target => target.children.length > 0);
            let isCorrect = false;
            
            if (allFilled) {
                isCorrect = Array.from(sizeTargets).every((target, index) => {
                    const item = target.firstChild;
                    return item && parseInt(item.dataset.size) === index + 1;
                });
                
                if (!isCorrect) {
                    sizeTargets.forEach(target => {
                        if (target.firstChild) {
                            target.firstChild.classList.add('error');
                        }
                    });
                    
                    setTimeout(() => {
                        sizeTargets.forEach(target => {
                            if (target.firstChild) {
                                target.firstChild.classList.remove('error');
                            }
                        });
                    }, 500);
                }
            }
            
            completeButton.style.display = allFilled && isCorrect ? 'inline-block' : 'none';
        }
    }

    function resetSizeGame() {
        const sizeItems = document.querySelectorAll('#levelGame1-3 .size-item');
        const sizeTargets = document.querySelectorAll('#levelGame1-3 .size-target');
        const itemsContainer = document.querySelector('#levelGame1-3 .size-items');
        const completeButton = document.querySelector('#levelGame1-3 .complete-level');
        
        if (sizeItems && itemsContainer && sizeTargets && completeButton) {
            itemsContainer.innerHTML = '';
            sizeItems.forEach(item => {
                itemsContainer.appendChild(item);
                item.classList.remove('error', 'dragging');
            });
            
            sizeTargets.forEach(target => {
                target.innerHTML = '';
                target.classList.remove('highlight');
            });
            
            completeButton.style.display = 'none';
        }
    }

    // ================= Уровень 2: Числа =================
    function resetLevel2() {
        // Сброс числовой сетки
        const numberGrid = document.getElementById('number-grid-game');
        if (numberGrid) numberGrid.innerHTML = '';
        
        // Сброс сопоставления чисел
        const itemContainers = document.querySelectorAll('.item-container');
        const completeButton = document.querySelector('#levelGame2B .complete-level');
        
        if (itemContainers && completeButton) {
            itemContainers.forEach(container => {
                const dropArea = container.querySelector('.drop-area');
                if (dropArea.firstChild) {
                    document.getElementById('number-drag-container').appendChild(dropArea.firstChild);
                }
            });
            
            completeButton.style.display = 'none';
        }
        
        currentNumber = 1;
    }

    function setupNumberGrid() {
        const container = document.getElementById('number-grid-game');
        const nextButton = document.querySelector('#levelGame2A .next-btn');
        if (!container || !nextButton) return;
        
        container.innerHTML = '';
        currentNumber = 1;
        nextButton.style.display = 'none';
        
        const numbers = shuffleArray(Array.from({length: 9}, (_, i) => i + 1));
        
        numbers.forEach(number => {
            const button = document.createElement('button');
            button.className = 'number-button';
            button.textContent = number;
            
            button.addEventListener('click', function() {
                if (parseInt(this.textContent) === currentNumber) {
                    this.disabled = true;
                    this.style.backgroundColor = '#8BFF73';
                    currentNumber++;
                    
                    if (currentNumber > 9) {
                        nextButton.style.display = 'inline-block';
                    }
                } else {
                    this.classList.add('shake');
                    this.style.backgroundColor = '#FFADAD';
                    
                    setTimeout(() => {
                        this.classList.remove('shake');
                        this.style.backgroundColor = '#9BF6FF';
                    }, 750);
                }
            });
            
            container.appendChild(button);
        });
    }

    function setupFindSame() {
        const targetNumber = document.querySelector('#levelGame2-2 .target-number');
        const optionsContainer = document.querySelector('#levelGame2-2 .number-options');
        const nextButton = document.querySelector('#levelGame2-2 .next-btn');
        
        if (!targetNumber || !optionsContainer || !nextButton) return;
        
        const correctNumber = Math.floor(Math.random() * 9) + 1;
        targetNumber.textContent = correctNumber;
        nextButton.style.display = 'none';
        
        // Создаем варианты ответов (1 правильный и 5 неправильных)
        const options = [correctNumber];
        while (options.length < 6) {
            const randomNum = Math.floor(Math.random() * 9) + 1;
            if (!options.includes(randomNum)) {
                options.push(randomNum);
            }
        }
        
        optionsContainer.innerHTML = '';
        shuffleArray(options).forEach(num => {
            const option = document.createElement('div');
            option.className = 'number-option';
            option.textContent = num;
            
            option.addEventListener('click', function() {
                if (parseInt(this.textContent) === correctNumber) {
                    this.classList.add('correct');
                    setTimeout(() => {
                        nextButton.style.display = 'inline-block';
                    }, 500);
                } else {
                    this.classList.add('shake', 'incorrect');
                    setTimeout(() => {
                        this.classList.remove('shake', 'incorrect');
                    }, 750);
                }
            });
            
            optionsContainer.appendChild(option);
        });
    }

    function setupMissingNumber() {
        const sequencesContainer = document.querySelector('#levelGame2-7 .sequences-container');
        const nextButton = document.querySelector('#levelGame2-7 .next-btn');
        
        if (!sequencesContainer || !nextButton) return;
        
        sequencesContainer.innerHTML = '';
        nextButton.style.display = 'none';
        
        const sequences = [
            { sequence: [1, 2, '_', 4], answer: 3 },
            { sequence: [5, '_', 7, 8], answer: 6 },
            { sequence: [9, 10, 11, '_'], answer: 12 }
        ];
        
        let correctCount = 0;
        
        sequences.forEach((seq, seqIndex) => {
            const sequenceElement = document.createElement('div');
            sequenceElement.className = 'sequence';
            
            const sequenceText = document.createElement('div');
            sequenceText.className = 'number-sequence';
            sequenceText.textContent = seq.sequence.join(', ');
            sequenceElement.appendChild(sequenceText);
            
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'number-options';
            
            // Создаем варианты ответов (1 правильный и 3 неправильных)
            const options = [seq.answer];
            while (options.length < 4) {
                const randomNum = seq.answer + Math.floor(Math.random() * 5) - 2;
                if (randomNum > 0 && !options.includes(randomNum)) {
                    options.push(randomNum);
                }
            }
            
            shuffleArray(options).forEach(num => {
                const option = document.createElement('div');
                option.className = 'number-option';
                option.textContent = num;
                option.dataset.sequenceIndex = seqIndex;
                
                option.addEventListener('click', function() {
                    if (parseInt(this.textContent) === seq.answer) {
                        // Заменяем _ на правильный ответ
                        const sequenceText = this.closest('.sequence').querySelector('.number-sequence');
                        const sequenceParts = sequenceText.textContent.split(', ');
                        const underscoreIndex = sequenceParts.indexOf('_');
                        if (underscoreIndex !== -1) {
                            sequenceParts[underscoreIndex] = seq.answer;
                            sequenceText.textContent = sequenceParts.join(', ');
                        }
                        
                        // Удаляем варианты ответов
                        this.closest('.sequence').querySelector('.number-options').remove();
                        
                        correctCount++;
                        
                        if (correctCount === sequences.length) {
                            setTimeout(() => {
                                nextButton.style.display = 'inline-block';
                            }, 500);
                        }
                    } else {
                        this.classList.add('shake', 'incorrect');
                        setTimeout(() => {
                            this.classList.remove('shake', 'incorrect');
                        }, 750);
                    }
                });
                
                optionsContainer.appendChild(option);
            });
            
            sequenceElement.appendChild(optionsContainer);
            sequencesContainer.appendChild(sequenceElement);
        });
    }

    function setupMathProblem() {
        const problemsContainer = document.querySelector('#levelGame2-9 .problems-container');
        const nextButton = document.querySelector('#levelGame2-9 .next-btn');
        
        if (!problemsContainer || !nextButton) return;
        
        problemsContainer.innerHTML = '';
        nextButton.style.display = 'none';
        
        const problems = [
            { problem: '2 + 3 = _', answer: 5 },
            { problem: '7 - 2 = _', answer: 5 },
            { problem: '4 + 5 = _', answer: 9 }
        ];
        
        let correctCount = 0;
        
        problems.forEach((prob, probIndex) => {
            const problemElement = document.createElement('div');
            problemElement.className = 'math-problem-container';
            
            const problemText = document.createElement('div');
            problemText.className = 'math-problem';
            problemText.textContent = prob.problem;
            problemElement.appendChild(problemText);
            
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'number-options';
            
            // Создаем варианты ответов (1 правильный и 3 неправильных)
            const options = [prob.answer];
            while (options.length < 4) {
                const randomNum = prob.answer + Math.floor(Math.random() * 5) - 2;
                if (randomNum > 0 && !options.includes(randomNum)) {
                    options.push(randomNum);
                }
            }
            
            shuffleArray(options).forEach(num => {
                const option = document.createElement('div');
                option.className = 'number-option';
                option.textContent = num;
                option.dataset.problemIndex = probIndex;
                
                option.addEventListener('click', function() {
                    if (parseInt(this.textContent) === prob.answer) {
                        // Заменяем _ на правильный ответ
                        const problemText = this.closest('.math-problem-container').querySelector('.math-problem');
                        problemText.textContent = problemText.textContent.replace('_', prob.answer);
                        
                        // Удаляем варианты ответов
                        this.closest('.math-problem-container').querySelector('.number-options').remove();
                        
                        correctCount++;
                        
                        if (correctCount === problems.length) {
                            setTimeout(() => {
                                nextButton.style.display = 'inline-block';
                            }, 500);
                        }
                    } else {
                        this.classList.add('shake', 'incorrect');
                        setTimeout(() => {
                            this.classList.remove('shake', 'incorrect');
                        }, 750);
                    }
                });
                
                optionsContainer.appendChild(option);
            });
            
            problemElement.appendChild(optionsContainer);
            problemsContainer.appendChild(problemElement);
        });
    }

    function setupNumberMatch() {
        const numbersDraggable = document.querySelectorAll('.number-drag');
        const itemContainers = document.querySelectorAll('.item-container');
        const completeButton = document.querySelector('#levelGame2B .complete-level');
        
        if (!numbersDraggable || !itemContainers || !completeButton) return;
        
        completeButton.style.display = 'none';
        
        numbersDraggable.forEach(numberDrag => {
            numberDrag.setAttribute('draggable', 'true');
            
            numberDrag.addEventListener('dragstart', function(e) {
                draggedItem = this;
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.dataset.number);
            });
            
            numberDrag.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                draggedItem = null;
                checkNumberMatchCompletion();
            });
        });
        
        itemContainers.forEach(itemContainer => {
            const dropArea = itemContainer.querySelector('.drop-area');
            
            dropArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                if (draggedItem) {
                    this.classList.add('highlight');
                }
            });
            
            dropArea.addEventListener('dragleave', function() {
                this.classList.remove('highlight');
            });
            
            dropArea.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('highlight');
                
                if (draggedItem) {
                    const draggedNumber = parseInt(draggedItem.dataset.number);
                    const targetNumber = parseInt(itemContainer.dataset.number);
                    
                    if (this.firstChild) {
                        document.getElementById('number-drag-container').appendChild(this.firstChild);
                    }
                    
                    this.appendChild(draggedItem);
                    
                    if (draggedNumber !== targetNumber) {
                        draggedItem.classList.add('incorrect');
                        setTimeout(() => {
                            draggedItem.classList.remove('incorrect');
                        }, 500);
                    }
                    
                    checkNumberMatchCompletion();
                }
            });
        });
        
        function checkNumberMatchCompletion() {
            const allCorrect = Array.from(itemContainers).every(container => {
                const dropArea = container.querySelector('.drop-area');
                const droppedNumber = dropArea.firstChild ? parseInt(dropArea.firstChild.dataset.number) : null;
                return droppedNumber === parseInt(container.dataset.number);
            });
            
            completeButton.style.display = allCorrect ? 'inline-block' : 'none';
        }
    }

    // ================= Уровень 3: Животные =================
    function resetLevel3() {
        // Сброс игры "Кто где живет"
        const habitats = document.querySelectorAll('#levelGame3-1 .habitat-area');
        const animals = document.querySelectorAll('#levelGame3-1 .animal');
        const animalsContainer = document.querySelector('#levelGame3-1 .animals-container');
        
        if (habitats && animals && animalsContainer) {
            habitats.forEach(habitat => habitat.innerHTML = '');
            animals.forEach(animal => {
                animal.style.display = 'block';
                animalsContainer.appendChild(animal);
            });
        }
        
        // Сброс игры "Времена года"
        const seasons = document.querySelectorAll('#levelGame3-2 .season-area');
        const seasonItems = document.querySelectorAll('#levelGame3-2 .season-item');
        const seasonItemsContainer = document.querySelector('#levelGame3-2 .season-items');
        
        if (seasons && seasonItems && seasonItemsContainer) {
            seasons.forEach(season => season.innerHTML = '');
            seasonItems.forEach(item => {
                item.style.display = 'block';
                seasonItemsContainer.appendChild(item);
            });
        }
        
        // Сброс других игр уровня 3
        resetParentsBabiesGame();
        resetProductsGame();
        resetLifecycleGame();
    }

    function setupHabitatsGame() {
        const habitats = document.querySelectorAll('#levelGame3-1 .habitat-area');
        const animals = document.querySelectorAll('#levelGame3-1 .animal');
        const completeButton = document.querySelector('#levelGame3-1 .complete-level');
        
        if (!habitats || !animals || !completeButton) return;
        
        completeButton.style.display = 'none';
        
        animals.forEach(animal => {
            animal.setAttribute('draggable', 'true');
            
            animal.addEventListener('dragstart', function(e) {
                draggedItem = this;
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.dataset.habitat);
            });
            
            animal.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                draggedItem = null;
                checkHabitatsCompletion();
            });
        });
        
        habitats.forEach(habitat => {
            habitat.addEventListener('dragover', function(e) {
                e.preventDefault();
                if (draggedItem && this.parentElement.dataset.habitat === draggedItem.dataset.habitat) {
                    this.style.borderColor = '#8BFF73';
                }
            });
            
            habitat.addEventListener('dragleave', function() {
                this.style.borderColor = '#8a9a9b';
            });
            
            habitat.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = '#8a9a9b';
                
                if (draggedItem && this.parentElement.dataset.habitat === draggedItem.dataset.habitat) {
                    this.appendChild(draggedItem);
                    draggedItem.style.display = 'block';
                    checkHabitatsCompletion();
                }
            });
        });
        
        function checkHabitatsCompletion() {
            const allPlaced = Array.from(animals).every(animal => animal.parentElement.classList.contains('habitat-area'));
            completeButton.style.display = allPlaced ? 'inline-block' : 'none';
        }
    }

    function setupSeasonsGame() {
        const seasons = document.querySelectorAll('#levelGame3-2 .season-area');
        const seasonItems = document.querySelectorAll('#levelGame3-2 .season-item');
        const completeButton = document.querySelector('#levelGame3-2 .complete-level');
        
        if (!seasons || !seasonItems || !completeButton) return;
        
        completeButton.style.display = 'none';
        
        seasonItems.forEach(item => {
            item.setAttribute('draggable', 'true');
            
            item.addEventListener('dragstart', function(e) {
                draggedItem = this;
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.dataset.season);
            });
            
            item.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                draggedItem = null;
                checkSeasonsCompletion();
            });
        });
        
        seasons.forEach(season => {
            season.addEventListener('dragover', function(e) {
                e.preventDefault();
                if (draggedItem && this.parentElement.dataset.season === draggedItem.dataset.season) {
                    this.style.borderColor = '#8BFF73';
                }
            });
            
            season.addEventListener('dragleave', function() {
                this.style.borderColor = '#8a9a9b';
            });
            
            season.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = '#8a9a9b';
                
                if (draggedItem && this.parentElement.dataset.season === draggedItem.dataset.season) {
                    this.appendChild(draggedItem);
                    draggedItem.style.display = 'block';
                    checkSeasonsCompletion();
                }
            });
        });
        
        function checkSeasonsCompletion() {
            const allPlaced = Array.from(seasonItems).every(item => item.parentElement.classList.contains('season-area'));
            completeButton.style.display = allPlaced ? 'inline-block' : 'none';
        }
    }

    function resetParentsBabiesGame() {
        const nextButton = document.querySelector('#levelGame3-3 .complete-level');
        if (nextButton) nextButton.style.display = 'none';
        document.querySelectorAll('.pair-line').forEach(line => line.remove());
    }

    function setupParentsBabiesGame() {
        const parentsContainer = document.querySelector('#levelGame3-3 .parents-container');
        const babiesContainer = document.querySelector('#levelGame3-3 .babies-container');
        const completeButton = document.querySelector('#levelGame3-3 .complete-level');
        
        if (!parentsContainer || !babiesContainer || !completeButton) return;
        
        parentsContainer.innerHTML = '';
        babiesContainer.innerHTML = '';
        completeButton.style.display = 'none';
        
        const pairs = [
            { parent: 'cow', baby: 'calf', parentImg: '../images/animals/cow.png', babyImg: '../images/animals/calf.png' },
            { parent: 'cat', baby: 'kitten', parentImg: '../images/animals/cat.png', babyImg: '../images/animals/kitten.png' },
            { parent: 'dog', baby: 'puppy', parentImg: '../images/animals/dog.png', babyImg: '../images/animals/puppy.png' }
        ];
        
        shuffleArray(pairs).forEach(pair => {
            const parent = document.createElement('div');
            parent.className = 'parent-animal';
            parent.dataset.animal = pair.parent;
            parent.innerHTML = `<img src="${pair.parentImg}" alt="${pair.parent}" width="100" height="100">`;
            parentsContainer.appendChild(parent);
            
            const baby = document.createElement('div');
            baby.className = 'baby-animal';
            baby.dataset.animal = pair.baby;
            baby.dataset.parent = pair.parent;
            baby.innerHTML = `<img src="${pair.babyImg}" alt="${pair.baby}" width="80" height="80">`;
            babiesContainer.appendChild(baby);
        });
        
        let lines = [];
        let selectedParent = null;
        let correctPairs = 0;
        
        document.querySelectorAll('#levelGame3-3 .parent-animal').forEach(parent => {
            parent.addEventListener('click', function() {
                if (selectedParent === null) {
                    selectedParent = this;
                    this.style.boxShadow = '0 0 0 4px #467470';
                } else if (selectedParent === this) {
                    selectedParent.style.boxShadow = '';
                    selectedParent = null;
                }
            });
        });
        
        document.querySelectorAll('#levelGame3-3 .baby-animal').forEach(baby => {
            baby.addEventListener('click', function() {
                if (selectedParent) {
                    // Удаляем все старые линии
                    lines.forEach(line => line.remove());
                    lines = [];
                    
                    // Создаем линию между родителем и детенышем
                    const line = document.createElement('div');
                    line.className = 'pair-line';
                    
                    const parentRect = selectedParent.getBoundingClientRect();
                    const babyRect = this.getBoundingClientRect();
                    
                    const x1 = parentRect.left + parentRect.width / 2;
                    const y1 = parentRect.top + parentRect.height / 2;
                    const x2 = babyRect.left + babyRect.width / 2;
                    const y2 = babyRect.top + babyRect.height / 2;
                    
                    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                    
                    line.style.width = `${length}px`;
                    line.style.left = `${x1}px`;
                    line.style.top = `${y1}px`;
                    line.style.transform = `rotate(${angle}deg)`;
                    
                    document.body.appendChild(line);
                    lines.push(line);
                    
                    if (selectedParent.dataset.animal === this.dataset.parent) {
                        selectedParent.style.backgroundColor = '#8BFF73';
                        this.style.backgroundColor = '#8BFF73';
                        correctPairs++;
                        
                        if (correctPairs === pairs.length) {
                            completeButton.style.display = 'inline-block';
                        }
                    } else {
                        selectedParent.classList.add('shake');
                        this.classList.add('shake');
                        setTimeout(() => {
                            selectedParent.classList.remove('shake');
                            this.classList.remove('shake');
                        }, 500);
                    }
                    
                    selectedParent.style.boxShadow = '';
                    selectedParent = null;
                }
            });
        });
    }

    function resetProductsGame() {
        const animalProducts = document.querySelectorAll('#levelGame3-4 .animal-product');
        const productsContainer = document.querySelector('#levelGame3-4 .products-container');
        const completeButton = document.querySelector('#levelGame3-4 .complete-level');
        
        if (animalProducts && productsContainer && completeButton) {
            animalProducts.forEach(container => {
                const product = container.firstChild;
                if (product) {
                    productsContainer.appendChild(product);
                }
            });
            completeButton.style.display = 'none';
        }
    }

    function setupProductsGame() {
        const animalProducts = document.querySelectorAll('#levelGame3-4 .animal-product');
        const products = document.querySelectorAll('#levelGame3-4 .product');
        const completeButton = document.querySelector('#levelGame3-4 .complete-level');
        
        if (!animalProducts || !products || !completeButton) return;
        
        completeButton.style.display = 'none';
        
        products.forEach(product => {
            product.setAttribute('draggable', 'true');
            
            product.addEventListener('dragstart', function(e) {
                draggedItem = this;
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.dataset.product);
            });
            
            product.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                draggedItem = null;
                checkProductsCompletion();
            });
        });
        
        animalProducts.forEach(container => {
            container.addEventListener('dragover', function(e) {
                e.preventDefault();
                if (draggedItem && this.dataset.product === draggedItem.dataset.product) {
                    this.style.borderColor = '#8BFF73';
                }
            });
            
            container.addEventListener('dragleave', function() {
                this.style.borderColor = '#8a9a9b';
            });
            
            container.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = '#8a9a9b';
                
                if (draggedItem && this.dataset.product === draggedItem.dataset.product) {
                    if (this.firstChild) {
                        document.querySelector('#levelGame3-4 .products-container').appendChild(this.firstChild);
                    }
                    this.appendChild(draggedItem);
                    checkProductsCompletion();
                }
            });
        });
        
        function checkProductsCompletion() {
            const allCorrect = Array.from(animalProducts).every(container => {
                const product = container.firstChild;
                return product && product.dataset.product === container.dataset.product;
            });
            
            completeButton.style.display = allCorrect ? 'inline-block' : 'none';
        }
    }

    function resetLifecycleGame() {
        const targets = document.querySelectorAll('#levelGame3-5 .lifecycle-target');
        const items = document.querySelectorAll('#levelGame3-5 .lifecycle-item');
        const itemsContainer = document.querySelector('#levelGame3-5 .lifecycle-items');
        const completeButton = document.querySelector('#levelGame3-5 .complete-level');
        
        if (targets && items && itemsContainer && completeButton) {
            targets.forEach(target => target.innerHTML = '');
            items.forEach(item => {
                itemsContainer.appendChild(item);
            });
            completeButton.style.display = 'none';
        }
    }

    function setupLifecycleGame() {
        const targets = document.querySelectorAll('#levelGame3-5 .lifecycle-target');
        const items = document.querySelectorAll('#levelGame3-5 .lifecycle-item');
        const completeButton = document.querySelector('#levelGame3-5 .complete-level');
        
        if (!targets || !items || !completeButton) return;
        
        completeButton.style.display = 'none';
        
        items.forEach(item => {
            item.setAttribute('draggable', 'true');
            
            item.addEventListener('dragstart', function(e) {
                draggedItem = this;
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.dataset.stage);
            });
            
            item.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                draggedItem = null;
                checkLifecycleCompletion();
            });
        });
        
        targets.forEach(target => {
            target.addEventListener('dragover', function(e) {
                e.preventDefault();
                if (draggedItem && this.dataset.stage === draggedItem.dataset.stage) {
                    this.style.borderColor = '#8BFF73';
                }
            });
            
            target.addEventListener('dragleave', function() {
                this.style.borderColor = '#8a9a9b';
            });
            
            target.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = '#8a9a9b';
                
                if (draggedItem && this.dataset.stage === draggedItem.dataset.stage) {
                    if (this.firstChild) {
                        document.querySelector('#levelGame3-5 .lifecycle-items').appendChild(this.firstChild);
                    }
                    this.appendChild(draggedItem);
                    checkLifecycleCompletion();
                }
            });
        });
        
        function checkLifecycleCompletion() {
            const allCorrect = Array.from(targets).every(target => {
                const item = target.firstChild;
                return item && item.dataset.stage === target.dataset.stage;
            });
            
            completeButton.style.display = allCorrect ? 'inline-block' : 'none';
        }
    }

    // ================= Обработчики событий =================
    function setupEventListeners() {
        // Клик по карточкам уровней
        levelNodes.forEach(node => {
            node.addEventListener('click', function() {
                const levelId = this.getAttribute('data-level');
                openModal(levelId);
            });
        });

        // Кнопки "Далее" и "Завершить"
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (!modal) return;
                
                const nextStep = this.getAttribute('data-next');
                if (!nextStep) return;
                
                // Проверяем, завершили ли мы уровень
                if (nextStep.includes('levelComplete')) {
                    const levelNumber = parseInt(nextStep.replace('levelComplete', ''));
                    // Сохраняем пройденный уровень
                    saveCompletedLevel(levelNumber);
                }
                
                showStep(modal, nextStep);
                
                // Инициализация следующего шага
                switch(nextStep) {
                    case 'levelGame1':
                        setupShapeGame();
                        break;
                    case 'levelGame1-1':
                        setupPairGame();
                        break;
                    case 'levelGame1-2':
                        setupOddOneOut();
                        break;
                    case 'levelGame1-3':
                        setupSizeGame();
                        break;
                    case 'levelGame2A':
                        setupNumberGrid();
                        break;
                    case 'levelGame2-2':
                        setupFindSame();
                        break;
                    case 'levelGame2-7':
                        setupMissingNumber();
                        break;
                    case 'levelGame2-9':
                        setupMathProblem();
                        break;
                    case 'levelGame2B':
                        setupNumberMatch();
                        break;
                    case 'levelGame3-1':
                        setupHabitatsGame();
                        break;
                    case 'levelGame3-2':
                        setupSeasonsGame();
                        break;
                    case 'levelGame3-3':
                        setupParentsBabiesGame();
                        break;
                    case 'levelGame3-4':
                        setupProductsGame();
                        break;
                    case 'levelGame3-5':
                        setupLifecycleGame();
                        break;
                }
            });
        });

        // Кнопки закрытия
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });

        // Закрытие по клику вне модального окна
        window.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal')) {
                closeModal(event.target);
            }
        });
    }

        // Новая функция для сохранения пройденного уровня
    function saveCompletedLevel(levelNumber) {
        auth.onAuthStateChanged(user => {
            if (user) {
                // Получаем текущего ребенка из базы данных
                db.ref('currentChildren/' + user.uid).once('value').then(snapshot => {
                    const currentChildId = snapshot.val();
                    if (!currentChildId) return;

                    // Обновляем данные ребенка в базе
                    const updates = {};
                    updates[`children/${currentChildId}/completedLevels/level${levelNumber}`] = {
                        completionDate: firebase.database.ServerValue.TIMESTAMP
                    };
                    
                    // Увеличиваем счетчик пройденных уроков
                    db.ref(`children/${currentChildId}/lessonsCompleted`).transaction(current => {
                        return (current || 0) + 1;
                    });
                    
                    // Применяем обновления
                    db.ref().update(updates)
                        .then(() => {
                            console.log(`Level ${levelNumber} completed successfully`);
                            // Обновляем статистику в родительском кабинете
                            if (window.parent && window.parent.updateChildStats) {
                                window.parent.updateChildStats(currentChildId);
                            }
                        })
                        .catch(error => {
                            console.error('Error saving completed level:', error);
                        });
                });
            } else {
                console.log('User not authenticated');
            }
        });
    }

    // Функция для обновления статистики в кабинете
    function updateStatsInCabinet() {
        if (window.parent && window.parent.updateChildStats) {
            window.parent.updateChildStats();
        }
    }

    // Инициализация
    initModals();
    setupEventListeners();
});