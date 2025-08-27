const apiKey = ""; // Your OpenWeatherMap API key

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const weatherResult = document.getElementById('weather-result');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const initialState = document.getElementById('initial-state');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Check if there's a previously searched city in localStorage
  const lastCity = localStorage.getItem('lastCity');
  if (lastCity) {
    cityInput.value = lastCity;
    getWeather(lastCity);
  }
  
  // Focus on input field
  cityInput.focus();
});

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});

locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }
  
  showLoading();
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      getWeatherByCoords(latitude, longitude);
    },
    error => {
      hideLoading();
      alert("Unable to retrieve your location. Please enter a city name manually.");
    }
  );
});

function handleSearch() {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    alert("Please enter a city name!");
  }
}

async function getWeather(city) {
  showLoading();
  hideError();
  hideInitialState();
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();

    // Handle wrong city name
    if (data.cod == 404) {
      showError();
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('lastCity', city);
    
    // Get forecast data
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastResponse.json();
    
    displayWeather(data);
    displayForecast(forecastData);
    
  } catch (error) {
    showError();
    console.error("Error fetching weather data:", error);
  }
}

async function getWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    
    // Get forecast data
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastResponse.json();
    
    displayWeather(data);
    displayForecast(forecastData);
    
    // Update input field
    cityInput.value = data.name;
    
    // Save to localStorage
    localStorage.setItem('lastCity', data.name);
    
  } catch (error) {
    showError();
    console.error("Error fetching weather data:", error);
  }
}

function displayWeather(data) {
  // Update DOM elements
  document.getElementById('city-name').querySelector('span').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('temp').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
  document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
  
  // Set weather icon
  const iconCode = data.weather[0].icon;
  document.getElementById('weather-icon').querySelector('img').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  document.getElementById('weather-icon').querySelector('img').alt = data.weather[0].description;
  
  // Show weather result and hide loading
  hideLoading();
  showWeatherResult();
}

function displayForecast(data) {
  const forecastContainer = document.getElementById('forecast-container');
  forecastContainer.innerHTML = '';
  
  // Get daily forecast (every 24 hours, API returns data every 3 hours)
  const dailyForecast = data.list.filter(item => item.dt_txt.includes('12:00:00'));
  
  // Create forecast items
  dailyForecast.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString('en', { weekday: 'short' });
    
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    forecastItem.innerHTML = `
      <div class="forecast-day">${dayName}</div>
      <div class="forecast-icon">
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
      </div>
      <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
    `;
    
    forecastContainer.appendChild(forecastItem);
  });
}

// UI Helper Functions
function showLoading() {
  loading.classList.remove('hidden');
  weatherResult.classList.add('hidden');
  errorMessage.classList.add('hidden');
  initialState.classList.add('hidden');
}

function hideLoading() {
  loading.classList.add('hidden');
}

function showWeatherResult() {
  weatherResult.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  initialState.classList.add('hidden');
}

function showError() {
  hideLoading();
  errorMessage.classList.remove('hidden');
  weatherResult.classList.add('hidden');
  initialState.classList.add('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}

function hideInitialState() {
  initialState.classList.add('hidden');
}
