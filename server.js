const express = require('express');
const session = require('express-session');
const path = require('path')
const bodyParser = require('body-parser');
const cors = require('cors'); // Importando o cors

const PORT = 3000;

// ====================================================================================================================

//importar o arquivo do bd
const connectDb = require('./bd')
const consultasRoutes = require('./controllers/controller');

const User = require('./models/User');
const { emit } = require('process');

// ====================================================================================================================
//app
const app = express();

app.use(session({secret:'adna3dniuar35nfis432dfinaas'}))
app.use(bodyParser.urlencoded({extended:true}))

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

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/assets', express.static(path.join(__dirname, 'assets')));


// ===================================================================================================================

app.post('/', async (req, res) => { 
    
    const email = req.body.email;
    const password = req.body.pass;

     // check if user exists
    const user = await User.findOne({email: email})

    if(!user){
        return res.send('<script>alert("Usuário não encontrado"); window.location.href="/";</script>');
    }

    if(password != user.password){
        return res.send('<script>alert("Senha invalida"); window.location.href="/";</script>');
    }

    return res.render('index')

});

app.get('/', (req, res) => {
    if(req.session.login){
        res.render('index')
    }else{
        res.render('login')
    }
});

