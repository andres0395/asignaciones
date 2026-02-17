export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
}

export enum Month {
  Enero = 'Enero',
  Febrero = 'Febrero',
  Marzo = 'Marzo',
  Abril = 'Abril',
  Mayo = 'Mayo',
  Junio = 'Junio',
  Julio = 'Julio',
  Agosto = 'Agosto',
  Septiembre = 'Septiembre',
  Octubre = 'Octubre',
  Noviembre = 'Noviembre',
  Diciembre = 'Diciembre',
}

export interface AssignmentItem {
  id?: string;
  name: string;
  minutos: number;
  encargado?: User;
  encargadoId?: string;
}

export interface Asignacion {
  id: string;
  name: string;
  semana: string;
  month: Month;
  createdAt: string;
  updatedAt: string;
  
  // Hierarchical relationships
  parentId?: string;
  parent?: {
    id: string;
    name: string;
    semana: string;
  };
  children?: Array<{
    id: string;
    name: string;
    semana: string;
    createdAt: string;
  }>;
  
  // User assignments
  presidente?: User;
  presidenteId?: string;
  
  presidenteReunion?: User;
  presidenteReunionId?: string;
  
  lectorReunion?: User;
  lectorReunionId?: string;
  
  oracionFinalVM?: User;
  oracionFinalVMId?: string;
  
  oracionFinalPublica?: User;
  oracionFinalPublicaId?: string;
  
  // Array relationships
  tesorosDeLaBiblia: AssignmentItem[];
  seamosMejoresMaestros: AssignmentItem[];
  nuestraVidaCristiana: AssignmentItem[];
  
  // Counts for list view
  _count?: {
    tesorosDeLaBiblia: number;
    seamosMejoresMaestros: number;
    nuestraVidaCristiana: number;
    children: number;
  };
}

export interface AsignacionFormData {
  name: string;
  semana: string;
  month: Month;
  parentId?: string;
  presidenteId?: string;
  presidenteReunionId?: string;
  lectorReunionId?: string;
  oracionFinalVMId?: string;
  oracionFinalPublicaId?: string;
  tesorosDeLaBiblia: AssignmentItem[];
  seamosMejoresMaestros: AssignmentItem[];
  nuestraVidaCristiana: AssignmentItem[];
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface SearchUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
}