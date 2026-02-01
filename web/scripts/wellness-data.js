/**
 * Модуль для работы с данными о самочувствии
 */

class WellnessData {
    constructor() {
        this.entries = this.loadEntries();
        this.symptoms = this.getSymptomsConfig();
    }
    
    getSymptomsConfig() {
        return {
            headache: [
                { id: 'headache_none', name: 'Нет головной боли', category: 'headache', severity: 0 },
                { id: 'headache_mild', name: 'Слабая головная боль', category: 'headache', severity: 1 },
                { id: 'headache_moderate', name: 'Средняя головная боль', category: 'headache', severity: 2 },
                { id: 'headache_severe', name: 'Сильная головная боль', category: 'headache', severity: 3 },
                { id: 'headache_pressure', name: 'Давящая головная боль', category: 'headache', severity: 2 }
            ],
            dizziness: [
                { id: 'dizziness_none', name: 'Нет головокружения', category: 'dizziness', severity: 0 },
                { id: 'dizziness_mild', name: 'Слабое головокружение', category: 'dizziness', severity: 1 },
                { id: 'dizziness_moderate', name: 'Среднее головокружение', category: 'dizziness', severity: 2 },
                { id: 'dizziness_severe', name: 'Сильное головокружение', category: 'dizziness', severity: 3 }
            ],
            general: [
                { id: 'wellness_good', name: 'Хорошее самочувствие', category: 'general', severity: 0 },
                { id: 'wellness_tired', name: 'Утомленное', category: 'general', severity: 1 },
                { id: 'wellness_fatigued', name: 'Сильно уставшее', category: 'general', severity: 2 },
                { id: 'wellness_exhausted', name: 'Истощенное', category: 'general', severity: 3 }
            ],
            pain: [
                { id: 'pain_heart', name: 'Боль в сердце', category: 'pain', severity: 3 },
                { id: 'pain_joints', name: 'Боль в суставах', category: 'pain', severity: 2 },
                { id: 'pain_muscle', name: 'Боль в мышцах', category: 'pain', severity: 1 },
                { id: 'pain_stomach', name: 'Боль в животе', category: 'pain', severity: 2 },
                { id: 'pain_back', name: 'Боль в спине', category: 'pain', severity: 2 }
            ],
            other: [
                { id: 'other_nausea', name: 'Тошнота', category: 'other', severity: 2 },
                { id: 'other_weakness', name: 'Слабость', category: 'other', severity: 1 },
                { id: 'other_anxiety', name: 'Тревожность', category: 'other', severity: 2 },
                { id: 'other_insomnia', name: 'Бессонница', category: 'other', severity: 2 }
            ]
        };
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
    
    saveEntries() {
        try {
            localStorage.setItem('wellness_entries', JSON.stringify(this.entries));
        } catch (error) {
            console.error('Ошибка сохранения записей:', error);
        }
    }
    
    addEntry(entry) {
        entry.id = Date.now().toString();
        entry.createdAt = new Date().toISOString();
        
        this.entries.push(entry);
        this.saveEntries();
        
        return entry.id;
    }
    
    updateEntry(id, updates) {
        const index = this.entries.findIndex(e => e.id === id);
        if (index !== -1) {
            this.entries[index] = { ...this.entries[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveEntries();
            return true;
        }
        return false;
    }
    
    deleteEntry(id) {
        const initialLength = this.entries.length;
        this.entries = this.entries.filter(e => e.id !== id);
        
        if (this.entries.length < initialLength) {
            this.saveEntries();
            return true;
        }
        return false;
    }
    
    getEntry(id) {
        return this.entries.find(e => e.id === id);
    }
    
    getEntriesByDate(date) {
        return this.entries.filter(e => e.date === date);
    }
    
    getEntriesByDateRange(startDate, endDate) {
        return this.entries.filter(e => {
            const entryDate = new Date(e.date);
            return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
        });
    }
    
    getRecentEntries(limit = 10) {
        return [...this.entries]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
    
    // Анализ данных
    getStatistics() {
        if (this.entries.length === 0) {
            return {
                total: 0,
                averageWellness: 0,
                bestDay: 0,
                worstDay: 0,
                mostCommonSymptoms: [],
                wellnessByDayOfWeek: {},
                wellnessByHour: {}
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
                const symptomName = this.getSymptomName(symptom.id) || symptom.name;
                symptomCount[symptomName] = (symptomCount[symptomName] || 0) + 1;
            });
        });
        
        const mostCommonSymptoms = Object.entries(symptomCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
        
        // Самочувствие по дням недели
        const wellnessByDayOfWeek = {};
        this.entries.forEach(entry => {
            const date = new Date(entry.date);
            const day = date.getDay(); // 0 - воскресенье, 1 - понедельник...
            
            if (!wellnessByDayOfWeek[day]) {
                wellnessByDayOfWeek[day] = { total: 0, count: 0 };
            }
            
            wellnessByDayOfWeek[day].total += entry.wellness || 0;
            wellnessByDayOfWeek[day].count += 1;
        });
        
        // Среднее по дням недели
        const avgByDay = {};
        Object.keys(wellnessByDayOfWeek).forEach(day => {
            const data = wellnessByDayOfWeek[day];
            avgByDay[day] = data.total / data.count;
        });
        
        return {
            total: this.entries.length,
            averageWellness,
            bestDay,
            worstDay,
            mostCommonSymptoms,
            wellnessByDayOfWeek: avgByDay
        };
    }
    
    // Корреляции с погодой
    analyzeWeatherCorrelations() {
        if (this.entries.length < 5) {
            return [];
        }
        
        const entriesWithWeather = this.entries.filter(e => e.weather && e.weather.temperature);
        if (entriesWithWeather.length < 5) {
            return [];
        }
        
        // Простая корреляция Пирсона
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
        const pressureValues = entriesWithWeather.map(e => e.weather.pressure || 0);
        const humidityValues = entriesWithWeather.map(e => e.weather.humidity || 0);
        
        // Вычисляем корреляции
        const correlations = [
            {
                factor: 'Температура',
                correlation: calculateCorrelation(tempValues, wellnessValues),
                interpretation: this.interpretCorrelation(calculateCorrelation(tempValues, wellnessValues))
            },
            {
                factor: 'Давление',
                correlation: calculateCorrelation(pressureValues, wellnessValues),
                interpretation: this.interpretCorrelation(calculateCorrelation(pressureValues, wellnessValues))
            },
            {
                factor: 'Влажность',
                correlation: calculateCorrelation(humidityValues, wellnessValues),
                interpretation: this.interpretCorrelation(calculateCorrelation(humidityValues, wellnessValues))
            }
        ];
        
        return correlations;
    }
    
    interpretCorrelation(value) {
        const absValue = Math.abs(value);
        
        if (absValue > 0.7) return 'Сильная связь';
        if (absValue > 0.5) return 'Умеренная связь';
        if (absValue > 0.3) return 'Слабая связь';
        return 'Очень слабая или отсутствует';
    }
    
    // Прогнозирование
    predictWellness(weatherData, lifestyleData) {
        if (this.entries.length === 0) {
            return {
                predictedScore: 7,
                confidence: 0.1,
                factors: ['Недостаточно данных для точного прогноза']
            };
        }
        
        const stats = this.getStatistics();
        const correlations = this.analyzeWeatherCorrelations();
        
        let baseScore = stats.averageWellness;
        let factors = [];
        
        // Корректируем на основе погоды
        if (weatherData) {
            correlations.forEach(corr => {
                if (Math.abs(corr.correlation) > 0.3) {
                    let adjustment = 0;
                    
                    switch (corr.factor) {
                        case 'Температура':
                            if (weatherData.temperature) {
                                // Нормализуем температуру относительно среднего
                                const avgTemp = this.getAverageWeather().temperature || 10;
                                const tempDiff = (weatherData.temperature - avgTemp) / 10;
                                adjustment = tempDiff * corr.correlation * 2;
                            }
                            break;
                            
                        case 'Давление':
                            if (weatherData.pressure) {
                                // Низкое давление обычно хуже
                                const pressureNorm = (weatherData.pressure - 1013) / 10;
                                adjustment = -pressureNorm * corr.correlation;
                            }
                            break;
                            
                        case 'Влажность':
                            if (weatherData.humidity) {
                                // Высокая влажность обычно хуже
                                const humidityNorm = (weatherData.humidity - 60) / 20;
                                adjustment = -humidityNorm * corr.correlation;
                            }
                            break;
                    }
                    
                    baseScore += adjustment;
                    if (Math.abs(adjustment) > 0.3) {
                        factors.push(`${corr.factor}: ${adjustment > 0 ? 'благоприятно' : 'неблагоприятно'}`);
                    }
                }
            });
        }
        
        // Корректируем на основе образа жизни
        if (lifestyleData) {
            if (lifestyleData.sleep && lifestyleData.sleep.hours) {
                // Оптимальный сон 7-8 часов
                const sleepDiff = Math.abs(lifestyleData.sleep.hours - 7.5) / 2;
                baseScore -= sleepDiff * 0.5;
                
                if (sleepDiff > 1) {
                    factors.push(`Сон: ${lifestyleData.sleep.hours < 6 ? 'недостаточно' : 'слишком много'}`);
                }
            }
            
            if (lifestyleData.stress) {
                baseScore -= lifestyleData.stress * 0.2;
                if (lifestyleData.stress > 5) {
                    factors.push('Высокий уровень стресса');
                }
            }
            
            if (lifestyleData.activity) {
                // Умеренная активность полезна
                if (lifestyleData.activity.level === 'moderate' && lifestyleData.activity.duration > 20) {
                    baseScore += 0.5;
                    factors.push('Умеренная физическая активность');
                } else if (lifestyleData.activity.level === 'high' && lifestyleData.activity.duration > 60) {
                    baseScore -= 0.3;
                    factors.push('Высокая физическая нагрузка');
                }
            }
        }
        
        // Ограничиваем 0-10
        const predictedScore = Math.max(0, Math.min(10, baseScore));
        
        // Уверенность в прогнозе зависит от количества данных
        const confidence = Math.min(0.9, this.entries.length / 50);
        
        // Добавляем общие рекомендации
        if (factors.length === 0) {
            factors.push('Условия близки к вашим средним показателям');
        }
        
        return {
            predictedScore: parseFloat(predictedScore.toFixed(1)),
            confidence: parseFloat(confidence.toFixed(2)),
            factors: factors.slice(0, 3) // Не более 3 факторов
        };
    }
    
    getAverageWeather() {
        const entriesWithWeather = this.entries.filter(e => e.weather);
        if (entriesWithWeather.length === 0) {
            return { temperature: 10, pressure: 1013, humidity: 60 };
        }
        
        const avgTemp = entriesWithWeather.reduce((sum, e) => sum + (e.weather.temperature || 0), 0) / entriesWithWeather.length;
        const avgPressure = entriesWithWeather.reduce((sum, e) => sum + (e.weather.pressure || 1013), 0) / entriesWithWeather.length;
        const avgHumidity = entriesWithWeather.reduce((sum, e) => sum + (e.weather.humidity || 60), 0) / entriesWithWeather.length;
        
        return {
            temperature: parseFloat(avgTemp.toFixed(1)),
            pressure: parseFloat(avgPressure.toFixed(0)),
            humidity: parseFloat(avgHumidity.toFixed(0))
        };
    }
    
    getSymptomName(symptomId) {
        for (const category of Object.values(this.symptoms)) {
            const symptom = category.find(s => s.id === symptomId);
            if (symptom) return symptom.name;
        }
        return null;
    }
    
    // Экспорт данных
    exportData(format = 'json') {
        const data = {
            user: this.loadUserSettings(),
            entries: this.entries,
            symptoms: this.symptoms,
            statistics: this.getStatistics(),
            exportedAt: new Date().toISOString()
        };
        
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(data);
        }
        
        return null;
    }
    
    convertToCSV(data) {
        // Простая конвертация в CSV
        const entries = data.entries;
        if (entries.length === 0) return '';
        
        // Заголовки CSV
        const headers = ['Дата', 'Время', 'Самочувствие', 'Симптомы', 'Сон (ч)', 'Качество сна', 'Активность', 'Стресс', 'Температура', 'Давление', 'Влажность'];
        
        // Данные
        const rows = entries.map(entry => {
            const symptoms = entry.symptoms.map(s => s.name).join('; ');
            const sleep = entry.lifestyle?.sleep?.hours || '';
            const sleepQuality = entry.lifestyle?.sleep?.quality || '';
            const activity = entry.lifestyle?.activity?.level || '';
            const stress = entry.lifestyle?.stress || '';
            const temp = entry.weather?.temperature || '';
            const pressure = entry.weather?.pressure || '';
            const humidity = entry.weather?.humidity || '';
            
            return [
                entry.date,
                entry.time,
                entry.wellness,
                `"${symptoms}"`,
                sleep,
                sleepQuality,
                activity,
                stress,
                temp,
                pressure,
                humidity
            ];
        });
        
        // Объединяем
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        return csvContent;
    }
    
    importData(data) {
        try {
            const parsed = JSON.parse(data);
            
            if (parsed.entries && Array.isArray(parsed.entries)) {
                this.entries = parsed.entries;
                this.saveEntries();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            return false;
        }
    }
    
    loadUserSettings() {
        try {
            const saved = localStorage.getItem('wellness_user_settings');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
            return null;
        }
    }
}

// Инициализация и экспорт
const wellnessData = new WellnessData();
window.wellnessData = wellnessData;