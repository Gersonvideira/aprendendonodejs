const mongoose = require('mongoose')
const Schema = mongoose.Schema


const Usuario = new Schema({
    nome:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    eAdmin: {
        type: Number,
        default: 0,
    },
    senha: {
        type: String,
        required: true,
        // select: false,
    },
    criadoEm: {
        type: Date,
        default: Date.now,
    }
})

mongoose.model('usuarios', Usuario)