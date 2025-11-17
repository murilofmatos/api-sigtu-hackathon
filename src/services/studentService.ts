import { firestore } from '../config/firebase';
import { AppError } from '../middlewares/errorHandler';
import {
  StudentProfile,
  CreateStudentProfileRequest,
} from '../types/student';

export class StudentService {
  /**
   * Cria ou atualiza o perfil completo do aluno
   */
  static async createOrUpdateProfile(
    userId: string,
    data: CreateStudentProfileRequest
  ): Promise<StudentProfile> {
    try {
      // Validar se o usuário existe e é um aluno
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData) {
        throw new AppError('Usuário não encontrado', 404);
      }

      if (userData.role !== 'student') {
        throw new AppError('Apenas alunos podem ter perfil de estudante', 403);
      }

      // Validar dados obrigatórios
      this.validateProfileData(data);

      // Criar perfil
      const profile: StudentProfile = {
        userId,
        personalData: data.personalData,
        address: data.address,
        familyData: data.familyData,
        academicData: data.academicData,
        scholarship: data.scholarship,
        documents: data.documents,
        profileCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Verificar se já existe perfil
      const existingProfileDoc = await firestore()
        .collection('student_profiles')
        .doc(userId)
        .get();

      if (existingProfileDoc.exists) {
        // Atualizar perfil existente
        profile.createdAt = existingProfileDoc.data()!.createdAt;
        profile.updatedAt = new Date().toISOString();
      }

      // Salvar perfil no Firestore
      await firestore()
        .collection('student_profiles')
        .doc(userId)
        .set(profile);

      // Marcar perfil como completo na coleção de usuários
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          profileCompleted: true,
          updatedAt: new Date().toISOString(),
        });

      return profile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao criar/atualizar perfil', 500);
    }
  }

  /**
   * Busca o perfil de um aluno
   */
  static async getProfile(userId: string): Promise<StudentProfile | null> {
    try {
      const profileDoc = await firestore()
        .collection('student_profiles')
        .doc(userId)
        .get();

      if (!profileDoc.exists) {
        return null;
      }

      return profileDoc.data() as StudentProfile;
    } catch (error) {
      throw new AppError('Erro ao buscar perfil', 500);
    }
  }

  /**
   * Valida os dados do perfil
   */
  private static validateProfileData(data: CreateStudentProfileRequest): void {
    // Validar dados pessoais
    if (!data.personalData.fullName || data.personalData.fullName.trim() === '') {
      throw new AppError('Nome completo é obrigatório', 400);
    }
    if (!data.personalData.rg || data.personalData.rg.trim() === '') {
      throw new AppError('RG é obrigatório', 400);
    }
    if (!data.personalData.birthDate) {
      throw new AppError('Data de nascimento é obrigatória', 400);
    }
    if (!data.personalData.phone || data.personalData.phone.trim() === '') {
      throw new AppError('Telefone é obrigatório', 400);
    }

    // Validar endereço
    if (!data.address.street || data.address.street.trim() === '') {
      throw new AppError('Rua é obrigatória', 400);
    }
    if (!data.address.number || data.address.number.trim() === '') {
      throw new AppError('Número é obrigatório', 400);
    }
    if (!data.address.neighborhood || data.address.neighborhood.trim() === '') {
      throw new AppError('Bairro é obrigatório', 400);
    }
    if (!data.address.state || data.address.state.trim() === '') {
      throw new AppError('Estado é obrigatório', 400);
    }
    if (!data.address.zipCode || data.address.zipCode.trim() === '') {
      throw new AppError('CEP é obrigatório', 400);
    }

    // Validar informações familiares
    if (data.familyData.hasFather && (!data.familyData.fatherName || data.familyData.fatherName.trim() === '')) {
      throw new AppError('Nome do pai é obrigatório quando possui pai', 400);
    }
    if (data.familyData.hasMother && (!data.familyData.motherName || data.familyData.motherName.trim() === '')) {
      throw new AppError('Nome da mãe é obrigatório quando possui mãe', 400);
    }

    // Validar dados acadêmicos
    if (!data.academicData.universityId || data.academicData.universityId.trim() === '') {
      throw new AppError('Universidade é obrigatória', 400);
    }
    if (!data.academicData.currentSemester || data.academicData.currentSemester < 1) {
      throw new AppError('Semestre atual inválido', 400);
    }
    if (!data.academicData.totalSemesters || data.academicData.totalSemesters < 1) {
      throw new AppError('Total de semestres inválido', 400);
    }
    if (data.academicData.currentSemester > data.academicData.totalSemesters) {
      throw new AppError('Semestre atual não pode ser maior que o total de semestres', 400);
    }
    if (!data.academicData.expectedGraduationYear || data.academicData.expectedGraduationYear < new Date().getFullYear()) {
      throw new AppError('Ano de conclusão inválido', 400);
    }
    if (!data.academicData.weeklyFrequency || data.academicData.weeklyFrequency.length === 0) {
      throw new AppError('Frequência semanal é obrigatória', 400);
    }
    if (!data.academicData.courseSchedule.startTime || !data.academicData.courseSchedule.endTime) {
      throw new AppError('Horário do curso é obrigatório', 400);
    }

    // Validar bolsa de estudo
    if (data.scholarship.hasScholarship && !data.scholarship.scholarshipType) {
      throw new AppError('Tipo de bolsa é obrigatório quando possui bolsa', 400);
    }

    // Validar aceite de termos
    if (!data.documents.termsAccepted) {
      throw new AppError('É necessário aceitar os termos de responsabilidade', 400);
    }
  }
}
