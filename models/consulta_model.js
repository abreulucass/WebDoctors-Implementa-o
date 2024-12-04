const mongoose = require('mongoose');

const consultaSchema = new mongoose.Schema({
  nomePaciente: { type: String, required: true },
  nomeMedico: { type: String, required: true },
  data: { type: String, required: true },
  hora: { type: String, required: true },
  motivo: { type: String, required: true },
  status: { type: String, default: 'Agendada' },
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' },
  medicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medico' },
});

module.exports = mongoose.model('Consulta', consultaSchema);