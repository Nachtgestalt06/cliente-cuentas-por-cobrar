import {DataSource} from '@angular/cdk/table';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ComisionesService} from '../services/comisiones/comisiones.service';
import {MatPaginator, MatSort} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {catchError, delay, finalize, map} from 'rxjs/operators';
import {of} from 'rxjs/internal/observable/of';

import {merge} from 'rxjs';

export class ComisionensLiderDataSource extends DataSource<any> {
  private comisionesLiderSubject = new BehaviorSubject<any[]>([]);
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

  constructor(public _exampleDatabase: ComisionesService,
              public _paginator: MatPaginator,
              public _sort: MatSort) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
    this.loadComisionesLider();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<any[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      // this._exampleDatabase.dataChangeLider,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];
    const comisionesLider = this.comisionesLiderSubject.asObservable();
    // this._exampleDatabase.getComisionesXLider(this.season.idtemporada);

    return merge(comisionesLider, ...displayDataChanges)
      .pipe(
        delay(0),
        map(() => {
          // Filter data
          this.filteredData = this.comisionesLiderSubject.value.slice().filter((cuentaVendedor: any) => {
            const searchStr = (cuentaVendedor.idprofesor + cuentaVendedor.nombre).toLowerCase();
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

  loadComisionesLider() {
    this.loadingSubject.next(true);
    this._exampleDatabase.getComisionesXLider(this.season.idtemporada)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(ventas => {
      console.log(ventas);
      this.comisionesLiderSubject.next(ventas);
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
          [propertyA, propertyB] = [a.idprofesor, b.idprofesor];
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
