import { NgFor, NgForOf } from '@angular/common';
import { Historial } from '../../historial';
import { Component, OnInit } from '@angular/core';
import { HistorialService } from '../../service/historial.service';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-historial-list',
  standalone: true,
  imports: [NgFor,NgForOf, DatePipe, RouterLink],
  templateUrl: './historial-list.component.html',
  styleUrl: './historial-list.component.css'
})
export class HistorialListComponent implements OnInit{
  historiales : Historial [] = [];
  constructor (private historialService : HistorialService){}
  ngOnInit(): void {
    this.listHistoriales();
  }
  listHistoriales(): void {
    this.historialService.getHistorialList().subscribe(
      data=> {this.historiales = data.sort((a, b) => {
        const fechaA = new Date(a.timeStamp ?? '').getTime();
        const fechaB = new Date(b.timeStamp ?? '').getTime();
        return fechaB - fechaA;
      });
      
        console.log(this.historiales);
      }
    )
  }
}
