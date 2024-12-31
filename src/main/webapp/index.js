document.addEventListener('DOMContentLoaded', () => {
    setupRadioButtons();
    setupNavbar();
    setupFormSubmission();
	setupDisplayAllButton();
	setupCityButtonSelection();
	
	function setupRadioButtons() {
	    const radioCity = document.getElementById('choiceCity');
	    const radioLatLong = document.getElementById('choiceLatLong');
	    const searchContainerCity = document.getElementById('searchContainerCity');
	    const searchContainerLatLong = document.getElementById('searchContainerLatLong');
		const searchResult = document.querySelector('.searchResult');
		const searchResultCity = document.querySelector('.searchResultCity');
	
	    function updateSearchContainer() {
	        if (radioCity.checked) {
	            searchContainerCity.style.display = 'block';
	            searchContainerLatLong.style.display = 'none';
				if (searchResultCity) searchResultCity.style.display = 'none';
				if (searchResult) searchResult.style.display = 'none';
				
	        } else if (radioLatLong.checked) {
	            searchContainerCity.style.display = 'none';
	            searchContainerLatLong.style.display = 'block';
				if (searchResultCity) searchResultCity.style.display = 'none';
				if (searchResult) searchResult.style.display = 'none';
	        }
	    }
	
	    radioCity.addEventListener('change', updateSearchContainer);
	    radioLatLong.addEventListener('change', updateSearchContainer);
	
	    updateSearchContainer();
	}
	
	function setupNavbar() {
	    const loggedIn = localStorage.getItem('loggedIn');
	    const navbarMenu = document.querySelector('.navbar .menu');
	
	    if (loggedIn === 'true') {
	        navbarMenu.innerHTML = `
	            <li><a href="profile.html">Profile</a></li>
	            <li><a href="#" id="signOutLink">Sign Out</a></li>
	        `;
	
	        const signOutLink = document.getElementById('signOutLink');
	        signOutLink.addEventListener('click', (e) => {
	            e.preventDefault();
	            localStorage.setItem('loggedIn', 'false');
	            localStorage.removeItem('username');
	            window.location.href = 'index.html';
	        });
	    } else {
	        navbarMenu.innerHTML = `
	            <li><a href="login.html">Login</a></li>
	            <li><a href="register.html">Register</a></li>
	        `;
	    }
	}
	
	function setupFormSubmission() {
	    const form = document.getElementById('searchForm');
	    const loggedIn = localStorage.getItem('loggedIn');
	
	    form.addEventListener('submit', (event) => {
	        event.preventDefault();
	
	        if (loggedIn !== 'true') {
	            return;
	        }
	
	        const userData = gatherFormData();
	        if (!userData) return;
	
	        sendWeatherRequest(userData);
	    });
	}
	
	function setupCityButtonSelection() {
	    document.addEventListener('click', (event) => {
	        if (event.target.classList.contains('city-button')) {
	            document.querySelectorAll('.city-button').forEach((button) =>
	                button.classList.remove('selected')
	            );
	            event.target.classList.add('selected');
	        }
	    });
	}

	function gatherFormData() {
	    const radioCity = document.getElementById('choiceCity');
	    const username = localStorage.getItem('username');
	
	    if (radioCity.checked) {
	        const cityButton = document.querySelector('.city-button.selected');
			if (!cityButton) {
	            return null;
	        }
	        return {
	            type: 'city',
	            input: cityButton.textContent.trim(),
	            username: username || 'default_user',
	        };
	    } 
		else {
	        const latitude = document.querySelector('.latInput').value.trim();
	        const longitude = document.querySelector('.longInput').value.trim();
	        if (!latitude || !longitude) {
	            return null;
	        }
			
			const latLongInput = `${latitude},${longitude}`;
			console.log("Gathered lat/long input:", latLongInput);
			
	        return {
				type: 'latlong',
		        input: `${latitude},${longitude}`,
		        username: username || 'default_user',
	        };
	    }
	}
	
	function sendWeatherRequest(userData) {
	    let baseURL = window.location.origin + "/mokd_CS201_Assignment3/";
	    var url = new URL("Weather", baseURL);

	    console.log("Sending data to backend:", JSON.stringify(userData));

	    fetch(url, {
	        method: 'POST',
	        headers: {
	            'Content-Type': 'application/json',
	        },
	        body: JSON.stringify(userData),
	    })
	        .then((response) => {
	            if (!response.ok) {
	                return response.json().then((errorData) => {
	                    throw new Error(errorData.message || 'Failed to fetch weather data.');
	                });
	            }
	            return response.json();
	        })
	        .then((data) => {
	            console.log("Backend response:", data);
	        })
	        .catch((error) => {
	            console.error("Fetch request failed:", error);
	        });
	}
	
	function setupDisplayAllButton() {
	    const displayAllBtn = document.querySelector('.buttonContainer .button');
	    if (displayAllBtn) {
	        displayAllBtn.addEventListener('click', async (event) => {
	            event.preventDefault();

	            const radioLatLong = document.getElementById('choiceLatLong');
	            const radioCity = document.getElementById('choiceCity');
				const searchResult = document.querySelector('.searchResult');
				const searchResultCity = document.querySelector('.searchResultCity');
	            if (radioLatLong.checked) {
	                const latitude = document.querySelector('.latInput').value.trim();
	                const longitude = document.querySelector('.longInput').value.trim();
					searchResult.style.display = 'block';
					searchResultCity.style.display = 'none';
	                if (!latitude || !longitude) {
	                    return;
	                }
	                const userData = {
	                    type: 'latlong',
	                    input: `lat=${latitude}, lon=${longitude}`,
	                    username: localStorage.getItem('username') || 'default_user',
	                };
	                sendWeatherRequest(userData);
	            } 
				else if (radioCity.checked) {
	                const cityButton = document.querySelector('.city-button.selected');
					searchResultCity.style.display = 'block';
					searchResult.style.display = 'none';
	                if (!cityButton) {
	                    return;
	                }
	                const userData = {
	                    type: 'city',
	                    input: cityButton.textContent.trim(),
	                    username: localStorage.getItem('username') || 'default_user',
	                };
	                sendWeatherRequest(userData);
	            } else {
	                alert("Please select an input method.");
	            }
	        });
	    }
	}

    //citation chatgpt "debug: Explain why number isn't working correctly for dynamically updating the table" line 275-306
    function getSortFunction(option) {
        switch (option) {
            case 'tempLowDesc':
                return (a, b) =>
                    Number(b.querySelector('td:nth-child(2)').textContent) -
                    Number(a.querySelector('td:nth-child(2)').textContent);
            case 'tempLowAsc':
                return (a, b) =>
                    Number(a.querySelector('td:nth-child(2)').textContent) -
                    Number(b.querySelector('td:nth-child(2)').textContent);
            case 'tempHighDesc':
                return (a, b) =>
                    Number(b.querySelector('td:nth-child(3)').textContent) -
                    Number(a.querySelector('td:nth-child(3)').textContent);
            case 'tempHighAsc':
                return (a, b) =>
                    Number(a.querySelector('td:nth-child(3)').textContent) -
                    Number(b.querySelector('td:nth-child(3)').textContent);
            case 'cityNameAsc':
                return (a, b) =>
                    a.querySelector('td:first-child').textContent.localeCompare(
                        b.querySelector('td:first-child').textContent
                    );
            case 'cityNameDesc':
                return (a, b) =>
                    b.querySelector('td:first-child').textContent.localeCompare(
                        a.querySelector('td:first-child').textContent
                    );
            default:
                return null;
        }
    }
	
	const sortByDropdown = document.getElementById('sortBy');
	const tableBody = document.getElementById('cityTableBody');
	if (sortByDropdown) {
	    sortByDropdown.addEventListener('change', () => {
	        const selectedOption = sortByDropdown.value;
	        const rows = Array.from(tableBody.querySelectorAll('tr'));
	        const sortFunction = getSortFunction(selectedOption);
	        if (sortFunction) {
	            const sortedRows = rows.sort(sortFunction);
	            tableBody.innerHTML = ''; //clear it outAHHHHHHh
	            sortedRows.forEach((row) => tableBody.appendChild(row));
	        } else {
	            console.warn('Unknown sort option selected:', selectedOption);
	        }
	    });
	}
});
