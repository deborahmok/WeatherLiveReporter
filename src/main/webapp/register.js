document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const passwordInput = document.querySelector('.passwordInput');
    const confirmPasswordInput = document.querySelector('.confirmPasswordInput');
	const usernameInput = document.querySelector('.usernameInput');

    form.addEventListener('submit', (event) => {
		event.preventDefault();
		
        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('The passwords do not match.');
			return;
        }
		
		const userData = 
		{
            username: usernameInput.value,
            password: passwordInput.value
        };
		
        fetch('RegisterServlet', {
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
			console.log("Registration successful:", data);
		    localStorage.setItem('loggedIn', 'true');
			localStorage.setItem('username', usernameInput.value);
		    window.location.href = 'index.html';
		})
        .catch(error => {
			console.error('Registration failed:', error.message);
            alert(error.message || 'An unexpected error occurred.');
        });
    });
});
