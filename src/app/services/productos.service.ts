import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

interface response {
  httpStatusCode: string | number;
  mensajeRespuesta: string | any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private products = [
    {
      name: 'Laptop',
      price: 15000,
      quantity: 3
    }
  ];

  private apiUrl = 'http://localhost:3000/servidor/productos/';

  constructor(private http: HttpClient) { }

  // Obtener lista de productos
  async getProducts() {

    const token = localStorage.getItem('Token')

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    try {
      let response = await this.http.get<response>(this.apiUrl, { headers }).toPromise();
      if (response?.httpStatusCode == 201) {

        const productosTransformados = (response.mensajeRespuesta).map((producto: any) => ({
          name: producto.producto_Nombre,
          price: producto.producto_Precio,
          quantity: producto.producto_Cantidad,
          producto_ID: producto.producto_ID,
        }));

        return productosTransformados;
      }

    } catch (error) {
      const respuesta: response = {
        httpStatusCode: 500,
        mensajeRespuesta: 'Error al consultar clientes'
      }
    }
  }

  // Agregar un nuevo producto
  async addProduct(product: any) {

    const token = localStorage.getItem('Token')

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const producto = {
      producto_Nombre: product.name,
      producto_Precio: product.price,
      producto_Cantidad: product.quantity
    }

    try {
      const response: response | any = await this.http.post<response>(this.apiUrl, producto, { headers }).toPromise();
      return response;
    } catch (error) {
      const response: response = {
        httpStatusCode: 500,
        mensajeRespuesta: 'Error al almacenar producto'
      }
      return response;
    }
  }

  async updateProduct(product: any): Promise<response> {

    const token = localStorage.getItem('Token')

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const producto = {
      producto_Nombre: product.name,
      producto_Precio: product.price,
      producto_Cantidad: product.quantity
    }

    try {
      const response: response | any = await this.http.patch<response>(this.apiUrl + product.producto_ID, producto, { headers }).toPromise();
      return response;
    } catch (error) {
      const response: response = {
        httpStatusCode: 500,
        mensajeRespuesta: 'Error al almacenar cliente'
      }
      return response;
    }

  }

  // Eliminar un producto
  async deleteProduct(product: any): Promise<response> {

    const token = localStorage.getItem('Token')

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    try {
      const response: response | any = await this.http.delete<response>(this.apiUrl + product.producto_ID, { headers }).toPromise();
      return response;
    } catch (error) {
      const response: response = {
        httpStatusCode: 500,
        mensajeRespuesta: 'Error al almacenar cliente'
      }
      return response;
    }
  }
}
