const express = require('express');
// O router é utilizado para criar rotas em arquivos separados
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Category');
const Category = mongoose.model('categories');
require('../models/Posts');
const Posts = mongoose.model('posts');
const {eAdmin} = require("../helpers/eAdmin");

router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
});

router.get('/categories', eAdmin, (req, res) => {
    Category.find().lean().sort({date: 'desc'}).then(category => {
        res.render('admin/categories', {category: category})
    }).catch(error => {
        req.flash("error_msg", "Falha ao listar categorias" + error)
        res.redirect("/admin")
    })
});
router.get('/categories/add', eAdmin, (req, res) => {
    res.render('admin/addcategories')
});
router.post('/categories/new', eAdmin, (req, res) => {

    const errors = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        errors.push({text: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        errors.push({text: "Slug inválido!"})
    }
    if(req.body.name.length < 3){
        errors.push({text: "Nome da categoria muito pequeno"})
    }

    if(errors.length > 0){
        res.render("admin/addcategories", {errors: errors})
    } else{
        const newCategory = {
            // fazem referência ao campo name="" do input
            name: req.body.name,
            slug: req.body.slug
        }
    
        new Category(newCategory).save()
        .then(() => {
            req.flash("success_msg", "Categoria criada com Sucesso!")
            res.redirect("/admin/categories")
        }).catch((error) => {
            req.flash("error_msg", "Erro ao cadastrar categoria: " + error)
            res.redirect('/admin')
        });
    }
});

router.get('/categories/edit/:id', eAdmin, (req, res) => {
    Category.findOne({_id: req.params.id}).lean()
    .then((category) => {
        res.render("admin/editcategories", {category})
    }).catch(error => {
        req.flash("error_msg", "Erro ao encontrar categoria: " + error)
        res.redirect("/admin/categories")
    })
});

router.post('/categories/edit', eAdmin, (req, res) => {
    Category.findOne({_id: req.body.id})
    .then(category => {
        const errors = [];

        if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
            errors.push({text: "Nome não declarado."})
        }
        if(req.body.name.length < 3){
            errors.push({text: "Adicione mais caracteres ao nome."})
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            errors.push({text: "Slug não declarado."})
        }
        if(req.body.slug.length < 3){
            errors.push({text: "Adicione mais caracteres ao slug."})
        }
        if(req.body.name == category.name && req.body.slug == category.slug){
            errors.push({text: ""})
            req.flash("error_msg", errorsValidation)
            res.redirect('/admin/categories/edit/' + category._id);
        }
        
        if(errors.length > 0){
            const errorsValidation = errors.map(error => {
                return error.text
            }).join(" ");

            req.flash("error_msg", errorsValidation)
            res.redirect('/admin/categories/edit/' + category._id);
        } else{
            category.name = req.body.name;
            category.slug = req.body.slug;
    
            category.save()
            .then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categories")
            })
            .catch(error => {
                req.flash("error_msg", "Não foi possível salvar as alterações: " + error)
                res.redirect("/admin/categories")
            });
        };

    }).catch(error => {
        req.flash("error_msg", "Houve um erro ao editar categoria: " + error)
        res.redirect("/admin/categories")
    });
});

router.post('/categories/delete', eAdmin, (req, res) => {
    Category.deleteOne({_id: req.body.id})
    .then(() => {
        req.flash("success_msg", "Categoria removida com sucesso!");
        res.redirect("/admin/categories")
    }).catch(error => {
        req.flash("error_msg", "Não foi possível remover a categoria: " + error);
        res.redirect("/admin/categories");
    })
})


    // Posts
    router.get("/posts", eAdmin, (req, res) => {
        Posts.find().lean().populate({path: 'category', strictPopulate: false}).sort({data: "desc"})
        .then((posts) => {
            res.render('admin/posts', {posts})
        }).catch(error => {
            req.flash("error_msg", "Ocoreu um erro: " + error)
            res.redirect('/admin')
        })
    });

    router.get("/posts/add", eAdmin, (req, res) => {
        Category.find().lean().then(categories => {
            res.render("admin/addposts", {categories})
        }).catch(error => {
            req.flash("error_msg", "Houve um erro ao carregar o formulário: " + error)
            res.redirect("/posts")
        })
    })

    router.post("/posts/new", eAdmin, (req, res) => {
        const errors = [];

        if(!req.body.title || typeof req.body.title == undefined || req.body.title == null){
            errors.push({text: "É preciso preencher o título da postagem"})
        }

        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            errors.push({text: "É preciso preencher o slug da postagem"})
        }

        if(!req.body.description || typeof req.body.description == undefined || req.body.description == null){
            errors.push({text: "É preciso preencher a descrição da postagem"})
        }

        if(!req.body.content || typeof req.body.content == undefined || req.body.content == null){
            errors.push({text: "É preciso preencher o conteúdo da postagem"})
        }

        if(req.body.category == 0){
            errors.push({text: "Categoria inválida, registre pelo menos uma categoria para poder continuar"})
        }

        if(errors.length > 0){
            res.render("admin/addposts", {errors})
        } else{
            const newPost = {
                title: req.body.title,
                description: req.body.description,
                content: req.body.content,
                category: req.body.category,
                slug: req.body.slug,
            }

            new Posts(newPost).save().then(() => {
                req.flash("success_msg", "Postagem criada com sucesso!")
                res.redirect("/admin/posts")
            }).catch(error => {
                req.flash("error_msg", "Não foi possível salvar a postagem: " + error)
                res.redirect("/admin/posts")
            })
        }
    })

    router.get("/posts/edit/:id", eAdmin, (req, res) => {
        Posts.findOne({_id: req.params.id}).populate({path: 'category', strictPopulate: false}).lean()
        .then(post => {
            Category.find().lean().then(categories => {
                res.render("admin/editposts", {post, categories})
            }).catch(error => {
                req.flash("error_msg", "Houve um erro ao carregar o formulário: " + error)
                res.redirect("/admin/posts")
            })
        }).catch(error => {
            req.flash("error_msg", "Houve um erro ao carregar o formulário de edição: " + error)
            res.redirect("/admin/posts")
        })
    })

    router.post("/posts/edit/updatepost", eAdmin, (req, res) => {
        Posts.findOne({_id: req.body.id})
        .then(post => {
            post.title = req.body.title;
            post.slug = req.body.slug;
            post.content = req.body.content;
            post.description = req.body.description;
            post.category = req.body.category;

            post.save()
            .then(() => {
                req.flash("success_msg", "Postagem editada com sucesso!")
                res.redirect("/admin/posts")
            })
            .catch(error => {
                req.flash("error_msg", "Não foi possível salvar as alterações: " + error)
                res.redirect("/admin/posts")
            });
        }).catch(error => {
            req.flash("error_msg", "Não foi possível localizar a postagem: " + error)
            res.redirect("/admin/posts")
        })
    })

    router.post("/posts/remove", eAdmin, (req, res) => {
        Posts.deleteOne({_id: req.body.id}).then(() => {
            req.flash("success_msg", "Postagem removida com sucesso!")
            res.redirect("/admin/posts");
        }).catch(error => {
            req.flash("error_msg", "Não foi possível remover a postagem: " + error)
            res.redirect("/admin/posts")
        })
    })

module.exports = router;