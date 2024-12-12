const express = require('express');
const mongoose = require('mongoose'); // Importa o Mongoose
const moment = require('moment');  // Importa o Moment para validação de data e hora
const router = express.Router();

const Consulta = require('../models/consulta_model');
const Medico = require('../models/medico_model');
const Paciente = require('../models/paciente_model');

// Rota para carregar todas as especialidades
router.get('/especialidades', async (req, res) => {
    try {
        // Busca todas as especialidades dos médicos, sem duplicatas
        const especialidades = await Medico.distinct('especialidade');
        res.json(especialidades);
    } catch (error) {
        console.error('Erro ao carregar especialidades:', error);
        res.status(500).send('Erro ao carregar especialidades');
    }
});

// Rota para buscar médicos por especialidade
router.get('/medicos', async (req, res) => {
    const { especialidadeId } = req.query; // O parâmetro correto aqui é 'especialidadeId'

    try {
        // Verifique se a especialidadeId foi passada corretamente
        if (!especialidadeId) {
            return res.status(400).send('Especialidade não fornecida');
        }

        // Buscando médicos pela especialidadeId
        const medicos = await Medico.find({ especialidade: especialidadeId });

        res.json(medicos);
    } catch (error) {
        console.error('Erro ao buscar médicos:', error);
        res.status(500).send('Erro ao buscar médicos');
    }
});

// Rota para buscar horários disponíveis de um médico
router.get('/horarios', async (req, res) => {
    const { medicoId } = req.query;

    try {
        if (!medicoId) {
            return res.status(400).send('ID do médico não fornecido');
        }

        // Busca o médico pelo ID
        const medico = await Medico.findById(medicoId);
        if (!medico) {
            return res.status(404).send('Médico não encontrado');
        }

        // Filtra apenas horários com status "disponível"
        const horariosDisponiveis = medico.horariosDisponiveis.filter(h => h.status === 'disponível');

        res.status(200).json(horariosDisponiveis);

    } catch (error) {
        console.error('Erro ao buscar horários:', error);
        res.status(500).send('Erro ao buscar horários');
    }
});

// ===========================================================================================================

// Rota para obter consultas do médico autenticado
router.get('/consultas/medico/:id', async (req, res) => {
    try {
        const medicoId = req.params.id; // Obtém o ID do médico
        console.log("ID do médico recebido:", medicoId); // Log do ID

        if (!medicoId) {
            return res.status(400).json({ error: 'ID do médico não fornecido.' });
        }

        // Busca as consultas no banco de dados associadas ao médico
        const consultas = await Consulta.find({ medicoId }).select(
            'nomePaciente data hora motivo status'
        );
        console.log("Consultas encontradas:", consultas); // Log das consultas

        if (!consultas || consultas.length === 0) {
            return res.status(404).json({ error: 'Nenhuma consulta encontrada.' });
        }

        res.status(200).json(consultas);
    } catch (error) {
        console.error("Erro ao buscar consultas:", error);
        res.status(500).json({ error: 'Erro ao buscar consultas.' });
    }
});

// ===========================================================================================================

router.post('/receitas', async (req, res) => {
    console.log('ENTROU NO POST');
    const { consultaId, medicamentos, observacoes } = req.body;

    // Validação dos dados obrigatórios
    if (!consultaId || !medicamentos) {
        return res.status(400).json({ message: 'Consulta ID e medicamentos são obrigatórios.' });
    }
    console.log('PASSOU DO IF DE POST');

    try {
        // Localiza a consulta associada
        const consulta = await Consulta.findById(consultaId);

        if (!consulta) {
            return res.status(404).json({ message: 'Consulta não encontrada.' });
        }

        // Atualiza a consulta com a receita fornecida
        consulta.receita = { medicamentos, observacoes };

        // Salva a consulta com a nova receita
        await consulta.save();

        res.status(200).json({ message: 'Receita adicionada com sucesso!', consulta });
    } catch (error) {
        console.error('Erro ao adicionar receita:', error);
        res.status(500).json({ message: 'Erro ao adicionar receita.' });
    }
});

// ===========================================================================================================

// Rota para adicionar horário disponível para o médico logado
router.post('/adicionar-horario', async (req, res) => {
    console.log("ENTROU NO POST");
    const { data, hora, medicoId } = req.body;

    console.log("Datahora", data, hora);

    // Verifica se todos os campos foram enviados
    if (!data || !hora || !medicoId) {
        return res.status(400).json({ message: 'Dados incompletos. Envie data, hora e ID do médico.' });
    }
    console.log("PASSOU DO PRIMEIRO IF");

    // Validação de formato de data e hora
    if (!moment(data, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Data no formato inválido.' });
    }
    console.log("PASSOU DO SEGUNDO IF");

    if (!moment(hora, 'HH:mm', true).isValid()) {
        return res.status(400).json({ message: 'Hora no formato inválido.' });
    }
    console.log("PASSOU DO TERCEIRO IF");

    try {
        console.log("ENTROU NO TRY");
        const medico = await Medico.findById(medicoId);
        console.log("ID do médico recebido:", medicoId); // Debug do ID do médico

        if (!medico) {
            return res.status(404).json({ message: 'Médico não encontrado.' });
        }
        console.log("PASSOU DO IF if (!medico)");

        const dataHora = moment(`${data} ${hora}`, 'YYYY-MM-DD HH:mm').toDate();

        // Verifica se o horário já existe
        const horarioExistente = medico.horariosDisponiveis.some(h =>
            moment(h.dataHora).isSame(dataHora)
        );

        if (horarioExistente) {
            console.warn('Horário já disponível:', dataHora);
            return res.status(400).json({ message: 'Este horário já está disponível.' });
        }

        // Adiciona o novo horário ao array `horariosDisponiveis`
        medico.horariosDisponiveis.push({
            dataHora,
            status: 'disponível'
        });

        // Salva as alterações
        await medico.save();

        console.log('Horário adicionado com sucesso:', dataHora);

        res.status(201).json({ message: 'Horário disponível adicionado com sucesso!' });
    } catch (error) {
        console.error('Erro ao adicionar horário:', error);
        res.status(500).json({ message: 'Erro ao adicionar horário.' });
    }
});

// ===========================================================================================================================

// Rota para atualizar uma consulta específica
router.put('/consultas/remarcar/:consultaId', async (req, res) => {
    const { consultaId } = req.params;
    const { novoHorario } = req.body; // O horário enviado pelo frontend

    console.log(`Recebendo solicitação para remarcar consulta. ID: ${consultaId}, Novo Horário: ${novoHorario}`);

    try {
        // Localiza a consulta existente
        const consulta = await Consulta.findById(consultaId);
        console.log('Consulta obtida:', consulta);
        if (!consulta) {
            console.error('Consulta não encontrada.');
            return res.status(404).send('Consulta não encontrada.');
        }

        const medicoId = consulta.medicoId;
        console.log('Médico associado à consulta:', medicoId);

        // Atualiza o horário da consulta com o novo horário
        consulta.dataHora = new Date(novoHorario); // Converte o horário enviado para um objeto Date
        await consulta.save();

        res.status(200).send('Consulta remarcada com sucesso.');
    } catch (error) {
        console.error('Erro ao remarcar consulta:', error);
        res.status(500).send('Erro ao remarcar consulta.');
    }
});

// ===========================================================================================================================

// Rota para remover horário disponível
router.delete('/remover-horario', async (req, res) => {
    const { medicoId, data, hora } = req.body;

    console.log("Recebendo dados para remover horário:", { medicoId, data, hora });

    // Verifica se todos os campos foram enviados
    if (!medicoId || !data || !hora) {
        console.error('Dados incompletos. Envie o ID do médico, data e hora.');
        return res.status(400).json({ message: 'Dados incompletos. Envie o ID do médico, data e hora.' });
    }
    console.log("PASSOU DO IF");

    // Validação de formato de data
    if (!moment(data, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Data no formato inválido.' });
    }
    console.log("PASSOU DO IF DE DATA");

    // Validação de formato de hora
    if (!moment(hora, 'HH:mm', true).isValid()) {
        console.error('Hora no formato inválido:', hora);
        return res.status(400).json({ message: 'Hora no formato inválido.' });
    }

    // Converte a hora para o formato UTC antes de comparar com a dataHora no banco
    const dataHora = moment(`${data} ${hora}`, 'YYYY-MM-DD HH:mm').utc().toDate();

    try {
        const medico = await Medico.findById(medicoId);
        console.log("Médico encontrado:", medico);

        if (!medico) {
            console.error('Médico não encontrado para o ID fornecido:', medicoId);
            return res.status(404).json({ message: 'Médico não encontrado.' });
        }

        // Verifica se o horário existe e está com status "disponível"
        const horarioIndex = medico.horariosDisponiveis.findIndex(h =>
            moment(h.dataHora).isSame(dataHora) && h.status === 'disponível'
        );

        if (horarioIndex === -1) {
            console.warn('Horário não encontrado ou não está disponível:', dataHora);
            return res.status(400).json({ message: 'Horário não encontrado ou já reservado.' });
        }

        // Remove o horário do array
        medico.horariosDisponiveis.splice(horarioIndex, 1);

        // Salva as alterações no banco
        await medico.save();

        console.log('Horário removido com sucesso:', dataHora);
        res.status(200).json({ message: 'Horário removido com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover horário:', error);
        res.status(500).json({ message: 'Erro ao remover horário.' });
    }
});

module.exports = router;