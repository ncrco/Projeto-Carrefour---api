# Testes Automatizados - API REST de Gerenciamento de Usuários

Este projeto contém uma suíte completa de testes automatizados para uma API REST que gerencia informações de usuários. Os testes garantem 100% de cobertura dos endpoints da API e estão integrados a uma pipeline de CI/CD.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Executando os Testes](#executando-os-testes)
- [Cobertura de Testes](#cobertura-de-testes)
- [Pipeline CI/CD](#pipeline-cicd)
- [Casos de Teste Implementados](#casos-de-teste-implementados)
- [Relatórios](#relatórios)

## 🎯 Sobre o Projeto

Este projeto implementa testes automatizados para uma API REST que gerencia operações CRUD (Create, Read, Update, Delete) de usuários. A API utilizada para testes é a [ServeRest](https://serverest.dev), uma API REST gratuita para testes.

### Endpoints Testados

- `GET /usuarios` - Retorna lista de todos os usuários
- `POST /usuarios` - Cria um novo usuário
- `GET /usuarios/{id}` - Retorna detalhes de um usuário específico
- `PUT /usuarios/{id}` - Atualiza informações de um usuário
- `DELETE /usuarios/{id}` - Exclui um usuário
- `POST /login` - Autenticação JWT

## 🛠 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Jest** - Framework de testes
- **Axios** - Cliente HTTP para requisições
- **dotenv** - Gerenciamento de variáveis de ambiente
- **jest-html-reporters** - Geração de relatórios HTML
- **GitHub Actions** - Pipeline de CI/CD

## 📁 Estrutura do Projeto

```
meu-projeto/
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI/CD
├── tests/
│   ├── authentication.test.js  # Testes de autenticação
│   ├── users.test.js           # Testes dos endpoints de usuários
│   └── setup.js                # Configurações globais dos testes
├── utils/
│   ├── apiClient.js            # Cliente HTTP da API
│   └── helpers.js              # Funções auxiliares
├── config.js                   # Configurações da aplicação
├── package.json                # Dependências e scripts
├── .env.example                # Exemplo de variáveis de ambiente
├── .gitignore                  # Arquivos ignorados pelo Git
└── README.md                   # Documentação do projeto
```

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18.x ou superior)
- **npm** (geralmente vem com o Node.js)
- **Git** (para controle de versão)

### Verificando as Instalações

```bash
node --version
npm --version
git --version
```

## ⚙️ Configuração do Ambiente

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd meu-projeto
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo e configure conforme necessário:

```bash
cp .env.example .env
```

Edite o arquivo `.env` (opcional, valores padrão já estão configurados):

```env
API_BASE_URL=https://serverest.dev
API_TIMEOUT=30000
```

## 🚀 Executando os Testes

### Executar Todos os Testes

```bash
npm test
```

### Executar Testes em Modo Watch (desenvolvimento)

```bash
npm run test:watch
```

### Executar Testes com Cobertura

```bash
npm run test:coverage
```

### Executar Testes para CI/CD

```bash
npm run test:ci
```

## 📊 Cobertura de Testes

O projeto garante **100% de cobertura** dos endpoints da API, incluindo:

### ✅ Casos de Sucesso
- Autenticação com credenciais válidas
- Criação de usuário com todos os campos obrigatórios
- Listagem de usuários
- Busca de usuário específico
- Atualização de usuário (campos individuais e múltiplos)
- Exclusão de usuário
- Fluxo completo CRUD

### ❌ Casos de Erro
- Autenticação com credenciais inválidas
- Criação de usuário sem campos obrigatórios
- Criação de usuário com email duplicado
- Busca de usuário inexistente
- Atualização de usuário inexistente
- Exclusão de usuário inexistente
- Requisições sem autenticação

### 🔐 Testes de Autenticação
- Autenticação bem-sucedida
- Falha com credenciais inválidas
- Falha com campos vazios
- Persistência do token
- Reset do token

## 🔄 Pipeline CI/CD

O projeto está configurado com **GitHub Actions** para execução automática dos testes em cada push e pull request.

### Configuração da Pipeline

A pipeline está definida em `.github/workflows/ci.yml` e executa:

1. **Checkout do código**
2. **Configuração do Node.js** (versões 18.x e 20.x)
3. **Instalação de dependências**
4. **Execução dos testes** com cobertura
5. **Geração de relatórios HTML**
6. **Upload de artefatos** (relatórios e cobertura)
7. **Publicação de resultados** no GitHub

### Visualizando os Resultados

1. Acesse a aba **Actions** no GitHub
2. Selecione o workflow executado
3. Baixe os artefatos para visualizar os relatórios HTML

## 📝 Casos de Teste Implementados

### Testes de Autenticação (`authentication.test.js`)

| Teste | Descrição |
|-------|-----------|
| `Deve autenticar com credenciais válidas` | Verifica autenticação bem-sucedida |
| `Deve falhar autenticação com credenciais inválidas` | Testa falha com credenciais erradas |
| `Deve falhar autenticação com email vazio` | Valida campo obrigatório |
| `Deve falhar autenticação com senha vazia` | Valida campo obrigatório |
| `Deve persistir token após autenticação` | Verifica persistência do token |
| `Deve resetar token corretamente` | Testa reset do token |

### Testes de Usuários (`users.test.js`)

#### GET /usuarios
- ✅ Listar usuários com autenticação
- ❌ Erro sem autenticação

#### POST /usuarios
- ✅ Criar usuário com todos os campos obrigatórios
- ✅ Criar usuário com administrador = "true"
- ✅ Criar usuário com administrador = "false"
- ❌ Falhar sem nome
- ❌ Falhar sem email
- ❌ Falhar sem senha
- ❌ Falhar sem campo administrador
- ❌ Falhar com email duplicado

#### GET /usuarios/{id}
- ✅ Buscar usuário existente
- ❌ Erro para usuário inexistente
- ❌ Erro sem autenticação

#### PUT /usuarios/{id}
- ✅ Atualizar nome
- ✅ Atualizar email
- ✅ Atualizar senha
- ✅ Atualizar status de administrador
- ✅ Atualizar múltiplos campos simultaneamente
- ❌ Erro ao atualizar usuário inexistente
- ❌ Erro sem autenticação

#### DELETE /usuarios/{id}
- ✅ Excluir usuário existente
- ❌ Erro ao excluir usuário inexistente
- ❌ Erro sem autenticação

#### Fluxo Completo
- ✅ CRUD completo: criar, buscar, atualizar e excluir

## 📈 Relatórios

### Relatórios HTML

Após executar os testes, os relatórios HTML são gerados em:

```
reports/report.html
```

Para visualizar:

```bash
# Abra o arquivo no navegador
open reports/report.html
# ou
xdg-open reports/report.html  # Linux
```

### Relatório de Cobertura

O relatório de cobertura é gerado em:

```
coverage/
├── lcov.info          # Formato LCOV
├── lcov-report/       # Relatório HTML de cobertura
└── coverage-final.json
```

### Relatórios na Pipeline

Na pipeline CI/CD, os relatórios são disponibilizados como **artefatos**:

1. Acesse a execução da pipeline no GitHub
2. Role até a seção **Artifacts**
3. Baixe o arquivo `test-report-html-node-<version>`
4. Extraia e abra `reports/report.html`

## 🔧 Configurações Avançadas

### Rate Limiting

A API possui limite de 100 requisições por minuto. O cliente implementa controle automático de rate limiting para evitar falhas.

### Timeout

O timeout padrão das requisições é de 30 segundos. Pode ser configurado no arquivo `.env`.

### Credenciais de Teste

A API ServeRest possui credenciais padrão para testes:

- **Email**: `fulano@qa.com`
- **Senha**: `teste`

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a [documentação da API ServeRest](https://serverest.dev/#/)
2. Abra uma issue no repositório
3. Consulte os logs de erro nos relatórios de teste

## 🎓 Aprendizados

Este projeto demonstra:

- ✅ Testes automatizados de API REST
- ✅ Autenticação JWT em testes
- ✅ Validação de campos obrigatórios
- ✅ Testes de casos de erro
- ✅ Integração com CI/CD
- ✅ Geração de relatórios de testes
- ✅ Controle de rate limiting
- ✅ Boas práticas de organização de testes

---

**Desenvolvido com ❤️ para garantir qualidade e confiabilidade em APIs REST**

