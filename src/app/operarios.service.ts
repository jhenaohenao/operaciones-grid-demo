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
        actividades: {
          '08:00': 'Actividad A',
          '09:00': 'Actividad B',
          '12:00': null, // Hora de receso
          '12:30': 'Actividad C',
          '14:00': 'Actividad D',
        },
        imagen: 'assets/img/avatar.png'
      },
      {
        nombre: 'Operario 2',
        actividades: {
          '08:00': 'Actividad E',
          '10:00': 'Actividad F',
          '12:00': null, // Hora de receso
          '13:00': 'Actividad G',
        },
        imagen: 'assets/img/avatar.png'
      },
      {
        nombre: 'Operario 3',
        actividades: {
          '09:00': 'Actividad H',
          '11:00': 'Actividad I',
          '12:00': null, // Hora de receso
          '15:00': 'Actividad J',
        },
        imagen: 'assets/img/avatar.png'
      },
      {
        nombre: 'Operario 4',
        actividades: {
          '08:00': 'Actividad K',
          '10:00': 'Actividad L',
          '12:00': null, // Hora de receso
          '16:00': 'Actividad M',
        },
        imagen: 'assets/img/avatar.png'
      },
      {
        nombre: 'Operario 5',
        actividades: {
          '09:00': 'Actividad N',
          '11:00': 'Actividad O',
          '12:00': null, // Hora de receso
          '17:00': 'Actividad P',
        },
        imagen: 'assets/img/avatar.png'
      }
    ];

    // Simular la respuesta de la API
    return of(operariosData);
  }
}
