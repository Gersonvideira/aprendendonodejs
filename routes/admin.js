const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')


//* Importar o models
    require('../models/Categoria')
    require('../models/Postagem')
    const Categoria = mongoose.model('categorias')         //  Esta função para referência do models para uma variável [Categoria]
    const Postagem = mongoose.model('postagem')
    const {eAdmin} = require('../helpers/eAdmin')




router.get('/', eAdmin, (req, res) => { res.render('admin/index')})
router.get('/posts', eAdmin, (req, res) => { res.send('Paginas de posts')})
router.get('/categorias', eAdmin,  (req, res) => {
    // await e async
    Categoria.find().lean().sort({date: 'desc'}).lean().then((categorias) =>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias')
        res.redirect('/admin')

        
    })
})

router.get('/categorias/add', eAdmin,  (req, res) => { res.render('admin/addcategorias')})
router.post('/categorias/nova', eAdmin,  (req, res) => {

    // Recebe os dados do formulário
    

        var erros = []
        const nomeInvalido = !req.body.nome || typeof req.body.nome  == undefined || req.body.nome == null || req.body.nome.length < 4
        const slugInvalido = !req.body.slug || typeof req.body.slug == undefined || req.body.slug == null || req.body.slug.length < 4
        
        
        if(nomeInvalido){
            erros.push({texto: 'Nome invalido!'})
        }
        if(slugInvalido){
            erros.push({texto: 'Slug invalido!'})
        }
        // if(req.body.nome.length <= 2){
        //     erros.push({texto: 'Por Favor verifica o nome!'})
        // }
        // if(req.body.slug.length <= 2){
        //     erros.push({texto: 'Por Favor verifica o slug!'})
        // }
        if(erros.length > 0){
            res.render('admin/addcategorias', {erros: erros})
        }else{

                const novaCategoria = {
                    nome: req.body.nome,
                    slug: req.body.slug
                }

                new Categoria(novaCategoria).save().then(() => {
                    req.flash('success_msg', 'Foi adicionada uma nova categoria!')
                    res.redirect('/admin/categorias')
                    // console.log('Foi adicionada uma nova categoria!')
                }).catch((err) => {
                    // console.log('Falha ao adicionar uma nova categoria: ' +err)
                    req.flash('error_msg', 'Falha ao adicionar uma nova categoria: ')
                    res.redirect('/admin')
                    
                })

        }

})


// Editar categorias

router.get('/categorias/edit/:id', eAdmin,  (req, res) =>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => { 
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe')
        res.redirect('/admin/categorias')
    })
})

// ?=============Este codigo falha na hora de atualizar============================================
// router.post('/categorias/edit', (req, res) => {                                                
//     Categoria.findOne({_id:req.params.id}).lean().then((categorias) => {                         
//         categorias.nome = req.body.nome                                                        
//         categorias.slug = req.body.slug

//         categoria.save().then(() => {
//             req.flash('success_msg', 'Categoria editada com sucesso')
//             res.redirect('/admin/categorias')
//         }).catch((err) => {
//             req.flash('error_msg', 'Falha ao editar a categoria | Tenta de novo')
//             res.redirect('/admin/categorias')
//         })

//     }).catch((err) => {
//         req.flash('error_msg', 'Houve um erro ao editar a categoria')
//         res.redirect('/admin/categorias')
//     })
// })
//?====================================================================================================



// editar categoria
router.post('/categorias/edit', eAdmin, (req, res) =>{

    let filter =  {
        _id:req.body.id
    }
    let update =  {
        nome:req.body.nome,
        slug: req.body.slug }

    Categoria.findOneAndUpdate(filter,update).lean().then(() => {
        req.flash('success_msg', 'Categoria atualizada com sucesso')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao atualizar a categoria')
        res.redirect('/admin/categorias')
    })

})




// Apagar Categoria

router.post('/categorias/deletar', eAdmin, (req, res) => {

    
        Categoria.remove({_id: req.body.id}).then(() =>{
        req.flash('success_msg', 'Categoriadeletada com sucesso!')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria!')
        res.redirect('/admin/categorias')
    })
})


// Postagem


router.get('/postagens', eAdmin,  (req, res) => {

    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {

        res.render('admin/postagens', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })

})

router.get('/postagens/add', eAdmin,  (req, res) =>{
    Categoria.find().lean().then((categoria) =>{
        res.render('admin/addpostagem', {categoria: categoria}) 
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário')
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', eAdmin,  (req, res) => {

    var erros = []
    // const neNhumaCategoria = req.body.categoria == "0"
    // const errosMaior = erros.length > 0

    if(req.body.categoria == "0"){
        erros.push({texto: 'Nenhuma categoria registada, registe uma categoria!'})
    }

    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else{
        const novaPostagem = { 
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem adicionada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao adicionar a postagem')
            res.redirect('/admin/postagens')
        })
    }
    
})

// Atualizar Postagem

router.get('/postagens/edit/:id', eAdmin,  (req, res) =>{
    
    Postagem.findOne({_id:req.params.id}).lean().then((postagem) => { 
        
        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categoria')
            res.redirect('/admin/postagens')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de atualização')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/edit', eAdmin,  (req, res) => {
    
    Postagem.findByIdAndUpdate({_id:req.body.id}).sort({data: 'desc'}).then((postagem) => {
        
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        // postagem.data = req.body.date   // se esta linha for valida não aparece a data depois da atualização
        
        postagem.save().then(() => {
            
            req.flash('success_msg', 'Postagem atualizada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Erro na atualização da postagem')
            res.redirect('/admin/postagens')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro na edição da postagem ')
        res.redirect('/admin/postagens')
    })
    
})

// Apagar Postagem | forma não e segura

router.get('/postagens/apagar/:id', eAdmin,  (req, res) => {

    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem apagada com sucesso')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao apagar a postagem')
        res.redirect('/admin/postagens')
    })

})













//! exportar o router
module.exports = router