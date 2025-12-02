const API_KEY = "db35be491245abfc0367098faedbb189";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const cityNameEl = document.getElementById("city-name");
const weatherDescEl = document.getElementById("weather-desc");
const tempEl = document.getElementById("temperature");
const feelsEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind-speed");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const timeEl = document.getElementById("local-time");
const weatherIconEl = document.getElementById("weather-icon");
const errorEl = document.getElementById("error-message");
const weatherTipEl = document.getElementById("weather-tip");
const forecastListEl = document.getElementById("forecast-list");
const bgVideo = document.getElementById("bg-video");
let unit = "metric";

/* 한국어 도시 이름 매핑 */
const cityMap = {
    "Seoul": "서울",
    "Busan": "부산",
    "Incheon": "인천",
    "Jeju": "제주",
    "Daegu": "대구",
    "Daejeon": "대전",
    "Gwangju": "광주",
    "Ulsan": "울산",
    "Suwon": "수원",
    "Changwon": "창원"
};

/* 지도 */
const map = L.map("map").setView([37.5665,126.9780],7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
let marker=null;
map.on("click", e=>{
    const {lat,lng}=e.latlng;
    if(marker) marker.remove();
    marker=L.marker([lat,lng]).addTo(map);
    fetchWeatherByCoords(lat,lng);
});

/* 즐겨찾기 */
const favorites=["Seoul","Busan","Jeju"];
function renderFavorites(){
    const listEl=document.getElementById("favorites-list");
    listEl.innerHTML="";
    favorites.forEach(city=>{
        const li=document.createElement("li");
        li.textContent=cityMap[city]||city;
        li.onclick=()=>{ document.getElementById("city-input").value=city; fetchWeather(); };
        listEl.appendChild(li);
    });
}

/* 검색 기록 */
let history=[];
function renderHistory(){
    const listEl=document.getElementById("history-list");
    listEl.innerHTML="";
    history.slice(-10).reverse().forEach(city=>{
        const li=document.createElement("li");
        li.textContent=cityMap[city]||city;
        li.onclick=()=>{ document.getElementById("city-input").value=city; fetchWeather(); };
        listEl.appendChild(li);
    });
}
function addHistory(city){ if(!history.includes(city)) history.push(city); renderHistory(); }

/* 단위 */
function updateUnits(){ unit=document.getElementById("unit-select").value; fetchWeather(); }

/* 날씨 조회 */
async function fetchWeather(){
    const city=document.getElementById("city-input").value;
    addHistory(city);
    errorEl.textContent="날씨 정보를 가져오는 중...";
    try{
        const url=`${BASE_URL}?q=${city}&appid=${API_KEY}&units=${unit}&lang=kr`;
        const res=await fetch(url);
        const data=await res.json();
        if(res.ok){
            updateWeatherUI(data);
            map.setView([data.coord.lat,data.coord.lon],10);
            if(marker) marker.remove();
            marker=L.marker([data.coord.lat,data.coord.lon]).addTo(map);
            fetchForecast(data.coord.lat,data.coord.lon);
        }else errorEl.textContent="⚠️ 도시를 찾을 수 없습니다.";
    }catch{ errorEl.textContent="❌ 네트워크 오류입니다."; }
}

/* 좌표 기반 */
async function fetchWeatherByCoords(lat,lon){
    errorEl.textContent="날씨 정보를 가져오는 중...";
    try{
        const url=`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=kr`;
        const res=await fetch(url);
        const data=await res.json();
        if(res.ok){
            updateWeatherUI(data);
            fetchForecast(lat,lon);
        }else errorEl.textContent="⚠️ 해당 지역 날씨를 가져올 수 없습니다.";
    }catch{ errorEl.textContent="❌ 네트워크 오류입니다."; }
}

/* UI 업데이트 */
function updateWeatherUI(data){
    cityNameEl.textContent = cityMap[data.name]||data.name;
    weatherDescEl.textContent=data.weather[0].description;
    tempEl.textContent=unit==="metric"?data.main.temp.toFixed(1)+" °C":data.main.temp.toFixed(1)+" °F";
    feelsEl.textContent=unit==="metric"?data.main.feels_like.toFixed(1)+" °C":data.main.feels_like.toFixed(1)+" °F";
    humidityEl.textContent=data.main.humidity;
    windEl.textContent=unit==="metric"?data.wind.speed.toFixed(1)+" m/s":data.wind.speed.toFixed(1)+" mph";
    sunriseEl.textContent=convertUnix(data.sys.sunrise+data.timezone);
    sunsetEl.textContent=convertUnix(data.sys.sunset+data.timezone);
    timeEl.textContent=convertUnix(Math.floor(Date.now()/1000)+data.timezone);
    weatherIconEl.src=`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    setBackgroundVideo(data.weather[0].icon);
    weatherTipEl.textContent=generateTip(data.weather[0].id);
    checkNotification(data.weather[0].id);
    errorEl.textContent="";
}

/* UNIX → HH:MM */
function convertUnix(ts){ return new Date(ts*1000).toISOString().substr(11,5); }

/* 날씨 예보 */
async function fetchForecast(lat,lon){
    const url=`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=kr`;
    try{
        const res=await fetch(url);
        const data=await res.json();
        renderForecast(data.list.slice(0,10));
    }catch{ console.error("예보를 가져올 수 없습니다."); }
}

function renderForecast(list){
    forecastListEl.innerHTML="";
    list.forEach(item=>{
        const li=document.createElement("li");
        const date = new Date(item.dt*1000);
        const hour = date.getHours();
        const pop = Math.round((item.pop||0)*100);
        li.textContent=`${hour}시 - ${item.weather[0].description}, ${item.main.temp.toFixed(1)}°, 습도:${item.main.humidity}%, 강수:${pop}%`;
        forecastListEl.appendChild(li);
    });
}

/* 날씨 팁 */
function generateTip(id){
    if(id>=200 && id<600) return "비나 눈이 올 예정이니 우산을 챙기세요!";
    if(id>=600 && id<700) return "눈이 올 예정입니다. 안전에 주의하세요.";
    if(id===800) return "맑은 날씨입니다. 야외 활동하기 좋습니다.";
    return "";
}

/* 브라우저 알림 */
function checkNotification(id){
    if(!("Notification" in window)) return;
    if(Notification.permission!=="granted") Notification.requestPermission();
    if(id>=200 && id<700) new Notification("날씨 알림", {body:"비/눈이 올 예정입니다. 우산 챙기세요!"});
}

/* 배경 영상 */
function setBackgroundVideo(icon){
    let videoSrc="";
    if(icon.startsWith("01")) videoSrc="videos/clear.mp4";
    else if(icon.startsWith("02") || icon.startsWith("03") || icon.startsWith("04")) videoSrc="videos/clouds.mp4";
    else if(icon.startsWith("09") || icon.startsWith("10")) videoSrc="videos/rain.mp4";
    else if(icon.startsWith("11")) videoSrc="videos/thunder.mp4";
    else if(icon.startsWith("13")) videoSrc="videos/snow.mp4";
    else if(icon.startsWith("50")) videoSrc="videos/mist.mp4";
    else videoSrc="videos/default.mp4";

    if(bgVideo.src !== videoSrc){
        bgVideo.src=videoSrc;
        bgVideo.play();
    }
}

/* SNS 공유 */
document.getElementById("share-btn").onclick=()=>{
    const city=cityNameEl.textContent;
    const temp=tempEl.textContent;
    const desc=weatherDescEl.textContent;
    const shareText=`현재 ${city} 날씨: ${desc}, 온도: ${temp}`;
    const twitterUrl=`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl,"_blank");
};

/* 초기화 */
window.onload=()=>{
    renderFavorites();
    renderHistory();
    fetchWeather();
};
