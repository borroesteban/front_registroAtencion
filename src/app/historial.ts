import { Persona } from './Persona';
import { Motivo } from './motivo';

export interface Historial {
  historialId?: number;
  notes?: string | null;
  timeStamp?: string;        // viene del backend
  persona?: Persona | null;
  motivo?: Motivo | null;
}


