import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, fromEvent, merge, Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSort} from '@angular/material/sort';
import {ZonaService} from '../../../services/zona/zona.service';
import {HttpClient} from '@angular/common/http';
import {Zona} from '../../../interfaces/zona.interface';
import {DeleteProductoDialogComponent} from '../../../dialogs/delete-producto/delete-producto.dialog.component';
import {DataSource} from '@angular/cdk/collections';
import {AddZonaDialogComponent} from '../../../dialogs/add-zona/add-zona.dialog.component';
import {Vendedor} from '../../../interfaces/vendedor.interface';
import {ReportesService} from '../../../services/reportes/reportes.service';
import {DomSanitizer} from '@angular/platform-browser';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

@Component({
  selector: 'app-zonas',
  templateUrl: './zonas.component.html',
  styleUrls: ['./zonas.component.css']
})
export class ZonasComponent implements OnInit {
  displayedColumns = ['nombre', 'vendedor', 'edit'];
  exampleDatabase: ZonaService | null;
  dataSource: ZonaDataSource | null;

  index: number;
  id: string;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild('filter', {static: true}) filter: ElementRef;

  constructor(private httpClient: HttpClient,
              public dialog: MatDialog,
              public snackBar: MatSnackBar,
              public _reportesService: ReportesService,
              private domSanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.loadData();
  }


  public loadData() {
    this.exampleDatabase = new ZonaService(this.httpClient);
    this.dataSource = new ZonaDataSource(this.exampleDatabase, this.paginator, this.sort);
    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged()
      )
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  deleteItem(i: number, idzona: string, clave_vendedor: string) {
    this.index = i;
    this.id = clave_vendedor;
    console.log('Esta es la clave: ' + idzona);
    const dialogRef = this.dialog.open(DeleteProductoDialogComponent, {
      data: {idzona: idzona, clave_vendedor: clave_vendedor}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        this.openSnackBar('Zona eliminado', 'Aceptar');
        const foundIndex = this.exampleDatabase.dataChange.value.findIndex(x => x.idzona === this.id);
        // for delete we use splice in order to remove single object from DataService
        this.exampleDatabase.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    });
  }

  startEdit(i: number, idzona: string, vendedor: Vendedor) {
    this.id = idzona;
    // index row is used just for debugging proposes and can be removed
    this.index = i;
    console.log(this.index);
    const dialogRef = this.dialog.open(AddZonaDialogComponent, {
      data: {
        id: idzona,
        clave_vendedor: vendedor,
        edit: true,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        this.loadData();
      }
    });
  }

  private refreshTable() {
    // if there's a paginator active we're using it for refresh
    if (this.dataSource._paginator.hasNextPage()) {
      this.dataSource._paginator.nextPage();
      this.dataSource._paginator.previousPage();
      // in case we're on last page this if will tick
    } else if (this.dataSource._paginator.hasPreviousPage()) {
      this.dataSource._paginator.previousPage();
      this.dataSource._paginator.nextPage();
      // in all other cases including active filter we do it like this
    } else {
      this.dataSource.filter = '';
      this.dataSource.filter = this.filter.nativeElement.value;
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  agregarZona(zona: Zona) {
    const dialogRef = this.dialog.open(AddZonaDialogComponent, {
      data: {zona: zona}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        this.loadData();
        // After dialog is closed we're doing frontend updates
        // For add we're just pushing a new row inside DataService
        // this.exampleDatabase.dataChange.value.push(this._zonaService.getDialogData());
        // this.refreshTable();
      }
    });
  }

  imprimirZonas(vendedor = '') {
    let pdfResult;
    this._reportesService.reporteZonas(vendedor).subscribe(
      (data: any) => {
        console.log(data);
        pdfResult = this.domSanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(data)
        );
        window.open(pdfResult.changingThisBreaksApplicationSecurity);
        console.log(pdfResult);
      }
    );
  }
}

export class ZonaDataSource extends DataSource<Zona> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: Zona[] = [];
  renderedData: Zona[] = [];

  constructor(public _exampleDatabase: ZonaService,
              public _paginator: MatPaginator,
              public _sort: MatSort) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Zona[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];

    this._exampleDatabase.obtenerZonas();

    return merge(...displayDataChanges).pipe(map(() => {
      // Filter data
      this.filteredData = this._exampleDatabase.data.slice().filter((zona: Zona) => {
        const searchStr = (zona.idzona).toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
      });

      // Sort filtered data
      const sortedData = this.sortData(this.filteredData.slice());

      // Grab the page's slice of the filtered sorted data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      this.renderedData = sortedData.splice(startIndex, this._paginator.pageSize);
      return this.renderedData;
    }));
  }

  disconnect() {
  }

  /** Returns a sorted copy of the database data. */
  sortData(data: Zona[]): Zona[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'nombre':
          [propertyA, propertyB] = [a.idzona, b.idzona];
          break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }
}
