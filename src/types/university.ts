// Tipos relacionados a Universidades

export interface University {
  id: string;
  name: string;
  acronym?: string; // Sigla (ex: USP, UFRJ)
  city: string;
  state: string; // UF
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUniversityRequest {
  name: string;
  acronym?: string;
  city: string;
  state: string;
}
