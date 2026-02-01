/**
 * Основной файл приложения Wellness Diary
 */

class WellnessApp {
    constructor() {
        this.currentUser = {
            name: 'Пользователь',
            city: 'Москва',
            timezone: 'Europe/Moscow'
        };
        
        this.symptoms = {
            headache: [
                { id: 'headache_none', name: 'Нет головной боли', category: 'headache' },
                { id: 'headache_mild', name: 'Слабая головная боль', category: 'headache' },
                { id: 'headache_moderate', name: 'Средняя головная боль', category: 'headache' },
                { id: 'headache_severe', name: 'Сильная головная боль', category: 'headache' },
                { id: 'headache_pressure', name: 'Давящая головная боль', category: 'headache' }
            ],
            dizziness: [
                { id: 'dizziness_none', name: 'Нет головокружения', category: 'dizziness' },
                { id: 'dizziness_mild', name: 'Слабое головокружение', category: 'dizziness' },
                { id: 'dizziness_moderate', name: 'Среднее головокружение', category: 'dizziness' },
                { id: 'dizziness_severe', name: 'Сильное головокружение', category: 'dizziness' }
            ],
            general: [
                { id: 'wellness_good', name: 'Хорошее самочувствие', category: 'general' },
                { id: 'wellness_tired', name: 'Утомленное', category: 'general' },
                { id: 'wellness_fatigued', name: 'Сильно уставшее', category: 'general' }
            ],
            pain: [
                { id: 'pain_heart', name: 'Боль в сердце', category: 'pain' },
                { id: 'pain_joints', name: 'Боль в суставах', category: 'pain' },
                { id: 'pain_muscle', name: 'Боль в мышцах', category: 'pain' },
                { id: 'pain_stomach', name: 'Боль в животе', category: 'pain' }
            ]
        };
        
        this.entries = this.loadEntries();
        this.init();
    }
    
    init() {
        this.initDate();
        this.initNavigation();
        this.initMobileMenu();
        this.initForms();
        this.initCalendar();
        this.initCharts();
        this.loadUserSettings();
        this.updateUI();
    }
    
    initDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = now.toLocaleDateString('ru-RU', options);
        document.getElementById('today-date').textContent = now.toLocaleDateString('ru-RU');
        
        // Установка текущей даты в форму
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().substring(0, 5);
        
        document.getElementById('entry-date').value = today;
        document.getElementById('entry-time').value = currentTime;
    }
    
    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const sectionId = item.dataset.section;
                
                // Обновляем активный элемент навигации
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Показываем выбранную секцию, скрываем остальные
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === sectionId) {
                        section.classList.add('active');
                    }
                });
                
                // Обновляем заголовок
                document.getElementById('page-title').textContent = item.querySelector('span').textContent;
                
                // Обновляем данные секции
                this.updateSection(sectionId);
                
                // Закрываем мобильное меню если открыто
                this.hideMobileMenu();
            });
        });
        
        // Обработчики для ссылок "Все записи"
        const viewAllLinks = document.querySelectorAll('.view-all');
        viewAllLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section;
                
                // Находим соответствующий элемент навигации
                const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
                if (navItem) {
                    navItem.click();
                }
            });
        });
    }
    
    initMobileMenu() {
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
            
            // Закрытие меню при клике на оверлей
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    this.hideMobileMenu();
                }
            });
        }
    }
    
    hideMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    }
    
    initForms() {
        // Форма добавления записи
        const entryForm = document.getElementById('wellness-entry-form');
        if (entryForm) {
            entryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEntry();
            });
        }
        
        // Быстрая запись
        const quickSaveBtn = document.getElementById('save-quick-entry');
        if (quickSaveBtn) {
            quickSaveBtn.addEventListener('click', () => this.saveQuickEntry());
        }
        
        // Слайдеры
        this.initSliders();
        
        // Чекбоксы симптомов
        this.initSymptomsCheckboxes();
        
        // Кнопка "Текущее время"
        const useCurrentTimeBtn = document.getElementById('use-current-time');
        if (useCurrentTimeBtn) {
            useCurrentTimeBtn.addEventListener('click', () => {
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const currentTime = now.toTimeString().substring(0, 5);
                
                document.getElementById('entry-date').value = today;
                document.getElementById('entry-time').value = currentTime;
                
                this.showNotification('Время установлено', 'Текущее время и дата установлены', 'success');
            });
        }
        
        // Кнопка получения погоды
        const getWeatherBtn = document.getElementById('get-weather-data');
        if (getWeatherBtn) {
            getWeatherBtn.addEventListener('click', () => this.getWeatherForEntry());
        }
        
        // Настройки профиля
        const saveProfileBtn = document.getElementById('save-profile');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => this.saveProfile());
        }
        
        // Обновление данных
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updateUI());
        }
        
        // Управление данными
        const exportBtn = document.getElementById('export-data');
        const importBtn = document.getElementById('import-data');
        const resetBtn = document.getElementById('reset-data');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetData());
        }
    }
    
    initSliders() {
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            // Устанавливаем начальное значение
            const valueDisplay = slider.parentElement.querySelector('.slider-value') || 
                               slider.parentElement.querySelector('.scale-value') ||
                               document.getElementById(slider.id + '-value');
            
            if (valueDisplay) {
                valueDisplay.textContent = slider.value;
            }
            
            // Обновляем значение при изменении
            slider.addEventListener('input', (e) => {
                if (valueDisplay) {
                    valueDisplay.textContent = e.target.value;
                }
                
                // Для рейтинга самочувствия
                if (slider.id === 'wellness-rating') {
                    document.getElementById('rating-display').textContent = e.target.value;
                }
                
                // Для быстрой записи
                if (slider.id === 'quick-wellness') {
                    document.getElementById('quick-value').textContent = e.target.value;
                }
            });
        });
    }
    
    initSymptomsCheckboxes() {
        // Инициализируем чекбоксы для каждой категории симптомов
        Object.keys(this.symptoms).forEach(category => {
            const containerId = `${category}-symptoms`;
            const container = document.getElementById(containerId);
            
            if (container) {
                container.innerHTML = '';
                this.symptoms[category].forEach(symptom => {
                    const checkbox = this.createSymptomCheckbox(symptom);
                    container.appendChild(checkbox);
                });
            }
        });
        
        // Для быстрой записи
        const quickContainer = document.getElementById('quick-symptoms');
        if (quickContainer) {
            // Выбираем только основные симптомы для быстрой записи
            const quickSymptoms = [
                ...this.symptoms.headache.filter(s => s.id !== 'headache_none'),
                ...this.symptoms.dizziness.filter(s => s.id !== 'dizziness_none')
            ].slice(0, 6); // Ограничиваем 6 симптомами
            
            quickSymptoms.forEach(symptom => {
                const checkbox = this.createSymptomCheckbox(symptom, true);
                quickContainer.appendChild(checkbox);
            });
        }
    }
    
    createSymptomCheckbox(symptom, isQuick = false) {
        const div = document.createElement('div');
        div.className = 'symptom-checkbox';
        
        const id = isQuick ? `quick_${symptom.id}` : symptom.id;
        const label = symptom.name;
        
        div.innerHTML = `
            <input type="checkbox" id="${id}" name="symptoms" value="${symptom.id}">
            <span class="checkmark"></span>
            <label for="${id}" class="symptom-label">${label}</label>
        `;
        
        return div;
    }
    
    initCalendar() {
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        
        if (prevBtn && nextBtn) {
            this.currentCalendarDate = new Date();
            this.renderCalendar();
            
            prevBtn.addEventListener('click', () => {
                this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
                this.renderCalendar();
            });
            
            nextBtn.addEventListener('click', () => {
                this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
                this.renderCalendar();
            });
        }
    }
    
    renderCalendar() {
        const monthYear = document.getElementById('current-month-year');
        const calendarGrid = document.getElementById('calendar-grid');
        
        if (!monthYear || !calendarGrid) return;
        
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        // Обновляем заголовок
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        monthYear.textContent = `${monthNames[month]} ${year}`;
        
        // Получаем первый день месяца и количество дней
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        // Очищаем календарь
        calendarGrid.innerHTML = '';
        
        // Добавляем заголовки дней недели
        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        dayNames.forEach(dayName => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = dayName;
            calendarGrid.appendChild(dayHeader);
        });
        
        // Добавляем пустые ячейки перед первым днем
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Добавляем дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Проверяем есть ли записи для этого дня
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEntries = this.entries.filter(entry => entry.date === dateStr);
            
            if (dayEntries.length > 0) {
                dayElement.classList.add('has-entries');
                
                // Добавляем индикаторы записей
                const entriesContainer = document.createElement('div');
                entriesContainer.className = 'day-entries';
                
                dayEntries.forEach(entry => {
                    const dot = document.createElement('div');
                    dot.className = 'entry-dot';
                    
                    // Цвет точки в зависимости от самочувствия
                    if (entry.wellness >= 7) {
                        dot.classList.add('good');
                    } else if (entry.wellness >= 4) {
                        dot.classList.add('fair');
                    } else {
                        dot.classList.add('poor');
                    }
                    
                    entriesContainer.appendChild(dot);
                });
                
                dayElement.appendChild(entriesContainer);
            }
            
            // Номер дня
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);
            
            // Обработчик клика
            dayElement.addEventListener('click', () => {
                this.showDayDetails(dateStr, dayEntries);
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    showDayDetails(dateStr, entries) {
        const detailsContainer = document.getElementById('day-details');
        if (!detailsContainer) return;
        
        const date = new Date(dateStr);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('ru-RU', options);
        
        let html = `
            <h3>Записи за ${formattedDate}</h3>
        `;
        
        if (entries.length === 0) {
            html += '<p class="empty-state">Нет записей за этот день</p>';
        } else {
            html += '<div class="day-entries-list">';
            
            entries.forEach(entry => {
                const time = entry.time || 'Не указано';
                const wellness = entry.wellness || 0;
                const symptoms = entry.symptoms ? entry.symptoms.slice(0, 3).map(s => s.name).join(', ') : 'Нет симптомов';
                
                html += `
                    <div class="day-entry-item" onclick="app.showEntryDetails('${entry.id}')">
                        <div class="entry-time">${time}</div>
                        <div class="entry-summary">
                            <div class="entry-wellness-badge">${wellness}/10</div>
                            <div class="entry-symptoms-summary" title="${symptoms}">${symptoms}</div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        detailsContainer.innerHTML = html;
    }
    
    initCharts() {
        // Инициализация графиков Chart.js
        // График будет создаваться динамически при загрузке анализа
    }
    
    saveEntry() {
        const date = document.getElementById('entry-date').value;
        const time = document.getElementById('entry-time').value;
        const wellness = parseInt(document.getElementById('wellness-rating').value);
        
        // Собираем симптомы
        const selectedSymptoms = [];
        const symptomCheckboxes = document.querySelectorAll('input[name="symptoms"]:checked');
        
        symptomCheckboxes.forEach(checkbox => {
            const symptomId = checkbox.value;
            // Находим симптом по ID
            Object.keys(this.symptoms).forEach(category => {
                const symptom = this.symptoms[category].find(s => s.id === symptomId);
                if (symptom) {
                    selectedSymptoms.push(symptom);
                }
            });
        });
        
        // Собираем факторы образа жизни
        const sleepHours = parseFloat(document.getElementById('sleep-hours').value) || 0;
        const sleepQuality = parseInt(document.getElementById('sleep-quality').value) || 0;
        
        const activityLevel = document.querySelector('input[name="activity"]:checked')?.value || 'none';
        const activityDuration = parseInt(document.getElementById('activity-duration').value) || 0;
        
        const stressLevel = parseInt(document.getElementById('stress-level').value) || 0;
        
        const notes = document.getElementById('entry-notes').value;
        
        // Получаем погодные данные (если есть)
        const weatherData = window.currentWeather || {};
        
        // Создаем запись
        const entry = {
            id: Date.now().toString(),
            date: date,
            time: time,
            wellness: wellness,
            symptoms: selectedSymptoms,
            lifestyle: {
                sleep: {
                    hours: sleepHours,
                    quality: sleepQuality
                },
                activity: {
                    level: activityLevel,
                    duration: activityDuration
                },
                stress: stressLevel
            },
            weather: weatherData,
            notes: notes,
            createdAt: new Date().toISOString()
        };
        
        // Сохраняем запись
        this.entries.push(entry);
        this.saveEntries();
        
        // Очищаем форму
        document.getElementById('wellness-entry-form').reset();
        this.initSliders();
        this.initSymptomsCheckboxes();
        
        // Показываем уведомление
        this.showNotification('Запись сохранена', 'Ваша запись о самочувствии успешно сохранена', 'success');
        
        // Обновляем UI
        this.updateUI();
    }
    
    saveQuickEntry() {
        const wellness = parseInt(document.getElementById('quick-wellness').value);
        
        // Собираем симптомы из быстрой записи
        const selectedSymptoms = [];
        const quickCheckboxes = document.querySelectorAll('#quick-symptoms input[type="checkbox"]:checked');
        
        quickCheckboxes.forEach(checkbox => {
            const symptomId = checkbox.value.replace('quick_', '');
            // Находим симптом по ID
            Object.keys(this.symptoms).forEach(category => {
                const symptom = this.symptoms[category].find(s => s.id === symptomId);
                if (symptom) {
                    selectedSymptoms.push(symptom);
                }
            });
        });
        
        // Используем текущее время
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().substring(0, 5);
        
        // Получаем погодные данные
        const weatherData = window.currentWeather || {};
        
        // Создаем быструю запись
        const entry = {
            id: Date.now().toString(),
            date: date,
            time: time,
            wellness: wellness,
            symptoms: selectedSymptoms,
            lifestyle: {
                sleep: { hours: 0, quality: 0 },
                activity: { level: 'none', duration: 0 },
                stress: 0
            },
            weather: weatherData,
            notes: 'Быстрая запись',
            createdAt: now.toISOString()
        };
        
        // Сохраняем запись
        this.entries.push(entry);
        this.saveEntries();
        
        // Показываем уведомление
        this.showNotification('Запись сохранена', 'Быстрая запись успешно сохранена', 'success');
        
        // Обновляем UI
        this.updateUI();
    }
    
    getWeatherForEntry() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    // Здесь можно вызвать функцию получения погоды
                    this.showNotification('Геолокация', 'Местоположение получено', 'info');
                    
                    // В реальном приложении здесь был бы вызов API
                    // fetchWeatherData(lat, lon).then(data => {
                    //     window.weatherData = data;
                    // });
                },
                (error) => {
                    this.showNotification('Ошибка', 'Не удалось получить местоположение', 'error');
                }
            );
        } else {
            this.showNotification('Ошибка', 'Геолокация не поддерживается', 'error');
        }
    }
    
    saveProfile() {
        const name = document.getElementById('settings-name').value;
        const city = document.getElementById('settings-city').value;
        const timezone = document.getElementById('settings-timezone').value;
        
        this.currentUser = { name, city, timezone };
        this.saveUserSettings();
        
        // Обновляем UI
        document.getElementById('user-name').textContent = name;
        document.getElementById('user-city').textContent = city;
        
        this.showNotification('Профиль сохранен', 'Настройки профиля успешно обновлены', 'success');
    }
    
    showEntryDetails(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;
        
        const modal = document.getElementById('entry-modal');
        const modalBody = document.getElementById('entry-modal-body');
        
        if (!modal || !modalBody) return;
        
        // Форматируем дату
        const entryDate = new Date(`${entry.date}T${entry.time}`);
        const dateStr = entryDate.toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Форматируем симптомы
        const symptomsList = entry.symptoms.map(s => s.name).join(', ') || 'Нет симптомов';
        
        // Форматируем факторы образа жизни
        const sleepInfo = entry.lifestyle.sleep.hours > 0 
            ? `${entry.lifestyle.sleep.hours} ч (качество: ${entry.lifestyle.sleep.quality}/10)`
            : 'Не указано';
            
        const activityLevels = {
            none: 'Нет нагрузки',
            light: 'Легкая',
            moderate: 'Умеренная',
            high: 'Высокая'
        };
        
        const activityInfo = entry.lifestyle.activity.duration > 0
            ? `${activityLevels[entry.lifestyle.activity.level]} (${entry.lifestyle.activity.duration} мин)`
            : 'Нет нагрузки';
        
        const stressInfo = entry.lifestyle.stress > 0 ? `${entry.lifestyle.stress}/10` : 'Не указано';
        
        // Форматируем погодные данные
        let weatherInfo = 'Нет данных';
        if (entry.weather && entry.weather.temperature) {
            weatherInfo = `
                Температура: ${entry.weather.temperature}°C<br>
                Влажность: ${entry.weather.humidity || 'Н/Д'}%<br>
                Давление: ${entry.weather.pressure_mmHg || 'Н/Д'} мм рт.ст.<br>
                Ветер: ${entry.weather.wind_speed || 'Н/Д'} м/с
            `;
        }
        
        // Создаем HTML содержимое
        modalBody.innerHTML = `
            <div class="entry-details">
                <div class="detail-section">
                    <h4>Общая информация</h4>
                    <table class="entry-details-table">
                        <tr>
                            <th>Дата и время</th>
                            <td>${dateStr}, ${entry.time}</td>
                        </tr>
                        <tr>
                            <th>Самочувствие</th>
                            <td>
                                <div class="wellness-indicator ${this.getWellnessClass(entry.wellness)}">
                                    ${entry.wellness}/10
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Симптомы</th>
                            <td>${symptomsList}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="detail-section">
                    <h4>Факторы образа жизни</h4>
                    <table class="entry-details-table">
                        <tr>
                            <th>Сон</th>
                            <td>${sleepInfo}</td>
                        </tr>
                        <tr>
                            <th>Физическая активность</th>
                            <td>${activityInfo}</td>
                        </tr>
                        <tr>
                            <th>Стресс</th>
                            <td>${stressInfo}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="detail-section">
                    <h4>Погодные условия</h4>
                    <div class="weather-info">${weatherInfo}</div>
                </div>
                
                ${entry.notes ? `
                    <div class="detail-section">
                        <h4>Заметки</h4>
                        <div class="notes-content">${entry.notes}</div>
                    </div>
                ` : ''}
                
                <div class="modal-actions">
                    <button class="btn-secondary modal-close">Закрыть</button>
                    <button class="btn-danger" onclick="app.deleteEntry('${entry.id}')">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        `;
        
        // Показываем модальное окно
        this.showModal('entry-modal');
        
        // Добавляем обработчики закрытия
        const closeBtn = modalBody.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal('entry-modal'));
        }
    }
    
    deleteEntry(entryId) {
        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
            this.entries = this.entries.filter(e => e.id !== entryId);
            this.saveEntries();
            
            this.hideModal('entry-modal');
            this.showNotification('Запись удалена', 'Запись успешно удалена', 'success');
            this.updateUI();
        }
    }
    
    getWellnessClass(score) {
        if (score >= 7) return 'excellent';
        if (score >= 4) return 'good';
        return 'poor';
    }
    
    updateSection(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'analysis':
                this.updateAnalysis();
                break;
            case 'weather':
                this.updateWeather();
                break;
            case 'calendar':
                this.renderCalendar();
                break;
            case 'settings':
                this.updateSettings();
                break;
        }
    }
    
    updateDashboard() {
        this.updateRecentEntries();
        this.updateForecast();
        this.updateStatsInDashboard();
    }
    
    updateRecentEntries() {
        const container = document.getElementById('recent-entries');
        if (!container) return;
        
        // Берем последние 5 записей
        const recentEntries = [...this.entries]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        if (recentEntries.length === 0) {
            container.innerHTML = '<p class="empty-state">Нет записей</p>';
            return;
        }
        
        let html = '';
        recentEntries.forEach(entry => {
            const date = new Date(`${entry.date}T${entry.time}`);
            const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            const timeStr = entry.time;
            
            const symptomsSummary = entry.symptoms.slice(0, 2).map(s => s.name).join(', ');
            
            html += `
                <div class="entry-item" onclick="app.showEntryDetails('${entry.id}')">
                    <div class="entry-date">${dateStr} ${timeStr}</div>
                    <div class="entry-wellness">
                        <span class="wellness-value">${entry.wellness}/10</span>
                        <i class="fas fa-heart wellness-icon"></i>
                    </div>
                    <div class="entry-symptoms-summary">${symptomsSummary || 'Нет симптомов'}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    updateForecast() {
        // Здесь будет логика прогнозирования
        // Пока используем статические данные
        
        const forecastValue = document.getElementById('forecast-value');
        const forecastText = document.getElementById('forecast-text');
        const forecastEmoji = document.getElementById('forecast-emoji');
        const factorsContainer = document.getElementById('forecast-factors');
        
        if (!forecastValue || !forecastText || !forecastEmoji || !factorsContainer) return;
        
        // Простая логика прогноза на основе последних записей
        if (this.entries.length > 0) {
            const lastEntry = this.entries[this.entries.length - 1];
            const baseScore = lastEntry.wellness;
            
            // Корректируем на основе погоды и других факторов
            let forecastScore = baseScore;
            let factors = [];
            
            // Пример факторов
            if (window.currentWeather) {
                if (window.currentWeather.temperature < -10) {
                    forecastScore -= 1;
                    factors.push('Сильный холод');
                }
                
                if (window.currentWeather.pressure_mmHg < 735) {
                    forecastScore -= 0.5;
                    factors.push('Низкое давление');
                }
            }
            
            // Ограничиваем score 0-10
            forecastScore = Math.max(0, Math.min(10, forecastScore));
            
            forecastValue.textContent = forecastScore.toFixed(1);
            
            // Текст прогноза
            if (forecastScore >= 8) {
                forecastText.textContent = 'Ожидается отличное самочувствие';
                forecastEmoji.className = 'fas fa-laugh-beam';
            } else if (forecastScore >= 6) {
                forecastText.textContent = 'Ожидается хорошее самочувствие';
                forecastEmoji.className = 'fas fa-smile';
            } else if (forecastScore >= 4) {
                forecastText.textContent = 'Самочувствие может быть средним';
                forecastEmoji.className = 'fas fa-meh';
            } else {
                forecastText.textContent = 'Возможны проблемы с самочувствием';
                forecastEmoji.className = 'fas fa-frown';
            }
            
            // Факторы
            if (factors.length > 0) {
                factorsContainer.innerHTML = factors.map(factor => 
                    `<span class="factor-tag">${factor}</span>`
                ).join('');
            } else {
                factorsContainer.innerHTML = '<span class="factor-tag">Условия благоприятные</span>';
            }
        } else {
            // Если нет записей, показываем нейтральный прогноз
            forecastValue.textContent = '7.5';
            forecastText.textContent = 'Начните вести дневник для персонализированного прогноза';
            forecastEmoji.className = 'fas fa-smile';
            factorsContainer.innerHTML = '<span class="factor-tag">Нет данных для анализа</span>';
        }
    }
    
    updateStatsInDashboard() {
        // Обновляем количество записей в настройках
        const totalEntriesCount = document.getElementById('total-entries-count');
        if (totalEntriesCount) {
            totalEntriesCount.textContent = this.entries.length;
        }
        
        // Обновляем даты первой и последней записи
        const firstEntryDate = document.getElementById('first-entry-date');
        const lastEntryDate = document.getElementById('last-entry-date');
        
        if (this.entries.length > 0) {
            const sortedEntries = [...this.entries].sort((a, b) => new Date(a.date) - new Date(b.date));
            const firstDate = new Date(sortedEntries[0].date);
            const lastDate = new Date(sortedEntries[sortedEntries.length - 1].date);
            
            if (firstEntryDate) {
                firstEntryDate.textContent = firstDate.toLocaleDateString('ru-RU');
            }
            if (lastEntryDate) {
                lastEntryDate.textContent = lastDate.toLocaleDateString('ru-RU');
            }
        } else {
            if (firstEntryDate) firstEntryDate.textContent = '-';
            if (lastEntryDate) lastEntryDate.textContent = '-';
        }
    }
    
    updateAnalysis() {
        const analysisContainer = document.getElementById('analysis-content');
        if (!analysisContainer) return;
        
        if (this.entries.length === 0) {
            analysisContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h3>Нет данных для анализа</h3>
                    <p>Добавьте несколько записей о самочувствии, чтобы увидеть статистику и корреляции.</p>
                    <button class="btn-primary" onclick="app.switchToSection('add-entry')">
                        <i class="fas fa-plus-circle"></i> Добавить первую запись
                    </button>
                </div>
            `;
            return;
        }
        
        if (this.entries.length < 3) {
            analysisContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h3>Мало данных для анализа</h3>
                    <p>Добавьте ещё ${3 - this.entries.length} записей, чтобы увидеть статистику.</p>
                    <button class="btn-primary" onclick="app.switchToSection('add-entry')">
                        <i class="fas fa-plus-circle"></i> Добавить запись
                    </button>
                </div>
            `;
            return;
        }
        
        // Если достаточно данных, показываем анализ
        const stats = this.getStatistics();
        const correlations = this.analyzeWeatherCorrelations();
        
        let html = `
            <div class="analysis-grid">
                <!-- Статистика самочувствия -->
                <div class="card analysis-card">
                    <div class="card-header">
                        <h3><i class="fas fa-heartbeat"></i> Статистика самочувствия</h3>
                    </div>
                    <div class="analysis-content">
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-value">${stats.averageWellness.toFixed(1)}</div>
                                <div class="stat-label">Средний балл</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${stats.bestDay}</div>
                                <div class="stat-label">Лучший день</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${stats.worstDay}</div>
                                <div class="stat-label">Худший день</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${stats.total}</div>
                                <div class="stat-label">Всего записей</div>
                            </div>
                        </div>
                        
                        <div class="common-symptoms">
                            <h4>Наиболее частые симптомы:</h4>
        `;
        
        if (stats.mostCommonSymptoms.length > 0) {
            html += `<div class="symptoms-list">`;
            stats.mostCommonSymptoms.forEach(symptom => {
                html += `<span class="symptom-tag">${symptom.name} (${symptom.count})</span>`;
            });
            html += `</div>`;
        } else {
            html += `<p>Нет данных о симптомах</p>`;
        }
        
        html += `
                        </div>
                    </div>
                </div>
                
                <!-- Корреляции с погодой -->
                <div class="card analysis-card">
                    <div class="card-header">
                        <h3><i class="fas fa-cloud-rain"></i> Влияние погоды</h3>
                    </div>
                    <div class="analysis-content">
        `;
        
        if (correlations.length > 0) {
            html += `<div class="correlation-list">`;
            correlations.forEach(corr => {
                const correlationClass = corr.correlation > 0 ? 'positive' : corr.correlation < 0 ? 'negative' : 'neutral';
                html += `
                    <div class="correlation-item">
                        <span class="correlation-name">${corr.factor}</span>
                        <span class="correlation-value ${correlationClass}">${corr.correlation.toFixed(2)}</span>
                    </div>
                `;
            });
            html += `</div>`;
        } else {
            html += `<p class="empty-state">Недостаточно данных для анализа корреляций с погодой</p>`;
        }
        
        html += `
                        <div class="weather-recommendations">
                            <h4><i class="fas fa-lightbulb"></i> Рекомендации</h4>
                            <div class="recommendations-list">
        `;
        
        // Добавляем рекомендации
        const recommendations = this.getWeatherRecommendations();
        if (recommendations.length > 0) {
            recommendations.forEach(rec => {
                html += `
                    <div class="recommendation-item">
                        <i class="fas fa-lightbulb"></i>
                        <span>${rec}</span>
                    </div>
                `;
            });
        } else {
            html += `<p>Нет данных для рекомендаций</p>`;
        }
        
        html += `
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- График трендов -->
                <div class="card analysis-card full-width">
                    <div class="card-header">
                        <h3><i class="fas fa-chart-area"></i> Тренды самочувствия</h3>
                        <select id="trend-period" class="form-control">
                            <option value="7">7 дней</option>
                            <option value="30" selected>30 дней</option>
                            <option value="90">90 дней</option>
                        </select>
                    </div>
                    <div class="analysis-content">
                        <div class="chart-container">
                            <canvas id="wellness-trend-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        analysisContainer.innerHTML = html;
        
        // Инициализируем график
        this.initTrendChart();
        
        // Добавляем обработчик изменения периода
        const trendPeriodSelect = document.getElementById('trend-period');
        if (trendPeriodSelect) {
            trendPeriodSelect.addEventListener('change', () => {
                this.updateTrendChart(parseInt(trendPeriodSelect.value));
            });
        }
    }
    
    getStatistics() {
        if (this.entries.length === 0) {
            return {
                total: 0,
                averageWellness: 0,
                bestDay: 0,
                worstDay: 0,
                mostCommonSymptoms: []
            };
        }
        
        // Среднее самочувствие
        const totalWellness = this.entries.reduce((sum, e) => sum + (e.wellness || 0), 0);
        const averageWellness = totalWellness / this.entries.length;
        
        // Лучший и худший дни
        const wellnessValues = this.entries.map(e => e.wellness || 0);
        const bestDay = Math.max(...wellnessValues);
        const worstDay = Math.min(...wellnessValues);
        
        // Частые симптомы
        const symptomCount = {};
        this.entries.forEach(entry => {
            entry.symptoms.forEach(symptom => {
                const symptomName = symptom.name;
                symptomCount[symptomName] = (symptomCount[symptomName] || 0) + 1;
            });
        });
        
        const mostCommonSymptoms = Object.entries(symptomCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
        
        return {
            total: this.entries.length,
            averageWellness,
            bestDay,
            worstDay,
            mostCommonSymptoms
        };
    }
    
    analyzeWeatherCorrelations() {
        if (this.entries.length < 5) {
            return [];
        }
        
        const entriesWithWeather = this.entries.filter(e => e.weather && e.weather.temperature);
        if (entriesWithWeather.length < 5) {
            return [];
        }
        
        // Простая корреляция
        const calculateCorrelation = (xValues, yValues) => {
            const n = xValues.length;
            
            // Средние значения
            const meanX = xValues.reduce((sum, val) => sum + val, 0) / n;
            const meanY = yValues.reduce((sum, val) => sum + val, 0) / n;
            
            // Вычисляем корреляцию
            let numerator = 0;
            let denominatorX = 0;
            let denominatorY = 0;
            
            for (let i = 0; i < n; i++) {
                const diffX = xValues[i] - meanX;
                const diffY = yValues[i] - meanY;
                
                numerator += diffX * diffY;
                denominatorX += diffX * diffX;
                denominatorY += diffY * diffY;
            }
            
            if (denominatorX === 0 || denominatorY === 0) {
                return 0;
            }
            
            return numerator / Math.sqrt(denominatorX * denominatorY);
        };
        
        // Подготавливаем данные
        const wellnessValues = entriesWithWeather.map(e => e.wellness || 0);
        const tempValues = entriesWithWeather.map(e => e.weather.temperature || 0);
        const pressureValues = entriesWithWeather.map(e => e.weather.pressure_mmHg || e.weather.pressure || 0);
        const humidityValues = entriesWithWeather.map(e => e.weather.humidity || 0);
        
        // Вычисляем корреляции
        const correlations = [
            {
                factor: 'Температура',
                correlation: calculateCorrelation(tempValues, wellnessValues)
            },
            {
                factor: 'Давление',
                correlation: calculateCorrelation(pressureValues, wellnessValues)
            },
            {
                factor: 'Влажность',
                correlation: calculateCorrelation(humidityValues, wellnessValues)
            }
        ];
        
        return correlations;
    }
    
    getWeatherRecommendations() {
        const recommendations = [];
        
        // Анализируем последние записи
        if (this.entries.length > 0) {
            const lastEntry = this.entries[this.entries.length - 1];
            
            // Рекомендации по погоде из последней записи
            if (lastEntry.weather && lastEntry.weather.recommendations) {
                recommendations.push(...lastEntry.weather.recommendations);
            }
            
            // Рекомендации по образу жизни
            if (lastEntry.lifestyle) {
                if (lastEntry.lifestyle.sleep && lastEntry.lifestyle.sleep.hours < 6) {
                    recommendations.push('Старайтесь спать не менее 7-8 часов');
                }
                
                if (lastEntry.lifestyle.stress > 7) {
                    recommendations.push('Высокий уровень стресса - попробуйте методы релаксации');
                }
            }
        }
        
        // Общие рекомендации
        if (recommendations.length === 0) {
            recommendations.push(
                'Ведите регулярные записи для получения персонализированных рекомендаций',
                'Обращайте внимание на связь самочувствия с погодными изменениями',
                'Отмечайте все симптомы для более точного анализа'
            );
        }
        
        return recommendations.slice(0, 3);
    }
    
    initTrendChart(period = 30) {
        const ctx = document.getElementById('wellness-trend-chart');
        if (!ctx) return;
        
        this.updateTrendChart(period);
    }
    
    updateTrendChart(period = 30) {
        const ctx = document.getElementById('wellness-trend-chart');
        if (!ctx || this.entries.length === 0) return;
        
        // Уничтожаем старый график если есть
        if (this.trendChart) {
            this.trendChart.destroy();
        }
        
        // Подготавливаем данные за указанный период
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        
        const dates = [];
        const wellnessData = [];
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            dates.push(dateStr);
            
            // Находим записи за этот день
            const dayEntries = this.entries.filter(entry => entry.date === dateStr);
            if (dayEntries.length > 0) {
                // Среднее значение самочувствия за день
                const avgWellness = dayEntries.reduce((sum, entry) => sum + entry.wellness, 0) / dayEntries.length;
                wellnessData.push(avgWellness);
            } else {
                wellnessData.push(null);
            }
        }
        
        // Создаем график
        this.trendChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: dates.map(date => {
                    const d = new Date(date);
                    return `${d.getDate()}.${d.getMonth() + 1}`;
                }),
                datasets: [{
                    label: 'Самочувствие',
                    data: wellnessData,
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'var(--primary-color)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                return value !== null ? `Самочувствие: ${value.toFixed(1)}/10` : 'Нет данных';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        grid: {
                            color: 'var(--border-color)'
                        },
                        ticks: {
                            color: 'var(--text-secondary)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'var(--border-color)'
                        },
                        ticks: {
                            color: 'var(--text-secondary)'
                        }
                    }
                }
            }
        });
    }
    
    updateWeather() {
        // Обновление погодных данных
        // В реальном приложении здесь был бы вызов API
        this.showNotification('Погода', 'Данные о погоде обновлены', 'info');
    }
    
    updateSettings() {
        // Обновляем статистику в настройках
        this.updateStatsInDashboard();
    }
    
    updateUI() {
        this.updateDashboard();
        this.updateAnalysis();
        this.renderCalendar();
        this.updateSettings();
    }
    
    switchToSection(sectionId) {
        const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
        if (navItem) {
            navItem.click();
        }
    }
    
    exportData() {
        const data = {
            user: this.currentUser,
            entries: this.entries,
            symptoms: this.symptoms,
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `wellness-diary-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Экспорт данных', 'Данные успешно экспортированы', 'success');
    }
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    if (data.entries && Array.isArray(data.entries)) {
                        this.entries = data.entries;
                        this.saveEntries();
                        
                        if (data.user) {
                            this.currentUser = data.user;
                            this.saveUserSettings();
                        }
                        
                        this.showNotification('Импорт данных', 'Данные успешно импортированы', 'success');
                        this.updateUI();
                    } else {
                        this.showNotification('Ошибка', 'Неверный формат файла', 'error');
                    }
                } catch (error) {
                    this.showNotification('Ошибка', 'Не удалось загрузить файл', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    resetData() {
        if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
            this.entries = [];
            this.saveEntries();
            
            this.showNotification('Данные сброшены', 'Все записи удалены', 'success');
            this.updateUI();
        }
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modal-overlay');
        
        if (modal && overlay) {
            modal.classList.add('active');
            overlay.classList.add('active');
            
            // Закрытие по клику на overlay
            overlay.onclick = () => this.hideModal(modalId);
            
            // Закрытие по ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideModal(modalId);
                }
            });
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modal-overlay');
        
        if (modal && overlay) {
            modal.classList.remove('active');
            overlay.classList.remove('active');
        }
    }
    
    showNotification(title, message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-icon ${type}">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Закрытие по клику
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());
    }
    
    saveEntries() {
        try {
            localStorage.setItem('wellness_entries', JSON.stringify(this.entries));
        } catch (error) {
            console.error('Ошибка сохранения записей:', error);
        }
    }
    
    loadEntries() {
        try {
            const saved = localStorage.getItem('wellness_entries');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Ошибка загрузки записей:', error);
            return [];
        }
    }
    
    saveUserSettings() {
        try {
            localStorage.setItem('wellness_user_settings', JSON.stringify(this.currentUser));
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
        }
    }
    
    loadUserSettings() {
        try {
            const saved = localStorage.getItem('wellness_user_settings');
            if (saved) {
                this.currentUser = JSON.parse(saved);
                
                // Обновляем поля ввода
                const nameInput = document.getElementById('settings-name');
                const cityInput = document.getElementById('settings-city');
                const timezoneSelect = document.getElementById('settings-timezone');
                
                if (nameInput) nameInput.value = this.currentUser.name;
                if (cityInput) cityInput.value = this.currentUser.city;
                if (timezoneSelect) timezoneSelect.value = this.currentUser.timezone;
                
                // Обновляем отображение
                document.getElementById('user-name').textContent = this.currentUser.name;
                document.getElementById('user-city').textContent = this.currentUser.city;
            }
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
        }
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new WellnessApp();
    window.app = app;
});