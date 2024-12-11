const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const Medico = require('../models/medico_model');
const Paciente = require('../models/paciente_model');
const { randomUUID } = require('crypto');

router.post('/registeruser',async(req, res) => {
    
    if(req.body.userType === 'medico'){
        try {   
            let usuario = await Medico.findOne({email: req.body.email});
            if(usuario){
                return res.status(400).json({success: false, message: 'Este email ja esta em uso'})
            }

            usuario = new Medico({
                nome: req.body.nome,
                email: req.body.email,
                senha: req.body.senha,
                crm: req.body.crm,
                endereco: req.body.endereco,
                telefone: req.body.telefone,
                idade: req.body.idade,
                especialidade: req.body.especialidade,
            })

            usuario = await usuario.save()

            if(usuario){
                return res.status(200).json({success: true, message: 'Usuario cadastrado'})
            } else {
                return res.status(400).json({success: false, message: 'Usuario não cadastrado'})
            }
        }catch (err) {
            console.error('Erro ao tentar fazer Registro:', err);
            return res.status(500).json({ error: 'Erro ao tentar fazer Registro.' });
    }} else {
        try {   
            let usuario = await Paciente.findOne({email: req.body.email});
            if(usuario){
                return res.status(400).json({success: false, message: 'Este email ja esta em uso'})
            }

            usuario = new Paciente({
                nome: req.body.nome,
                email: req.body.email,
                senha: req.body.senha,
                endereco: req.body.endereco,
                telefone: req.body.telefone,
                idade: req.body.idade,
            })

            usuario = await usuario.save()

            if(usuario){
                return res.status(200).json({success: true, message: 'Usuario cadastrado'})
            } else {
                return res.status(400).json({success: false, message: 'Usuario não cadastrado'})
            }
        }catch (err) {
            console.error('Erro ao tentar fazer Registro:', err);
            return res.status(500).json({ error: 'Erro ao tentar fazer Registro.' });
        }
    }
})

module.exports = router;