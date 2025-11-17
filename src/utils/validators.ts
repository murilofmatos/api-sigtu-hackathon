import { body } from 'express-validator';

/**
 * Validações para o perfil do aluno
 */
export const studentProfileValidation = [
  // Step 1: Dados Pessoais
  body('personalData.fullName')
    .notEmpty()
    .withMessage('Nome completo é obrigatório')
    .isString()
    .withMessage('Nome completo deve ser uma string'),

  body('personalData.rg')
    .notEmpty()
    .withMessage('RG é obrigatório')
    .isString()
    .withMessage('RG deve ser uma string'),

  body('personalData.birthDate')
    .notEmpty()
    .withMessage('Data de nascimento é obrigatória')
    .isISO8601()
    .withMessage('Data de nascimento deve estar no formato ISO8601'),

  body('personalData.phone')
    .notEmpty()
    .withMessage('Telefone é obrigatório')
    .isString()
    .withMessage('Telefone deve ser uma string'),

  // Step 2: Endereço
  body('address.street')
    .notEmpty()
    .withMessage('Rua é obrigatória')
    .isString()
    .withMessage('Rua deve ser uma string'),

  body('address.number')
    .notEmpty()
    .withMessage('Número é obrigatório')
    .isString()
    .withMessage('Número deve ser uma string'),

  body('address.neighborhood')
    .notEmpty()
    .withMessage('Bairro é obrigatório')
    .isString()
    .withMessage('Bairro deve ser uma string'),

  body('address.state')
    .notEmpty()
    .withMessage('Estado é obrigatório')
    .isString()
    .withMessage('Estado deve ser uma string')
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ser a sigla (UF) com 2 caracteres'),

  body('address.zipCode')
    .notEmpty()
    .withMessage('CEP é obrigatório')
    .isString()
    .withMessage('CEP deve ser uma string'),

  // Step 3: Informações Familiares
  body('familyData.hasFather')
    .isBoolean()
    .withMessage('hasFather deve ser um booleano'),

  body('familyData.fatherName')
    .optional()
    .isString()
    .withMessage('Nome do pai deve ser uma string'),

  body('familyData.hasMother')
    .isBoolean()
    .withMessage('hasMother deve ser um booleano'),

  body('familyData.motherName')
    .optional()
    .isString()
    .withMessage('Nome da mãe deve ser uma string'),

  body('familyData.maritalStatus')
    .isIn(['single', 'married'])
    .withMessage('Estado civil deve ser "single" ou "married"'),

  body('familyData.residenceType')
    .isIn(['owned', 'rented'])
    .withMessage('Tipo de residência deve ser "owned" ou "rented"'),

  // Step 4: Dados Acadêmicos
  body('academicData.universityId')
    .notEmpty()
    .withMessage('Universidade é obrigatória')
    .isString()
    .withMessage('ID da universidade deve ser uma string'),

  body('academicData.currentSemester')
    .isInt({ min: 1 })
    .withMessage('Semestre atual deve ser um número inteiro maior que 0'),

  body('academicData.totalSemesters')
    .isInt({ min: 1 })
    .withMessage('Total de semestres deve ser um número inteiro maior que 0'),

  body('academicData.expectedGraduationYear')
    .isInt({ min: new Date().getFullYear() })
    .withMessage(`Ano de conclusão deve ser maior ou igual a ${new Date().getFullYear()}`),

  body('academicData.weeklyFrequency')
    .isArray({ min: 1 })
    .withMessage('Frequência semanal deve ser um array com pelo menos 1 dia'),

  body('academicData.weeklyFrequency.*')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Dia da semana inválido'),

  body('academicData.coursePeriod')
    .isIn(['morning', 'afternoon', 'evening', 'full-time'])
    .withMessage('Período do curso deve ser "morning", "afternoon", "evening" ou "full-time"'),

  body('academicData.courseSchedule.startTime')
    .notEmpty()
    .withMessage('Horário de início é obrigatório')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Horário de início deve estar no formato HH:MM'),

  body('academicData.courseSchedule.endTime')
    .notEmpty()
    .withMessage('Horário de término é obrigatório')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Horário de término deve estar no formato HH:MM'),

  // Step 5: Bolsa de Estudo
  body('scholarship.hasScholarship')
    .isBoolean()
    .withMessage('hasScholarship deve ser um booleano'),

  body('scholarship.scholarshipType')
    .optional()
    .isIn(['prouni', 'fies', 'institutional', 'other'])
    .withMessage('Tipo de bolsa deve ser "prouni", "fies", "institutional" ou "other"'),

  body('scholarship.scholarshipProofDocument')
    .optional()
    .isString()
    .withMessage('Documento de comprovação deve ser uma string'),

  // Step 6: Documentos e Termos
  body('documents.termsAccepted')
    .isBoolean()
    .withMessage('termsAccepted deve ser um booleano')
    .custom((value) => value === true)
    .withMessage('É necessário aceitar os termos de responsabilidade'),

  body('documents.photo3x4')
    .optional()
    .isString()
    .withMessage('Foto 3x4 deve ser uma string'),

  body('documents.identityDocument')
    .optional()
    .isString()
    .withMessage('Documento de identidade deve ser uma string'),

  body('documents.addressProof')
    .optional()
    .isString()
    .withMessage('Comprovante de residência deve ser uma string'),

  body('documents.enrollmentDeclaration')
    .optional()
    .isString()
    .withMessage('Declaração de matrícula deve ser uma string'),

  body('documents.classSchedule')
    .optional()
    .isString()
    .withMessage('Cronograma de aulas deve ser uma string'),

  body('documents.handwrittenDeclaration')
    .optional()
    .isString()
    .withMessage('Declaração de próprio punho deve ser uma string'),
];
