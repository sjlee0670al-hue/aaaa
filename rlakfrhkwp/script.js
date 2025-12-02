const API_KEY = "db35be491245abfc0367098faedbb189";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const cityNameEl = document.getElementById("city-name");
const weatherDescEl = document.getElementById("weather-desc");
const tempEl = document.getElementById("temperature");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("wind-speed");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const weatherIconEl = document.getElementById("weather-icon");
const errorEl = document.getElementById("error-message");
const bgVideo = document.getElementById("bg-video");
const canvas = document.getElementById("weather-canvas");
const ctx = canvas.getContext("2d");

/* 지도 초기화 */
const map = L.map("map").setView([37.5665,126.9780], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
let marker = null;
map.on("click", e => {
    const { lat, lng } = e.latlng;
    if (marker) marker.remove();
    marker = L.marker([lat,lng]).addTo(map);
    fetchWeatherByCoords(lat,lng);
});

/* 즐겨찾기 */
const favorites = ["Seoul","Busan","Jeju","New York","Tokyo"];
function renderFavorites(){
    const listEl = document.getElementById("favorites-list");
    listEl.innerHTML = "";
    favorites.forEach(city=>{
        const li = document.createElement("li");
        li.textContent = city;
        li.onclick = ()=>{
            document.getElementById("city-input").value = city;
            fetchWeather();
        };
        listEl.appendChild(li);
    });
}
function addFavorite(city){
    if(!favorites.includes(city)){
        favorites.push(city);
        renderFavorites();
    }
}

/* 검색 기록 */
let history = [];
function renderHistory(){
    const listEl = document.getElementById("history-list");
    listEl.innerHTML = "";
    history.slice(-10).reverse().forEach(city=>{
        const li = document.createElement("li");
        li.textContent = city;
        li.onclick = ()=>{
            document.getElementById("city-input").value = city;
            fetchWeather();
        };
        listEl.appendChild(li);
    });
}
function addHistory(city){
    if(!history.includes(city)){
        history.push(city);
    }
    renderHistory();
}

/* 날씨 조회 */
async function fetchWeather() {
    const city = document.getElementById("city-input").value;
    addHistory(city);
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=kr`;
    errorEl.textContent = "날씨 정보를 가져오는 중...";
    try {
        const res = await fetch(url);
        const data = await res.json();
        if(res.ok){
            updateWeatherUI(data);
            map.setView([data.coord.lat,data.coord.lon],10);
            if(marker) marker.remove();
            marker = L.marker([data.coord.lat,data.coord.lon]).addTo(map);
        } else errorEl.textContent = "⚠️ 도시를 찾을 수 없습니다.";
    } catch { errorEl.textContent = "❌ 네트워크 오류입니다."; }
}

/* 좌표 기반 날씨 */
async function fetchWeatherByCoords(lat,lon){
    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
    errorEl.textContent = "날씨 정보를 가져오는 중...";
    try{
        const res = await fetch(url);
        const data = await res.json();
        if(res.ok) updateWeatherUI(data);
        else errorEl.textContent = "⚠️ 해당 지역 날씨를 가져올 수 없습니다.";
    } catch { errorEl.textContent = "❌ 네트워크 오류입니다."; }
}

/* UI 업데이트 */
function updateWeatherUI(data){
    cityNameEl.textContent = data.name;
    weatherDescEl.textContent = data.weather[0].description;
    tempEl.textContent = data.main.temp.toFixed(1);
    humidityEl.textContent = data.main.humidity;
    windSpeedEl.textContent = data.wind.speed.toFixed(1);
    sunriseEl.textContent = convertUnix(data.sys.sunrise + data.timezone);
    sunsetEl.textContent = convertUnix(data.sys.sunset + data.timezone);

    const icon = data.weather[0].icon;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    setBackgroundVideo(icon);
    setWeatherAnimation(icon);
    errorEl.textContent = "";
}

/* UNIX → HH:MM */
function convertUnix(ts){
    const date = new Date(ts*1000);
    return date.toTimeString().slice(0,5);
}

/* 배경 비디오 설정 */
function setBackgroundVideo(icon){
    const prefix = icon.substring(0,2);
    const videoFiles = {
        "01":"videos/clear.mp4",
        "02":"videos/clouds.mp4",
        "03":"videos/clouds.mp4",
        "04":"videos/clouds.mp4",
        "09":"videos/rain.mp4",
        "10":"videos/rain.mp4",
        "11":"videos/thunder.mp4",
        "13":"videos/snow.mp4",
        "50":"videos/mist.mp4"
    };
    bgVideo.src = videoFiles[prefix] || videoFiles["01"];
}

/* 날씨별 입자 애니메이션 */
let particles = [];
function setWeatherAnimation(icon){
    particles = [];
    const prefix = icon.substring(0,2);
    if(["09","10"].includes(prefix)) createRain();
    else if(prefix==="13") createSnow();
    animateParticles();
}

function createRain(){
    for(let i=0;i<150;i++){
        particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,length:10+Math.random()*10, speed:4+Math.random()*4});
    }
}

function createSnow(){
    for(let i=0;i<100;i++){
        particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:1+Math.random()*3, speed:1+Math.random()*2});
    }
}

function animateParticles(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    particles.forEach(p=>{
        if(p.length){ // rain
            ctx.strokeStyle="rgba(174,194,224,0.5)";
            ctx.lineWidth=1;
            ctx.beginPath();
            ctx.moveTo(p.x,p.y);
            ctx.lineTo(p.x,p.y+p.length);
            ctx.stroke();
            p.y += p.speed;
            if(p.y>canvas.height) p.y=-20;
        } else { // snow
            ctx.fillStyle="rgba(255,255,255,0.8)";
            ctx.beginPath();
            ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
            ctx.fill();
            p.y += p.speed;
            p.x += Math.sin(p.y*0.01)*2;
            if(p.y>canvas.height) p.y=-10;
        }
    });
    requestAnimationFrame(animateParticles);
}

window.onload = () => {
    renderFavorites();
    renderHistory();
    fetchWeather();
};
window.onresize = ()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
