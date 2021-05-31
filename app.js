//! Importando os módulos

const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('./node_modules/body-parser')
const  mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const { get } = require('./routes/admin')
const passport = require('passport')



    //* models
    require('./models/Postagem')
    const Postagem = mongoose.model('postagem')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')
    const usuarios = require('./routes/usuario')
    // const passport = require('passport')
    require('./config/auth')(passport)
    const db = require('./config/db')

//!config

    //* Sessão
        app.use(session({ 
            secret: 'cursodenode', 
            resave: true, 
            saveUninitialized: true
        }))
// esta linha deve ficar sempre por baixo da secção e o flash
        app.use(passport.initialize())
        app.use(passport.session())

        //* Connect-flash
        app.use(flash())  // Deve ser configurada sempre abaixo do session
    //* Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg') 
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
    
            //? Armazenar os dados do usuario logado em uma variável global
            res.locals.user = req.user || null
            next() 
        })
    //* Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    //* Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    //* Mongoose
        mongoose.Promise = global.Promise
        // mongoose.connect('mongodb://localhost/blogapp', {useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex:true}).then(() => {
        mongoose.connect(db.mongoURI,{useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex:true}).then(() => {
            console.log('Conectado ao mongo...')
        }).catch((err) => {
            console.log('Falha na conexão com o mongo: ' +err)
        })
    
    //* Public
        app.use(express.static(path.join(__dirname,'public')))
        // app.set('view', path.join(__dirname, 'views'))
    





//! Routers

        //* Pagina Home
        app.get('/', (req, res) => {
            
            Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
                res.render('index', {postagens: postagens})

            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro na exibição de postagem')
                res.redirect('/404')
                console.log(err)
            })
        })


        //* Pagina de postagem:Slug
        app.use('/postagem/:slug', (req, res) => {
            Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
                
                if(postagem){
                    res.render('postagem/index', {postagem: postagem})
                }else{
                    req.flash('error_msg', 'Esta postagem não existe')
                    res.redirect('/')
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro na pesquisa')
                res.redirect('/')
            })
        })

        //* Pagina lista de categorias

        app.get('/categorias', (req, res) => {
            Categoria.find().lean().then((categorias) => {
                res.render('categorias/index', {categorias: categorias})
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao listar categorias')
                res.redirect('/')

            })

        })
        //* Pagina lista de categorias

        app.get('/categorias/:slug', (req, res) => {
            Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {

                if(categoria){
                    Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                        res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
                    }).catch((err) => {
                        req.flash('error_msg', 'Erro ao listar posts')
                        res.redirect('/')
                    })
                }else{
                    req.flash('error_msg', 'Esta categoria não existe')
                    res.redirect('/')
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao carregar as categorias')
                res.redirect('/')

            })
        })


        //?rota de erro
        app.get('/404', (req, res) => {
            res.send('Erro 404')
        })
        
        app.use('/posts', (req, res) => {
            res.send('Lista de posts')
        })
        
    



        app.use('/admin', admin)
        app.use('/usuarios', usuarios)


//! Outros

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () =>{
        console.log('Servidor ligado...')
    })

// todo: coisas por fazer 
//? Questões
//! Alertas
