/*===  GLOBALS  ===*/
const express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    bodyParser = require('body-parser'),
    env = require('dotenv').config(); // process.env.DB_PASSWORD etc...;

/*===  MONGOOSE CONNECT  ===*/
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-fxbxa.mongodb.net/${process.env.DB_NAME}`, {
    useNewUrlParser: true
});


/*===  API CONFIG  ===*/
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride("_method"));
app.use(expressSanitizer()); // ! HAS TO GO AFTER BODY PARSER !!!
app.set('view engine', 'ejs');


/*===  MONGOOSE & MODEL CONFIG  ===*/
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
});
const Blog = mongoose.model('Blog', blogSchema);

// // Sample create blog
// Blog.create({
//     title: 'Test Blog',
//     image: 'https://source.unsplash.com/300x300?blog',
//     body: 'Lorem lorem loremmmmm',
//     created: new Date()
// });


/*===  ROUTES  ===*/

// - ROOT ROUTE -
app.get('/', (req, res) => res.redirect('/blogs'));


// - INDEX ROUTE -
app.get('/blogs', (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                blogs
            });
        }
    });
});


// - NEW ROUTE -
app.get('/blogs/new', (req, res) => {
    res.render('new');
});


// - CREATE ROUTE -
app.post('/blogs', (req, res) => {
    // Create block
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, e => e ? res.render('new') : res.redirect('/blogs'));
});


// - SHOW ROUTE -
app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect('/blogs');
        } else {
            res.render('show', {blog: foundBlog});
        }
    });
});


// - EDIT ROUTE -
app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect('/');
        } else {
            res.render('edit', {blog: foundBlog});
        }
    });
    
});


// - UPDATE ROUTE - 
app.put('/blogs/:id', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if (err) {
            res.redirect('/blogs');
        } else {
            res.redirect(`/blogs/${req.params.id}`);
        }
    });
});


// - DELETE ROUTE -
app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id, err => res.redirect('/blogs'));
});



/*===  RUN SERVER  ===*/
app.listen(process.env.PORT, process.env.IP, () => console.log('Server running...'));