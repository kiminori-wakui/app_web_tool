document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'YOUR_API_KEY'; // open-meteo��API�L�[�������ɒǉ�
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

            document.getElementById('temperature').textContent = `���݂̉��x: ${temperature} ��C`;
            document.getElementById('description').textContent = `�V�C: ${description}`;
            document.getElementById('max-temp').textContent = `�ō��C��: ${maxTemp} ��C`;
            document.getElementById('min-temp').textContent = `�Œ�C��: ${minTemp} ��C`;
        })
        .catch(error => console.error('Error:', error));
});

function getWeatherDescription(code) {
    switch(code) {
        case 0:
            return '����';
        case 1:
        case 2:
        case 3:
            return '��ɐ���';
        case 45:
        case 48:
            return '��';
        case 51:
        case 53:
        case 55:
            return '���J';
        case 56:
        case 57:
            return '�������J';
        case 61:
        case 63:
        case 65:
            return '�J';
        case 66:
        case 67:
            return '�����J';
        case 71:
        case 73:
        case 75:
            return '��';
        case 77:
            return '�ɂ킩��';
        case 80:
        case 81:
        case 82:
            return '�ɂ킩�J';
        case 85:
        case 86:
            return '�ɂ킩��';
        case 95:
            return '���J';
        case 96:
        case 99:
            return '���������J';
        default:
            return '�s��';
    }
}
