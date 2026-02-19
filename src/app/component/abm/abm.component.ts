import { Component, ViewChild, ElementRef} from '@angular/core';
import { PersonaListComponent } from '../persona-list/persona-list.component';
import { MotivoListComponent } from '../motivo-list/motivo-list.component';
import { HistorialListComponent } from '../historial-list/historial-list.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import htmlToPdfmake from 'html-to-pdfmake'; 
import * as XLSX from 'xlsx';
import { catchError } from 'rxjs';


// Importaciones corregidas para evitar errores de tipos

declare var pdfMake: any;
@Component({
  selector: 'app-abm',
  standalone: true,
  imports: [NavbarComponent, PersonaListComponent, CommonModule, MotivoListComponent, HistorialListComponent],
  templateUrl: './abm.component.html',
  styleUrl: './abm.component.css'
})

export class AbmComponent {
  @ViewChild('contenedorTabla') contenedor!: ElementRef;
  motivoList = false;
  historialList = false;
  personaList = false;



  showPersonaList() {
    this.personaList = true;
    this.motivoList = false;
    this.historialList = false;
  }

  showHistorialList() {
    this.historialList = true;
    this.personaList = false;
    this.motivoList = false;
  }

  showMotivoList() {
    this.motivoList = true;
    this.historialList = false;
    this.personaList = false;
  }

  exportPDF() {

    //si el contenedor no existe o no es un elemento nativo
    if (!this.contenedor || !this.contenedor.nativeElement) {
      alert("seleccionar una lista");
      return; 
    }

    // Verificar si el contenedor está correctamente referenciado
    if (!this.contenedor || !this.contenedor.nativeElement) {
      alert("Por favor, selecciona una lista antes de exportar.");
      return;
    }

    // Obtener el HTML interno donde están las tablas
    const contenidoHtml = this.contenedor.nativeElement.innerHTML;

    // Verificar si hay una tabla visible
    if (!contenidoHtml.includes('<table')) {
      alert("No hay una tabla visible para exportar.");
      return;
    } 
    
          if (!contenidoHtml.includes('<table')) {
      alert("No hay una tabla visible para exportar");
      return;
      }


    try{
      const val = htmlToPdfmake(contenidoHtml);
      const docDefinition = {
          content: [
            { text: 'Reporte', fontSize: 20, bold: true, margin: [0, 0, 0, 10] },
            val
          ],
          styles: {
            header: { bold: true, fontSize: 18 }
           }
         };
         
         if(typeof pdfMake !=='undefined'){
          pdfMake.createPdf(docDefinition).download("tabla.pdf");
        } else {
          alert('La librería pdfMake no está cargada. Revisa el index.html');
        }
      } catch (error) {
        console.error(error);
        alert ("error al generar pdf");
      }
    }
    //revisamos si existe una lista primero
      
    exportExcel() {
      if (!this.contenedor || !this.contenedor.nativeElement) {
        alert("seleccionar una lista");
        return;
      }

      // buscamos la tabla dentro del contenedor
      const table: HTMLTableElement | null = this.contenedor.nativeElement.querySelector('table');

      if (!table) {
        alert("no hay una tabla activa para exportar a excel");
        return;
      }

      try {
        const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'reporte');
        XLSX.writeFile(wb, 'reporte.xlsx');
      } catch (error) {
        console.error("error al generar excel", error);
        alert("ocurrio un error al generar el archivo");
      }
    }
  }
