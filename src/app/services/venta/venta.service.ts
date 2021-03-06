import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {URL_SERVICIOS} from '../../config/config';
import {Venta} from '../../interfaces/venta.interface';
import {BehaviorSubject} from 'rxjs';
import * as moment from 'moment';
import {map} from 'rxjs/operators';

@Injectable()
export class VentaService {
  ventasURL = URL_SERVICIOS + '/venta';
  token = localStorage.getItem('token');
  pdfURL = URL_SERVICIOS + '/inventario/pdf?folio=';

  dataChange: BehaviorSubject<Venta[]> = new BehaviorSubject<Venta[]>([]);

  constructor(public http: HttpClient) {
  }

  get data(): Venta[] {
    return this.dataChange.value;
  }

  getVentas() {
    return this.http.get<Venta[]>(this.ventasURL, {headers: {'Content-Type': 'application/json'}})
      .pipe(map(
        res => {
          for (const venta of res) {
            venta.fecha = moment(venta.fecha).locale('es').format('DD MMM YYYY'); // parse integer
          }
          return res;
        }
      ))
      .subscribe(data => {
          console.log(data);
          this.dataChange.next(data);
        },
        (error: HttpErrorResponse) => {
          console.log(error.name + ' ' + error.message);
        });
  }

  obtenerVentas() {
    const temporada = JSON.parse(localStorage.getItem('season'));
    const params = new HttpParams().set('hacienda', '0');
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    // return this.http.get<Venta[]>(`${this.ventasURL}`, {headers});
    return this.http.get<Venta[]>(`${this.ventasURL}/temporada/${temporada.idtemporada}`, {headers, params});
  }

  getVenta(id) {
    const url = `${this.ventasURL}/${id}`;
    return this.http.get(url, {headers: {'authorization': this.token, 'Content-Type': 'application/json'}})
      .pipe(map(
        (res: any) => {
          const venta = {
            zona: res.escuela.zona.idzona,
            vendedor_clave: res.bloqueFolio.vendedor.clave,
            vendedor: `${res.bloqueFolio.vendedor.nombre} ${res.bloqueFolio.vendedor.apellidos}`,
            folio: res.folio,
            fecha: res.fecha,
            escuela: res.escuela,
            maestro: res.profesor,
            comision_director: res.comisionDirector,
            comision_profesor: res.comisionProfesor,
            comision_vendedor: res.comisionVendedor,
            idfolios: res.bloqueFolio.folio.idfolios,
            lideres: res.lideres
          };
          console.log(venta);
          console.log(res);
          return venta;
        }
      ));
  }

  postVenta(venta) {
    const url = `${this.ventasURL}/nuevo`;
    const body = JSON.stringify(venta);
    return this.http.post(url, body, {headers: {'Content-Type': 'application/json'}});
  }

  postResurtido(historial, folio) {
    const url = `${this.ventasURL}/resurtido`;
    const body = JSON.stringify(historial);
    let headers = new HttpHeaders();
    headers = headers.append('authorization', this.token);
    headers = headers.append('Content-Type', 'application/json');

    let params = new HttpParams();
    params = params.append('folio', folio);
    return this.http.post(url, body, {headers, params});
  }


  putVenta(venta) {
    const body = JSON.stringify(venta);
    return this.http.put(this.ventasURL, body, {headers: {'authorization': this.token, 'Content-Type': 'application/json'}});
  }

  getPFDVenta(folio) {
    // console.log(`${this.pdfURL}${folio}`);
    return this.http
      .get(`${this.pdfURL}${folio}`, {headers: {'authorization': this.token}, responseType: 'blob'})
      .pipe(map(res => {
        console.log(`${this.pdfURL}${folio}`);
        return new Blob([res], {type: 'application/pdf'});
      }));
  }

  folioAsignadoVenta(folio) {
    const url = `${this.ventasURL}/search/folio=${folio}`;
    return this.http.get(url, {headers: {'authorization': this.token, 'Content-Type': 'application/json'}});
  }

  deleteVenta(folio) {
    const url = `${this.ventasURL}/${folio}`;
    return this.http.delete(url, {headers: {'authorization': this.token, 'Content-Type': 'application/json'}});
  }
}
