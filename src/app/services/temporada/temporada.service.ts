import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {Temporada} from '../../interfaces/temporada.interface';
import {URL_SERVICIOS} from '../../config/config';
import * as moment from 'moment';

@Injectable()
export class TemporadaService {
  token = localStorage.getItem('token');
  temporadaURL = URL_SERVICIOS + '/temporada';
  dataChange: BehaviorSubject<Temporada[]> = new BehaviorSubject<Temporada[]>([]);
  dialogData: any;

  get data(): Temporada[] {
    return this.dataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  constructor(private http: HttpClient) { }

  agregarTemporada(temporada: Temporada) {
    const body = JSON.stringify(temporada);

    console.log(body);

    return this.http.post(this.temporadaURL, body, {headers: {'Content-Type': 'application/json'}});
  }

  obtenerTemporadas() {
    return this.http.get<Temporada[]>(this.temporadaURL, {headers: {'Content-Type': 'application/json'}})
      .subscribe(data => {
          for (const temporada of data) {
            temporada.fecha_inicio = moment(temporada.fecha_inicio).locale('es').format('DD MMM YYYY');
            temporada.fecha_termino = moment(temporada.fecha_termino).locale('es').format('DD MMM YYYY');
          }
          console.log(data);
          this.dataChange.next(data);
        },
        (error: HttpErrorResponse) => {
          console.log (error.name + ' ' + error.message);
        });
  }

  getTemporadas() {
    return this.http.get(this.temporadaURL, {headers: {'Content-Type': 'application/json'}});
  }

  getCurrentSeason() {
    return this.http.get(`${this.temporadaURL}/actual`, {headers: {'Content-Type': 'application/json'}});
  }

  actualizarTemporada(temporada) {
    const body = JSON.stringify(temporada);
    console.log(body);
    return this.http.put(this.temporadaURL, body, {headers: {'Content-Type': 'application/json'}});
  }

  getTemporada(id: any) {
    const url = `${this.temporadaURL}/${id}`;
    return this.http.get(url, {headers: {'Content-Type': 'application/json'}});
  }
}
