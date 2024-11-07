const mongoose = require('mongoose')

// Modelo de Consulta
const consultaSchema = new mongoose.Schema({
    nomePaciente: { type: String, required: true },
    nomeMedico: { type: String, required: true },
    data: { type: String, required: true },
    hora: { type: String, required: true },
    motivo: { type: String, required: true },
    status: { type: String, default: 'Agendada' }
});

const Consulta = mongoose.model('consulta', consultaSchema);

module.exports = Consulta;