const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Biblioteca para hashing da senha

// Modelo de Paciente
const pacienteSchema = new mongoose.Schema({
    nome: { type: String, required: true },        // Nome do paciente
    idade: { type: Number, required: true },       // Idade do paciente
    email: { type: String, required: true, unique: true },     // Email do paciente    
    endereco: { type: String, required: true },    // Endereço do paciente
    telefone: { type: String, required: true },    // Telefone do paciente
    senha: { type: String, required: true },  // Adicionando campo de senha  
    consultas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consulta'
    }]  // Referência para as consultas que o paciente marcou
});

module.exports = mongoose.model('Paciente', pacienteSchema);