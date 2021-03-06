import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {URL_SERVICIOS} from '../../config/config';
import {BehaviorSubject} from 'rxjs';
import {Escuela} from '../../interfaces/escuela.interface';

@Injectable()
export class BloqueFoliosService {
  token = localStorage.getItem('token');
  private urlBloqueFolios = URL_SERVICIOS + '/bloque_folio';
  temporada = JSON.parse(localStorage.getItem('season'));
  idTemporada = this.temporada.idtemporada;

  dataChange: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) { }

  get data(): Escuela[] {
    return this.dataChange.value;
  }

  agregarBloqueFolios(bloqueFolios) {
    const url = `${this.urlBloqueFolios}/nuevo`;
    const body = JSON.stringify(bloqueFolios);
    return this.http.post(url, body, {headers: {'Content-Type': 'application/json'}});
  }

  folioInRange(clave_vendedor: string, folio: string) {
    const url = `${this.urlBloqueFolios}/isValidFolio`;
    let headers = new HttpHeaders();
    headers  = headers.append('Content-Type', 'application/json');

    let params = new HttpParams();
    params = params.append('clave', clave_vendedor);
    params = params.append('valor', folio);
    return this.http.get(url, {headers, params});
  }

  obtenerBloqueFolios() {
    return this.http.get<any[]>(`${this.urlBloqueFolios}/temporada/${this.idTemporada}`)
      .subscribe((data: any[]) => {
          console.log(data);
          this.dataChange.next(data);
        },
        () => {
          // console.log (error.name + ' ' + error.message);
        });
  }

  existeFolioXVendedorTemporada(claveVendedor, tipoFolio, folio) {
    const url = `${this.urlBloqueFolios}/isValidFolioType`;
    let params = new HttpParams();
    params = params.append('clave', claveVendedor);
    params = params.append('valor', folio);
    params = params.append('type', tipoFolio);

    return this.http.get(url, {headers: {'authorization': this.token, 'Content-Type': 'application/json'}, params});
  }

  bloqueFolioInRange(valor, idFolio) {
    const url = `${this.urlBloqueFolios}/range`;
    let params = new HttpParams();
    params = params.append('valor', valor);
    params = params.append('idfolio', idFolio);
    return this.http.get(url, {headers: {'authorization': this.token, 'Content-Type': 'application/json'}, params});
  }

}
