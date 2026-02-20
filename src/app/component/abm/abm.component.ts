import { Component, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PersonaListComponent } from '../persona-list/persona-list.component';
import { MotivoListComponent } from '../motivo-list/motivo-list.component';
import { HistorialListComponent } from '../historial-list/historial-list.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import htmlToPdfmake from 'html-to-pdfmake';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { AuthService } from '../../service/auth.service';
import { AdminAccessService } from '../../service/admin-access.service';
import { Subscription, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

declare var pdfMake: any;

interface ChartSeries {
  labels?: unknown;
  values?: unknown;
}

interface ChartImages {
  atenciones_por_dia_data_url?: unknown;
  atenciones_por_motivo_data_url?: unknown;
}

interface HistorialChartsResponse {
  images?: ChartImages;
  series?: {
    atenciones_por_dia?: ChartSeries;
    atenciones_por_motivo?: ChartSeries;
  };
}

interface PreparedPdfImage {
  dataUrl: string;
  width: number;
  height: number;
}

@Component({
  selector: 'app-abm',
  standalone: true,
  imports: [NavbarComponent, PersonaListComponent, CommonModule, FormsModule, MotivoListComponent, HistorialListComponent],
  templateUrl: './abm.component.html',
  styleUrl: './abm.component.css'
})
export class AbmComponent implements OnInit, OnDestroy {
  @ViewChild('contenedorTabla') contenedor!: ElementRef;
  @ViewChild('chartsContainer') chartsContainer?: ElementRef<HTMLElement>;

  motivoList = false;
  historialList = false;
  personaList = false;
  chartsView = true;
  loadingAccess = false;
  hasPanelAccess = true;

  lineLabels: string[] = [];
  lineData: number[] = [];
  barLabels: string[] = [];
  barData: number[] = [];
  imgDia = '';
  imgMotivo = '';
  chartsLoading = false;
  chartsError = '';
  fromDate = '';
  toDate = '';
  private chartsSub?: Subscription;

  constructor(
    private auth: AuthService,
    private adminAccessService: AdminAccessService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.validatePanelVisitasAccess();
  }

  ngOnDestroy(): void {
    this.stopChartLoading();
  }

  private validatePanelVisitasAccess(): void {
    this.loadingAccess = true;
    const userId = this.auth.getUserId();
    if (userId === null) {
      this.hasPanelAccess = false;
      this.loadingAccess = false;
      return;
    }

    this.adminAccessService.getUserById(userId).pipe(
      map((response) => this.hasPanelVisitasAccess(response)),
      catchError(() => of(false))
    ).subscribe((hasAccess) => {
      this.hasPanelAccess = hasAccess;
      this.loadingAccess = false;

      if (!hasAccess) {
        this.personaList = false;
        this.motivoList = false;
        this.historialList = false;
        this.chartsView = false;
        this.clearChartData();
        return;
      }
    });
  }

  private hasPanelVisitasAccess(response: unknown): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const payload = response as Record<string, unknown>;
    const user = payload['user'];
    if (!user || typeof user !== 'object') {
      return false;
    }

    const userRecord = user as Record<string, unknown>;
    const rawSuperuser = userRecord['is_superuser'] ?? userRecord['isSuperuser'];
    if (this.toBoolean(rawSuperuser)) {
      return true;
    }

    const permissions = [
      ...(this.toArray(userRecord['direct_permissions'])),
      ...(this.toArray(userRecord['group_permissions'])),
      ...(this.toArray(userRecord['permissions']))
    ];

    const hasCodenamePermission = permissions.some((permission) => {
      if (!permission || typeof permission !== 'object') {
        return false;
      }
      const record = permission as Record<string, unknown>;
      const code = record['codename'] ?? record['code'];
      return typeof code === 'string' && code.trim().toLowerCase() === 'ver_visitas';
    });

    if (hasCodenamePermission) {
      return true;
    }

    const roles = this.toArray(userRecord['roles']);
    return roles.some((role) => {
      if (!role || typeof role !== 'object') {
        return false;
      }
      const name = (role as Record<string, unknown>)['name'];
      if (typeof name !== 'string') {
        return false;
      }
      const normalized = name.trim().toLowerCase().replace(/\s+/g, '_');
      return normalized === 'ver_panel_visitas';
    });
  }

  private toArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private toBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === 'true' || normalized === '1';
    }
    return false;
  }

  loadHistorialCharts(from: string, to: string): void {
    const token = this.auth.getToken();
    if (!token) {
      this.chartsError = 'No hay token de autenticacion.';
      this.clearChartData();
      return;
    }

    this.stopChartLoading();
    this.chartsLoading = true;
    this.chartsError = '';

    this.chartsSub = this.http.get<HistorialChartsResponse>(`${environment.api}/api/charts/historial/render/`, {
      headers: { Authorization: `Token ${token}` },
      params: { from, to }
    }).subscribe({
      next: (resp) => {
        if (!this.chartsView) {
          return;
        }
        const images = resp?.images;
        this.imgDia = this.toSafeString(images?.atenciones_por_dia_data_url);
        this.imgMotivo = this.toSafeString(images?.atenciones_por_motivo_data_url);

        const lineSeries = resp?.series?.atenciones_por_dia;
        const barSeries = resp?.series?.atenciones_por_motivo;
        this.lineLabels = this.toStringArray(lineSeries?.labels);
        this.lineData = this.toNumberArray(lineSeries?.values);
        this.barLabels = this.toStringArray(barSeries?.labels);
        this.barData = this.toNumberArray(barSeries?.values);

        if (!this.hasChartData()) {
          this.chartsError = 'La respuesta no trajo imagenes ni series para graficar.';
        }
      },
      error: (error) => {
        console.error('Error loading historial charts:', error);
        this.chartsError = 'No se pudieron cargar los datos del grafico.';
        this.clearChartData();
      },
      complete: () => {
        this.chartsLoading = false;
        this.chartsSub = undefined;
      }
    });
  }

  generateCharts(): void {
    const from = this.fromDate.trim();
    const to = this.toDate.trim();

    if (!from || !to) {
      this.chartsError = 'Selecciona fecha desde y fecha hasta para generar los graficos.';
      this.clearChartData();
      return;
    }

    if (from > to) {
      this.chartsError = 'La fecha desde no puede ser mayor que la fecha hasta.';
      this.clearChartData();
      return;
    }

    this.loadHistorialCharts(from, to);
  }

  private clearChartData(): void {
    this.lineLabels = [];
    this.lineData = [];
    this.barLabels = [];
    this.barData = [];
    this.imgDia = '';
    this.imgMotivo = '';
    this.chartsLoading = false;
  }

  private toSafeString(value: unknown): string {
    if (typeof value !== 'string') {
      return '';
    }
    return value.trim();
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.map((item) => String(item ?? ''));
  }

  private toNumberArray(value: unknown): number[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map((item) => (typeof item === 'number' ? item : Number(item)))
      .filter((item) => Number.isFinite(item));
  }

  showPersonaList() {
    if (!this.hasPanelAccess) {
      return;
    }
    this.stopChartLoading();
    this.chartsView = false;
    this.personaList = true;
    this.motivoList = false;
    this.historialList = false;
  }

  showHistorialList() {
    if (!this.hasPanelAccess) {
      return;
    }
    this.stopChartLoading();
    this.chartsView = false;
    this.historialList = true;
    this.personaList = false;
    this.motivoList = false;
  }

  showMotivoList() {
    if (!this.hasPanelAccess) {
      return;
    }
    this.stopChartLoading();
    this.chartsView = false;
    this.motivoList = true;
    this.historialList = false;
    this.personaList = false;
  }

  showCharts(): void {
    if (!this.hasPanelAccess) {
      return;
    }

    this.chartsView = true;
    this.personaList = false;
    this.motivoList = false;
    this.historialList = false;
  }

  async exportPDF() {
    const table = this.getActiveTable();
    if (table) {
      this.exportTablePdf(table);
      return;
    }

    await this.exportChartsPdf();
  }

  exportExcel() {
    const table = this.getActiveTable();
    if (table) {
      this.exportTableExcel(table);
      return;
    }

    this.exportChartsExcel();
  }

  hasChartData(): boolean {
    return !!this.imgDia || !!this.imgMotivo || this.lineData.length > 0 || this.barData.length > 0;
  }

  private getActiveTable(): HTMLTableElement | null {
    if (!this.contenedor?.nativeElement) {
      return null;
    }

    return this.contenedor.nativeElement.querySelector('table');
  }

  private stopChartLoading(): void {
    this.chartsSub?.unsubscribe();
    this.chartsSub = undefined;
    this.chartsLoading = false;
  }

  private exportTablePdf(table: HTMLTableElement): void {
    try {
      const val = htmlToPdfmake(table.outerHTML);
      const docDefinition = {
        content: [
          { text: 'Reporte', fontSize: 20, bold: true, margin: [0, 0, 0, 10] },
          val
        ],
        styles: {
          header: { bold: true, fontSize: 18 }
        }
      };

      if (typeof pdfMake !== 'undefined') {
        pdfMake.createPdf(docDefinition).download('tabla.pdf');
      } else {
        alert('La libreria pdfMake no esta cargada. Revisa el index.html');
      }
    } catch (error) {
      console.error(error);
      alert('Error al generar pdf');
    }
  }

  private async exportChartsPdf(): Promise<void> {
    const chartImages = [
      { title: 'Atenciones por dia', dataUrl: this.imgDia },
      { title: 'Atenciones por motivo', dataUrl: this.imgMotivo }
    ].filter((item) => !!item.dataUrl);

    if (!chartImages.length) {
      alert('No hay graficos cargados para exportar.');
      return;
    }

    try {
      const prepared = await Promise.all(chartImages.map((chart) => this.preparePdfImage(chart.dataUrl)));
      const useLandscape = prepared.some((image) => image.width > image.height);
      const pageOrientation = useLandscape ? 'landscape' : 'portrait';
      const pdf = new jsPDF(useLandscape ? 'l' : 'p', 'mm', 'a4');

      chartImages.forEach((chart, index) => {
        const image = prepared[index];
        if (index > 0) {
          pdf.addPage('a4', pageOrientation);
        }

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const titleY = 12;
        const imageTop = 18;
        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - imageTop - margin;
        const ratio = image.width / image.height;

        let drawWidth = maxWidth;
        let drawHeight = drawWidth / ratio;

        if (drawHeight > maxHeight) {
          drawHeight = maxHeight;
          drawWidth = drawHeight * ratio;
        }

        const x = (pageWidth - drawWidth) / 2;

        pdf.setFontSize(12);
        pdf.text(chart.title, margin, titleY);
        pdf.addImage(image.dataUrl, 'JPEG', x, imageTop, drawWidth, drawHeight);
      });

      pdf.save('graficos.pdf');
    } catch (error) {
      console.error('error al generar pdf de graficos', error);
      alert('Ocurrio un error al generar el pdf de graficos');
    }
  }

  private preparePdfImage(sourceDataUrl: string): Promise<PreparedPdfImage> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const maxEdge = 2200;
        const sourceWidth = image.naturalWidth || image.width;
        const sourceHeight = image.naturalHeight || image.height;
        const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
        const width = Math.max(1, Math.round(sourceWidth * scale));
        const height = Math.max(1, Math.round(sourceHeight * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('No se pudo crear el contexto de canvas'));
          return;
        }

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve({ dataUrl, width, height });
      };
      image.onerror = () => reject(new Error('No se pudo procesar la imagen para PDF'));
      image.src = sourceDataUrl;
    });
  }

  private exportTableExcel(table: HTMLTableElement): void {
    try {
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'reporte');
      XLSX.writeFile(wb, 'reporte.xlsx');
    } catch (error) {
      console.error('error al generar excel', error);
      alert('Ocurrio un error al generar el archivo');
    }
  }

  private exportChartsExcel(): void {
    if (this.lineData.length === 0 && this.barData.length === 0) {
      alert('No hay series numericas en la respuesta para exportar a excel.');
      return;
    }

    if (!this.hasChartData()) {
      alert('No hay graficos cargados para exportar.');
      return;
    }

    try {
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      const lineRows = this.lineLabels.map((label, index) => ({
        fecha: label,
        atenciones: this.lineData[index] ?? 0
      }));
      const barRows = this.barLabels.map((label, index) => ({
        motivo: label,
        atenciones: this.barData[index] ?? 0
      }));

      const lineWs = XLSX.utils.json_to_sheet(lineRows);
      const barWs = XLSX.utils.json_to_sheet(barRows);
      XLSX.utils.book_append_sheet(wb, lineWs, 'AtencionesDia');
      XLSX.utils.book_append_sheet(wb, barWs, 'AtencionesMotivo');
      XLSX.writeFile(wb, 'graficos.xlsx');
    } catch (error) {
      console.error('error al generar excel de graficos', error);
      alert('Ocurrio un error al generar el excel de graficos');
    }
  }
}
