// Register.js
import React from 'react';
import {NavLink} from "react-router-dom";
import Products from "./Products";
import Orders from "./Orders";
import './Home.css';
const Home = () => {
    return (
        <div className="wrapper2">
            <div className="container2">
            <h1>Welcome to our CustomerHome Page</h1>
            <NavLink
                to="/home/products"
                className={Products
                }
            >
                view all products
            </NavLink>
            {localStorage.getItem("isAdmin") === "false" && 
            <NavLink
                to="/home/orders"
                className={Orders}
            >
                orders
            </NavLink>
            }
            </div>
        </div>
    );
};

export default Home;