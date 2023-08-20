import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import validateToken from "../utils/validateToken";

export default function Login() {
	const [loggedIn, setLoggedIn] = useState(null);

	const signupHandler = (event) => {
		event.preventDefault();

		const payload = {
			email: event.target.singup_email.value,
			username: event.target.signup_username.value,
			password: event.target.signup_password.value
		}

		const signupAPI = async () => {
			const resp = await fetch('http://localhost:5000/api/signup', {
				method: 'POST',
				mode: 'cors',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
			const respObj = await resp.json();

			console.log(respObj.mess) // <-- do sth on error
		}
		signupAPI();
	}

	const loginHandler = (event) => {
		event.preventDefault();

		const payload = {
			login_user: event.target.login_user.value,
			password: event.target.login_password.value
		}

		const loginAPI = async () => {
			const resp = await fetch('http://localhost:5000/api/login', {
				method: 'POST',
				mode: 'cors',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
			const respObj = await resp.json();

			if(respObj.mess == 'Login successful') {
				window.localStorage.setItem('accToken', respObj.token);
				setLoggedIn(true);
			}

			console.log(respObj.mess) // <-- do sth on error
		}
		loginAPI();
	}

	useEffect(() => {
		validateToken(setLoggedIn);
	}, []);

	if(loggedIn) return <Navigate to="/" />
	else return (
		<div className="bg-gray-500 w-screen h-screen">
			<h2>Înregistrează-te</h2>
			<form method="POST" onSubmit={signupHandler}>
				<label htmlFor="signup_email">Email</label>
				<input name="singup_email" type="email" required />
				
				<label htmlFor="signup_username">Username</label>
				<input name="signup_username" type="text" required />

				<label htmlFor="signup_password">Parolă</label>
				<input name="signup_password" type="password" required></input>

				<button type="submit">Înregistrare</button>
			</form>

			<h2>Loghează-te</h2>
			<form method="POST" onSubmit={loginHandler}>
				<label htmlFor="login_user">Email/username</label>
				<input name="login_user" type="text" required />

				<label htmlFor="login_password">Parolă</label>
				<input name="login_password" type="password" required />

				<button type="submit">Logare</button>
			</form>
		</div>
	)
}