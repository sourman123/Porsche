import React, { useEffect, useState } from 'react';
import './Orders.css';

const OrdersComponent = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Fetch orders from the first API endpoint
        fetch('http://localhost:3000/orders', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setOrders(data);
                console.log(data);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
            });
    }, []);

    const fetchProductDetails = async (productId) => {
        // Fetch product details from the second API endpoint using productId
        try {
            const response = await fetch(`your_products_api_endpoint/${productId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching product details:', error);
            return null;
        }
    };

    const fetchAllProductDetails = async (order) => {
        // Iterate through each product ID in the order and fetch its details
        return await Promise.all(order.products.map(async productId => {
            return await fetchProductDetails(productId);
        }));
    };

    return (
        <div className="orders-wrapper">
            <div className="orders-container">
                {orders.map((order, index) => (
                    <div className="order" key={order.id}>
                        <h2>Order ID: {index}</h2>
                        <ul>
                            {order.products.map(productId => (
                                <li key={productId._id}>
                                    {/* Fetch and display each product detail */}
                                    <img
                                    className="image-product"
                                    src="https://scontent.fcai20-5.fna.fbcdn.net/v/t39.30808-6/254248292_4488945131218539_3594380631839996416_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=5f2048&_nc_ohc=XvID3PVXSnYQ7kNvgEUWv6u&_nc_ht=scontent.fcai20-5.fna&oh=00_AYA2kYf3sfJybqMcOjb_jR-Vbb6a-aIIlAwUklaHmwt7Xg&oe=664D347D"
                                    alt="product image"
                                    />
                                    <ProductDetails productId={productId} />
                                </li>
                            ))}
                        </ul>
                        <p>Total: {order.totalAmount}</p>
                        <p>Status: {order.status}</p>
                        <button
                        onClick={() => {
                            // Send updated product data to the server
                            fetch(`http://localhost:3000/cancelOrder/${order._id}`, {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: localStorage.getItem("token"),
                                }
                            })
                                .then((res) => {
                                    if (!res.ok) {
                                        throw new Error("Network response was not ok");
                                    }
                                    return res.json();
                                })
                                .then((data) => {
                                    console.log("order deleted successfully:", data);
                                    // Update state with new product data
                                    window.location.reload();
                                })
                                .catch((error) => {
                                    console.error("Error updating product:", error);
                                });
                        }}>Delete</button>

                    </div>
                ))}
            </div>
        </div>
    );
};

const ProductDetails = ({ productId }) => {
    const [product, setProduct] = useState({ name: 'a', description: 'a', stock: 0, price: 0});

    useEffect(() => {
        // Fetch product details when component mounts
        fetchProductDetails(productId);
        console.log(productId);
    }, [productId]);

    const fetchProductDetails = async (productId) => {
        // Fetch product details from the API endpoint using productId
        try {
            const response = await fetch(`http://localhost:3000/product/${productId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const productDetails = await response.json();
            setProduct(productDetails);
            console.log(productDetails);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    return (
        <div className="product-details">
            {/* Product Name */}
            <h3>{product.name}</h3>
            {/* Product Description */}
            <p>Description: {product.description}</p>
            {/* Product Stock */}
            <p>Stock: {product.stock}</p>
            {/* Product Price */}
            <p>Price: {product.price}</p>
        </div>
    );
};

export default OrdersComponent;