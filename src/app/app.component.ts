import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OperacionesGridComponent } from './operaciones-grid/operaciones-grid.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OperacionesGridComponent
     ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'operaciones-grid-demo';
}
