document.addEventListener('DOMContentLoaded', () => {
    let map;
    let weatherData = null;

	//intialize map
	window.initMap = () => {
	    const mapElement = document.getElementById("map");
	    if (mapElement) {
	        map = new google.maps.Map(mapElement, {
	            center: { lat: 34.022415, lng: -118.285530 },
	            zoom: 3,
	        });

	        map.addListener("click", (e) => {
	            handleMapClick(e.latLng);
	        });
	    }
	};

    window.openMap = (event) => {
        event.preventDefault();
        const mapOverlay = document.querySelector(".map-overlay");
        if (mapOverlay) {
            mapOverlay.style.display = "block";
        }
        if (!map) {
            window.initMap();
        }

        const mapBackground = document.querySelector(".map-background");
        if (mapBackground) {
            mapBackground.onclick = () => {
                mapOverlay.style.display = "none";
            };
        }
    };

    const mapButton = document.querySelector(".mapButton");
    if (mapButton) {
        mapButton.addEventListener("click", openMap);
    }

    const handleMapClick = (latLng) => {
        const latInput = document.querySelector('input[placeholder="Latitude"]');
        const lngInput = document.querySelector('input[placeholder="Longitude"]');
		const searchResult = document.querySelector('.searchResult');
		const searchResultCity = document.querySelector('.searchResultCity');
		
		if (latInput && lngInput) {
            const lat = latLng.lat();
            const lon = latLng.lng();
            latInput.value = lat.toFixed(6);
            lngInput.value = lon.toFixed(6);

            if (searchResult) searchResult.style.display = 'none';
        }

        const mapOverlay = document.querySelector(".map-overlay");
        if (mapOverlay) {
            mapOverlay.style.display = "none";
        }
    };
	
	const fetchWeatherByLatLong = (lat, lon) => {
        const API_KEY = "(openWeatherAPIKey)";
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

        return fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch weather data.");
                }
                return response.json();
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Unable to fetch weather data. Please try again.");
                throw error;
            });
    };
	
    const updateSpansWithWeatherData = (data) => {
        if (!data) {
            alert("No weather data available. Please select a location on the map first.");
            return;
        }
		//citation chatgpt: "what is the syntax for retrieving local time and to round up the hours" line 97-98
		const searchResult = document.querySelector('.searchResult');
		const searchResultCity = document.querySelector('.searchResultCity');
        const placeName = data.name || "Unknown Location";
        const lowestTemp = Math.ceil(data.main.temp_min * 9/5 + 32);
        const highestTemp = Math.ceil(data.main.temp_max * 9/5 + 32);
        const windSpeed = data.wind.speed + " mi/h";
        const humidity = data.main.humidity + "%";
        const coordinates = `${Math.ceil(data.coord.lat)}/${Math.ceil(data.coord.lon)}`;
        const currentTemp = Math.ceil(data.main.temp * 9/5 + 32);
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', hour12: true});
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', hour12: true});

        updateText("earthIcon", placeName);
        updateText("snowflakeIcon", `${lowestTemp}`);
        updateText("sunIcon", `${highestTemp}`);
        updateText("windIcon", `${windSpeed}`);
        updateText("dropIcon", `${humidity}`);
        updateText("coordinatesIcon", `${coordinates}`);
        updateText("tempIcon", `${currentTemp}`);
        updateText("sunriseIcon", `${sunrise}/${sunset}`);
		
	    if (searchResult) {
	        searchResult.style.display = "block";
	    }
	    if (searchResultCity) {
	        searchResultCity.style.display = "none";
	    }
    };

    const updateText = (iconClass, newText) => {
        const iconContainer = document.querySelector(`.${iconClass}`).parentElement;
        if (iconContainer) {
            const span = iconContainer.querySelector("span");
            if (span) {
                span.textContent = newText;
            }
        }
    };
	
	const fetchCitiesAndUpdateTable = (cityInput) => {
	    const API_KEY = "(openWeatherAPIKey)";
	    const geoApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=5&appid=${API_KEY}`;

	    fetch(geoApiUrl)
	        .then((response) => {
	            if (!response.ok) {
	                throw new Error("Failed to fetch geocoding data.");
	            }
	            return response.json();
	        })
	        .then((cities) => {
				console.log("Received city data:", cities);
	            if (!cities || cities.length === 0) {
	                alert("No matching cities found.");
	                return;
	            }
	            updateCityTable(cities, API_KEY);
	        })
	        .catch((error) => {
	            console.error("Error:", error);
	            alert("Unable to fetch city data. Please try again.");
	        });
	};
	
	const fetchWeatherByCityName = (cityInput) => {
	    const API_KEY = "(openWeatherAPIKey)";
	    const geoApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=1&appid=${API_KEY}`; //this one is 1 result

	    fetch(geoApiUrl)
	        .then((response) => {
	            if (!response.ok) {
	                throw new Error("Failed to fetch geocoding data.");
	            }
	            return response.json();
	        })
	        .then((cities) => {
	            if (!cities || cities.length === 0) {
	                alert(`No matching city found for "${cityInput}".`);
	                return;
	            }

	            const { lat, lon } = cities[0]; 
	            console.log(`City: ${cityInput}, Lat: ${lat}, Lon: ${lon}`); 

	            fetchWeatherByLatLong(lat, lon)
	                .then((data) => {
	                    weatherData = data;
	                    updateSpansWithWeatherData(data);
	                })
	                .catch((error) => {
	                    console.error("Error fetching weather data:", error);
	                });
	        })
	        .catch((error) => {
	            console.error("Error:", error);
	            alert("Unable to fetch city geocoding data. Please try again.");
	        });
	};
	
	const updateCityTable = (cities, API_KEY) => {
	    const tableBody = document.getElementById("cityTableBody");
	    tableBody.innerHTML = "";

	    cities.forEach((city) => {
	        const { lat, lon, name, state, country } = city;
	        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

	        fetch(weatherApiUrl)
	            .then((response) => {
	                if (!response.ok) {
	                    throw new Error("Failed to fetch weather data.");
	                }
	                return response.json();
	            })
	            .then((weatherData) => {
	                const row = document.createElement("tr");
	                const cityCell = document.createElement("td");
					const cityButton = document.createElement("button");
	                
					cityButton.textContent = `${name}, ${state || ""} ${country}`;
	                cityButton.className = "city-button"; 
	                cityButton.addEventListener("click", () => {
	                    updateSpansWithWeatherData(weatherData);
						
						const searchResult = document.querySelector(".searchResult");
						const searchResultCity = document.querySelector('.searchResultCity');
	                    if (searchResult) {
	                        searchResult.style.display = "block";
							searchResultCity.style.display = "none";
	                    }
	                });
					cityCell.appendChild(cityButton);
	                row.appendChild(cityCell);

	                const tempLowCell = document.createElement("td");
	                tempLowCell.textContent = `${Math.round(weatherData.main.temp_min)}`;
	                row.appendChild(tempLowCell);

	                const tempHighCell = document.createElement("td");
	                tempHighCell.textContent = `${Math.round(weatherData.main.temp_max)}`;
	                row.appendChild(tempHighCell);

	                tableBody.appendChild(row);
	            })
	            .catch((error) => {
	                console.error("Error:", error);
	                alert("Unable to fetch weather data for city.");
	            });
	    });
	};
	
	//chatgpt "debug: why is the searchResult not uploading by the displayAll is pressed?" line 207 & 222
	const displayAllBtn = document.querySelector("#buttonContainer .button");
	if (displayAllBtn) {
	    displayAllBtn.addEventListener("click", async (event) => {
	        event.preventDefault();

	        const cityInput = document.getElementById("locationInput").value.trim();
	        const latInput = document.querySelector(".latInput").value.trim();
	        const longInput = document.querySelector(".longInput").value.trim();
	        const radioCity = document.getElementById('choiceCity');
	        const radioLatLong = document.getElementById('choiceLatLong');
	        const searchResult = document.querySelector('.searchResult');
	        const searchResultCity = document.querySelector('.searchResultCity');

	        if (radioLatLong.checked && latInput && longInput) {
	            if (searchResultCity) searchResultCity.style.display = 'none';

	            try {
	                const data = await fetchWeatherByLatLong(latInput, longInput);
	                weatherData = data;
	                updateSpansWithWeatherData(data);
	            } catch (error) {
	                console.error("Error updating weather data:", error);
	            }
	        } else if (radioCity.checked && cityInput) {
	            if (searchResult) searchResult.style.display = 'none';
	            fetchCitiesAndUpdateTable(cityInput);
	        }
	    });
	}
	
	const queryParams = getQueryParams();
    if (queryParams.type && queryParams.query) {
		if (queryParams.type === 'city') {
			const cityName = queryParams.query.match(/(.+)/)[0];
		    if (cityName) {
		        console.log("City name to search:", cityName);
		        fetchWeatherByCityName(cityName.trim())
		            .then(() => {
		                console.log("City data successfully fetched and displayed.");
		            })
		            .catch((error) => {
		                console.error("Error fetching city data:", error);
		            });
		    } else {
		        console.warn("Invalid or empty city name provided in query.");
		    }
		}
		else if (queryParams.type === 'latlong') {
            const [lat, lon] = queryParams.query.match(/lat=(-?\d+\.\d+),\s*lon=(-?\d+\.\d+)/).slice(1);
            fetchWeatherByLatLong(lat, lon).then((data) => {
                weatherData = data;
                updateSpansWithWeatherData(data);
            }).catch((error) => {
                console.error("Error fetching weather data:", error);
            });
        }
    }
	
	function getQueryParams() {
	    const urlParams = new URLSearchParams(window.location.search);
	    return {
	        type: urlParams.get('type'),
	        query: urlParams.get('query'),
	    };
	}
});
