import {Component, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import {ProductosService} from '../../../services/producto/productos.service';
import {Http, Headers} from '@angular/http';
import {Producto} from '../../../interfaces/producto.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {Stock} from '../../../interfaces/stock.interface';
import {StockService} from '../../../services/stock/stock.service';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar-producto.component.html',
  styleUrls: ['./agregar-producto.component.css']
})
export class AgregarProductoComponent implements OnInit {
  // Banderas de control
  active = true;
  productoActualizar = true;
  productoAgregado = false;

  forma: FormGroup;

  clave: string;
  nivel: any;

  productsAfterChangeEvent = [];

  private producto: Producto = {
    clave_producto: '',
    autor: '',
    titulo: '',
    year: '',
    editorial: '',
    nivel: '',
    curso: '',
    isbn: '',
    descripcion: '',
    precio: null,
    costo: null,
    cantidad: null
  };

  niveles = [
    {value: 'Preescolar', viewValue: 'PREESCOLAR'},
    {value: 'Primaria', viewValue: 'PRIMARIA'},
    {value: 'Secundaria', viewValue: 'SECUNDARIA'}
  ];

  grados = [];

  gradosPrimaria = [
    {value: '1° - PRIMERO', viewValue: '1° - PRIMERO'},
    {value: '2° - SEGUNDO', viewValue: '2° - SEGUNDO'},
    {value: '3° - TERCERO', viewValue: '3° - TERCERO'},
    {value: '4° - CUARTO', viewValue: '4° - CUARTO'},
    {value: '5° - QUINTO', viewValue: '5° - QUINTO'},
    {value: '6° - SEXTO', viewValue: '6° - SEXTO'},
  ];

  gradosSecunadaria = [
    {value: '1° - PRIMERO', viewValue: '1° - PRIMERO'},
    {value: '2° - SEGUNDO', viewValue: '2° - SEGUNDO'},
    {value: '3° - TERCERO', viewValue: '3° - TERCERO'},
  ];



  constructor(private _productosService: ProductosService,
              private _stockService: StockService,
              private router: Router,
              private route: ActivatedRoute) {
    this.route.params
      .subscribe(parametros => {
        this.clave = parametros['clave'];
        if (this.clave !== 'nuevo') {
          this.crearFormaActualizar();
          this.productoActualizar = false;
          this._productosService.obtenerProducto(this.clave)
            .subscribe(producto => {
              console.log(producto);
              this.forma.setValue(producto);
              console.log(this.forma.value);
            });
        } else {
          this.productoActualizar = true;
          this.crearForma();
        }
      });
  }

  ngOnInit() {
    this.grados = this.gradosSecunadaria;
    // this._agregarService.solicitar().subscribe();
  }

  crearForma() {
    this.forma = new FormGroup({
      'clave_producto': new FormControl('', [Validators.required]),
      'isbn': new FormControl(''),
      'autor': new FormControl('', Validators.required),
      'titulo': new FormControl('', Validators.required),
      'year': new FormControl(''),
      'editorial': new FormControl('', Validators.required),
      'nivel': new FormControl(''),
      'curso': new FormControl(''),
      'descripcion': new FormControl(''),
      'precio': new FormControl('', Validators.required),
      'costo': new FormControl('', Validators.required),
      'cantidad': new FormControl('', Validators.required)
    });

    this.forma.get('nivel').valueChanges
      .subscribe(
        res => {
          console.log(res);
          if (res === 'Primaria') {
            this.grados = this.gradosPrimaria;
          } else {
            this.grados = this.gradosSecunadaria;
          }
        }

      );
  }

  // Funcion creada para omitir los validadores asincronos.
  crearFormaActualizar() {
    this.forma = new FormGroup({
      'claveProducto': new FormControl('', [Validators.required]),
      'clave_producto': new FormControl('', [Validators.required]),
      'isbn': new FormControl(''),
      'autor': new FormControl('', Validators.required),
      'titulo': new FormControl('', Validators.required),
      'year': new FormControl(''),
      'editorial': new FormControl('', Validators.required),
      'nivel': new FormControl(''),
      'curso': new FormControl(''),
      'descripcion': new FormControl(''),
      'precio': new FormControl('', Validators.required),
      'costo': new FormControl('', Validators.required)
    });
  }

  agregar() {
    if (this.clave === 'nuevo') {
      this._productosService.agregarProducto(this.forma.value)
        .subscribe(
          (res: any) => {
            console.log(res);
            let stock: Stock = {
              idstock: null,
              cantidad: this.forma.get('cantidad').value,
              libro: res.clave_producto,
              fecha_entrada: '',
              stock_actual: null
            };
            this._stockService.postStock(stock).subscribe(
              data => {
                console.log(data);
              }
            )
            this.productoActualizar = true;
            this.forma.reset();
            this.active = false;
            swal('Producto agregado', 'Producto agregado con exito', 'success');
            setTimeout(() => this.active = true, 1000);
          },
          error1 => {}
        );
    } else {
      this._productosService.actualizarProducto(this.forma.value, this.clave)
        .subscribe(res => {
          this.forma.reset();
          this.active = false;
          swal('Producto actualizado', 'Producto actualizado con exito', 'success');
          setTimeout(() => {
            this.router.navigate(['/almacen/productos']);
          }, 1000);
        });
    }
  }

  nivelChanged() {
    const nivelType = this.forma.get('nivel').value;
    this.productsAfterChangeEvent = this.grados.filter(p => p.value === nivelType);
  }

  getErrorMessages() {
    return ' Campo requerido ';
  }

}