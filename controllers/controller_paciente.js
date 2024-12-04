const express = require('express');
const router = express.Router();

const Consulta = require('../models/consulta_model');
const Medico = require('../models/medico_model');
const Paciente = require('../models/paciente_model');

// ===================================================================================================================

router.post('/marcar-consulta', async (req, res) => {
    try {
        const { nomePaciente, nomeMedico, data, hora, motivo, status } = req.body;

        // Verifica se o paciente existe
        const paciente = await Paciente.findOne({ nome: nomePaciente });
        if (!paciente) {
            return res.status(404).send('Paciente não encontrado');
        }

        // Verifica se o médico existe
        const medico = await Medico.findOne({ nome: nomeMedico });
        if (!medico) {
            return res.status(404).send('Médico não encontrado');
        }

        // Verifica se o horário está disponível
        const horarioSolicitado = new Date(`${data}T${hora}`).toISOString();
        const horarioDisponivel = medico.horariosDisponiveis.find(h =>
            new Date(h.dataHora).toISOString() === horarioSolicitado
        );
        if (!horarioDisponivel) {
            return res.status(400).send('Horário indisponível');
        }

        // Atualiza o status do horário para "reservado"
        horarioDisponivel.status = 'reservado';
        await medico.save();

        // Salva a consulta na coleção "consultas"
        const novaConsulta = new Consulta({
            nomePaciente,
            nomeMedico,
            data,
            hora,
            motivo,
            status,
            pacienteId: paciente._id,
            medicoId: medico._id,
        });

        await novaConsulta.save();

        res.status(201).send('Consulta marcada com sucesso');
    } catch (error) {
        console.error('Erro ao marcar consulta:', error);
        console.error(error.stack); // Detalhes do erro
        res.status(500).send('Erro interno do servidor');
    }
});

// ===================================================================================================================

// Rota para obter consultas do paciente autenticado
router.get('/consultas/paciente/:id', async (req, res) => {
    try {
        const pacienteId = req.params.id; // Obtém o ID do paciente
        if (!pacienteId) {
            return res.status(400).json({ error: 'ID do paciente não fornecido.' });
        }

        // Busca as consultas no banco de dados pelo ID do paciente
        const consultas = await Consulta.find({ pacienteId }).select(
            'nomeMedico data hora motivo status'
        );

        // Se consultas estiver vazio ou não for encontrado
        if (!consultas || consultas.length === 0) {
            return res.status(404).json({ error: 'Nenhuma consulta encontrada.' });
        }

        console.log("Consultas encontradas:", consultas);  // Verifique as consultas no servidor
        res.status(200).json(consultas);  // Retorna as consultas ao frontend
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar consultas.' });
    }
});

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

// ===================================================================================================================

// Rota para buscar dados de uma consulta específica
router.get('/consultas/:consultaId', async (req, res) => {
    const { consultaId } = req.params;

    try {
        const consulta = await Consulta.findById(consultaId).populate('medicoId', 'especialidade');
        if (!consulta) {
            return res.status(404).send('Consulta não encontrada.');
        }

        res.status(200).json(consulta); // Retorna os dados da consulta
    } catch (error) {
        console.error('Erro ao buscar consulta:', error);
        res.status(500).send('Erro ao buscar consulta.');
    }
});

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

        // Localiza o médico para verificar os horários disponíveis
        const medico = await Medico.findById(medicoId);
        if (!medico) {
            console.error('Médico não encontrado.');
            return res.status(404).send('Médico não encontrado.');
        }

        // Convertendo novoHorario para data e hora corretas
        const novoHorarioDate = new Date(novoHorario); // Fazendo a conversão para um objeto Date

        // Verifica se o novo horário está disponível
        const horarioDisponivel = medico.horariosDisponiveis.find(h => new Date(h.dataHora).toISOString() === novoHorarioDate.toISOString() && h.status === 'disponível');

        console.log('Resultado da busca por horário disponível:', horarioDisponivel);

        if (!horarioDisponivel) {
            console.error('Horário não disponível.');
            return res.status(400).send('Horário não disponível.');
        }

        // Libera o horário antigo
        const antigoHorario = new Date(`${consulta.data}T${consulta.hora}`);
        console.log('Horário antigo a ser liberado:', antigoHorario);

        // Atualiza o status do horário antigo para "disponível"
        const horarioAntigo = medico.horariosDisponiveis.find(h => new Date(h.dataHora).toISOString() === antigoHorario.toISOString());
        if (horarioAntigo) {
            horarioAntigo.status = 'disponível';
        }

        // Atualiza o status do novo horário para "reservado"
        horarioDisponivel.status = 'reservado';

        // Salva as atualizações no modelo do médico
        await medico.save();

        // Atualiza a consulta com o novo horário
        consulta.data = novoHorarioDate.toISOString().split('T')[0]; // Atualiza a data no formato correto
        consulta.hora = novoHorarioDate.toISOString().split('T')[1]; // Atualiza a hora no formato correto
        console.log('Consulta após atualização:', consulta);
        await consulta.save();

        console.log('Novo horário reservado.');

        res.status(200).send('Consulta remarcada com sucesso.');
    } catch (error) {
        console.error('Erro ao remarcar consulta:', error.message);
        res.status(500).send('Erro ao remarcar consulta.');
    }
});

// ===================================================================================================================

// Rota para cancelar (deletar) uma consulta específica
router.delete('/consultas/:id', async (req, res) => {
    const { id } = req.params; // ID da consulta

    try {
        // Localizar a consulta a ser deletada
        const consulta = await Consulta.findById(id);

        if (!consulta) {
            return res.status(404).send('Consulta não encontrada');
        }

        // Remover a consulta
        await Consulta.findByIdAndDelete(id);

        // Atualizar o status do horário do médico
        await Medico.updateOne(
            { _id: consulta.medicoId, "horariosDisponiveis.dataHora": new Date(`${consulta.data}T${consulta.hora}`) },
            { $set: { "horariosDisponiveis.$.status": "disponível" } }
        );

        res.status(200).send('Consulta cancelada e horário atualizado');
    } catch (error) {
        console.error('Erro ao cancelar consulta:', error.message);
        res.status(500).send('Erro ao cancelar consulta');
    }
});

module.exports = router;