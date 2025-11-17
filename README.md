# SIGTU-API

Sistema de Gestão para Transporte Universitário - API Backend

## Sobre o Projeto

API REST construída com Express.js, TypeScript e Firebase para gerenciar um sistema de transporte universitário.

## Tecnologias

- Node.js + TypeScript
- Express.js
- Firebase Admin SDK (Authentication + Firestore)
- express-validator
- Helmet + CORS

## Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de exemplo de variáveis de ambiente
cp .env.example .env
```

## Configuração

### Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Gere uma chave privada para sua conta de serviço:
   - Acesse Project Settings > Service Accounts
   - Clique em "Generate New Private Key"
3. Configure as variáveis de ambiente no arquivo `.env`:

```env
PORT=3000
NODE_ENV=development

FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_CLIENT_EMAIL=seu-email@seu-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua chave privada aqui\n-----END PRIVATE KEY-----\n"
```

**Alternativa**: Você pode baixar o arquivo JSON completo e salvá-lo como `serviceAccountKey.json` na raiz do projeto (não recomendado para produção).

## Executar o Projeto

```bash
# Modo de desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Executar versão de produção
npm start
```

## Endpoints da API

### Health Check

```http
GET /api/health
```

### Autenticação

#### Registrar Usuário

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123",
  "name": "Nome do Usuário" // opcional
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

#### Obter Informações do Usuário Autenticado

```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Deletar Conta

```http
DELETE /api/auth/delete
Authorization: Bearer {token}
```

## Estrutura do Projeto

```
src/
├── config/           # Configurações (Firebase, env)
├── controllers/      # Controllers da API
├── middlewares/      # Middlewares (auth, errors, validators)
├── routes/           # Definição das rotas
├── services/         # Lógica de negócio
├── types/            # Tipos TypeScript
└── utils/            # Funções utilitárias
```

## Padrões de Código

```bash
# Verificar linting
npm run lint

# Corrigir problemas de linting
npm run lint:fix

# Formatar código
npm run format
```

## Importante

- **NUNCA** commite o arquivo `.env` ou `serviceAccountKey.json`
- Mantenha suas credenciais do Firebase seguras
- Use variáveis de ambiente em produção
- A senha deve ter no mínimo 6 caracteres

## Licença

ISC
