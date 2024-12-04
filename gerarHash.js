const bcrypt = require('bcrypt');

// Função para gerar o hash
const gerarHash = async () => {
    const senha = "456"; // Senha que será transformada em hash
    const hash = await bcrypt.hash(senha, 10); // Gerar o hash com fator de custo 10
    console.log("Hash gerado para '456':", hash);
};

// Executar a função
gerarHash();