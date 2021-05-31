const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Postagem = new Schema({
    
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,         // relacionamento 
        ref: 'categorias',                  // A tabela com qual estabelece o relacionamento
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('postagem', Postagem)