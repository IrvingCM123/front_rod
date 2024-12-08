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
export class HomeService {

  private apiUrl = 'http://localhost:3000/servidor/ventas/';

  constructor(private http: HttpClient) { }

  // Obtener lista de clientes
  async getVentas() {

    const token = localStorage.getItem('Token')

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    try {
      let response = await this.http.get<response>(this.apiUrl, { headers }).toPromise();
      if (response?.httpStatusCode == 201) {

        return response.mensajeRespuesta;
      }

    } catch (error) {
      const respuesta: response = {
        httpStatusCode: 500,
        mensajeRespuesta: 'Error al consultar clientes'
      }

	  return respuesta;
    }
  }

  async addVentas(venta: any): Promise<response> {

    const token = localStorage.getItem('Token')

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

	console.log(venta)
	console.log(venta.productos)

	const productosTransformados = (venta.productos).map((producto: any) => ({
		productoVenta_ProductoID: producto.producto_ID,
		productoVenta_NombreProducto: producto.nombre,
		productoVenta_CantidadProducto: producto.cantidad,
		productoVenta_PrecioProducto: producto.precioUnitario,
		productoVenta_SubtotalVenta: producto.total,
	}));

	console.log(productosTransformados)

    const ventaObjeto = {
	  detalleVenta_TotalProductosVendidos: venta.totalProductos,
      detalleVenta_MontoTotal: venta.totalVenta,
      detalleVentaCorreoCliente: venta.cliente.email,
      detalleVentaNombreCliente: venta.cliente.name,
	  producto_ID: productosTransformados
    }

    try {
      const response: response | any = await this.http.post<response>(this.apiUrl, ventaObjeto, { headers }).toPromise();
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
