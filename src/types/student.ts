// Tipos relacionados ao perfil do aluno

export type UserRole = 'student' | 'employee';

export type MaritalStatus = 'single' | 'married';

export type ResidenceType = 'owned' | 'rented';

export type ScholarshipType = 'prouni' | 'fies' | 'institutional' | 'other';

export type CoursePeriod = 'morning' | 'afternoon' | 'evening' | 'full-time';

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Step 1: Dados Pessoais
export interface PersonalData {
  fullName: string;
  rg: string;
  birthDate: string; // ISO string format
  phone: string;
}

// Step 2: Endereço
export interface AddressData {
  street: string;
  number: string;
  neighborhood: string;
  state: string; // UF
  zipCode: string; // CEP
}

// Step 3: Informações Familiares
export interface FamilyData {
  hasFather: boolean;
  fatherName?: string;
  hasMother: boolean;
  motherName?: string;
  maritalStatus: MaritalStatus;
  residenceType: ResidenceType;
}

// Step 4: Dados Acadêmicos
export interface AcademicData {
  universityId: string; // Reference to university
  currentSemester: number;
  totalSemesters: number;
  expectedGraduationYear: number;
  weeklyFrequency: WeekDay[]; // Dias que vai à faculdade
  coursePeriod: CoursePeriod;
  courseSchedule: {
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
}

// Step 5: Bolsa de Estudo
export interface ScholarshipData {
  hasScholarship: boolean;
  scholarshipType?: ScholarshipType;
  scholarshipProofDocument?: string; // Placeholder - futuramente será URL do documento
}

// Step 6: Documentos e Termos
export interface DocumentsData {
  photo3x4?: string; // Placeholder para URL
  identityDocument?: string; // Placeholder para URL
  addressProof?: string; // Placeholder para URL
  enrollmentDeclaration?: string; // Placeholder para URL
  classSchedule?: string; // Placeholder para URL
  handwrittenDeclaration?: string; // Placeholder para URL
  termsAccepted: boolean;
  termsAcceptedAt?: string; // ISO string
}

// Perfil Completo do Aluno
export interface StudentProfile {
  userId: string;
  personalData: PersonalData;
  address: AddressData;
  familyData: FamilyData;
  academicData: AcademicData;
  scholarship: ScholarshipData;
  documents: DocumentsData;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request para criar/atualizar perfil
export interface CreateStudentProfileRequest {
  personalData: PersonalData;
  address: AddressData;
  familyData: FamilyData;
  academicData: AcademicData;
  scholarship: ScholarshipData;
  documents: DocumentsData;
}
