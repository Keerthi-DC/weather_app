const API_KEY = '2c60ef4fe78a2fd7ccd848c05cd44f4d';

function getWeatherByCity() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    showError('Please enter a city name.');
    return;
  }
  fetchWeather(city);
  addToRecent(city);
}

function getWeatherByLocation() {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`)
      .then(res => res.json())
      .then(data => {
        displayWeather(data);
        fetchForecast(data.name);
        addToRecent(data.name);
      })
      .catch(() => showError('Location error.'));
  });
}

function fetchWeather(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) throw new Error(data.message);
      displayWeather(data);
      fetchForecast(city);
    })
    .catch(err => showError(err.message));
}

function fetchForecast(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      displayForecast(data);
    });
}

function displayWeather(data) {
  document.getElementById('error').textContent = '';
  const html = `
    <h2 class="text-2xl font-bold">${data.name}, ${data.sys.country}</h2>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" class="mx-auto"/>
    <p class="text-lg">${data.weather[0].main}</p>
    <p>Temperature: ${data.main.temp}°C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind: ${data.wind.speed} km/h</p>
  `;
  document.getElementById('weather').innerHTML = html;
}

function displayForecast(data) {
  const forecastEl = document.getElementById('forecast');
  forecastEl.innerHTML = '';
  const days = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!days[date]) days[date] = item;
  });

  Object.values(days).slice(0, 5).forEach(item => {
    forecastEl.innerHTML += `
      <div class="bg-white p-4 rounded-md shadow-md text-center">
        <p>${item.dt_txt.split(' ')[0]}</p>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" class="mx-auto"/>
        <p>${item.weather[0].main}</p>
        <p>${item.main.temp}°C</p>
        <p>Wind: ${item.wind.speed} km/h</p>
        <p>Humidity: ${item.main.humidity}%</p>
      </div>
    `;
  });
}

function showError(msg) {
  document.getElementById('error').textContent = msg;
  document.getElementById('weather').innerHTML = '';
  document.getElementById('forecast').innerHTML = '';
}

function addToRecent(city) {
  let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (!cities.includes(city)) {
    cities.unshift(city);
    cities = cities.slice(0, 5);
    localStorage.setItem('recentCities', JSON.stringify(cities));
  }
  renderDropdown();
}

function renderDropdown() {
  const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  const dropdown = document.getElementById('cityDropdown');
  const container = document.getElementById('recentCities');
  if (cities.length === 0) {
    container.classList.add('hidden');
    return;
  }
  container.classList.remove('hidden');
  dropdown.innerHTML = '<option value="">Select</option>';
  cities.forEach(city => {
    dropdown.innerHTML += `<option value="${city}">${city}</option>`;
  });
}

function handleCityDropdown(select) {
  const city = select.value;
  if (city) fetchWeather(city);
}

window.onload = () => renderDropdown();
