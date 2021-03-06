import {DataSource} from '@angular/cdk/table';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {CuentasXcobrarService} from '../services/cuentas-xcobrar/cuentas-xcobrar.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {catchError, delay, finalize, map} from 'rxjs/operators';
import {of} from 'rxjs/internal/observable/of';

export class CuentasEscuelaDataSource extends DataSource<any> {
  private cuentasEscuelaSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  season = JSON.parse(localStorage.getItem('season'));
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: any[] = [];
  renderedData: any[] = [];

  constructor(public _exampleDatabase: CuentasXcobrarService,
              public _paginator: MatPaginator,
              public _sort: MatSort,
              public _claveVendedor: string) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
    this.loadCuentasEscuela();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<any[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      // this._exampleDatabase.dataChangeEscuela,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];

    const cuentasEscuela = this.cuentasEscuelaSubject.asObservable();
    // console.log(this._exampleDatabase.getCuentasXVendedorEscuela(this.season.idtemporada, this._claveVendedor));
    // this._exampleDatabase.getCuentasXVendedorEscuela(this.season.idtemporada, this._claveVendedor);


    return merge(cuentasEscuela, ...displayDataChanges)
      .pipe(
        delay(0),
        map(() => {
          // Filter data
          this.filteredData = this.cuentasEscuelaSubject.value.slice().filter((cuentaVendedor: any) => {
            const searchStr = (cuentaVendedor.clave + cuentaVendedor.nombre).toLowerCase();
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
    this.loadingSubject.complete();
    this.cuentasEscuelaSubject.complete();
  }

  loadCuentasEscuela() {
    this.loadingSubject.next(true);
    this._exampleDatabase.getCuentasXVendedorEscuela(this.season.idtemporada, this._claveVendedor)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(ventas => {
      console.log(ventas);
      this.cuentasEscuelaSubject.next(ventas);
    });
  }

  /** Returns a sorted copy of the database data. */
  sortData(data: any[]): any[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'clave':
          [propertyA, propertyB] = [a.clave, b.clave];
          break;
        case 'nombre':
          [propertyA, propertyB] = [a.nombre, b.nombre];
          break;
        case 'deuda':
          [propertyA, propertyB] = [a.deuda, b.deuda];
          break;
        case 'pagado':
          [propertyA, propertyB] = [a.pagado, b.pagado];
          break;
        case 'restante':
          [propertyA, propertyB] = [a.restante, b.restante];
          break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }

}
