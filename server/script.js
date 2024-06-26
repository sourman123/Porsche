const SECRET = "801f3dbdc8a3d987717c32f1492806bc81e07532d8e5ef0478f4b7f4735812ec159c76c66e049f7510b2556564c2ce2e20ac3ec8ee0161db7de5e6686aaf4fbc"
const sec="anaadmin"
const mongoose = require('mongoose');
const Admin = require('./models/admin');
const Customer = require('./models/customer');
const Product = require('./models/product');
const Order = require('./models/order');
const bcrypt = require('bcrypt')
const express = require('express');
const jwt = require('jsonwebtoken')
const app = express();
const cors = require('cors');

app.use(express.json());

const PORT = 3000; // Change the port number



// Allow requests from http://localhost:3001
// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Connect to the database
mongoose.connect('mongodb://localhost:27017/PorscheDB');

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('Connection error:', error);
});

db.once('open', () => {
    console.log('Connected to PorscheDB');
});

// Add new product
app.post("/addProduct", authenticateAdmin, async (req, res) => {
    try {
        if(await Product.findOne({name: req.body.name})){
            return res.status(500).json('There is another product with this name')
        }
        if(
            !req.body.name ||
            !req.body.description ||
            !req.body.price ||
            !req.body.stock
        ) {
            return res.status(400).json("Send all required fields: name, description, price, stock");
        }
        const admin = await Admin.findById(req.user._id)

        if(admin == null){
           return res.status(501).json("Not authorized")
        }
        const newProduct =  {
            createdBy: admin._id,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock
        }
        const product = await Product.create(newProduct);

        return res.status(201).json(product);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message})
    }
});

// Edit product
app.put('/editProducts/:id', authenticateAdmin, async (req, res) => {
    try {
        if(
            !req.body.name ||
            !req.body.description ||
            !req.body.price ||
            !req.body.stock
        ) {
            return res.status(400).json({
                message: "Send all required fields: name, description, price, stock"
            });
        }

        const admin = await Admin.findById(req.user._id);
        const product = await Product.findById(req.params.id);

        const result = await Product.findByIdAndUpdate(req.params.id, req.body);

        if(!result) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Product updated successfully"})

    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message})
    }
});

// Delete product
app.delete('/deleteProducts/:id', authenticateAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id);
        const product = await Product.findById(req.params.id);

        const result = await Product.findByIdAndDelete(req.params.id);

        if(!result) {

            return res.status(404).json({ message: "Product not found" });
        }


        return res.status(200).json({ message: "Product deleted successfully"})

    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message})
    }
});

// Omar Part
app.get("/",async (request, response) => {
    const admins = await Admin.find();
    const customers = await Customer.find();
    const products = await Product.find();
    const orders = await Order.find();
    response.json({ admins, customers, products, orders });
});

//get all products
app.get("/products", async (req, res) => {
    try{
        res.status(200).json(await Product.find())
    }catch(error){

        res.status(404).json({message: "Product doesn't exist"})

    }
})
//get a product by id
app.get("/product/:id", async (req, res) => {
    try{
        res.status(200).json(await Product.findById(req.params.id))
    }catch(error){
        res.status(404).json({message: "Product doesn't exist"})
    }
})
//search for a product 
app.post("/findProduct", async (req, res) => {
    try {
        res.status(200).json(await Product.find({"name": req.body.name}))
    }catch(err){
        res.status(404).json('Product not found')
    }
})
//login an already existing user
app.post('/login', async (req, res) => {
    
    const userCustomer = await Customer.findOne({email: req.body.email})
    const userAdmin = await Admin.findOne({email: req.body.email})
    try {
      if(userCustomer == null){
          if(userAdmin == null){
              return res.status(400).json('invalid user or pass')
          }else {
              if(await bcrypt.compare(req.body.password, userAdmin.password)){
                return res.json({accessToken: jwt.sign(userAdmin.toObject(), SECRET), Admin: true})
              }else {
                  return res.status(400).json('invalid user or pass')
              }
          }
      }else {
          if(await bcrypt.compare(req.body.password, userCustomer.password)){
            return res.json({accessToken: jwt.sign(userCustomer.toObject(), SECRET), Admin: false})
          }else {
              return res.status(400).json('invalid user or pass')
          }
      } 
  }

  catch {
      return res.status(500).json('Invalid login attempt')
  }
})
//USE JWT authentication for customers
function authenticateCustomer(req, res, next){
    const auth = req.headers['authorization']

    let token = auth && auth.split(' ')[1]
    if(token == null){
        token= auth;
    }
    console.log(token)
    if(token == null){
        return res.jsonStatus(401)
    }

    jwt.verify(token, SECRET, (err, user) => {
        if(err) return res.status(404)

        req.user = user
        
        next()
    })
}
//USE JWT authentication for admins
function authenticateAdmin(req, res, next){
    const auth = req.headers['authorization']
    let token = auth && auth.split(' ')[1]
    if(token == null){
        token= auth;
    }
    if(token == null){
        return res.jsonStatus(401)
    }

    jwt.verify(token, SECRET, (err, user) => {
        if(err) return res.jsonStatus(404)

        req.user = user
        
        next()
    })
}

app.post('/admin', authenticateAdmin, async (req, res) => {
    return res.status(200).json('Admin registration successful');
})
//Register a new user
//email, password, username, firstName, lastName, address
app.post('/register', async (req, res) => {
    if(await Admin.findOne({email: req.body.email}) || await Customer.findOne({email: req.body.email})){
        return res.status(500).json('There is another account with this email')
    }
    if(await Admin.findOne({username: req.body.username}) || await Customer.findOne({username: req.body.username})){
        return res.status(500).json('There is another account with this username')
    }

    try {
        if(!(req.body.admin===""||req.body.admin===sec)){
            throw new Error("Not authorized")
        }
        const salt = await bcrypt.genSalt()
        
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
    
        const user = {
             email: req.body.email ,
             password: hashedPassword,
             username: req.body.username,
             firstName: req.body.firstName,
             lastName: req.body.lastName,
             address: req.body.address
            }
        const adminOrNot = !(req.body.admin==="")
        if(adminOrNot){
           await Admin.create(user)
        }else{ 
           await Customer.create(user)    
        }
        return res.status(200).json('Registration Successful')
    }catch(err) {
        console.log(err.message)
        res.status(400).json(err.message)
    }
})
//Get the orders for the customer that is logged in
app.get('/orders', authenticateCustomer , async(req, res) => {
    res.json(await Order.find({customer: req.user._id}))
})
//Place an order for the customer that is logged in
app.post('/placeOrder',authenticateCustomer, async (req, res) => {

    try{
        const products = req.body.products
        let total = 0
        for(let item of products){
            const temporary = await Product.findById(item)
            if(temporary.stock === 0){
                return res.status(500).json(`Item ${temporary.name} is out of stock, failed to place order`)
            }
            await Product.findByIdAndUpdate(item, {stock: temporary.stock - 1}, {new: true})
            total += temporary.price
        }
        const order = {
            customer: req.user._id,
            products: products,
            status: 'pending',
            totalAmount: total,
        }

        await Order.create(order)

        return res.status(200).json('Order placed successfully')
    }catch(err){
        return res.status(500).json(err.message)
    }
})




//Adam part
//cancel an order
app.post('/cancelOrder',authenticateCustomer, async (req, res) => {
    try{
        const orders = await Order.find({customer: req.user._id})
        const toCancel = orders.find(obj => obj.id === req.body.orderId)
        if(toCancel.status !== 'pending')
        {
            return res.status(501).json("This order has already been shipped")
        }
        const products = toCancel.products
        for(let item of products)
        {
            const temporary = await Product.findById(item)
            await Product.findByIdAndUpdate(item, {stock: temporary.stock + 1}, {new: true})
        }
        await Order.deleteOne(toCancel)
        return res.status(200).json('Order cancelled successfully')
    } catch(err) {
        return res.status(500).json(err.message)
    }
})

