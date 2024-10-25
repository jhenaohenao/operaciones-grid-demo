import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ColDef, CellClassParams, ValueGetterParams } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';
import { OperariosService } from '../operarios.service';
import { FormsModule } from '@angular/forms';

// Definir una interfaz para los operarios y sus actividades
export interface Operario {
  nombre: string;
  actividades: { [key: string]: string | null };
  imagen?: string; // Agregar campo para imagen o avatar
}

@Component({
  selector: 'app-operaciones-grid',
  templateUrl: './operaciones-grid.component.html',
  styleUrls: ['./operaciones-grid.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None, // Desactivar encapsulamiento
  imports: [AgGridModule, FormsModule]
})
export class OperacionesGridComponent implements OnInit {
  workingHours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '12:30',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  operarios: Operario[] = [];
  mostrarOperarios: { [key: string]: boolean } = {};

  // Definir las columnas, incluyendo el cellRenderer para mostrar imagen/operario
  columnas: ColDef[] = [
    {
      field: 'nombre',
      headerName: 'Operario',
      width: 200,
      cellRenderer: (params: any) => {
        const operario = params.data;
        const imgSrc = operario.imagen ? operario.imagen : 'https://example.com/default-avatar.png'; // Imagen por defecto

        return `
          <div style="padding-top: 1rem; display: flex; flex-direction: column; align-items: center;">
            <img src="${imgSrc}" alt="${operario.nombre}" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 5px;" />
            <div style="text-align: center;">${operario.nombre}</div>
          </div>
        `;
      },
      cellStyle: { backgroundColor: '#f0f8ff', color: '#333' } // Estilo específico para la columna de operarios
    },
    ...this.workingHours.map(hora => ({
      headerName: hora,
      valueGetter: (params: ValueGetterParams) => params.data.actividades[hora] || '',
      editable: hora !== '12:00',
      cellStyle: (params: CellClassParams) => {
        if (hora === '12:00') {
          return { backgroundColor: '#f5f5f5', color: '#999999', fontWeight: 'bold' };
        }
        return null;
      },
      width: hora === '12:00' || hora === '12:30' ? 90 : 120
    }))
  ];

  gridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true
    },
    getRowHeight: () => 120,  // Ajustar la altura de las filas
    onCellValueChanged: (event: any) => {
      console.log('Actividad cambiada:', event.data);
    }
  };

  constructor(private operariosService: OperariosService) {}

  ngOnInit(): void {
    this.operariosService.getOperarios().subscribe((data: Operario[]) => {
      this.operarios = data;

      this.operarios.forEach(operario => {
        this.mostrarOperarios[operario.nombre] = true;
      });
    });
  }

  getOperariosFiltrados(): Operario[] {
    return this.operarios.filter(operario => this.mostrarOperarios[operario.nombre]);
  }

  isTimeAvailable(time: string): boolean {
    return time !== '12:00';
  }

  assignActivity(time: string, activity: string) {
    if (this.isTimeAvailable(time)) {
      console.log(`Asignando actividad "${activity}" a las ${time}`);
    } else {
      console.log(`No se puede asignar actividad a las ${time} (receso).`);
    }
  }
}
