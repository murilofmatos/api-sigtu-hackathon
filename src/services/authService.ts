import { auth, firestore } from '../config/firebase';
import { AppError } from '../middlewares/errorHandler';
import { AuthResponse, RegisterRequest, LoginRequest } from '../types';

export class AuthService {
  /**
   * Registra um novo usuário com email e senha
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const { email, password, name, role } = data;

      // Validar role
      if (!['student', 'employee'].includes(role)) {
        throw new AppError('Role inválido. Deve ser "student" ou "employee"', 400);
      }

      // Criar usuário no Firebase Auth
      const userRecord = await auth().createUser({
        email,
        password,
        displayName: name,
        emailVerified: false, // Email não verificado inicialmente
      });

      // Gerar link de verificação de email
      const actionCodeSettings = {
        url: process.env.EMAIL_VERIFICATION_REDIRECT_URL || 'http://localhost:3000/email-verified',
        handleCodeInApp: false,
      };

      const verificationLink = await auth().generateEmailVerificationLink(
        email,
        actionCodeSettings
      );

      // Criar documento do usuário no Firestore
      const userData: any = {
        uid: userRecord.uid,
        email: userRecord.email,
        name: name || '',
        role,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Adicionar profileCompleted apenas para alunos
      if (role === 'student') {
        userData.profileCompleted = false;
      }

      await firestore()
        .collection('users')
        .doc(userRecord.uid)
        .set(userData);

      // Aqui você pode enviar o link por email usando um serviço como SendGrid, Nodemailer, etc.
      // Por enquanto, vamos apenas retornar o link na resposta (apenas para desenvolvimento)
      console.log('Link de verificação:', verificationLink);

      // Gerar token customizado
      const token = await auth().createCustomToken(userRecord.uid);

      const response: AuthResponse = {
        uid: userRecord.uid,
        email: userRecord.email!,
        token,
        role,
        emailVerified: false,
        verificationLink, // Apenas para desenvolvimento - remover em produção
      };

      if (role === 'student') {
        response.profileCompleted = false;
      }

      return response;
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        throw new AppError('Email já está em uso', 400);
      }
      if (error.code === 'auth/invalid-email') {
        throw new AppError('Email inválido', 400);
      }
      if (error.code === 'auth/weak-password') {
        throw new AppError('Senha muito fraca', 400);
      }
      throw new AppError('Erro ao criar usuário', 500);
    }
  }

  /**
   * Autentica um usuário (Firebase Admin não possui método de login direto)
   * Esta função verifica se o usuário existe e retorna um custom token
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const { email } = data;

      // Verificar se o usuário existe
      const userRecord = await auth().getUserByEmail(email);

      // Verificar se o email foi verificado
      if (!userRecord.emailVerified) {
        throw new AppError('Por favor, verifique seu email antes de fazer login', 403);
      }

      // Buscar dados do usuário no Firestore
      const userDoc = await firestore().collection('users').doc(userRecord.uid).get();
      const userData = userDoc.data();

      if (!userData) {
        throw new AppError('Dados do usuário não encontrados', 404);
      }

      // Gerar token customizado
      const token = await auth().createCustomToken(userRecord.uid);

      const response: AuthResponse = {
        uid: userRecord.uid,
        email: userRecord.email!,
        token,
        role: userData.role,
        emailVerified: userRecord.emailVerified,
      };

      // Adicionar profileCompleted se for aluno
      if (userData.role === 'student') {
        response.profileCompleted = userData.profileCompleted || false;
      }

      return response;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new AppError('Usuário não encontrado', 404);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao fazer login', 500);
    }
  }

  /**
   * Busca informações de um usuário pelo UID
   */
  static async getUserByUid(uid: string) {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (!userDoc.exists) {
        throw new AppError('Usuário não encontrado', 404);
      }

      return userDoc.data();
    } catch (error) {
      throw new AppError('Erro ao buscar usuário', 500);
    }
  }

  /**
   * Deleta um usuário
   */
  static async deleteUser(uid: string): Promise<void> {
    try {
      // Deletar do Firebase Auth
      await auth().deleteUser(uid);

      // Deletar do Firestore
      await firestore().collection('users').doc(uid).delete();
    } catch (error) {
      throw new AppError('Erro ao deletar usuário', 500);
    }
  }

  /**
   * Reenvia o email de verificação
   */
  static async resendVerificationEmail(email: string): Promise<string> {
    try {
      const userRecord = await auth().getUserByEmail(email);

      if (userRecord.emailVerified) {
        throw new AppError('Email já verificado', 400);
      }

      const actionCodeSettings = {
        url: process.env.EMAIL_VERIFICATION_REDIRECT_URL || 'http://localhost:3000/email-verified',
        handleCodeInApp: false,
      };

      const verificationLink = await auth().generateEmailVerificationLink(
        email,
        actionCodeSettings
      );

      // Aqui você enviaria o email
      console.log('Link de verificação reenviado:', verificationLink);

      return verificationLink;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new AppError('Usuário não encontrado', 404);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao reenviar email de verificação', 500);
    }
  }

  /**
   * Verifica o status de verificação do email e atualiza no Firestore
   */
  static async checkEmailVerification(uid: string): Promise<boolean> {
    try {
      const userRecord = await auth().getUser(uid);

      // Atualizar status no Firestore se foi verificado
      if (userRecord.emailVerified) {
        await firestore()
          .collection('users')
          .doc(uid)
          .update({
            emailVerified: true,
            updatedAt: new Date().toISOString(),
          });
      }

      return userRecord.emailVerified;
    } catch (error) {
      throw new AppError('Erro ao verificar status do email', 500);
    }
  }
}
