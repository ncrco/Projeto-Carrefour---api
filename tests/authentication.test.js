/**
 * Testes de autenticação JWT
 */
const APIClient = require('../utils/apiClient');

describe('Autenticação', () => {
  let apiClient;

  beforeEach(() => {
    apiClient = new APIClient();
  });

  afterEach(() => {
    apiClient.resetToken();
  });

  test('Deve autenticar com credenciais válidas', async () => {
    const email = 'fulano@qa.com';
    const password = 'teste';

    const response = await apiClient.authenticate(email, password);

    expect(response).toBeDefined();
    expect(apiClient.token).toBeDefined();
    expect(apiClient.token).toBeTruthy();
  });

  test('Deve falhar autenticação com credenciais inválidas', async () => {
    const email = 'invalid@example.com';
    const password = 'wrongpassword';

    await expect(apiClient.authenticate(email, password)).rejects.toThrow();
  });

  test('Deve falhar autenticação com email vazio', async () => {
    const email = '';
    const password = 'teste';

    await expect(apiClient.authenticate(email, password)).rejects.toThrow();
  });

  test('Deve falhar autenticação com senha vazia', async () => {
    const email = 'fulano@qa.com';
    const password = '';

    await expect(apiClient.authenticate(email, password)).rejects.toThrow();
  });

  test('Deve persistir token após autenticação', async () => {
    const email = 'fulano@qa.com';
    const password = 'teste';

    await apiClient.authenticate(email, password);
    const initialToken = apiClient.token;

    // Faz uma requisição que requer autenticação
    try {
      await apiClient.getUsers();
      expect(apiClient.token).toBe(initialToken);
    } catch (error) {
      // Pode falhar se não houver usuários, mas o token deve persistir
      expect(apiClient.token).toBe(initialToken);
    }
  });

  test('Deve resetar token corretamente', async () => {
    const email = 'fulano@qa.com';
    const password = 'teste';

    await apiClient.authenticate(email, password);
    expect(apiClient.token).toBeTruthy();

    apiClient.resetToken();
    expect(apiClient.token).toBeNull();
  });
});

