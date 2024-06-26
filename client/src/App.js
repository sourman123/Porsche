// App.js
import React, { useEffect } from 'react';
import { createBrowserRouter , RouterProvider} from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import HomeLayout from "./components/HomeLayout";
import Home from "./components/Home";
import Products from "./components/Products";
import Orders from "./components/Orders";
import './App.css';


const router = createBrowserRouter([
    {
        path: '/',
        element: <HomeLayout />,
        loader: () => import('./components/HomeLayout')
    },
    {
        path: 'login',
        element: <Login />,
        loader: () => import('./components/login')
    },
    {
        path: 'register',
        element: <Register />,
        loader: () => import('./components/register')
    },
    {
        path: 'home',
        element: <Home />,
        loader: () => import('./components/Home')
    }
    ,
    {
        path: '/home/products',
        element: <Products />,
        loader: () => import('./components/Products')
    },
    {
        path: '/home/orders',
        element: <Orders />,
        loader: () => import('./components/Orders')
    }



]);

function App() {
    useEffect(() => {

        if (localStorage.getItem('isAdmin') === null) {
            localStorage.setItem('isAdmin', 'false');
        }
        if (localStorage.getItem('token') === null) {
            localStorage.setItem('token', '');
        }
    }
    , []);
    
    return <RouterProvider router={router} />;
}

export default App;
