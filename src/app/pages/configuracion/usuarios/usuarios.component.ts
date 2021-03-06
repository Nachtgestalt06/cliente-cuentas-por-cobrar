import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {VendedorService} from '../../../services/vendedor/vendedor.service';
import {UserService} from '../../../services/user/user.service';
import swal from 'sweetalert';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  forma: FormGroup;

  roles = [
    {value: 'ADMIN_ROLE', viewValue: 'Administrador'},
    {value: 'VENDOR_ROLE', viewValue: 'Vendedor'},
    {value: 'ALMACEN_ROLE', viewValue: 'Almacen'},
    {value: 'HACIENDA_ROLE', viewValue: 'Hacienda'}
  ];

  constructor(private  _userService: UserService, private _vendedorService: VendedorService) {
    this.forma = new FormGroup({
      'username': new FormControl('', Validators.required, this.validarUsername.bind(this)),
      'password': new FormControl('', Validators.required),
      'role': new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
  }

  agregar() {
    this._userService.agregarUsuario(this.forma.value)
      .subscribe(res => {
        console.log(res);
        swal('Usuario agregado', 'Usuario agregado con exito', 'success');
        this.forma.reset();
      });
  }

  validarUsername(control: AbstractControl) {
    return this._vendedorService.existeUsername(control.value)
      .pipe(map(res => {
        console.log(res);
        return res ? {existeUsername: true} : null;
      }));
  }

  getErrorMessages() {
    return ' Campo requerido ';
  }

}
