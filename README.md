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

EMAIL_VERIFICATION_REDIRECT_URL=http://localhost:3000/email-verified
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
  "name": "Nome do Usuário", // opcional
  "role": "student" // ou "employee"
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

#### Reenviar Email de Verificação

```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

#### Verificar Status do Email (Requer Autenticação)

```http
GET /api/auth/verify-status
Authorization: Bearer {token}
```

## Verificação de Email

O sistema implementa verificação de email obrigatória:

1. **Registro**: Ao se registrar, um link de verificação é gerado automaticamente
2. **Login**: Usuários devem verificar o email antes de fazer login (retorna erro 403 se não verificado)
3. **Reenvio**: É possível reenviar o link de verificação caso o usuário não tenha recebido
4. **Status**: Usuários autenticados podem verificar se seu email já foi confirmado

**Nota para Desenvolvimento**: O link de verificação é retornado na resposta da API apenas em modo de desenvolvimento. Em produção, você deve configurar um serviço de email (SendGrid, AWS SES, etc.) para enviar o link.

### Perfil do Aluno

#### Criar/Atualizar Perfil Completo

```http
PUT /api/student/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "personalData": {
    "fullName": "João Silva",
    "rg": "12.345.678-9",
    "birthDate": "2000-01-15",
    "phone": "(11) 98765-4321"
  },
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "neighborhood": "Centro",
    "state": "SP",
    "zipCode": "12345-678"
  },
  "familyData": {
    "hasFather": true,
    "fatherName": "José Silva",
    "hasMother": true,
    "motherName": "Maria Silva",
    "maritalStatus": "single",
    "residenceType": "owned"
  },
  "academicData": {
    "universityId": "uuid-da-universidade",
    "currentSemester": 3,
    "totalSemesters": 8,
    "expectedGraduationYear": 2026,
    "weeklyFrequency": ["monday", "wednesday", "friday"],
    "coursePeriod": "evening",
    "courseSchedule": {
      "startTime": "19:00",
      "endTime": "22:30"
    }
  },
  "scholarship": {
    "hasScholarship": true,
    "scholarshipType": "prouni",
    "scholarshipProofDocument": "url-placeholder"
  },
  "documents": {
    "photo3x4": "url-placeholder",
    "identityDocument": "url-placeholder",
    "addressProof": "url-placeholder",
    "enrollmentDeclaration": "url-placeholder",
    "classSchedule": "url-placeholder",
    "handwrittenDeclaration": "url-placeholder",
    "termsAccepted": true
  }
}
```

#### Obter Perfil do Aluno

```http
GET /api/student/profile
Authorization: Bearer {token}
```

### Universidades

#### Listar Universidades

```http
GET /api/universities
```

#### Buscar Universidade por ID

```http
GET /api/universities/:id
```

#### Criar Seed de Universidades (Desenvolvimento)

```http
POST /api/universities/seed
```

## Níveis de Acesso

O sistema possui dois níveis de acesso:

1. **Aluno (student)**: Acesso ao sistema de transporte, deve completar perfil
2. **Funcionário (employee)**: Gerenciamento do sistema

Ao se registrar, o usuário deve especificar seu `role`. Alunos devem completar o perfil em um fluxo único (todas as informações de uma vez).

## Fluxo de Cadastro de Aluno

1. **Registro**: Email, senha e role="student"
2. **Verificação de Email**: Confirmar email via link
3. **Completar Perfil**: Enviar todos os dados do perfil de uma vez
4. **Acesso Completo**: Após perfil completo, aluno pode acessar todas as funcionalidades

**Importante**: Os campos de upload de documentos são placeholders. A implementação de upload será feita posteriormente.

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
- **Verificação de email é obrigatória** para fazer login
- Configure um serviço de email em produção para enviar os links de verificação automaticamente

## Licença

ISC
