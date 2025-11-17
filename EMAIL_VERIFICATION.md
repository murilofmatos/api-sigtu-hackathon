# Guia de Verificação de Email

## Visão Geral

O sistema implementa verificação de email obrigatória usando o Firebase Admin SDK. A verificação de email é **gratuita** no Firebase e ajuda a garantir que os usuários forneçam endereços de email válidos.

## Fluxo de Verificação

### 1. Registro

Quando um usuário se registra:
- Uma conta é criada no Firebase Authentication com `emailVerified: false`
- Um link de verificação é gerado usando `generateEmailVerificationLink()`
- O usuário é criado no Firestore com `emailVerified: false`
- Em desenvolvimento, o link é retornado na resposta da API
- Em produção, o link deve ser enviado por email

**Exemplo de Resposta (Desenvolvimento):**
```json
{
  "success": true,
  "data": {
    "uid": "abc123...",
    "email": "usuario@example.com",
    "token": "custom-token...",
    "emailVerified": false,
    "verificationLink": "https://your-project.firebaseapp.com/__/auth/action?..."
  },
  "message": "Usuário registrado com sucesso"
}
```

### 2. Verificação

O usuário clica no link de verificação enviado por email. O Firebase automaticamente:
- Marca `emailVerified: true` no Firebase Authentication
- Redireciona para a URL configurada em `EMAIL_VERIFICATION_REDIRECT_URL`

### 3. Atualização no Firestore

Quando o usuário faz uma requisição autenticada após verificar o email, o método `checkEmailVerification()` atualiza o Firestore:
```typescript
await AuthService.checkEmailVerification(uid);
```

### 4. Login

Ao fazer login:
- O sistema verifica se `emailVerified === true`
- Se não verificado, retorna erro 403: "Por favor, verifique seu email antes de fazer login"
- Se verificado, gera e retorna o token de autenticação

## Endpoints

### Reenviar Email de Verificação

```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Email de verificação enviado com sucesso",
  "data": {
    "verificationLink": "https://..." // Apenas em desenvolvimento
  }
}
```

### Verificar Status

```http
GET /api/auth/verify-status
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "emailVerified": true
  }
}
```

## Configuração em Produção

### 1. Configurar Variável de Ambiente

```env
EMAIL_VERIFICATION_REDIRECT_URL=https://seu-app.com/email-verificado
```

### 2. Integrar Serviço de Email

Você precisará de um serviço de email para enviar os links. Opções populares:

#### Opção A: SendGrid

```bash
npm install @sendgrid/mail
```

```typescript
// src/services/emailService.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendVerificationEmail = async (email: string, link: string) => {
  const msg = {
    to: email,
    from: 'noreply@seu-app.com',
    subject: 'Verifique seu email',
    html: `
      <h1>Bem-vindo ao SIGTU!</h1>
      <p>Clique no link abaixo para verificar seu email:</p>
      <a href="${link}">Verificar Email</a>
    `,
  };

  await sgMail.send(msg);
};
```

#### Opção B: Nodemailer

```bash
npm install nodemailer
```

```typescript
// src/services/emailService.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, link: string) => {
  await transporter.sendMail({
    from: 'noreply@seu-app.com',
    to: email,
    subject: 'Verifique seu email',
    html: `
      <h1>Bem-vindo ao SIGTU!</h1>
      <p>Clique no link abaixo para verificar seu email:</p>
      <a href="${link}">Verificar Email</a>
    `,
  });
};
```

### 3. Atualizar AuthService

```typescript
// src/services/authService.ts
import { sendVerificationEmail } from './emailService';

// No método register(), após gerar o link:
if (process.env.NODE_ENV === 'production') {
  await sendVerificationEmail(email, verificationLink);
  // Não retornar o link na resposta em produção
  return {
    uid: userRecord.uid,
    email: userRecord.email!,
    token,
    emailVerified: false,
  };
}
```

## Middleware Opcional

Para proteger rotas específicas que requerem email verificado:

```typescript
import { requireEmailVerification } from '../middlewares/requireEmailVerification';

// Exemplo: rota que só usuários com email verificado podem acessar
router.post(
  '/rota-protegida',
  authenticate,
  requireEmailVerification, // Adicione após authenticate
  controller.action
);
```

## Customização do Template de Email

Para criar templates de email mais elaborados, considere usar:
- [MJML](https://mjml.io/) - Framework de email responsivo
- [Handlebars](https://handlebarsjs.com/) - Template engine
- Serviços de template como [Mailgun Templates](https://www.mailgun.com/products/send/email-templates/)

## Perguntas Frequentes

### O Firebase cobra pela verificação de email?
**Não**, a geração de links de verificação é gratuita no Firebase.

### E se o usuário não receber o email?
Use o endpoint `/api/auth/resend-verification` para reenviar o link.

### Posso desabilitar a verificação de email?
Sim, remova a verificação em `authService.ts` (linha 85-87 no método login):
```typescript
// Comentar ou remover:
// if (!userRecord.emailVerified) {
//   throw new AppError('Por favor, verifique seu email antes de fazer login', 403);
// }
```

### Como testar em desenvolvimento?
O link de verificação é retornado na resposta da API em modo desenvolvimento. Copie e cole no navegador para verificar.

### Os links de verificação expiram?
Sim, os links do Firebase expiram após algumas horas por segurança.

## Logs e Debugging

Para debugar problemas com verificação de email:

```typescript
// Adicione logs no authService.ts
console.log('Link de verificação gerado:', verificationLink);
console.log('Status de verificação:', userRecord.emailVerified);
```

Verifique também o Firebase Console:
- Authentication > Users - verifica o status `emailVerified`
- Firestore > users - verifica o campo `emailVerified`
