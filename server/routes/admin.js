const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const brcypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

/** 
// GET/
// Admin - check login // This is just a middlewware function which is going to help me out
*/
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json( { message: 'Unauthorized'});
    }

    try{
        const decoded = jwt.verify(token,jwtSecret);
        req.userId = decoded.userId;
        next();
    }catch (error) {
        return res.status(401).json( { message: 'Unauthorized'});
    }
}


/** 
// GET/
// Admin - login Page
*/
router.get('/admin',async (req, res) => {


    try{
        const locals = {
            title: "Admin ",
            description: "Simple Blog created with NodeJS, Express & MongoDB"
        }
        //this try block will find all the posts
        // const data = await Post.find();
        res.render('admin/index', {locals, layout : adminLayout});
    }catch (error) {
        console.log(error);
    }
});

/** 
// GET/
// Admin - check login 
*/

router.post('/admin',async (req, res) => {
    try{
        //building logic : We can get the uname and the pws from the form 
        const { username, password} = req.body;

        //check if the new username is available in the Database
        const user = await User.findOne( { username } );

        if(!user) {
            return res.status(401).json( {message: 'Invalid Credentials'} );

        }
        const ifPasswordValid = await brcypt.compare(password, user.password);

        if(!ifPasswordValid) {
            return res.status(401).json( {message: 'Invalid Credentials'} );
        }

        //we want to save a token to the cookie
        const token = jwt.sign({userId: user._id}, jwtSecret);
        res.cookie('token', token, {httpOnly: true});

        res.redirect('/dashboard');

    }catch (error) {
        console.log(error);
    }
});

// /** 
// // GET/
// // Admin - check login 
// */

// router.get('/dashboard', authMiddleware,async (req, res) => {

//     res.render('admin/dashboard');
// });


/** 
// GET/
// Admin DashBoard 
*/


router.get('/dashboard',authMiddleware,async (req, res) => {

    const locals = {
        title: 'Dashboard',
        description: 'Simple Blog created with NodeJS, Express & MongoDB.'
    }

    try {
        const data = await Post.find();
        res.render('admin/dashboard', {
            locals, 
            data,
            layout : adminLayout
        });

    } catch (error) {
        console.log(error);
    }
});

/** 
// GET/
// Admin - Create New Posts 
*/

router.get('/add-post',authMiddleware,async (req, res) => {

    const locals = {
        title: 'Add Post',
        description: 'Simple Blog created with NodeJS, Express & MongoDB.'
    }

    try {
        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            layout : adminLayout 
        });

    } catch (error) {
        console.log(error);
    }
});



/** 
// POST/
// Admin - Create New Posts 
*/

router.post('/add-post',authMiddleware,async (req, res) => {

    try {
        // console.log(req.body); //
        //What we are adding on the admin -> Dashboard -> Add new post -> this content will be uploaded to MongoDB
        try{
            const newPost = new Post({
                title : req.body.title,
                body : req.body.body
            });

            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch(error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
});


/** 
// GET/
// Admin - Get the post which i  edited
*/

router.get('/edit-post/:id',authMiddleware,async (req, res) => {

    const locals = {
        title: 'Edit Post',
        description: 'Free NodeJs User Manegement System'
    };
    try {
        const data = await Post.findOne({ _id: req.params.id});

        res.render('admin/edit-post', {
            data,
            layouts: adminLayout,
            locals
        });

    } catch (error) {
        console.log(error);
    }
});

/** 
// PUT/
// Admin - edit new Post
*/

router.put('/edit-post/:id',authMiddleware,async (req, res) => {

    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });
        res.redirect('/dashboard');
        //res.redirect(`/edit-post/${req.params.id}`);

    } catch (error) {
        console.log(error);
    }
});

/** 
// DELETE/
// Admin - Delete Post
*/

router.post('/delete-post/:id',authMiddleware,async (req, res) => {
    try {
        console.log("try Delete");
        await Post.deleteOne( { _id: req.params.id});
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

/** 
// GET/
// Admin - Logout Post
*/
router.get('/logout', (req,res) => {
    //we Basically want to remove the cookie with the help of token
    res.clearCookie('token');
    //res.json({message: 'Logut Successful.'});
    res.redirect('/');
});

// router.post('/admin',async (req, res) => {
//     try{
//         //building logic : We can get the uname and the pws from the form 
//         const { username, password} = req.body;
        
//         if(req.body.username === 'admin' &&    req.body.password === 'password') {
//             res.send('You are Logged in.')
//         } else{
//             res.send('Wrong username and Password')
//         }
//     }catch (error) {
//         console.log(error);
//     }
// });


/** 
// GET/
// Admin -  Register 
*/
router.post('/register',async (req, res) => {
    try{
        //building logic : We can get the uname and the pws from the form 
        const { username, password} = req.body;
        const hashedPassword = await brcypt.hash(password, 10);

        try {
            const user = await User.create({username,password:hashedPassword});
            res.status(201).json({ message: 'User Created', user});
        } catch (error) {
            if(error.code === 11000){
                res.status(409).json({message: 'User already in Use'});
            }
            res.status(500).json({ message : 'Internal server error'});
        }
    }catch (error) {
        console.log(error);
    }
});

module.exports = router;