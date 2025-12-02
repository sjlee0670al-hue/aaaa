// ⚠️ 반드시 본인 API 키로 교체하세요.
const API_KEY = "db35be491245abfc0367098faedbb189";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const cityNameEl = document.getElementById('city-name');
const weatherDescEl = document.getElementById('weather-desc');
const tempEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const errorEl = document.getElementById('error-message');
const weatherIconEl = document.getElementById('weather-icon');
const bodyEl = document.getElementById('weather-body');

// Leaflet 지도 초기화
const map = L.map('map').setView([37.5665, 126.9780], 7);

// 지도 타일 추가
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

let marker;

// 지도 클릭 → 날씨 업데이트
map.on('click', async (e) => {
    const { lat, lng } = e.latlng;

    if (marker) marker.remove();
    marker = L.marker([lat, lng]).addTo(map);

    fetchWeatherByCoords(lat, lng);
});

// 좌표로 날씨 조회
async function fetchWeatherByCoords(lat, lon) {
    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
    errorEl.textContent = "날씨 정보를 가져오는 중...";

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            updateWeatherUI(data);
        } else {
            errorEl.textContent = "⚠️ 해당 지역의 날씨를 가져올 수 없습니다.";
        }
    } catch (error) {
        errorEl.textContent = "❌ 네트워크 오류가 발생했습니다.";
        console.error(error);
    }
}

// 도시 이름으로 조회
async function fetchWeather() {
    const cityInput = document.getElementById('city-input').value;
    errorEl.textContent = "날씨 정보를 가져오는 중...";

    const url = `${BASE_URL}?q=${cityInput}&appid=${API_KEY}&units=metric&lang=kr`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            updateWeatherUI(data);

            const lat = data.coord.lat;
            const lon = data.coord.lon;

            map.setView([lat, lon], 10);

            if (marker) marker.remove();
            marker = L.marker([lat, lon]).addTo(map);
        } else {
            errorEl.textContent = "⚠️ 도시를 찾을 수 없습니다.";
        }
    } catch (error) {
        errorEl.textContent = "❌ 네트워크 오류가 발생했습니다.";
    }
}

// UI 업데이트
function updateWeatherUI(data) {
    cityNameEl.textContent = data.name;
    weatherDescEl.textContent =
        data.weather[0].description.charAt(0).toUpperCase() +
        data.weather[0].description.slice(1);

    tempEl.textContent = data.main.temp.toFixed(1);
    humidityEl.textContent = data.main.humidity;
    windSpeedEl.textContent = data.wind.speed.toFixed(1);
    weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    const iconCode = data.weather[0].icon;
    const weatherClass = getWeatherClass(iconCode);

    bodyEl.classList.remove(
        'clear-sky', 'night', 'clouds', 'rain',
        'thunderstorm', 'snow', 'mist'
    );

    if (weatherClass) {
        const classes = weatherClass.split(' ');
        classes.forEach(cls => bodyEl.classList.add(cls));
    }

    errorEl.textContent = "";
}

// 날씨 아이콘 코드 → 배경 클래스
function getWeatherClass(iconCode) {
    const codePrefix = iconCode.substring(0, 2);
    const isNight = iconCode.slice(-1) === 'n';

    switch (codePrefix) {
        case '01': return isNight ? 'clear-sky night' : 'clear-sky';
        case '02':
        case '03':
        case '04': return 'clouds';
        case '09':
        case '10': return 'rain';
        case '11': return 'thunderstorm';
        case '13': return 'snow';
        case '50': return 'mist';
        default: return null;
    }
}

// 시작 시 서울 날씨 가져오기
window.onload = () => fetchWeather();
