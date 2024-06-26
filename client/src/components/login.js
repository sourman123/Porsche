import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requestBody = {
            email: username,
            password: password
        };
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Include Bearer token in the Authorization header

                },
                body: JSON.stringify(requestBody)
            });
            const data = await response.json();
            if(data==="invalid user or pass"){
                alert("invalid user or pass")
                return;
            }
            // Handle successful response
            if(data.Admin) {
                loggedd = 'admin';
                localStorage.setItem('isAdmin', 'true');
            }else{
                loggedd = 'customer';
                localStorage.setItem('isAdmin', 'false');
            }
            // token = JSON.stringify(data.accessToken);
            // token=token.split('"')[1];
            // console.log(token.charAt(0));

            localStorage.setItem('token', data.accessToken);
            // console.log(token);
            console.log(localStorage.getItem('token'));
            console.log(data.accessToken);
            navigate('/home');
            console.log(data);
            console.log('Login successful:', data);
            console.log(localStorage.getItem('isAdmin'));
        } catch (error) {
            // Handle error
            console.error('There was a problem with your fetch operation:', error);
        }
    };

    return (
        <div className="containerLogin">
            <div className="topLogin"></div>
            <div className="bottomLogin"></div>
            <div className="centerLogin">
                <h1 className='porscheLogin'>Porsche</h1>
                <h2>Please Sign In</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="email" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

// Wrap the Login component with withRouter to access history object
export default Login;
export let loggedd = '';
export let token = '';