if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: "mongodb+srv://gersonvideira:g87e89d12$@blogapp-prod.o8gng.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}

