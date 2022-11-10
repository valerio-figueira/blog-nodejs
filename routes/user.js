const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
require("../models/User");
const User = mongoose.model('users');
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get('/register', (req, res) => {
    res.render("users/register")
})

router.post("/register", (req, res) => {
    const errors = [];

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        errors.push({text: "Nome inválido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        errors.push({text: "E-mail inválido"})
    }
    if(!req.body.password || typeof req.body.password == undefined || req.body.password == null){
        errors.push({text: "Senha inválida"})
    }
    if(req.body.password.length < 4){
        errors.push({text: "Senha muito curta"})
    }
    if(req.body.password != req.body.password2){
        errors.push({text: "As senhas são diferentes"})
    }
    if(errors.length > 0){
        res.render("users/register", {errors: errors})
    } else{
        User.findOne({email: req.body.email}).then(user => {
            if(user){
                req.flash("error_msg", "O e-mail já está cadastrado em nosso sistema")
                res.redirect("/users/register")
            }else{
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    eAdmin: 0
                });

                bcrypt.genSalt(10, (error, salt) => {
                    if(error){
                        req.flash("error_msg", "Não foi possível concluir o cadastro: " + error)
                        res.redirect("/users/register")
                    } else{
                        bcrypt.hash(newUser.password, salt, (error, hash) => {
                            if(error){
                                req.flash("error_msg", "Houve um erro ao salvar o usuário: " + error)
                                res.redirect("/users/register")
                            }
                            newUser.password = hash;
    
                            newUser.save().then(() => {
                                req.flash("success_msg", "Usuário cadastrado com sucesso!");
                                res.redirect("/users/register")
                            }).catch(error => {
                                req.flash("error_msg", "Não foi possível concluir o cadastro: " + error)
                                res.redirect("/users/register")
                            })
                        });
                    }
                });
            };
        }).catch(error => {
            req.flash("error_msg", "Não foi possível concluir o cadastro: " + error)
            res.redirect("/register")
        });
    };
});

router.get("/login", (req, res) => {
    res.render("users/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next);
});

module.exports = router;