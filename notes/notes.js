document.addEventListener('DOMContentLoaded', function() {
  // Элементы
  const cards = {
    figures: document.getElementById('figures-card'),
    numbers: document.getElementById('numbers-card'),
    seasons: document.getElementById('seasons-card'),
    animals: document.getElementById('animals-card')
  };
  
  const modals = {
    figures: document.getElementById('figures-modal'),
    numbers: document.getElementById('numbers-modal'),
    seasons: document.getElementById('seasons-modal'),
    animals: document.getElementById('animals-modal')
  };
  
  const closeBtns = document.querySelectorAll('.close');
  
  // Проверка на мобильное устройство
  function isMobile() {
    return window.innerWidth <= 600;
  }
  
  // Открытие модального окна
  function openModal(modalId) {
    const modal = modals[modalId];
    if (!modal) return;
    
    // Блокируем прокрутку фона
    document.body.style.overflow = 'hidden';
    
    // Показываем модальное окно с анимацией
    modal.style.display = 'block';
    
    // Добавляем классы для анимации
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
    
    // Добавляем обработчик для закрытия по ESC
    document.addEventListener('keydown', handleEscape);
    
    // Оптимизация для мобильных
    const modalContent = modal.querySelector('.modal-content');
    if (isMobile() && modalContent) {
      modalContent.classList.add('mobile-view');
    }
  }
  
  // Закрытие модального окна
  function closeModal() {
    // Находим открытое модальное окно
    const openModal = document.querySelector('.modal.show');
    if (!openModal) return;
    
    // Убираем классы анимации
    openModal.classList.remove('show');
    
    // Ждем завершения анимации перед скрытием
    setTimeout(() => {
      openModal.style.display = 'none';
      document.body.style.overflow = '';
      
      // Убираем класс мобильного вида
      const modalContent = openModal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.classList.remove('mobile-view');
      }
      
      // Удаляем обработчик ESC
      document.removeEventListener('keydown', handleEscape);
    }, 300);
  }
  
  // Обработчик ESC
  function handleEscape(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }
  
  // Закрытие при клике вне контента
  function handleOutsideClick(e) {
    if (e.target.classList.contains('modal')) {
      closeModal();
    }
  }
  
  // Обработчики событий для карточек
  Object.keys(cards).forEach(key => {
    if (cards[key]) {
      cards[key].addEventListener('click', () => openModal(key));
    }
  });
  
  // Обработчики событий для кнопок закрытия
  closeBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  
  // Обработчики событий для модальных окон
  Object.values(modals).forEach(modal => {
    if (modal) {
      modal.addEventListener('click', handleOutsideClick);
    }
  });
  
  // Оптимизация при изменении размера
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      const isMobileView = isMobile();
      Object.values(modals).forEach(modal => {
        if (modal) {
          const modalContent = modal.querySelector('.modal-content');
          if (modalContent) {
            if (isMobileView) {
              modalContent.classList.add('mobile-view');
            } else {
              modalContent.classList.remove('mobile-view');
            }
          }
        }
      });
    }, 250);
  });
  
  // Предзагрузка изображений для всех модальных окон
  function preloadModalImages() {
    const images = [
      '../images/listing/listen/sun.png',
      '../images/listing/listen/cub1.png',
      '../images/listing/listen/door.png',
      '../images/listing/listen/pizza.png',
      '../images/listing/listen/number1.png',
      '../images/listing/listen/number2.png',
      '../images/listing/listen/number3.png',
      '../images/listing/listen/number4.png',
      '../images/listing/listen/winter.png',
      '../images/listing/listen/spring.png',
      '../images/listing/listen/summer.png',
      '../images/listing/listen/autumn.png',
      '../images/listing/listen/cat.png',
      '../images/listing/listen/dog.png',
      '../images/listing/listen/lion.png',
      '../images/listing/listen/bird.png',
      '../images/listing/listen/figuri.png',
      '../images/listing/listen/numbers.png',
      '../images/listing/listen/seasons.png',
      '../images/listing/listen/animals.png'
    ];
    
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }
  
  // Запускаем предзагрузку
  preloadModalImages();
});