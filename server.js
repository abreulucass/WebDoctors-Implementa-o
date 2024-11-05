const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importando o cors

const app = express();
const PORT = 3000;

// Middleware para analisar o corpo da requisição em JSON e habilitar CORS
app.use(cors()); // Habilita CORS
app.use(bodyParser.json());
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/webdoctors', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado ao MongoDB');
}).catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error.message);
});

// Modelo de Consulta
const consultaSchema = new mongoose.Schema({
    nomePaciente: { type: String, required: true },
    nomeMedico: { type: String, required: true },
    data: { type: String, required: true },
    hora: { type: String, required: true },
    motivo: { type: String, required: true },
    status: { type: String, default: 'Agendada' }
});

const Consulta = mongoose.model('Consulta', consultaSchema);

module.exports = Consulta;


// ===================================================================================================================

// Rota para adicionar uma nova consulta
app.post('/marcar-consulta', async (req, res) => {
    try {
        const novaConsulta = new Consulta(req.body);
        await novaConsulta.save();
        res.status(201).send('Consulta marcada com sucesso!');
    } catch (error) {
        console.error('Erro ao marcar consulta:', error.message); // Exibe o erro no console
        res.status(500).send('Erro ao marcar consulta: ' + error.message);
    }
});

// ===================================================================================================================

// Rota para obter todas as consultas
app.get('/consultas', async (req, res) => {
    try {
        const consultas = await Consulta.find();
        res.json(consultas);
    } catch (error) {
        res.status(500).send('Erro ao obter consultas');
    }
});

// ===================================================================================================================

// Rota para atualizar uma consulta específica
app.put('/consultas/:id', async (req, res) => {
    const { id } = req.params;
    const { novaData, novoHorario } = req.body; // Obtém a nova data e hora do corpo da requisição

    try {
        const consultaAtualizada = await Consulta.findByIdAndUpdate(
            id,
            { data: novaData, hora: novoHorario },
            { new: true } // Retorna a consulta atualizada
        );

        if (!consultaAtualizada) {
            return res.status(404).send('Consulta não encontrada');
        }

        res.json(consultaAtualizada);
    } catch (error) {
        res.status(500).send('Erro ao atualizar consulta');
    }
});

// ===================================================================================================================

// Rota para cancelar (deletar) uma consulta específica
app.delete('/consultas/:id', async (req, res) => {
    const { id } = req.params; // Obtém o ID da consulta a ser deletada

    try {
        const consultaDeletada = await Consulta.findByIdAndDelete(id); // Deleta a consulta pelo ID

        if (!consultaDeletada) {
            return res.status(404).send('Consulta não encontrada');
        }

        res.status(204).send(); // Retorna 204 No Content
    } catch (error) {
        console.error('Erro ao cancelar consulta:', error.message);
        res.status(500).send('Erro ao cancelar consulta');
    }
});

// ===================================================================================================================

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});