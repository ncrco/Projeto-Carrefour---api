/**
 * Cliente HTTP para interagir com a API
 */
const axios = require('axios');
const config = require('../config');

class APIClient {
  /**
   * Cria uma instância do cliente da API
   * @param {string} baseUrl - URL base da API
   * @param {number} timeout - Timeout das requisições em ms
   */
  constructor(baseUrl = config.API_BASE_URL, timeout = config.API_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.token = null;
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.rateLimitWindowStart = Date.now();

    // Cria instância do axios com configurações padrão
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Controla o rate limiting (100 requisições por minuto)
   */
  async _handleRateLimit() {
    const currentTime = Date.now();

    // Reset contador se passou 1 minuto
    if (currentTime - this.rateLimitWindowStart >= config.RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.rateLimitWindowStart = currentTime;
    }

    // Se atingiu o limite, espera até o próximo minuto
    if (this.requestCount >= config.RATE_LIMIT_REQUESTS) {
      const sleepTime = config.RATE_LIMIT_WINDOW - (currentTime - this.rateLimitWindowStart);
      if (sleepTime > 0) {
        await new Promise(resolve => setTimeout(resolve, sleepTime));
        this.requestCount = 0;
        this.rateLimitWindowStart = Date.now();
      }
    }

    this.requestCount++;
  }

  /**
   * Retorna os headers para as requisições
   * @param {boolean} includeAuth - Se deve incluir token de autenticação
   * @returns {Object} Headers da requisição
   */
  _getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Autentica na API e obtém o token JWT
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Resposta da API com o token
   */
  async authenticate(email, password) {
    await this._handleRateLimit();

    const url = `${this.baseUrl}${config.ENDPOINTS.login}`;
    const payload = {
      email,
      password
    };

    try {
      const response = await axios.post(url, payload, {
        headers: this._getHeaders(false),
        timeout: this.timeout
      });

      if (response.data.authorization) {
        this.token = response.data.authorization;
      }

      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Retorna lista de todos os usuários
   * @returns {Promise<Object>} Resposta da API com lista de usuários
   */
  async getUsers() {
    await this._handleRateLimit();

    const url = `${this.baseUrl}${config.ENDPOINTS.users}`;
    
    try {
      const response = await this.client.get(url, {
        headers: this._getHeaders()
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Retorna detalhes de um usuário específico
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resposta da API com detalhes do usuário
   */
  async getUser(userId) {
    await this._handleRateLimit();

    const url = `${this.baseUrl}${config.ENDPOINTS.userById(userId)}`;
    
    try {
      const response = await this.client.get(url, {
        headers: this._getHeaders()
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Cria um novo usuário
   * @param {string} nome - Nome do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {string} administrador - "true" ou "false"
   * @returns {Promise<Object>} Resposta da API com dados do usuário criado
   */
  async createUser(nome, email, password, administrador) {
    await this._handleRateLimit();

    const url = `${this.baseUrl}${config.ENDPOINTS.users}`;
    const payload = {
      nome,
      email,
      password,
      administrador
    };

    try {
      const response = await this.client.post(url, payload, {
        headers: this._getHeaders()
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Atualiza informações de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} updates - Objeto com campos a atualizar
   * @returns {Promise<Object>} Resposta da API com dados atualizados
   */
  async updateUser(userId, updates = {}) {
    await this._handleRateLimit();

    const url = `${this.baseUrl}${config.ENDPOINTS.userById(userId)}`;
    
    try {
      const response = await this.client.put(url, updates, {
        headers: this._getHeaders()
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Exclui um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resposta da API
   */
  async deleteUser(userId) {
    await this._handleRateLimit();

    const url = `${this.baseUrl}${config.ENDPOINTS.userById(userId)}`;
    
    try {
      const response = await this.client.delete(url, {
        headers: this._getHeaders()
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Reseta o token de autenticação
   */
  resetToken() {
    this.token = null;
  }

  /**
   * Trata erros das requisições
   * @param {Error} error - Erro da requisição
   * @returns {Error} Erro tratado
   */
  _handleError(error) {
    if (error.response) {
      // Erro com resposta do servidor
      const message = error.response.data?.message || error.response.statusText;
      const status = error.response.status;
      const errorObj = new Error(message);
      errorObj.status = status;
      errorObj.data = error.response.data;
      return errorObj;
    } else if (error.request) {
      // Erro de requisição (sem resposta)
      const errorObj = new Error('Erro de conexão com a API');
      errorObj.request = error.request;
      return errorObj;
    } else {
      // Outro tipo de erro
      return error;
    }
  }
}

module.exports = APIClient;

