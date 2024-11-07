require('dotenv').config()
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const Consulta = require('../models/consulta_model')
const User = require('../models/User')


// Rota para adicionar uma nova consulta
router.post('/marcar-consulta', async (req, res) => {
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
router.get('/consultas', async (req, res) => {
    try {
        const consultas = await Consulta.find();
        res.json(consultas);
    } catch (error) {
        res.status(500).send('Erro ao obter consultas');
    }
});

// ===================================================================================================================

// Rota para atualizar uma consulta específica
router.put('/consultas/:id', async (req, res) => {
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
router.delete('/consultas/:id', async (req, res) => {
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

module.exports = router