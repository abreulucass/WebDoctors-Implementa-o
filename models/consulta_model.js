const mongoose = require('mongoose');

// Subdocumento de Receita
const receitaSchema = new mongoose.Schema({
  medicamentos: [
    {
      nome: { type: String, required: true },
      dosagem: { type: String, required: true },
      instrucoes: { type: String, required: true },
    },
  ],
  observacoes: { type: String },
  criadoEm: { type: Date, default: Date.now },
});

// Esquema de Consulta
const consultaSchema = new mongoose.Schema({
  nomePaciente: { type: String, required: true },
  nomeMedico: { type: String, required: true },
  data: { type: String, required: true },
  hora: { type: String, required: true },
  motivo: { type: String, required: true },
  status: { type: String, default: 'Agendada' },
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' },
  medicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medico' },
  receita: receitaSchema, // Adicionando o subdocumento de receita
  exame: { type: String, default: null } // Caminho do arquivo de exame
});

module.exports = mongoose.model('Consulta', consultaSchema);