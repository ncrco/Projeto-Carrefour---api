/**
 * Funções auxiliares para os testes
 */

/**
 * Gera um email aleatório para testes
 * @returns {string} Email aleatório
 */
function generateRandomEmail() {
  const randomString = Math.random().toString(36).substring(2, 10);
  return `teste_${randomString}@example.com`;
}

/**
 * Gera um nome aleatório para testes
 * @returns {string} Nome aleatório
 */
function generateRandomName() {
  const randomString = Math.random().toString(36).substring(2, 12);
  return `Usuario Teste ${randomString}`;
}

/**
 * Gera dados completos de um usuário para testes
 * @returns {Object} Dados do usuário
 */
function generateUserData() {
  return {
    nome: generateRandomName(),
    email: generateRandomEmail(),
    password: 'senha123',
    administrador: 'true'
  };
}

module.exports = {
  generateRandomEmail,
  generateRandomName,
  generateUserData
};

