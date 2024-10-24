import { Component, OnInit } from '@angular/core';
import { ColDef, CellClassParams, ValueGetterParams } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';
import { OperariosService } from '../operarios.service';
import { FormsModule } from '@angular/forms'; // Importa FormsModule

// Definir una interfaz para los operarios y sus actividades
export interface Operario {
  nombre: string;
  actividades: { [key: string]: string | null }; // Las actividades son por hora, y pueden ser null
}

@Component({
  selector: 'app-operaciones-grid',
  templateUrl: './operaciones-grid.component.html',
  styleUrls: ['./operaciones-grid.component.scss'],
  standalone: true,
  imports: [AgGridModule, FormsModule]  // Añadir FormsModule aquí
})
export class OperacionesGridComponent implements OnInit {
  workingHours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '12:30',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  operarios: Operario[] = []; // Inicializa como un array vacío con el tipo Operario[]
  mostrarOperarios: { [key: string]: boolean } = {}; // Para habilitar/deshabilitar la visualización de cada operario

  columnas: ColDef[] = [
    { field: 'nombre', headerName: 'Operario', width: 150 },
    ...this.workingHours.map(hora => ({
      headerName: hora,
      valueGetter: (params: ValueGetterParams) => params.data.actividades[hora] || '', // Obtener el valor dinámico de las actividades
      editable: hora !== '12:00', // Deshabilitar la celda de 12:00
      cellStyle: (params: CellClassParams) => {  // Asignar el tipo a params
        if (hora === '12:00') {
          return { backgroundColor: '#f5f5f5', color: '#999999', fontWeight: 'bold' }; // Estilo para las 12:00
        }
        return null;
      },
      width: hora === '12:00' || hora === '12:30' ? 90 : 120 // Reducir el ancho de 12:00 y 12:30
    }))
  ];

  gridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true
    },
    onCellValueChanged: (event: any) => {
      console.log('Actividad cambiada:', event.data);
    }
  };

  constructor(private operariosService: OperariosService) { }

  ngOnInit(): void {
    // Obtener datos de operarios desde la API simulada
    this.operariosService.getOperarios().subscribe((data: Operario[]) => {
      this.operarios = data;

      // Inicializar el objeto mostrarOperarios con todos los operarios habilitados
      this.operarios.forEach(operario => {
        this.mostrarOperarios[operario.nombre] = true;
      });
    });
  }

  // Filtrar los operarios seleccionados para mostrar en la tabla
  getOperariosFiltrados(): Operario[] {
    return this.operarios.filter(operario => this.mostrarOperarios[operario.nombre]);
  }

  // Verificar si una hora está disponible para asignar actividad
  isTimeAvailable(time: string): boolean {
    return time !== '12:00';  // Solo 12:00 no está disponible
  }

  assignActivity(time: string, activity: string) {
    if (this.isTimeAvailable(time)) {
      console.log(`Asignando actividad "${activity}" a las ${time}`);
    } else {
      console.log(`No se puede asignar actividad a las ${time} (receso).`);
    }
  }
}
