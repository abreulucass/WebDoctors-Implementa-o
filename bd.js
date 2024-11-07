const mongoose = require('mongoose');

// Conectar ao MongoDB
const dbUri = 'mongodb://localhost:27017/webdoctors'

module.exports = () => mongoose.connect(dbUri)