import { auth, firestore } from '../config/firebase';
import { AppError } from '../middlewares/errorHandler';
import { AuthResponse, RegisterRequest, LoginRequest } from '../types';

export class AuthService {
  /**
   * Registra um novo usuário com email e senha
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const { email, password, name } = data;

      // Criar usuário no Firebase Auth
      const userRecord = await auth().createUser({
        email,
        password,
        displayName: name,
      });

      // Criar documento do usuário no Firestore
      await firestore()
        .collection('users')
        .doc(userRecord.uid)
        .set({
          uid: userRecord.uid,
          email: userRecord.email,
          name: name || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      // Gerar token customizado
      const token = await auth().createCustomToken(userRecord.uid);

      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        token,
      };
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

      // Gerar token customizado
      const token = await auth().createCustomToken(userRecord.uid);

      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        token,
      };
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new AppError('Usuário não encontrado', 404);
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
}
