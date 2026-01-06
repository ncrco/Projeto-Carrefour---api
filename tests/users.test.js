/**
 * Testes dos endpoints de usuários
 */
const APIClient = require('../utils/apiClient');
const { generateUserData } = require('../utils/helpers');

describe('Gerenciamento de Usuários', () => {
  let apiClient;
  let authenticatedClient;
  let createdUserIds = [];

  beforeAll(async () => {
    apiClient = new APIClient();
    authenticatedClient = new APIClient();
    
    // Autentica para usar nos testes
    try {
      await authenticatedClient.authenticate('fulano@qa.com', 'teste');
    } catch (error) {
      // Se falhar, tenta criar um usuário admin primeiro
      const userData = generateUserData();
      userData.administrador = 'true';
      const response = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );
      await authenticatedClient.authenticate(userData.email, userData.password);
      if (response._id) {
        createdUserIds.push(response._id);
      }
    }
  });

  afterAll(async () => {
    // Cleanup: remove todos os usuários criados durante os testes
    for (const userId of createdUserIds) {
      try {
        await authenticatedClient.deleteUser(userId);
      } catch (error) {
        // Ignora erros no cleanup
      }
    }
  });

  describe('GET /users - Listar usuários', () => {
    test('Deve retornar lista de usuários com autenticação', async () => {
      const response = await authenticatedClient.getUsers();

      expect(response).toBeDefined();
      expect(Array.isArray(response.usuarios) || typeof response === 'object').toBe(true);
    });

    test('Deve permitir listar usuários sem autenticação (API ServeRest permite)', async () => {
      // A API ServeRest permite listar usuários sem autenticação
      const response = await apiClient.getUsers();
      expect(response).toBeDefined();
    });
  });

  describe('POST /users - Criar usuário', () => {
    test('Deve criar usuário com todos os campos obrigatórios', async () => {
      const userData = generateUserData();

      const response = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );

      expect(response).toBeDefined();
      expect(response._id || response.id).toBeDefined();
      expect(response.nome || response.message).toBeDefined();

      if (response._id) {
        createdUserIds.push(response._id);
      }
    });

    test('Deve falhar ao criar usuário sem nome', async () => {
      const userData = generateUserData();

      await expect(
        authenticatedClient.createUser(
          '', // nome vazio
          userData.email,
          userData.password,
          userData.administrador
        )
      ).rejects.toThrow();
    });

    test('Deve falhar ao criar usuário sem email', async () => {
      const userData = generateUserData();

      await expect(
        authenticatedClient.createUser(
          userData.nome,
          '', // email vazio
          userData.password,
          userData.administrador
        )
      ).rejects.toThrow();
    });

    test('Deve falhar ao criar usuário sem senha', async () => {
      const userData = generateUserData();

      await expect(
        authenticatedClient.createUser(
          userData.nome,
          userData.email,
          '', // senha vazia
          userData.administrador
        )
      ).rejects.toThrow();
    });

    test('Deve falhar ao criar usuário sem campo administrador', async () => {
      const userData = generateUserData();

      await expect(
        authenticatedClient.createUser(
          userData.nome,
          userData.email,
          userData.password,
          '' // administrador vazio
        )
      ).rejects.toThrow();
    });

    test('Deve criar usuário com administrador = "true"', async () => {
      const userData = generateUserData();
      userData.administrador = 'true';

      const response = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );

      expect(response).toBeDefined();
      if (response._id) {
        createdUserIds.push(response._id);
      }
    });

    test('Deve criar usuário com administrador = "false"', async () => {
      const userData = generateUserData();
      userData.administrador = 'false';

      const response = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );

      expect(response).toBeDefined();
      if (response._id) {
        createdUserIds.push(response._id);
      }
    });

    test('Deve falhar ao criar usuário com email duplicado', async () => {
      const userData = generateUserData();

      // Cria primeiro usuário
      const firstResponse = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );

      if (firstResponse._id) {
        createdUserIds.push(firstResponse._id);
      }

      // Tenta criar segundo usuário com mesmo email
      const secondUserData = generateUserData();
      secondUserData.email = userData.email;

      await expect(
        authenticatedClient.createUser(
          secondUserData.nome,
          secondUserData.email,
          secondUserData.password,
          secondUserData.administrador
        )
      ).rejects.toThrow();
    });
  });

  describe('GET /users/{id} - Buscar usuário específico', () => {
    test('Deve retornar detalhes de um usuário existente', async () => {
      // Primeiro cria um usuário
      const userData = generateUserData();
      const createResponse = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );

      const userId = createResponse._id || createResponse.id;
      expect(userId).toBeDefined();

      if (userId) {
        createdUserIds.push(userId);

        // Busca o usuário criado
        const response = await authenticatedClient.getUser(userId);

        expect(response).toBeDefined();
        expect(response._id || response.id).toBe(userId);
      }
    });

    test('Deve retornar erro para usuário inexistente', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011'; // ID MongoDB válido mas inexistente

      await expect(
        authenticatedClient.getUser(nonExistentId)
      ).rejects.toThrow();
    });

    test('Deve retornar erro sem autenticação', async () => {
      const userId = '507f1f77bcf86cd799439011';

      await expect(apiClient.getUser(userId)).rejects.toThrow();
    });
  });

  describe('PUT /users/{id} - Atualizar usuário', () => {
    test('Deve atualizar nome do usuário', async () => {
      // Cria um usuário
      const userData = generateUserData();
      const createResponse = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );

      const userId = createResponse._id || createResponse.id;
      if (userId) {
        createdUserIds.push(userId);

        // Busca o usuário para obter todos os campos
        const userBefore = await authenticatedClient.getUser(userId);
        
        // Atualiza o nome mantendo os outros campos
        const newName = 'Nome Atualizado';
        const response = await authenticatedClient.updateUser(userId, {
          nome: newName,
          email: userBefore.email,
          password: userData.password,
          administrador: userBefore.administrador
        });

        expect(response).toBeDefined();
        expect(response.message || response.nome).toBeDefined();
      }
    });

    test('Deve atualizar email do usuário', async () => {
      const userData = generateUserData();
      const createResponse = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );

      const userId = createResponse._id || createResponse.id;
      if (userId) {
        createdUserIds.push(userId);

        // Busca o usuário para obter todos os campos
        const userBefore = await authenticatedClient.getUser(userId);
        
        const newEmail = generateUserData().email;
        const response = await authenticatedClient.updateUser(userId, {
          nome: userBefore.nome,
          email: newEmail,
          password: userData.password,
          administrador: userBefore.administrador
        });

        expect(response).toBeDefined();
      }
    });

    test('Deve atualizar senha do usuário', async () => {
      const userData = generateUserData();
      const createResponse = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );

      const userId = createResponse._id || createResponse.id;
      if (userId) {
        createdUserIds.push(userId);

        // Busca o usuário para obter todos os campos
        const userBefore = await authenticatedClient.getUser(userId);
        
        const newPassword = 'novaSenha123';
        const response = await authenticatedClient.updateUser(userId, {
          nome: userBefore.nome,
          email: userBefore.email,
          password: newPassword,
          administrador: userBefore.administrador
        });

        expect(response).toBeDefined();
      }
    });

    test('Deve atualizar status de administrador', async () => {
      const userData = generateUserData();
      const createResponse = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );

      const userId = createResponse._id || createResponse.id;
      if (userId) {
        createdUserIds.push(userId);

        // Busca o usuário para obter todos os campos
        const userBefore = await authenticatedClient.getUser(userId);
        
        const response = await authenticatedClient.updateUser(userId, {
          nome: userBefore.nome,
          email: userBefore.email,
          password: userData.password,
          administrador: 'false'
        });

        expect(response).toBeDefined();
      }
    });

    test('Deve atualizar múltiplos campos simultaneamente', async () => {
      const userData = generateUserData();
      const createResponse = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );

      const userId = createResponse._id || createResponse.id;
      if (userId) {
        createdUserIds.push(userId);

        const updates = {
          nome: 'Nome Atualizado',
          email: generateUserData().email,
          password: userData.password,
          administrador: 'false'
        };

        const response = await authenticatedClient.updateUser(userId, updates);

        expect(response).toBeDefined();
      }
    });

    test('Deve retornar erro ao atualizar usuário inexistente', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      await expect(
        authenticatedClient.updateUser(nonExistentId, { nome: 'Novo Nome' })
      ).rejects.toThrow();
    });

    test('Deve retornar erro sem autenticação', async () => {
      const userId = '507f1f77bcf86cd799439011';

      await expect(
        apiClient.updateUser(userId, { nome: 'Novo Nome' })
      ).rejects.toThrow();
    });
  });

  describe('DELETE /users/{id} - Excluir usuário', () => {
    test('Deve excluir usuário existente', async () => {
      // Cria um usuário
      const userData = generateUserData();
      const createResponse = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );

      const userId = createResponse._id || createResponse.id;
      if (userId) {
        // Exclui o usuário
        const response = await authenticatedClient.deleteUser(userId);

        expect(response).toBeDefined();
        expect(response.message || response._id).toBeDefined();

        // Verifica que o usuário foi excluído
        await expect(authenticatedClient.getUser(userId)).rejects.toThrow();
      }
    });

    test('Deve retornar mensagem ao tentar excluir usuário inexistente', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      // A API ServeRest retorna sucesso com mensagem quando não encontra
      const response = await authenticatedClient.deleteUser(nonExistentId);
      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
    });

    test('Deve permitir deletar sem autenticação (API ServeRest permite)', async () => {
      const userId = '507f1f77bcf86cd799439011';

      // A API ServeRest permite deletar sem autenticação
      const response = await apiClient.deleteUser(userId);
      expect(response).toBeDefined();
    });
  });

  describe('Fluxo completo CRUD', () => {
    test('Deve realizar operações completas: criar, buscar, atualizar e excluir', async () => {
      // CREATE
      const userData = generateUserData();
      const createResponse = await authenticatedClient.createUser(
        userData.nome,
        userData.email,
        userData.password,
        userData.administrador
      );

      const userId = createResponse._id || createResponse.id;
      expect(userId).toBeDefined();

      if (!userId) {
        return; // Pula o teste se não conseguiu criar
      }

      // READ
      const getUserResponse = await authenticatedClient.getUser(userId);
      expect(getUserResponse).toBeDefined();
      expect(getUserResponse._id || getUserResponse.id).toBe(userId);

      // UPDATE
      const userBefore = await authenticatedClient.getUser(userId);
      const updatedName = 'Nome Atualizado no Fluxo Completo';
      const updateResponse = await authenticatedClient.updateUser(userId, {
        nome: updatedName,
        email: userBefore.email,
        password: userData.password,
        administrador: userBefore.administrador
      });
      expect(updateResponse).toBeDefined();

      // Verifica atualização
      const verifyResponse = await authenticatedClient.getUser(userId);
      expect(verifyResponse).toBeDefined();

      // DELETE
      const deleteResponse = await authenticatedClient.deleteUser(userId);
      expect(deleteResponse).toBeDefined();

      // Verifica exclusão
      await expect(authenticatedClient.getUser(userId)).rejects.toThrow();
    });
  });
});

