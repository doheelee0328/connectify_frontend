import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setToken, setUsername, setVerified, setVerifyToken } from '../../actions';
import LoginImage from '../../assets/Connectify.jpg';
import './style.css';

const LoginUser = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [password, setPassword] = useState('');
	const [isLoaded, setIsLoaded] = useState(false);

	const username = useSelector((state) => state.user.username);
	const verifyToken = useSelector((state) => state.user.verifyToken);

	useEffect(() => {
		const fetchToken = async () => {
			try {
				const storedToken = localStorage.getItem('token');
				if (storedToken) {
					dispatch(setToken(storedToken));
				}
			} catch (error) {
				console.log(error);
			}
		};

		fetchToken();
	}, [dispatch]);

	useEffect(() => {
		if (verifyToken && isLoaded) {
			loginUserForFirstTime(verifyToken);
		}
	}, [verifyToken, isLoaded]);

	const errorCreate = (error) =>
		toast.error(error, {
			position: 'top-center',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: 'colored',
		});

	const loginUserForFirstTime = async () => {
		// dispatch(setIsLoaded(false));

		const url = window.location.href;
		const tokenUrl = url.split('/');
		if (verifyToken != tokenUrl[5]) {
			errorCreate('Wrong Credentials');
		} else {
			try {
				const url = `http://127.0.0.1:5000/users/verify/${verifyToken}`;
				const data = {
					user_username: username,
					user_password: password,
				};
				const res = await axios.post(url, data);
				dispatch(setToken(res.data.token));
				dispatch(setVerified(true));

				const business_id = res.data.business_id;
				const user_id = res.data.user_id;
				if (business_id == null) {
					navigate('/not-assigned');
				} else {
					localStorage.setItem('joinedBusiness', true);
					localStorage.setItem('business_id', business_id);
					localStorage.setItem('user_id', user_id);

					navigate('/dashboard');
				}
			} catch (error) {
				console.log(error, 'error');
				if (error && password.length != 0) {
					errorCreate('Incorrect credentials');
				}
			}
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (username.length === 0 || password.length === 0) {
			errorCreate('Enter username and password');
			setIsLoaded(false);
		} else {
			getUsers();
			setIsLoaded(true);
		}
	};

	async function getUsers() {
		try {
			const url = 'http://127.0.0.1:5000/users/';
			const res = await axios.get(url);
			const data = await res.data;

			const user = data.find((u) => u.user_username === username);

			dispatch(setVerifyToken(user.user_verify_token));
			// dispatch(setVerified(true));
			setIsLoaded(true);
		} catch (error) {
			if (error) {
				errorCreate("User doesn't exist");
			}
		}
	}

	return (
		<div className="container-login-register">
			<form onSubmit={handleSubmit} className="user-container">
				<label htmlFor="username" className="user-label">
					Username:
				</label>
				<input type="text" id="username" value={username} onChange={(e) => dispatch(setUsername(e.target.value))} className="user-text" />

				<label htmlFor="password" className="user-label">
					Password:
				</label>
				<input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="user-text" />

				<input type="submit" value="Login" className="login-register-button" />
			</form>

			<div className="login-register-image">
				<img src={LoginImage} alt="login-page" className="image" />
			</div>
			<ToastContainer />
		</div>
	);
};

export default LoginUser;
