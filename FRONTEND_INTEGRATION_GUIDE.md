# Guia de Integração Frontend - SIGTU API

Este guia fornece todas as informações necessárias para integrar o frontend com a API do SIGTU.

## Sumário

1. [Configuração Inicial](#configuração-inicial)
2. [Fluxo de Autenticação](#fluxo-de-autenticação)
3. [Fluxo de Cadastro de Aluno](#fluxo-de-cadastro-de-aluno)
4. [Endpoints Disponíveis](#endpoints-disponíveis)
5. [Exemplos de Código](#exemplos-de-código)
6. [Tratamento de Erros](#tratamento-de-erros)
7. [Tipos TypeScript](#tipos-typescript)

---

## Configuração Inicial

### Base URL

```
Development: http://localhost:3000/api
Production: https://sua-api.com/api
```

### Headers Padrão

```javascript
{
  "Content-Type": "application/json"
}
```

### Headers com Autenticação

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

---

## Fluxo de Autenticação

### 1. Registro de Usuário

**Endpoint:** `POST /auth/register`

**Body:**
```json
{
  "email": "aluno@example.com",
  "password": "senha123",
  "name": "João Silva",
  "role": "student"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "data": {
    "uid": "firebase-user-id",
    "email": "aluno@example.com",
    "token": "custom-firebase-token",
    "role": "student",
    "emailVerified": false,
    "profileCompleted": false,
    "verificationLink": "https://..." // Apenas em desenvolvimento
  },
  "message": "Usuário registrado com sucesso"
}
```

**O que fazer com a resposta:**
1. **Não salve o token ainda** - o email não foi verificado
2. Mostre mensagem ao usuário para verificar o email
3. Em desenvolvimento, pode-se usar o `verificationLink` para testar

### 2. Verificação de Email

O usuário receberá um email com link de verificação. Após clicar:
- Firebase automaticamente marca o email como verificado
- Redireciona para a URL configurada em `EMAIL_VERIFICATION_REDIRECT_URL`

**Frontend deve:**
- Mostrar página de "Email Verificado com Sucesso"
- Redirecionar para tela de login

### 3. Login

**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "aluno@example.com",
  "password": "senha123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "uid": "firebase-user-id",
    "email": "aluno@example.com",
    "token": "custom-firebase-token",
    "role": "student",
    "emailVerified": true,
    "profileCompleted": false
  },
  "message": "Login realizado com sucesso"
}
```

**Resposta de Erro - Email Não Verificado (403):**
```json
{
  "success": false,
  "error": {
    "message": "Por favor, verifique seu email antes de fazer login"
  }
}
```

**O que fazer com a resposta:**
1. Salvar `token` no localStorage/sessionStorage
2. Salvar `role` e `profileCompleted` no estado global (Redux, Context, etc.)
3. Se `role === "student"` e `profileCompleted === false`:
   - Redirecionar para fluxo de cadastro do perfil
4. Se `profileCompleted === true`:
   - Redirecionar para dashboard/home

### 4. Reenviar Email de Verificação

**Endpoint:** `POST /auth/resend-verification`

**Body:**
```json
{
  "email": "aluno@example.com"
}
```

---

## Fluxo de Cadastro de Aluno

### Visão Geral

O frontend coleta os dados em 6 etapas (steps), mas **envia tudo de uma vez** para o backend.

### Estado Recomendado (React)

```typescript
const [profileData, setProfileData] = useState({
  personalData: {
    fullName: '',
    rg: '',
    birthDate: '',
    phone: ''
  },
  address: {
    street: '',
    number: '',
    neighborhood: '',
    state: '',
    zipCode: ''
  },
  familyData: {
    hasFather: false,
    fatherName: '',
    hasMother: false,
    motherName: '',
    maritalStatus: 'single',
    residenceType: 'owned'
  },
  academicData: {
    universityId: '',
    currentSemester: 1,
    totalSemesters: 8,
    expectedGraduationYear: 2026,
    weeklyFrequency: [],
    coursePeriod: 'evening',
    courseSchedule: {
      startTime: '',
      endTime: ''
    }
  },
  scholarship: {
    hasScholarship: false,
    scholarshipType: undefined,
    scholarshipProofDocument: undefined
  },
  documents: {
    photo3x4: undefined,
    identityDocument: undefined,
    addressProof: undefined,
    enrollmentDeclaration: undefined,
    classSchedule: undefined,
    handwrittenDeclaration: undefined,
    termsAccepted: false
  }
});
```

### Passo 1: Buscar Universidades

**Endpoint:** `GET /universities`

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Universidade de São Paulo",
      "acronym": "USP",
      "city": "São Paulo",
      "state": "SP",
      "active": true
    }
  ]
}
```

**Usar para:**
- Popular dropdown de seleção de universidade no Step 4

### Passo 2: Enviar Perfil Completo

**Endpoint:** `PUT /student/profile`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Body Completo:**
```json
{
  "personalData": {
    "fullName": "João Silva Santos",
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

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "userId": "firebase-user-id",
    "personalData": { /* ... */ },
    "address": { /* ... */ },
    "familyData": { /* ... */ },
    "academicData": { /* ... */ },
    "scholarship": { /* ... */ },
    "documents": { /* ... */ },
    "profileCompleted": true,
    "createdAt": "2025-11-17T12:00:00.000Z",
    "updatedAt": "2025-11-17T12:00:00.000Z"
  },
  "message": "Perfil salvo com sucesso"
}
```

**O que fazer após sucesso:**
1. Atualizar estado global: `profileCompleted = true`
2. Mostrar mensagem de sucesso
3. Redirecionar para dashboard/home

---

## Endpoints Disponíveis

### Autenticação (Públicos)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Registrar novo usuário |
| POST | `/auth/login` | Fazer login |
| POST | `/auth/resend-verification` | Reenviar email de verificação |

### Autenticação (Protegidos)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/auth/me` | Obter dados do usuário atual |
| GET | `/auth/verify-status` | Verificar status de verificação do email |
| DELETE | `/auth/delete` | Deletar conta |

### Perfil do Aluno (Requer role: student)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| PUT | `/student/profile` | Criar/atualizar perfil completo |
| GET | `/student/profile` | Obter perfil do aluno |

### Universidades (Públicos)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/universities` | Listar todas universidades ativas |
| GET | `/universities/:id` | Buscar universidade por ID |

### Utilitários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Status da API |

---

## Exemplos de Código

### Configuração do Axios

```typescript
// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Serviço de Autenticação

```typescript
// src/services/authService.ts
import api from '../api/axios';

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role: 'student' | 'employee';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    if (response.data.success) {
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('userRole', response.data.data.role);
      localStorage.setItem('profileCompleted', response.data.data.profileCompleted);
    }
    return response.data;
  },

  async resendVerification(email: string) {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('profileCompleted');
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  getRole() {
    return localStorage.getItem('userRole') as 'student' | 'employee' | null;
  },

  isProfileCompleted() {
    return localStorage.getItem('profileCompleted') === 'true';
  },
};
```

### Serviço de Perfil do Aluno

```typescript
// src/services/studentService.ts
import api from '../api/axios';

export interface StudentProfileData {
  personalData: {
    fullName: string;
    rg: string;
    birthDate: string;
    phone: string;
  };
  address: {
    street: string;
    number: string;
    neighborhood: string;
    state: string;
    zipCode: string;
  };
  familyData: {
    hasFather: boolean;
    fatherName?: string;
    hasMother: boolean;
    motherName?: string;
    maritalStatus: 'single' | 'married';
    residenceType: 'owned' | 'rented';
  };
  academicData: {
    universityId: string;
    currentSemester: number;
    totalSemesters: number;
    expectedGraduationYear: number;
    weeklyFrequency: string[];
    coursePeriod: 'morning' | 'afternoon' | 'evening' | 'full-time';
    courseSchedule: {
      startTime: string;
      endTime: string;
    };
  };
  scholarship: {
    hasScholarship: boolean;
    scholarshipType?: 'prouni' | 'fies' | 'institutional' | 'other';
    scholarshipProofDocument?: string;
  };
  documents: {
    photo3x4?: string;
    identityDocument?: string;
    addressProof?: string;
    enrollmentDeclaration?: string;
    classSchedule?: string;
    handwrittenDeclaration?: string;
    termsAccepted: boolean;
  };
}

export const studentService = {
  async createOrUpdateProfile(data: StudentProfileData) {
    const response = await api.put('/student/profile', data);
    if (response.data.success) {
      localStorage.setItem('profileCompleted', 'true');
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/student/profile');
    return response.data;
  },
};
```

### Serviço de Universidades

```typescript
// src/services/universityService.ts
import api from '../api/axios';

export const universityService = {
  async listUniversities() {
    const response = await api.get('/universities');
    return response.data;
  },

  async getUniversityById(id: string) {
    const response = await api.get(`/universities/${id}`);
    return response.data;
  },
};
```

### Hook Customizado para Autenticação (React)

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [role, setRole] = useState(authService.getRole());
  const [profileCompleted, setProfileCompleted] = useState(authService.isProfileCompleted());

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    setRole(authService.getRole());
    setProfileCompleted(authService.isProfileCompleted());
  }, []);

  return {
    isAuthenticated,
    role,
    profileCompleted,
    logout: authService.logout,
  };
};
```

### Componente de Proteção de Rota

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'student' | 'employee';
  requireProfileCompleted?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRole,
  requireProfileCompleted,
}) => {
  const { isAuthenticated, role, profileCompleted } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && role !== requireRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireProfileCompleted && role === 'student' && !profileCompleted) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};
```

### Exemplo de Fluxo Multi-Step (React)

```typescript
// src/pages/CompleteProfile.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService, StudentProfileData } from '../services/studentService';
import { universityService } from '../services/universityService';

export const CompleteProfile = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [universities, setUniversities] = useState([]);
  const [profileData, setProfileData] = useState<StudentProfileData>({
    // ... estado inicial
  });

  useEffect(() => {
    // Buscar universidades ao montar
    universityService.listUniversities().then((response) => {
      if (response.success) {
        setUniversities(response.data);
      }
    });
  }, []);

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await studentService.createOrUpdateProfile(profileData);
      if (response.success) {
        alert('Perfil completado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    }
  };

  const updateProfileData = (step: string, data: any) => {
    setProfileData((prev) => ({
      ...prev,
      [step]: { ...prev[step], ...data },
    }));
  };

  return (
    <div>
      {/* Renderizar step apropriado baseado em currentStep */}
      {currentStep === 1 && (
        <Step1PersonalData
          data={profileData.personalData}
          onChange={(data) => updateProfileData('personalData', data)}
          onNext={handleNext}
        />
      )}
      {/* ... outros steps ... */}
      {currentStep === 6 && (
        <Step6Documents
          data={profileData.documents}
          onChange={(data) => updateProfileData('documents', data)}
          onBack={handleBack}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
```

---

## Tratamento de Erros

### Estrutura de Erro Padrão

```json
{
  "success": false,
  "error": {
    "message": "Mensagem de erro",
    "errors": [ /* array de erros de validação (opcional) */ ]
  }
}
```

### Erros de Validação (400)

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
      },
      {
        "msg": "Senha deve ter no mínimo 6 caracteres",
        "param": "password",
        "location": "body"
      }
    ]
  }
}
```

### Códigos de Status HTTP

| Código | Significado | Ação Recomendada |
|--------|-------------|------------------|
| 200 | Sucesso | Processar dados normalmente |
| 201 | Criado | Recurso criado com sucesso |
| 400 | Bad Request | Mostrar erros de validação ao usuário |
| 401 | Unauthorized | Redirecionar para login |
| 403 | Forbidden | Usuário não tem permissão (ex: email não verificado) |
| 404 | Not Found | Recurso não encontrado |
| 500 | Server Error | Mostrar erro genérico |

### Exemplo de Tratamento

```typescript
try {
  const response = await api.post('/auth/register', data);
  // Sucesso
} catch (error) {
  if (error.response) {
    const { status, data } = error.response;

    if (status === 400) {
      // Erros de validação
      if (data.error.errors) {
        data.error.errors.forEach((err) => {
          console.error(`${err.param}: ${err.msg}`);
        });
      } else {
        console.error(data.error.message);
      }
    } else if (status === 403) {
      // Email não verificado ou sem permissão
      console.error(data.error.message);
    } else {
      // Outros erros
      console.error(data.error.message);
    }
  }
}
```

---

## Tipos TypeScript

### Tipos de Enums

```typescript
export type UserRole = 'student' | 'employee';

export type MaritalStatus = 'single' | 'married';

export type ResidenceType = 'owned' | 'rented';

export type ScholarshipType = 'prouni' | 'fies' | 'institutional' | 'other';

export type CoursePeriod = 'morning' | 'afternoon' | 'evening' | 'full-time';

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
```

### Mapeamento de Dias da Semana (PT-BR)

```typescript
export const weekDayLabels: Record<WeekDay, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};
```

### Mapeamento de Períodos

```typescript
export const coursePeriodLabels: Record<CoursePeriod, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
  'full-time': 'Integral',
};
```

---

## Checklist de Integração

### Setup Inicial
- [ ] Configurar variável de ambiente `VITE_API_URL`
- [ ] Criar instância do Axios com interceptors
- [ ] Implementar serviços de API

### Fluxo de Autenticação
- [ ] Tela de registro
- [ ] Tela de login
- [ ] Tela de "Verifique seu email"
- [ ] Tela de "Email verificado"
- [ ] Opção de reenviar email de verificação
- [ ] Gerenciamento de token (localStorage)
- [ ] Logout

### Fluxo de Perfil do Aluno
- [ ] Buscar universidades na montagem
- [ ] 6 telas de steps
- [ ] Navegação entre steps (next/back)
- [ ] Validação de campos em cada step
- [ ] Preview/confirmação antes de enviar
- [ ] Envio do perfil completo
- [ ] Feedback de sucesso/erro

### Proteção de Rotas
- [ ] ProtectedRoute component
- [ ] Verificação de autenticação
- [ ] Verificação de role
- [ ] Verificação de perfil completo
- [ ] Redirecionamento apropriado

### Tratamento de Erros
- [ ] Interceptor de erros 401 (logout automático)
- [ ] Exibição de erros de validação
- [ ] Mensagens de erro amigáveis
- [ ] Loading states

---

## Notas Importantes

### Upload de Documentos

**Atenção:** Os campos de documentos são **placeholders** no momento. A implementação de upload será feita posteriormente.

Por enquanto, você pode:
- Deixar como `undefined`
- Usar string placeholder: `"url-placeholder"`
- Simular upload e usar: `"data:image/png;base64,..."`

### Formato de Dados

- **Datas:** Use formato ISO 8601: `"2000-01-15"` (YYYY-MM-DD)
- **Horários:** Use formato HH:MM: `"19:00"`, `"22:30"`
- **Telefone:** Qualquer formato aceito (sugestão: `"(11) 98765-4321"`)
- **RG:** Qualquer formato aceito (sugestão: `"12.345.678-9"`)
- **CEP:** Qualquer formato aceito (sugestão: `"12345-678"`)

### Desenvolvimento

Para popular universidades em desenvolvimento:
```bash
POST http://localhost:3000/api/universities/seed
```

---

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do backend
2. Confira a documentação completa no `README.md`
3. Revise os tipos TypeScript em `src/types/`
