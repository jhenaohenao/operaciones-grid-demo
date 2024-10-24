import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Operario } from './operaciones-grid/operaciones-grid.component';  // Importar la interfaz Operario

@Injectable({
  providedIn: 'root'
})
export class OperariosService {
  constructor() { }

  // Método que simula una llamada a la API para obtener operarios y sus actividades
  getOperarios(): Observable<Operario[]> {
    const operariosData: Operario[] = [
      {
        nombre: 'Operario 1',
        date: new Date('2024/10/24'),
        actividades: {
          '08:00': 'Actividad A',
          '09:00': 'Actividad B',
          '12:00': null, // Hora de receso
          '12:30': 'Actividad C',
          '14:00': 'Actividad D',
        }
      },
      {
        nombre: 'Operario 2',
        date: new Date('10/24/2024'),
        actividades: {
          '08:00': 'Actividad E',
          '10:00': 'Actividad F',
          '12:00': null, // Hora de receso
          '13:00': 'Actividad G',
        }
      },
      {
        nombre: 'Operario 3',
        date: new Date('10/20/2024'),
        actividades: {
          '09:00': 'Actividad H',
          '11:00': 'Actividad I',
          '12:00': null, // Hora de receso
          '15:00': 'Actividad J',
        }
      },
      {
        nombre: 'Operario 4',
        date: new Date('10/11/2024'),
        actividades: {
          '08:00': 'Actividad K',
          '10:00': 'Actividad L',
          '12:00': null, // Hora de receso
          '16:00': 'Actividad M',
        }
      },
      {
        nombre: 'Operario 5',
        date: new Date('10/10/2024'),
        actividades: {
          '09:00': 'Actividad N',
          '11:00': 'Actividad O',
          '12:00': null, // Hora de receso
          '17:00': 'Actividad P',
        }
      }
    ];

    // Simular la respuesta de la API
    return of(operariosData);
  }
}
