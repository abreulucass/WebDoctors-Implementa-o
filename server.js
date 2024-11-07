const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const cors = require('cors'); // Importando o cors

const PORT = 3000;

// ====================================================================================================================

//importar o arquivo do bd
const connectDb = require('./bd')
const consultasRoutes = require('./controllers/controller')

// ====================================================================================================================

//app
const app = express();

// ====================================================================================================================

// Middleware para analisar o corpo da requisição em JSON e habilitar CORS
app.use(cors()); // Habilita CORS
app.use(bodyParser.json());
app.use(express.json());

// ====================================================================================================================

//rotas
app.use('/', consultasRoutes)

// ====================================================================================================================

//Habilitar conexao com o DB e o servidor da aplicação
connectDb()
.then(() => {
    console.log('>> Banco de dados conectados com sucesso.')
    app.listen(3000, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`)
    }).on('error', err =>
        console.log("erro ao ligar com o servidor: \n", err))
})
.catch(err => console.log("Não foi possivel conectar ao bd \n", err))


// ===================================================================================================================

app.get('/', (req, res) => {
    res.redirect('/');
});
