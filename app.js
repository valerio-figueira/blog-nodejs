/*
DEPENDENCIAS INSTALADAS
body-parser, mongoose, express, express-handlebars, nodemon, express-session, connect-flash, dotenv, bcryptjs, passport
*/
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const admin = require('./routes/admin');
const users = require('./routes/user')
// O path é um módulo padrão do NodeJS. Serve para manipular diretórios
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();
require("./models/Posts");
require("./models/Category");
const Post = mongoose.model('posts');
const Category = mongoose.model('categories');
const passport = require("passport");
require("./config/auth")(passport);

// O middleware é um intermediador entre as requisições e respostas e nos ajuda a manipular com maior precisão as informações requisitadas antes que elas cheguem ao destino final da aplicação. Ele é executado sempre a cada nova requisição.

// Configurações
    // Session
    app.use(session({
        secret: 'blogapp',
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize());
    app.use(passport.session())

    // o flash é uma sessão que dura apenas uma única vez
    app.use(flash());

    // Middleware
    app.use((req, res, next) => {
        // res.locals serve para criar variáveis globais
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        res.locals.error = req.flash("error");
        res.locals.user = req.user || null;
        next();
    });

    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

    // Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');

    // Public Dir
        app.use(express.static(path.join(__dirname, "public")));

        app.use((req, res, next) => {
            const today = new Date();
            console.log("Time: ", today.getHours() + ":" + today.getMinutes() + " hours")
            next();
        });


        app.use('/admin', admin);
        app.use('/users', users);


// Rotas
    app.get('/', (req, res) => {
        Post.find().populate("category")
        .sort({data: "desc"}).lean()
        .then(posts => {
            res.render('index', {posts})
        }).catch(error => {
            req.flash("error_msg", "Não foi possível carregar as postagens: " + error)
            res.redirect("/404")
        })
    });

    app.get("/categories", (req, res) => {
        Category.find().lean().then(categories => {
            res.render("categories/index", {categories})
        }).catch(error => {
            req.flash("error_msg", "Não foi possível carregar as categorias: " + error)
            res.redirect("/")
        })
    })

    app.get("/category/:slug", (req, res) => {
        Category.findOne({slug: req.params.slug}).lean().then(category => {
            if(category){
                Post.find({category: category._id}).lean().then(posts => {
                    res.render("categories/posts", {posts, category})
                }).catch(error => {
                    req.flash("error_msg", "Não foi possível listar as postagens: " + error)
                    res.redirect("/")
                })
            } else{
                req.flash("error_msg", "Essa categoria não existe")
                res.redirect("/")
            }
        }).catch(error => {
            req.flash("error_msg", "Não foi possível carregar a categoria: " + error)
            res.redirect("/")
        })
    })

    app.get("*", (req, res) => {
        res.status(404).render("404/404error")
    })

    app.get("/post/:slug", (req, res) => {
        Post.findOne({slug: req.params.slug}).lean().then(post => {
            if(post){
                res.render("post/index", {post})
            } else{
                req.flash("error_msg", "Essa postagem não existe")
                res.redirect("/")
            }
        }).catch(error => {
            req.flash("error_msg", "Houve um erro ao carregar: " + error)
            res.redirect("/")
        })
    })





    // Mongoose
    const DB_USER  = process.env.DB_USER;
    const DB_PASSWORD = encodeURIComponent(process.env.DB_PASSWORD);

    mongoose.Promise = global.Promise;
    mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@apicluster.vimpoeg.mongodb.net/blogapp?retryWrites=true&w=majority`)
    .then(() => {
        console.log('Conectado ao MongoDB!')
        const PORT = process.env.PORT || 8081
        app.listen(PORT, () => {
            console.log('Running Server...')
        });
    }).catch((error) => {
        console.error('Falha na conexão: ' + error)
    });