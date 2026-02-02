/**
 * Модуль для работы с погодными API
 */

class WeatherAPI {
    constructor() {
        this.openMeteoUrl = "https://api.open-meteo.com/v1/forecast";
        this.geocodingUrl = "https://geocoding-api.open-meteo.com/v1/search";
        this.currentWeather = null;
        this.forecast = null;
    }
    
    // Конвертация гПа в мм рт.ст.
    hPaToMmHg(hPa) {
        return Math.round(hPa * 0.750062);
    }
    
    async getCoordinates(cityName) {
        try {
            const params = {
                name: cityName,
                count: 1,
                language: "ru",
                format: "json"
            };
            
            const response = await fetch(`${this.geocodingUrl}?${new URLSearchParams(params)}`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                return {
                    latitude: result.latitude,
                    longitude: result.longitude,
                    city: result.name,
                    country: result.country || "",
                    region: result.admin1 || ""
                };
            }
            return null;
        } catch (error) {
            console.error('Ошибка геокодирования:', error);
            return null;
        }
    }
    
    async getCurrentWeather(latitude, longitude) {
        try {
            const params = {
                latitude: latitude,
                longitude: longitude,
                current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
                timezone: "auto",
                forecast_days: 1
            };
            
            const response = await fetch(`${this.openMeteoUrl}?${new URLSearchParams(params)}`);
            const data = await response.json();
            
            if (data.current) {
                // Конвертируем давление в мм рт.ст.
                const pressure_hPa = data.current.pressure_msl;
                const pressure_mmHg = this.hPaToMmHg(pressure_hPa);
                
                return {
                    temperature: data.current.temperature_2m,
                    humidity: data.current.relative_humidity_2m,
                    feels_like: data.current.apparent_temperature,
                    pressure_hPa: pressure_hPa,
                    pressure_mmHg: pressure_mmHg,
                    wind_speed: data.current.wind_speed_10m,
                    wind_direction: data.current.wind_direction_10m,
                    weather_code: data.current.weather_code,
                    is_day: data.current.is_day,
                    precipitation: data.current.precipitation,
                    cloud_cover: data.current.cloud_cover,
                    time: data.current.time
                };
            }
            return null;
        } catch (error) {
            console.error('Ошибка получения погоды:', error);
            return null;
        }
    }
    
    async getForecast(latitude, longitude, days = 3) {
        try {
            const params = {
                latitude: latitude,
                longitude: longitude,
                hourly: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,visibility,wind_speed_10m,uv_index,is_day",
                daily: "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant",
                timezone: "auto",
                forecast_days: days
            };
            
            const response = await fetch(`${this.openMeteoUrl}?${new URLSearchParams(params)}`);
            const data = await response.json();
            
            // Конвертируем давление в мм рт.ст. для всех данных
            if (data.hourly && data.hourly.pressure_msl) {
                data.hourly.pressure_mmHg = data.hourly.pressure_msl.map(p => this.hPaToMmHg(p));
            }
            
            if (data.daily && data.daily.pressure_msl_max) {
                data.daily.pressure_mmHg_max = data.daily.pressure_msl_max.map(p => this.hPaToMmHg(p));
                data.daily.pressure_mmHg_min = data.daily.pressure_msl_min.map(p => this.hPaToMmHg(p));
            }
            
            return data;
        } catch (error) {
            console.error('Ошибка получения прогноза:', error);
            return null;
        }
    }
    
    interpretWeatherCode(code) {
        const codes = {
            0: "Ясно",
            1: "Преимущественно ясно",
            2: "Переменная облачность",
            3: "Пасмурно",
            45: "Туман",
            48: "Инейный туман",
            51: "Легкая морось",
            53: "Умеренная морось",
            55: "Сильная морось",
            56: "Ледяная морось",
            57: "Сильная ледяная морось",
            61: "Небольшой дождь",
            63: "Умеренный дождь",
            65: "Сильный дождь",
            66: "Ледяной дождь",
            67: "Сильный ледяной дождь",
            71: "Небольшой снег",
            73: "Умеренный снег",
            75: "Сильный снег",
            77: "Снежные зерна",
            80: "Небольшой ливень",
            81: "Умеренный ливень",
            82: "Сильный ливень",
            85: "Небольшой снегопад",
            86: "Сильный снегопад",
            95: "Гроза",
            96: "Гроза с небольшим градом",
            99: "Гроза с сильным градом"
        };
        
        return codes[code] || "Неизвестно";
    }
    
    getWeatherIcon(code, isDay = true) {
        const icons = {
            0: isDay ? "☀️" : "🌙",
            1: isDay ? "🌤️" : "🌤️",
            2: isDay ? "⛅" : "⛅",
            3: "☁️",
            45: "🌫️",
            48: "🌫️",
            51: "🌦️",
            53: "🌦️",
            55: "🌧️",
            56: "🌧️❄️",
            57: "🌧️❄️",
            61: "🌧️",
            63: "🌧️",
            65: "🌧️",
            66: "🌧️❄️",
            67: "🌧️❄️",
            71: "🌨️",
            73: "🌨️",
            75: "🌨️",
            77: "🌨️",
            80: "⛈️",
            81: "⛈️",
            82: "⛈️",
            85: "🌨️",
            86: "🌨️",
            95: "⛈️",
            96: "⛈️🌨️",
            99: "⛈️🌨️"
        };
        
        return icons[code] || "🌡️";
    }
    
    getWeatherRecommendations(weatherCode, temperature, pressure_mmHg, humidity) {
        const recommendations = [];
        
        // Рекомендации по температуре
        if (temperature > 30) {
            recommendations.push("Избегайте длительного пребывания на солнце");
            recommendations.push("Пейте больше воды");
        } else if (temperature < -10) {
            recommendations.push("Одевайтесь теплее");
            recommendations.push("Избегайте переохлаждения");
        }
        
        // Рекомендации по типу погоды
        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
            recommendations.push("Возьмите зонт или дождевик");
        }
        
        if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
            recommendations.push("Будьте осторожны на улицах, возможен гололёд");
        }
        
        if ([45, 48].includes(weatherCode)) {
            recommendations.push("Будьте осторожны на дорогах, ограниченная видимость");
        }
        
        // Рекомендации по давлению (в мм рт.ст.)
        if (pressure_mmHg < 735) { // ~980 гПа
            recommendations.push("Низкое давление - возможны головные боли у метеозависимых");
        } else if (pressure_mmHg > 765) { // ~1020 гПа
            recommendations.push("Высокое давление - следите за самочувствием");
        }
        
        // Рекомендации по влажности
        if (humidity > 85) {
            recommendations.push("Высокая влажность - возможна одышка");
        }
        
        return recommendations.slice(0, 3); // Не более 3 рекомендаций
    }
    
    async getSpaceWeather() {
        // В реальном приложении здесь будет вызов API космической погоды
        // Пока возвращаем тестовые данные
        
        return {
            kp_index: 3,
            magnetic_status: "Спокойно",
            solar_flares: "Нет значительных вспышек",
            health_impact: "Магнитная активность в норме. Риск негативного воздействия на здоровье минимален."
        };
    }
    
    async updateWeatherForCity(city) {
        try {
            const coords = await this.getCoordinates(city);
            if (!coords) {
                throw new Error('Город не найден');
            }
            
            const weather = await this.getCurrentWeather(coords.latitude, coords.longitude);
            if (!weather) {
                throw new Error('Не удалось получить погоду');
            }
            
            const forecast = await this.getForecast(coords.latitude, coords.longitude);
            
            this.currentWeather = {
                ...weather,
                location: coords,
                description: this.interpretWeatherCode(weather.weather_code),
                icon: this.getWeatherIcon(weather.weather_code, weather.is_day),
                recommendations: this.getWeatherRecommendations(
                    weather.weather_code,
                    weather.temperature,
                    weather.pressure_mmHg,
                    weather.humidity
                )
            };
            
            this.forecast = forecast;
            
            // Сохраняем в глобальную переменную для доступа из других модулей
            window.currentWeather = this.currentWeather;
            
            return this.currentWeather;
        } catch (error) {
            console.error('Ошибка обновления погоды:', error);
            return null;
        }
    }
    
    updateWeatherUI(weatherData) {
        if (!weatherData) return;
        
        // Обновляем текущую погоду
        const tempElement = document.getElementById('current-temp');
        const descElement = document.getElementById('weather-desc');
        const iconElement = document.getElementById('weather-icon');
        const pressureElement = document.getElementById('pressure');
        const humidityElement = document.getElementById('humidity');
        const windElement = document.getElementById('wind');
        const magneticElement = document.getElementById('magnetic');
        
        if (tempElement) tempElement.textContent = `${Math.round(weatherData.temperature)}°C`;
        if (descElement) descElement.textContent = weatherData.description;
        if (iconElement) iconElement.textContent = weatherData.icon;
        if (pressureElement) pressureElement.textContent = weatherData.pressure_mmHg;
        if (humidityElement) humidityElement.textContent = weatherData.humidity;
        if (windElement) windElement.textContent = Math.round(weatherData.wind_speed);
        if (magneticElement) magneticElement.textContent = "Спокойно"; // Временно
        
        // Обновляем большой блок погоды
        const tempLarge = document.getElementById('current-temp-large');
        const descLarge = document.getElementById('current-desc-large');
        const iconLarge = document.getElementById('current-icon-large');
        const feelsLike = document.getElementById('feels-like');
        const pressureLarge = document.getElementById('pressure-large');
        const humidityLarge = document.getElementById('humidity-large');
        const windLarge = document.getElementById('wind-large');
        const locationElement = document.getElementById('current-location');
        
        if (tempLarge) tempLarge.textContent = `${Math.round(weatherData.temperature)}°`;
        if (descLarge) descLarge.textContent = weatherData.description;
        if (iconLarge) iconLarge.textContent = weatherData.icon;
        if (feelsLike) feelsLike.textContent = `${Math.round(weatherData.feels_like)}°`;
        if (pressureLarge) pressureLarge.textContent = `${weatherData.pressure_mmHg} мм рт.ст.`;
        if (humidityLarge) humidityLarge.textContent = `${weatherData.humidity}%`;
        if (windLarge) windLarge.textContent = `${Math.round(weatherData.wind_speed)} м/с`;
        if (locationElement && weatherData.location) {
            locationElement.textContent = weatherData.location.city;
        }
        
        // Обновляем почасовой прогноз
        this.updateHourlyForecast();
        
        // Обновляем прогноз на 3 дня
        this.updateDailyForecast();
    }
    
    updateHourlyForecast() {
        const container = document.getElementById('hourly-forecast');
        if (!container || !this.forecast) return;
        
        // Берем данные на следующие 12 часов
        const hourlyData = this.forecast.hourly;
        if (!hourlyData || !hourlyData.time) return;
        
        let html = '';
        const now = new Date();
        
        for (let i = 0; i < 12; i++) {
            if (i >= hourlyData.time.length) break;
            
            const timeStr = hourlyData.time[i];
            const time = new Date(timeStr);
            const hour = time.getHours().toString().padStart(2, '0');
            const temp = Math.round(hourlyData.temperature_2m[i]);
            const code = hourlyData.weather_code[i];
            const isDay = hourlyData.is_day[i] === 1;
            
            html += `
                <div class="hour-item">
                    <div class="hour-time">${hour}:00</div>
                    <div class="hour-icon">${this.getWeatherIcon(code, isDay)}</div>
                    <div class="hour-temp">${temp}°</div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    updateDailyForecast() {
        const container = document.getElementById('daily-forecast');
        if (!container || !this.forecast) return;
        
        const dailyData = this.forecast.daily;
        if (!dailyData || !dailyData.time) return;
        
        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const today = new Date();
        
        let html = '';
        
        for (let i = 0; i < Math.min(3, dailyData.time.length); i++) {
            const dateStr = dailyData.time[i];
            const date = new Date(dateStr);
            const dayName = i === 0 ? 'Сегодня' : dayNames[date.getDay()];
            const tempMax = Math.round(dailyData.temperature_2m_max[i]);
            const tempMin = Math.round(dailyData.temperature_2m_min[i]);
            const code = dailyData.weather_code[i];
            
            html += `
                <div class="day-item">
                    <div class="day-info">
                        <div class="day-name">${dayName}</div>
                        <div class="day-icon">${this.getWeatherIcon(code, true)}</div>
                        <div class="day-desc">${this.interpretWeatherCode(code)}</div>
                    </div>
                    <div class="day-temps">
                        <span class="day-temp-high">${tempMax}°</span>
                        <span class="day-temp-low">${tempMin}°</span>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    async updateSpaceWeatherUI() {
        const spaceWeather = await this.getSpaceWeather();
        
        const kpElement = document.getElementById('kp-index');
        const magneticElement = document.getElementById('magnetic-status');
        const solarElement = document.getElementById('solar-flares');
        const impactElement = document.getElementById('space-health-impact');
        
        if (kpElement) kpElement.textContent = spaceWeather.kp_index;
        if (magneticElement) magneticElement.textContent = spaceWeather.magnetic_status;
        if (solarElement) solarElement.textContent = spaceWeather.solar_flares;
        if (impactElement) impactElement.textContent = spaceWeather.health_impact;
    }
}

// Инициализация и экспорт
const weatherAPI = new WeatherAPI();
window.weatherAPI = weatherAPI;

// Автоматическое обновление погоды при загрузке
document.addEventListener('DOMContentLoaded', async () => {
    // Загружаем настройки пользователя
    let userCity = 'Москва';
    try {
        const settings = localStorage.getItem('wellness_user_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            userCity = parsed.city || 'Москва';
        }
    } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
    }
    
    // Обновляем погоду
    const weather = await weatherAPI.updateWeatherForCity(userCity);
    if (weather) {
        weatherAPI.updateWeatherUI(weather);
    }
    
    // Обновляем космическую погоду
    await weatherAPI.updateSpaceWeatherUI();
    
    // Обработчики для кнопок обновления погоды
    const updateWeatherBtn = document.getElementById('update-weather');
    if (updateWeatherBtn) {
        updateWeatherBtn.addEventListener('click', async () => {
            updateWeatherBtn.classList.add('loading');
            const weather = await weatherAPI.updateWeatherForCity(userCity);
            if (weather) {
                weatherAPI.updateWeatherUI(weather);
                if (window.app) {
                    window.app.showNotification('Погода обновлена', 'Данные о погоде успешно обновлены', 'success');
                }
            }
            updateWeatherBtn.classList.remove('loading');
        });
    }
    
    const updateSpaceWeatherBtn = document.getElementById('update-space-weather');
    if (updateSpaceWeatherBtn) {
        updateSpaceWeatherBtn.addEventListener('click', async () => {
            updateSpaceWeatherBtn.classList.add('loading');
            await weatherAPI.updateSpaceWeatherUI();
            if (window.app) {
                window.app.showNotification('Космическая погода', 'Данные о космической погоде обновлены', 'success');
            }
            updateSpaceWeatherBtn.classList.remove('loading');
        });
    }
    
    // Обработчик поиска города
    const searchCityBtn = document.getElementById('search-city');
    const citySearchInput = document.getElementById('city-search');
    
    if (searchCityBtn && citySearchInput) {
        searchCityBtn.addEventListener('click', async () => {
            const city = citySearchInput.value.trim();
            if (!city) return;
            
            searchCityBtn.classList.add('loading');
            const weather = await weatherAPI.updateWeatherForCity(city);
            
            if (weather) {
                weatherAPI.updateWeatherUI(weather);
                if (window.app) {
                    window.app.showNotification('Город изменен', `Погода для ${city} успешно загружена`, 'success');
                    
                    // Обновляем настройки пользователя
                    window.app.currentUser.city = city;
                    window.app.saveUserSettings();
                    document.getElementById('user-city').textContent = city;
                }
            } else {
                if (window.app) {
                    window.app.showNotification('Ошибка', 'Не удалось найти город', 'error');
                }
            }
            
            searchCityBtn.classList.remove('loading');
        });
        
        // Поиск при нажатии Enter
        citySearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchCityBtn.click();
            }
        });
    }
});