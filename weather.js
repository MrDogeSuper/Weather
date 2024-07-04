const dateElement = document.getElementById('CurrentDate');
const timeElement = document.getElementById('CurrentTime');
const locationElement = document.getElementById('UserLocation');
const weatherForm = document.querySelector("#weatherForm");
const searchInput = document.querySelector("#Search");
const cityName = document.querySelector("#cityName");
const localTime = document.querySelector("#localTime");
const temperature = document.querySelector("#temperature");
const humidity = document.querySelector("#humidity");
const description = document.querySelector("#description");
const emoji = document.querySelector("#emoji");
const hourlyData = document.querySelector("#hourlyData");
const forecastData = document.querySelector("#forecastData");
const APIKey = "3d0247b6de3edc9359a40a3aae5e1288";
const timezoneAPIKey = "YOUR_TIMEZONE_DB_API_KEY"; // Replace with your TimezoneDB API key

function fetchTimeData(lon, lat) {
    const timeApiUrl = `http://api.timezonedb.com/v2.1/get-time-zone?key=${timezoneAPIKey}&format=json&by=position&lat=${lat}&lng=${lon}`;

    fetch(timeApiUrl)
        .then(response => response.json())
        .then(timeData => {
            if (timeData.status === "OK") {
                updateTimeInfo(timeData);
            } else {
                console.error("Error fetching time data:", timeData);
                alert("Failed to fetch time data. Please try again later.");
            }
        })
        .catch(error => {
            console.error("Error fetching time data:", error);
            alert("Failed to fetch time data. Please try again later.");
        });
}

function fetchLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiKey = 'ed615c5422dc42508ea9d81d7dd615d6'; // Replace with your API key
            const url = `https://ipinfo.io/${lat},${lon}?token=${apiKey}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                locationElement.innerHTML = `${data.city}, ${data.country}`;
            } catch (error) {
                locationElement.innerHTML = 'Unable to fetch location';
            }
        }, () => {
            locationElement.innerHTML = 'Location access denied';
        });
    } else {
        locationElement.innerHTML = 'Geolocation not supported';
    }
}

function fetchWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}&units=imperial`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                updateWeatherInfo(data);
            } else {
                alert("City not found. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            alert("Failed to fetch weather data. Please try again later.");
        });
}

function fetchTimeData(city) {
    const geoApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;

    fetch(geoApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                const { lon, lat } = data.coord;
                const timeApiUrl = `http://api.timezonedb.com/v2.1/get-time-zone?key=YOUR_TIMEZONE_DB_API_KEY&format=json&by=position&lat=${lat}&lng=${lon}`;

                fetch(timeApiUrl)
                    .then(response => response.json())
                    .then(timeData => {
                        updateTimeInfo(timeData);
                    })
                    .catch(error => {
                        console.error("Error fetching time data:", error);
                        alert("Failed to fetch time data. Please try again later.");
                    });
            } else {
                alert("City not found. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error fetching geo data:", error);
            alert("Failed to fetch geo data. Please try again later.");
        });
}

function fetchForecastData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}&units=imperial`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === "200") {
                updateHourlyForecast(data);
                updateFiveDayForecast(data);
            } else {
                alert("City not found. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error fetching forecast data:", error);
            alert("Failed to fetch forecast data. Please try again later.");
        });
}

function updateWeatherInfo(data) {
    cityName.textContent = data.name;
    temperature.textContent = `Temperature: ${data.main.temp} °F`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    description.textContent = data.weather[0].description;
    emoji.textContent = getWeatherEmoji(data.weather[0].main);
}

function updateTimeInfo(timeData) {
    localTime.textContent = `Local Time: ${timeData.formatted}`;
}

function updateHourlyForecast(data) {
    hourlyData.innerHTML = ""; // Clear previous data
    const hourlyItems = data.list.slice(0, 12); // Get the first 12 items

    hourlyItems.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = `${item.main.temp} °F`;
        const desc = item.weather[0].description;
        const hourlyItem = document.createElement("p");
        hourlyItem.textContent = `${time}: ${temp}, ${desc}`;
        hourlyData.appendChild(hourlyItem);
    });
}

function updateFiveDayForecast(data) {
    forecastData.innerHTML = ""; // Clear previous data
    const dailyData = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[date]) {
            dailyData[date] = [];
        }
        dailyData[date].push(item);
    });

    Object.keys(dailyData).slice(0, 5).forEach(date => {
        const dayData = dailyData[date];
        const temps = dayData.map(item => item.main.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        const desc = dayData[0].weather[0].description;
        const forecastItem = document.createElement("p");
        forecastItem.textContent = `${date}: Min ${minTemp} °F, Max ${maxTemp} °F, ${desc}`;
        forecastData.appendChild(forecastItem);
    });
}

function getWeatherEmoji(main) {
    switch (main.toLowerCase()) {
        case "clear":
            return "☀️";
        case "clouds":
            return "☁️";
        case "rain":
            return "🌧️";
        case "snow":
            return "❄️";
        case "thunderstorm":
            return "⛈️";
        default:
            return "🌈";
    }
}

weatherForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const city = searchInput.value.trim();
    if (city) {
        fetchWeatherData(city);
        fetchTimeData(city);
        fetchForecastData(city);
    }
});

// Start fetching location and updating date/time
fetchLocation();
updateDateTime();
setInterval(updateDateTime, 1000);
