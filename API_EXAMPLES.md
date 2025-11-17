# Exemplos de Uso da API

## Usando cURL

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

### 2. Registrar Novo Usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "senha123",
    "name": "João Silva"
  }'
```

Resposta:
```json
{
  "success": true,
  "data": {
    "uid": "firebase-user-id",
    "email": "usuario@example.com",
    "token": "custom-firebase-token"
  },
  "message": "Usuário registrado com sucesso"
}
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "senha123"
  }'
```

### 4. Obter Informações do Usuário (Rota Protegida)

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 5. Deletar Conta (Rota Protegida)

```bash
curl -X DELETE http://localhost:3000/api/auth/delete \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Usando JavaScript/Fetch

### Registrar

```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'usuario@example.com',
    password: 'senha123',
    name: 'João Silva'
  })
});

const data = await response.json();
console.log(data);
```

### Login e Guardar Token

```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'usuario@example.com',
    password: 'senha123'
  })
});

const data = await response.json();
const token = data.data.token;

// Guardar token (localStorage, sessionStorage, etc.)
localStorage.setItem('authToken', token);
```

### Usar Rotas Protegidas

```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('http://localhost:3000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const userData = await response.json();
console.log(userData);
```

## Usando Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Registrar
const registerUser = async () => {
  try {
    const { data } = await api.post('/auth/register', {
      email: 'usuario@example.com',
      password: 'senha123',
      name: 'João Silva'
    });
    console.log(data);
  } catch (error) {
    console.error(error.response.data);
  }
};

// Login
const login = async () => {
  try {
    const { data } = await api.post('/auth/login', {
      email: 'usuario@example.com',
      password: 'senha123'
    });
    localStorage.setItem('authToken', data.data.token);
    return data;
  } catch (error) {
    console.error(error.response.data);
  }
};

// Obter usuário atual
const getCurrentUser = async () => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (error) {
    console.error(error.response.data);
  }
};
```

## Respostas de Erro

### Erro de Validação (400)

```json
{
  "success": false,
  "error": {
    "message": "Erro de validação",
    "errors": [
      {
        "msg": "Email inválido",
        "param": "email",
        "location": "body"
      }
    ]
  }
}
```

### Erro de Autenticação (401)

```json
{
  "success": false,
  "error": {
    "message": "Token não fornecido"
  }
}
```

### Usuário já Existe (400)

```json
{
  "success": false,
  "error": {
    "message": "Email já está em uso"
  }
}
```

## Testando com Postman

1. Importe a collection (você pode criar uma)
2. Configure uma variável de ambiente `baseUrl` = `http://localhost:3000/api`
3. Configure uma variável `token` que será atualizada automaticamente após o login
4. Adicione um script de teste no endpoint de login:

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
}
```

5. Nas rotas protegidas, use `Bearer {{token}}` no header Authorization
