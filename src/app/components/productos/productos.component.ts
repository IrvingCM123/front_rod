import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../services/productos.service';

interface response {
  httpStatusCode: string | number;
  mensajeRespuesta: string | any;
}

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  // Modelo de producto
  product = {
    producto_ID: '',
    name: '',
    price: 0,
    quantity: 0
  };

  products: any;

  async ngOnInit(): Promise<void> {
    this.products = await this.productosService.getProducts() ?? [];
  }

  // Lista de productos


  // Variables para notificaciones (toast)
  showToast = false;
  isSuccess = false;
  toastMessage = '';

  constructor(private productosService: ProductosService) { }

  // Método para registrar un producto
  async registerProduct(productForm: any) {
    if (productForm.valid) {

      let response: response = {
        httpStatusCode: '500',
        mensajeRespuesta: 'Error'
      };

      try {
        response = await this.productosService.addProduct({ ...this.product });

        if (response.httpStatusCode == 500) {
          alert(response.mensajeRespuesta)
        }

        if (response.httpStatusCode == 201) {
          alert(response.mensajeRespuesta)
          window.location.reload();
        }


      } catch (error) {
        alert(response.mensajeRespuesta)
      }
      // Limpiar formulario
      this.resetForm();
      productForm.resetForm();
    } else {
      this.showToastMessage('Por favor, complete todos los campos obligatorios.', false);
    }
  }

  // Mostrar notificaciones (toast)
  showToastMessage(message: string, success: boolean) {
    this.toastMessage = message;
    this.isSuccess = success;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // Restablecer el formulario
  resetForm() {
    this.product = {
      producto_ID: '',
      name: '',
      price: 0,
      quantity: 0
    };
  }

  // Editar un producto
  async editProduct(product: any) {
    let response: response = {
      httpStatusCode: '500',
      mensajeRespuesta: 'Error'
    };

    try {
      response = await this.productosService.updateProduct({ ...this.product });

      if (response.httpStatusCode == 500) {
        alert(response.mensajeRespuesta);
      }

      if (response.httpStatusCode == 201) {
        alert(response.mensajeRespuesta);
        window.location.reload();
      }


    } catch (error) {
      alert(response.mensajeRespuesta)
    }
  }

  // Eliminar un producto
  async deleteProduct(product: any) {
    let response: response = {
      httpStatusCode: '500',
      mensajeRespuesta: 'Error'
    };

    try {
      response = await this.productosService.deleteProduct(product);

      if (response.httpStatusCode == 500) {
        alert(response.mensajeRespuesta);
      }

      if (response.httpStatusCode == 201) {
        alert(response.mensajeRespuesta);
        window.location.reload();
      }


    } catch (error) {
      alert(response.mensajeRespuesta)
    }

  }
}
