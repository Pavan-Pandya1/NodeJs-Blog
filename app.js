require('dotenv').config();

const express = require('express');
//add express ejs layer
const epressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const connectDB = require('./server/config/db');
const {isActiveRoute} = require('./server/helpers/routeHelpers');
const session = require('express-session');

const app = express();
const PORT = 5001 || process.env.PORT;


// Connect Database
connectDB();

app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
    //cookie: {maxAge: newDate ( Date.now() + (3600000))}
    // Date.now() - 30 * 24 * 60 * 60 * 1000
}));

//we alsp have to set a public folder before we go all out - public folder will hold js,css,vue.js,imageJS
app.use(express.static('public'));



//In order to use express ejs layout we will use pjp
//Template Engine 
app.use(epressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/',require('./server/routes/main'));
app.use('/',require('./server/routes/admin'));
// app.get('', (req, res) => {
//     res.send("Hello world");
// });

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});

