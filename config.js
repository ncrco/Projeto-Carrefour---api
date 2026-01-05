/**
 * Configurações da aplicação de testes
 */
require('dotenv').config();

const config = {
  // URL base da API
  API_BASE_URL: process.env.API_BASE_URL || 'https://serverest.dev',
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000', 10),

  // Endpoints
  ENDPOINTS: {
    login: '/login',
    users: '/usuarios',
    userById: (id) => `/usuarios/${id}`
  },

  // Limites de rate limiting
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60 * 1000, // 60 segundos em milissegundos
};

module.exports = config;

