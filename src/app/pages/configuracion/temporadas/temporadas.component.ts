import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TemporadaService} from '../../../services/temporada/temporada.service';
import {DataSource} from '@angular/cdk/collections';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSort} from '@angular/material/sort';
import {BehaviorSubject, fromEvent, merge, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Temporada} from '../../../interfaces/temporada.interface';
import {DeleteProductoDialogComponent} from '../../../dialogs/delete-producto/delete-producto.dialog.component';
import {AddTemporadaComponent} from '../../../dialogs/add-temporada/add-temporada.dialog.component';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

@Component({
  selector: 'app-temporadas',
  templateUrl: './temporadas.component.html',
  styleUrls: ['./temporadas.component.css']
})
export class TemporadasComponent implements OnInit {
  displayedColumns = ['nombre', 'fecha_inicio', 'fecha_termino', 'edit'];
  exampleDatabase: TemporadaService | null;
  dataSource: TemporadaDataSource | null;

  index: number;
  id: number;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild('filter', {static: true}) filter: ElementRef;

  constructor(private httpClient: HttpClient,
              public dialog: MatDialog,
              public snackBar: MatSnackBar,
              public _temporadaService: TemporadaService) {
  }

  ngOnInit() {
    this.loadData();
  }


  public loadData() {
    this.exampleDatabase = new TemporadaService(this.httpClient);
    this.dataSource = new TemporadaDataSource(this.exampleDatabase, this.paginator, this.sort);
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

  startEdit(i: number, idtemporada: number, nombre: string, fecha_inicio: string, fecha_termino: string) {
    this.id = idtemporada;
    // index row is used just for debugging proposes and can be removed
    this.index = i;
    const dialogRef = this.dialog.open(AddTemporadaComponent, {
      data: {
        id: idtemporada,
        nombre: nombre,
        fecha_inicio: fecha_inicio,
        fecha_termino: fecha_termino,
        edit: true
      }
    });
  }

  deleteItem(i: number, clave: number, titulo: string, autor: string) {
    this.index = i;
    this.id = clave;
    console.log('Esta es la clave: ' + clave);
    const dialogRef = this.dialog.open(DeleteProductoDialogComponent, {
      data: {clave: clave, titulo: titulo, autor: autor}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        this.openSnackBar('Producto eliminado', 'Aceptar');
        const foundIndex = this.exampleDatabase.dataChange.value.findIndex(x => x.idtemporada === this.id);
        // for delete we use splice in order to remove single object from DataService
        this.exampleDatabase.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
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

  agregarTemporada(temporada: Temporada) {
    const dialogRef = this.dialog.open(AddTemporadaComponent, {
      data: {temporada: temporada}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        this.loadData();
        // After dialog is closed we're doing frontend updates
        // For add we're just pushing a new row inside DataService
        // this.exampleDatabase.dataChange.value.push(this._temporadaService.getDialogData());
        // this.refreshTable();
      }
    });
  }
}

export class TemporadaDataSource extends DataSource<Temporada> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: Temporada[] = [];
  renderedData: Temporada[] = [];

  constructor(public _exampleDatabase: TemporadaService,
              public _paginator: MatPaginator,
              public _sort: MatSort) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Temporada[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];

    this._exampleDatabase.obtenerTemporadas();

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          // Filter data
          this.filteredData = this._exampleDatabase.data.slice().filter((temporada: Temporada) => {
            const searchStr = (temporada.nombre).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });

          // Sort filtered data
          const sortedData = this.sortData(this.filteredData.slice());

          // Grab the page's slice of the filtered sorted data.
          const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
          this.renderedData = sortedData.splice(startIndex, this._paginator.pageSize);
          return this.renderedData;
        })
      );
  }

  disconnect() {
  }

  /** Returns a sorted copy of the database data. */
  sortData(data: Temporada[]): Temporada[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'nombre':
          [propertyA, propertyB] = [a.nombre, b.nombre];
          break;
        case 'fecha_inicio':
          [propertyA, propertyB] = [a.fecha_inicio, b.fecha_inicio];
          break;
        case 'fecha_termino':
          [propertyA, propertyB] = [a.fecha_termino, b.fecha_termino];
          break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }

}

