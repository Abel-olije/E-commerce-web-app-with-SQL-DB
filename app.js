const express = require('express');
const path = require('path');


const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./utils/database');
const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-items')

const app = express();


app.set('view engine', 'ejs');
app.set('views', 'views')

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { userInfo } = require('os'); 
const { access } = require('fs');
// const { FORCE } = require('sequelize/types/index-hints');


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'public')));

app.use((req, res, next) =>{
    User.findByPk(1)
    .then(user =>{
        req.user = user
        next()
    })
    .catch(err =>{
        console.log(err)
    })
})

app.use('/admin',adminRoutes);
app.use(shopRoutes);

app.use(errorController.getError)

Product.belongsTo(User, {constraints: true, onDelete:'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem});
Product.belongsToMany(Order, {through: OrderItem })

sequelize
// .sync({force: true})
.sync()
.then(result => {
    // checking to see if there is a user adn creating a dummy user
    return User.findByPk(1)
    // console.log(result);   
})
.then(user => {
    if(!user) {
        return User.create({name: 'ace', email: 'ace@gmail.com',})
    }
    return user;
})
.then(user =>{
    // console.log(user)
    return user.createCart()
})
.then(cart => {
    app.listen(5000,()=>{
        console.log("server running at port 5000!")
    });
})
.catch( err => {
    console.log(err)
})


