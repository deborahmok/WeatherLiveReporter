document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
	const usernameInput = document.querySelector('.usernameInput');
	const passwordInput = document.querySelector('.passwordInput');
	
    form.addEventListener('submit', (event) => {
		event.preventDefault(); 
		
		const userData = 
		{
            username: usernameInput.value,
            password: passwordInput.value
        };

		console.log('Sending data:', JSON.stringify(userData));
		
        fetch('LoginServlet', {
            method: 'POST',
			headers: 
			{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        })
		.then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Login Successful:', data);
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', usernameInput.value);
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || 'An unexpected error occurred.');
        });
    });
});
