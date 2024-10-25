import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ColDef, CellClassParams, ValueGetterParams, GridOptions, CellValueChangedEvent, ValueSetterParams, ColGroupDef } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';
import { OperariosService } from '../operarios.service';
import { FormsModule } from '@angular/forms';

export interface Operario {
  nombre: string;
  date: Date;
  actividades: { [key: string]: string | null };
  imagen?: string;
}

@Component({
  selector: 'app-operaciones-grid',
  templateUrl: './operaciones-grid.component.html',
  styleUrls: ['./operaciones-grid.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [AgGridModule, FormsModule]
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
    const startDate = this.filtroActivo && this.fechaFiltrada
      ? new Date(this.fechaFiltrada)
      : new Date();

    startDate.setHours(0, 0, 0, 0);

    const fechasSiguientes: Date[] = [];
    for (let i = 0; i < this.numeroDiasMostrar; i++) {
      const fecha = new Date(startDate);
      fecha.setDate(startDate.getDate() + i);
      fechasSiguientes.push(fecha);
    }
    return fechasSiguientes;
  }

  private initializeColumns() {
    const todasLasFechas = [...new Set(
      this.operarios.map(op => op.date.toDateString())
    )].map(dateStr => new Date(dateStr));

    todasLasFechas.sort((a, b) => a.getTime() - b.getTime());

    const fechasAMostrar = this.getFechasAMostrar(todasLasFechas);

    this.columnas = [
      {
        headerName: '', // Encabezado vacío para evitar que ocupe espacio en la fila superior
        marryChildren: true,
        children: [
          {
            field: 'date',
            headerName: 'Fecha',
            filter: 'agDateColumnFilter',
            width: 150,
            pinned: 'left',
          },
          {
            field: 'nombre',
            headerName: 'Operario',
            width: 150,
             pinned: 'left',
            cellRenderer: (params: any) => {
              const operario = params.data;
              const imgSrc = operario.imagen ? operario.imagen : 'https://example.com/default-avatar.png';
              return `
                <div style="padding-top: 1rem; display: flex; flex-direction: column; align-items: center;">
                  <img src="${imgSrc}" alt="${operario.nombre}" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 5px;" />
                  <div style="text-align: center;">${operario.nombre}</div>
                </div>
              `;
            },
            cellStyle: { backgroundColor: '#f0f8ff', color: '#333' }
          }
        ]
      }
    ];

    fechasAMostrar.forEach(date => {
      const formattedDate = this.formatDate(date);
      const dayColumns: ColDef[] = this.workingHours.map(hora => {
        const columnWidth = hora === '12:00' || hora === '12:30' ? 90 : 120;

        return {
          headerName: hora,
          field: `actividades.${hora}`,
          editable: hora !== '12:00',
          width: columnWidth,
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
          }
        };
      });

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
      suppressMovable: true,
    },
    getRowHeight: () => 120,
    suppressColumnVirtualisation: true,
    onFilterChanged: (event) => {
      const filterModel = event.api.getFilterModel();
      this.filtroActivo = Object.keys(filterModel).length > 0;

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
