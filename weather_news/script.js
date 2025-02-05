document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'YOUR_API_KEY'; // open-meteoのAPIキーをここに追加
    const url = `https://api.open-meteo.com/v1/forecast?latitude=35.682839&longitude=139.759455&daily=temperature_2m_max,temperature_2m_min&current_weather=true&timezone=Asia/Tokyo`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const currentWeather = data.current_weather;
            const daily = data.daily;
            
            const temperature = currentWeather.temperature;
            const weatherCode = currentWeather.weathercode;
            const description = getWeatherDescription(weatherCode);
            
            const maxTemp = daily.temperature_2m_max[0];
            const minTemp = daily.temperature_2m_min[0];

            document.getElementById('temperature').textContent = `現在の温度: ${temperature} °C`;
            document.getElementById('description').textContent = `天気: ${description}`;
            document.getElementById('max-temp').textContent = `最高気温: ${maxTemp} °C`;
            document.getElementById('min-temp').textContent = `最低気温: ${minTemp} °C`;
        })
        .catch(error => console.error('Error:', error));
});

function getWeatherDescription(code) {
    switch(code) {
        case 0:
            return '晴れ';
        case 1:
        case 2:
        case 3:
            return '主に晴れ';
        case 45:
        case 48:
            return '霧';
        case 51:
        case 53:
        case 55:
            return '霧雨';
        case 56:
        case 57:
            return '凍結霧雨';
        case 61:
        case 63:
        case 65:
            return '雨';
        case 66:
        case 67:
            return '凍結雨';
        case 71:
        case 73:
        case 75:
            return '雪';
        case 77:
            return 'にわか雪';
        case 80:
        case 81:
        case 82:
            return 'にわか雨';
        case 85:
        case 86:
            return 'にわか雪';
        case 95:
            return '雷雨';
        case 96:
        case 99:
            return '激しい雷雨';
        default:
            return '不明';
    }
}
