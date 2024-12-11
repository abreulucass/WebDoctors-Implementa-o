const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importando o cors
const session = require('express-session');

const PORT = 3000;

// ====================================================================================================================

//importar o arquivo do bd
const connectDb = require('./bd')

const loginRoutes = require('./controllers/controller_login'); // Rotas de login
const medicosRoutes = require('./controllers/controller_medico'); // Rotas de médicos
const consultasRoutes = require('./controllers/controller_paciente');
const registerRoutes = require('./controllers/controller_register');
// ====================================================================================================================

//app
const app = express();

// Configuração de sessões
app.use(session({
    secret: 'suaChaveSecreta', // Substitua por uma chave segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Alterar para `true` se usar HTTPS
}));

// ====================================================================================================================

// Middleware para analisar o corpo da requisição em JSON e habilitar CORS
app.use(cors()); // Habilita CORS
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ====================================================================================================================

// Servir os arquivos estáticos da página de login
app.use('/login-assets', express.static(path.join(__dirname, 'assets', 'login', 'Login_v1')));

// Servir os arquivos estáticos da pasta 'menu'
app.use('/menu', express.static(path.join(__dirname, 'assets', 'menu')));

// Configurar a pasta "views" como estática
app.use(express.static(path.join(__dirname, 'views')));  // Certifique-se de que as views estão sendo servidas corretamente

//rotas
app.use('/', consultasRoutes)
app.use('/medicos', medicosRoutes); // Rotas de médicos (subrota para gerenciar horários)
app.use('/', loginRoutes);
app.use('/', registerRoutes);


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
    res.sendFile(path.join(__dirname, 'assets', 'login', 'Login_v1', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});