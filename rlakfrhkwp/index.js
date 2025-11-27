// ⚠️ 주의: 실제 OpenWeatherMap API 키로 교체해야 작동합니다.
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
const map = L.map('map').setView([37.5665, 126.9780], 7); // 한국 중심

// 지도 타일 추가
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

let marker; // 클릭할 때마다 위치표시 갱신

// 지도 클릭 이벤트
map.on('click', async (e) => {
    const { lat, lng } = e.latlng;

    // 기존 마커 제거하고 새로 추가
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

// 도시 이름으로 날씨 조회
async function fetchWeather() {
    const cityInput = document.getElementById('city-input').value;
    errorEl.textContent = "날씨 정보를 가져오는 중...";

    const url = `${BASE_URL}?q=${cityInput}&appid=${API_KEY}&units=metric&lang=kr`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            updateWeatherUI(data);

            // 지도 이동 & 마커 표시
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

// UI 업데이트 및 배경 변경
function updateWeatherUI(data) {
    cityNameEl.textContent = data.name || "위치";
    weatherDescEl.textContent =
        data.weather[0].description.charAt(0).toUpperCase() +
        data.weather[0].description.slice(1);

    tempEl.textContent = data.main.temp.toFixed(1);
    humidityEl.textContent = data.main.humidity;
    windSpeedEl.textContent = data.wind.speed.toFixed(1);

    const iconCode = data.weather[0].icon;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // 🌟 날씨별 배경화면 변경 로직 🌟
    const weatherClass = getWeatherClass(iconCode);
    
    // 기존 날씨 클래스 제거
    bodyEl.classList.remove('clear-sky', 'night', 'clouds', 'rain', 'thunderstorm', 'snow', 'mist');

    // 새 날씨 클래스 추가
    if (weatherClass) {
        // night 클래스는 clear-sky와 함께 적용될 수 있도록 처리
        if (weatherClass.includes(' ')) {
            const classes = weatherClass.split(' ');
            classes.forEach(cls => bodyEl.classList.add(cls));
        } else {
            bodyEl.classList.add(weatherClass);
        }
    }

    errorEl.textContent = "";
}

// 날씨 아이콘 코드를 기반으로 CSS 클래스 결정
function getWeatherClass(iconCode) {
    const codePrefix = iconCode.substring(0, 2);
    const isNight = iconCode.slice(-1) === 'n';

    switch (codePrefix) {
        case '01': // 맑음
            return isNight ? 'clear-sky night' : 'clear-sky';
        case '02': // 약간의 구름
        case '03': // 구름
        case '04': // 흐림
            return 'clouds';
        case '09': // 가벼운 비
        case '10': // 비
            return 'rain';
        case '11': // 천둥
            return 'thunderstorm';
        case '13': // 눈
            return 'snow';
        case '50': // 안개 등
            return 'mist';
        default:
            return null; // 기본 배경 유지
    }
}

// 시작 시 서울 날씨 표시
window.onload = () => fetchWeather();