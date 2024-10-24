import { Component, OnInit } from '@angular/core';
import { ColDef, CellClassParams, ValueGetterParams, GridOptions, CellValueChangedEvent, ValueSetterParams, ColGroupDef, CellStyle } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';
import { OperariosService } from '../operarios.service';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { addDays, format } from 'date-fns';

// Definir una interfaz para los operarios y sus actividades
export interface Operario {
  nombre: string;
  date: Date;
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

  operarios: Operario[] = [];
  mostrarOperarios: { [key: string]: boolean } = {};
  columnas: (ColDef | ColGroupDef)[] = [];
  private filtroActivo: boolean = false;
  private fechaFiltrada: Date | null = null;
  private numeroDiasMostrar: number = 7;

  constructor(private operariosService: OperariosService) {}

  ngOnInit(): void {
    this.operariosService.getOperarios().subscribe((data: Operario[]) => {
      this.operarios = data;
      this.operarios.forEach(operario => {
        this.mostrarOperarios[operario.nombre] = true;
      });
      this.initializeColumns();
    });
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private getFechasAMostrar(todasLasFechas: Date[]): Date[] {
    // Si hay una fecha filtrada, comenzar desde esa fecha
    const startDate = this.filtroActivo && this.fechaFiltrada
      ? new Date(this.fechaFiltrada)
      : new Date();

    startDate.setHours(0, 0, 0, 0);

    // Generar array de fechas desde la fecha inicial hasta numeroDiasMostrar días después
    const fechasSiguientes: Date[] = [];
    for (let i = 0; i < this.numeroDiasMostrar; i++) {
      const fecha = new Date(startDate);
      fecha.setDate(startDate.getDate() + i);
      fechasSiguientes.push(fecha);
    }
    return fechasSiguientes;
  }

  private initializeColumns() {
    // Obtener todas las fechas únicas
    const todasLasFechas = [...new Set(
      this.operarios.map(op => op.date.toDateString())
    )].map(dateStr => new Date(dateStr));

    // Ordenar todas las fechas
    todasLasFechas.sort((a, b) => a.getTime() - b.getTime());

    // Obtener las fechas que se deben mostrar
    const fechasAMostrar = this.getFechasAMostrar(todasLasFechas);

    // Columnas base
    this.columnas = [
      {
        field: 'nombre',
        headerName: 'Operario',
        width: 150,
        pinned: 'left'
      } as ColDef,
      {
        field: 'date',
        headerName: 'Fecha',
        filter: 'agDateColumnFilter',
        width: 200,
        valueFormatter: (params) => {
          if (params.value) {
            return this.formatDate(new Date(params.value));
          }
          return '';
        },
      } as ColDef
    ];

    // Crear grupos de columnas por fecha
    fechasAMostrar.forEach(date => {
      const formattedDate = this.formatDate(date);
      const dayColumns: ColDef[] = this.workingHours.map(hora => ({
        headerName: hora,
        field: `actividades.${hora}`,
        editable: true,
        width: 100,
        valueGetter: (params: ValueGetterParams) => {
          if (params.data.date instanceof Date) {
            if (this.isSameDay(params.data.date, date)) {
              return params.data.actividades[hora] || '';
            }
          }
          return '';
        },
        valueSetter: (params: ValueSetterParams) => {
          if (!params.data.actividades) params.data.actividades = {};
          if (params.data.date instanceof Date && this.isSameDay(params.data.date, date)) {
            params.data.actividades[hora] = params.newValue;
            return true;
          }
          return false;
        },
        cellStyle: (params: CellClassParams) => {
          if (hora === '12:00') {
            return { backgroundColor: '#f5f5f5', color: '#999999', fontWeight: 'bold' };
          }
          return null;
        },
      }));

      const dayGroup: ColGroupDef = {
        headerName: formattedDate,
        children: dayColumns,
        marryChildren: true
      };

      this.columnas.push(dayGroup);
    });
  }

  gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      suppressMovable: true
    },
    suppressColumnVirtualisation: true,
    onFilterChanged: (event) => {
      const filterModel = event.api.getFilterModel();
      this.filtroActivo = Object.keys(filterModel).length > 0;

      // Obtener la fecha filtrada si existe
      if (this.filtroActivo && filterModel['date']) {
        const dateFilter = filterModel['date'];
        if (dateFilter.dateFrom) {
          this.fechaFiltrada = new Date(dateFilter.dateFrom);
        }
      } else {
        this.fechaFiltrada = null;
      }

      this.initializeColumns();
    },
    onCellValueChanged: (event) => {
      console.log('Actividad cambiada:', event.data);
    }
  };

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

