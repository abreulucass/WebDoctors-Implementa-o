const mongoose = require('mongoose');

// Modelo de Médico
const medicoSchema = new mongoose.Schema({
    nome: { type: String, required: true },        // Nome do médico
    idade: { type: Number, required: true },       // Idade do médico
    email: { type: String, required: true, unique: true },     // Email do médico
    endereco: { type: String, required: true },    // Endereço do médico
    telefone: { type: String, required: true },    // Telefone do médico
    especialidade: { type: String, required: true }, // Especialidade do médico
    crm: { type: String, required: true },         // CRM do médico
    horariosDisponiveis: [                         // Lista de horários disponíveis
        {
            dataHora: Date,
            status: { type: String, enum: ['disponível', 'reservado', 'indisponível'], default: 'disponível' }
        }
    ],
    senha: { type: String, required: true }  // Adicionando campo de senha
});

module.exports = mongoose.model('Medico', medicoSchema);