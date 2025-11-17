import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

const initializeFirebase = () => {
  try {
    // Opção 1: Usando arquivo de credenciais
    // const serviceAccount = require('../../serviceAccountKey.json') as ServiceAccount;

    // Opção 2: Usando variáveis de ambiente (recomendado para produção)
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    } as ServiceAccount;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
};

export const auth = admin.auth;
export const firestore = admin.firestore;
export default initializeFirebase;
