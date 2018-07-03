import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {InventarioService} from '../../services/inventario/inventario.service';
import {AddTemporadaComponent} from '../add-temporada/add-temporada.dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatSort} from '@angular/material';
import {VentaService} from '../../services/venta/venta.service';
import {DataSource} from '@angular/cdk/collections';
import {Venta} from '../../interfaces/venta.interface';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ShowResurtidoInterface} from '../../interfaces/showResurtido.interface';
import {VendedorDataSource} from '../../pages/recursos-humanos/modificar-empleado/modificar-empleado.component';
import {VendedorService} from '../../services/vendedor/vendedor.service';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import * as moment from 'moment';

@Component({
  selector: 'app-show-resurtidos',
  templateUrl: './show-resurtidos.dialog.component.html',
  styleUrls: ['./show-resurtidos.dialog.component.css']
})
export class ShowResurtidosDialogComponent implements OnInit {

  noData: boolean = false;
  displayedColumns = ['numresurtido', 'fecha', 'edit'];
  exampleDatabase: InventarioService | null;
  dataSource: ShowResurtidoInterfaceDataSource | null;

  index: number;
  id: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  constructor( private httpClient: HttpClient,
               public _inventarioService: InventarioService,
               public dialogRef: MatDialogRef<AddTemporadaComponent>,
               @Inject(MAT_DIALOG_DATA) public data: any,
               private domSanitizer: DomSanitizer) { }

  ngOnInit() {
    this.loadData();
  }

  public loadData() {
    this.exampleDatabase = new InventarioService(this.httpClient);
    this.dataSource = new ShowResurtidoInterfaceDataSource(this.exampleDatabase, this.paginator, this.sort, this.data.folio);
    Observable.fromEvent(this.filter.nativeElement, 'keyup')
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  printPDF(numresurtido) {
    let pdfResult;
    this._inventarioService.obtenerPDFXResurtido(this.data.folio, numresurtido)
      .subscribe(
        (data: any) => {
          console.log(data);
          // var fileURL = URL.createObjectURL(data);
          // window.open(fileURL, 'reporte de venta');
          pdfResult = this.domSanitizer.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(data)
          );
          window.open(pdfResult.changingThisBreaksApplicationSecurity);
          console.log(pdfResult);
        }
      );
  }

}

export class ShowResurtidoInterfaceDataSource extends DataSource<ShowResurtidoInterface> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: ShowResurtidoInterface[] = [];
  renderedData: ShowResurtidoInterface[] = [];

  constructor(public _exampleDatabase: InventarioService,
              public _paginator: MatPaginator,
              public _sort: MatSort,
              public folio) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ShowResurtidoInterface[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this._exampleDatabase.dataChangeResurtido,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];

    this._exampleDatabase.obtenerResurtidos(this.folio);

    return Observable.merge(...displayDataChanges).map(() => {
      // Filter data
      this.filteredData = this._exampleDatabase.dataResurtido.slice().filter((resurtido: ShowResurtidoInterface) => {
        const searchStr = (resurtido.numresurtido + moment(resurtido.fecha).format('DD MMM YYYY')).toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
      });

      // Sort filtered data
      const sortedData = this.sortData(this.filteredData.slice());

      // Grab the page's slice of the filtered sorted data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      this.renderedData = sortedData.splice(startIndex, this._paginator.pageSize);
      return this.renderedData;
    });
  }
  disconnect() {
  }

  /** Returns a sorted copy of the database data. */
  sortData(data: ShowResurtidoInterface[]): ShowResurtidoInterface[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      console.log('No se ontoy!')
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'numresurtido': [propertyA, propertyB] = [a.numresurtido, b.numresurtido]; break;
        case 'fecha': [propertyA, propertyB] = [a.fecha, b.fecha]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }

}
