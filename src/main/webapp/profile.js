document.addEventListener('DOMContentLoaded', () => {
    const loggedIn = localStorage.getItem('loggedIn');
    const navbarMenu = document.querySelector('.navbar .menu');
    const username = localStorage.getItem('username');
    const userHeader = document.getElementById('userHeader');
    const searchHistoryTable = document.querySelector('#searchHistory tbody'); // Reference to tbody for rows

    if (loggedIn === 'true') {
        navbarMenu.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="#" id="signOutLink">Sign Out</a></li>
        `;

        document.getElementById('signOutLink').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('loggedIn', 'false');
            localStorage.removeItem('username');
            window.location.href = 'index.html';
        });

        userHeader.textContent = `${username}'s Search History`;
        fetchSearchHistory();

    } 
	else {
        navbarMenu.innerHTML = `
            <li><a href="login.html">Login</a></li>
            <li><a href="register.html">Register</a></li>
        `;
        userHeader.textContent = "Please log in to view your search history.";
    }

	function fetchSearchHistory() {
	    const baseURL = window.location.origin + "/mokd_CS201_Assignment3/";
	    const url = new URL("Weather", baseURL);

	    fetch(url, {
	        method: 'GET',
	    })
	        .then((response) => {
	            if (!response.ok) {
	                return response.json().then((error) => {
	                    throw new Error(error || 'Failed to fetch search history.');
	                });
	            }
	            return response.json();
	        })
	        .then((data) => {
	            console.log('Search History:', data); 
	            displaySearchHistory(data);
	        })
	        .catch((error) => {
	            console.error('Error:', error);
	            alert('Error fetching search history: ' + error.message);
	        });
	}

    function displaySearchHistory(data) {
        searchHistoryTable.innerHTML = '';
		//citation chatgpt "syntax for encodeURIComponent to direct search from the click" line 68-71
        if (data && data.length > 0) {
            data.forEach((entry) => {
                const row = document.createElement('tr');
                const queryCell = document.createElement('td');
				const queryButton = document.createElement('button');
				queryButton.textContent = entry.search_query;
	            queryButton.classList.add('query-button');
				queryButton.addEventListener('click', () => {
				    const searchType = entry.search_query.includes('lat=') ? 'latlong' : 'city';
				    window.location.href = `index.html?type=${searchType}&query=${encodeURIComponent(entry.search_query.trim())}`;
				});
	            queryCell.appendChild(queryButton);
	            row.appendChild(queryCell);

                searchHistoryTable.appendChild(row);
            });
        } 
		else {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 1;
            cell.textContent = 'No search history found.';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            searchHistoryTable.appendChild(row);
        }
    }
});