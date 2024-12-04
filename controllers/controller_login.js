const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');


// Importar os modelos de Paciente e Médico
const Paciente = require('../models/paciente_model');
const Medico = require('../models/medico_model');

router.get('/medico', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index-medico.html'));
});

router.get('/paciente', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index-paciente.html'));
});

// Adicionar endpoint de login
// Rota de login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    console.log('Dados recebidos:', { email, senha }); // LOG 1

    try {
        // Verifique se o email é do paciente
        let usuario = await Paciente.findOne({ email });
        console.log('Paciente encontrado:', usuario); // LOG 2
        if (!usuario) {
            // Se não encontrar no modelo de Paciente, tente no modelo de Médico
            usuario = await Medico.findOne({ email });
            console.log('Médico encontrado:', usuario); // LOG 3
            if (!usuario) {
                console.log('Usuário não encontrado.');
                return res.status(404).json({ error: 'Conta não encontrada' });
            }
        }

        // Comparando a senha se a conta existir com hash para uma maior segurança
        //const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        //console.log('Senha correta:', senhaCorreta); // LOG 4
        //if (!senhaCorreta) {
            //return res.status(400).json({ error: 'Senha incorreta' });
        //}

        // Comparando a senha (não será mais hash, então compararemos diretamente)
        if (senha !== usuario.senha) {
            return res.status(400).json({ error: 'Senha incorreta' });
        }

        // Verificar se o usuário é da coleção de Pacientes ou Médicos
        if (usuario.constructor.modelName === 'Medico') {
            console.log('Redirecionando para a rota do médico');
            return res.status(200).json({
                success: 'Login bem-sucedido',
                redirect: '/medico',
                medicoId: usuario._id, // Adicionar ID do médico
                medicoNome: usuario.nome // Adicionar nome do médico
            });
        } else if (usuario.constructor.modelName === 'Paciente') {
            console.log('Redirecionando para a rota do paciente');
            return res.status(200).json({
                success: 'Login bem-sucedido',
                redirect: '/paciente',
                nome: usuario.nome, // Adicionando o nome do paciente
                id: usuario._id // ID do paciente (ou usuario.id dependendo do esquema)
            });
        }

    } catch (err) {
        console.error('Erro ao tentar fazer login:', err);
        return res.status(500).json({ error: 'Erro ao tentar fazer login.' });
    }
});

router.post('/logout', (req, res) => {
    if (!req.session) {
        return res.status(400).send({ error: 'Nenhuma sessão ativa encontrada.' });
    }

    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao destruir a sessão:', err);
            return res.status(500).send({ error: 'Erro ao encerrar a sessão.' });
        }
        res.clearCookie('connect.sid'); // Remove o cookie da sessão
        res.status(200).send({ success: 'Logout realizado com sucesso.' });
    });
});

module.exports = router;