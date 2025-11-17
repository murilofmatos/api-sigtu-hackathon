import { firestore } from '../config/firebase';
import { AppError } from '../middlewares/errorHandler';
import { University, CreateUniversityRequest } from '../types/university';

export class UniversityService {
  /**
   * Lista todas as universidades ativas
   */
  static async listUniversities(): Promise<University[]> {
    try {
      const snapshot = await firestore()
        .collection('universities')
        .where('active', '==', true)
        .orderBy('name', 'asc')
        .get();

      const universities: University[] = [];

      snapshot.forEach((doc) => {
        universities.push(doc.data() as University);
      });

      return universities;
    } catch (error) {
      throw new AppError('Erro ao listar universidades', 500);
    }
  }

  /**
   * Busca uma universidade por ID
   */
  static async getUniversityById(id: string): Promise<University | null> {
    try {
      const doc = await firestore().collection('universities').doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as University;
    } catch (error) {
      throw new AppError('Erro ao buscar universidade', 500);
    }
  }

  /**
   * Cria uma nova universidade (apenas para administradores)
   */
  static async createUniversity(
    data: CreateUniversityRequest
  ): Promise<University> {
    try {
      const id = firestore().collection('universities').doc().id;

      const university: University = {
        id,
        name: data.name,
        acronym: data.acronym,
        city: data.city,
        state: data.state,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await firestore().collection('universities').doc(id).set(university);

      return university;
    } catch (error) {
      throw new AppError('Erro ao criar universidade', 500);
    }
  }

  /**
   * Seed inicial de universidades para testes
   */
  static async seedUniversities(): Promise<void> {
    try {
      const universities: Omit<University, 'id'>[] = [
        {
          name: 'Universidade de São Paulo',
          acronym: 'USP',
          city: 'São Paulo',
          state: 'SP',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'Universidade Federal do Rio de Janeiro',
          acronym: 'UFRJ',
          city: 'Rio de Janeiro',
          state: 'RJ',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'Universidade Federal de Minas Gerais',
          acronym: 'UFMG',
          city: 'Belo Horizonte',
          state: 'MG',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'Universidade Estadual de Campinas',
          acronym: 'UNICAMP',
          city: 'Campinas',
          state: 'SP',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'Universidade Federal do Rio Grande do Sul',
          acronym: 'UFRGS',
          city: 'Porto Alegre',
          state: 'RS',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      for (const university of universities) {
        const id = firestore().collection('universities').doc().id;
        await firestore()
          .collection('universities')
          .doc(id)
          .set({ ...university, id });
      }

      console.log('Universidades seed criadas com sucesso');
    } catch (error) {
      console.error('Erro ao criar seed de universidades:', error);
      throw new AppError('Erro ao criar seed de universidades', 500);
    }
  }
}
