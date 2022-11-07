/*
DEPENDENCIAS INSTALADAS
body-parser, mongoose, express, express-handlebars, nodemon, express-session, connect-flash
*/
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const admin = require('./routes/admin');
// O path é um módulo padrão do NodeJS. Serve para manipular diretórios
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

// O middleware é um intermediador entre as requisições e respostas e nos ajuda a manipular com maior precisão as informações requisitadas antes que elas cheguem ao destino final da aplicação. Ele é executado sempre a cada nova requisição.

// Configurações
    // Session
    app.use(session({
        secret: 'sessionteste',
        resave: true,
        saveUninitialized: true
    }))

    // o flash é uma sessão que dura apenas uma única vez
    app.use(flash());

    // Middleware
    app.use((req, res, next) => {
        // res.locals serve para criar variáveis globais
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        next();
    });

    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

    // Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');

    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/blogapp')
        .then(() => {
            console.log('Conectado ao MongoDB!')
        }).catch((error) => {
            console.error('Falha na conexão: ' + error)
        });

    // Public Dir
        app.use(express.static(path.join(__dirname, "public")));

        app.use((req, res, next) => {
            console.log("Olá, sou um middleware!")
            next();
        });


// Rotas
    app.get('/', (req, res) => {
        res.send('Rota principal')
    });
    app.use('/admin', admin); 



// Port
const PORT = 8081
app.listen(PORT, () => {
    console.log('Running Server...')
});





