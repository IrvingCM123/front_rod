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
export class ClientesService {

  private apiUrl = 'http://localhost:3000/servidor/clientes/';

  constructor(private http: HttpClient) { }

  // Obtener lista de clientes
  async getClients() {

    const token = localStorage.getItem('Token')

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    try {
      let response = await this.http.get<response>(this.apiUrl, { headers }).toPromise();
      if (response?.httpStatusCode == 201) {

        const clientesTransformados = (response.mensajeRespuesta).map((client: any) => ({
          name: client.cliente_Nombre,
          phone: client.cliente_Telefono,
          email: client.cliente_Correo,
          address: client.cliente_Direccion,
          cliente_ID: client.cliente_ID,
        }));

        return clientesTransformados;
      }

    } catch (error) {
      const respuesta: response = {
        httpStatusCode: 500,
        mensajeRespuesta: 'Error al consultar clientes'
      }
    }
  }

  // Agregar un nuevo cliente
  async addClient(client: any): Promise<response> {

    const token = localStorage.getItem('Token')

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const cliente = {
      cliente_Nombre: client.name,
      cliente_Telefono: client.phone,
      cliente_Correo: client.email,
      cliente_Direccion: client.address
    }

    try {
      const response: response | any = await this.http.post<response>(this.apiUrl, cliente, { headers }).toPromise();
      return response;
    } catch (error) {
      const response: response = {
        httpStatusCode: 500,
        mensajeRespuesta: 'Error al almacenar cliente'
      }
      return response;
    }
  }

  //actualizar cliente
  async updateClient(client: any): Promise<response> {

    const token = localStorage.getItem('Token')

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const cliente = {
      cliente_Nombre: client.name,
      cliente_Telefono: client.phone,
      cliente_Correo: client.email,
      cliente_Direccion: client.address
    }

    try {
      const response: response | any = await this.http.patch<response>(this.apiUrl + client.cliente_ID, cliente, { headers }).toPromise();
      return response;
    } catch (error) {
      const response: response = {
        httpStatusCode: 500,
        mensajeRespuesta: 'Error al almacenar cliente'
      }
      return response;
    }

  }

  // Eliminar un cliente
  async deleteClient(client: any): Promise<response> {

    const token = localStorage.getItem('Token')

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    try {
      const response: response | any = await this.http.delete<response>(this.apiUrl + client.cliente_ID, { headers }).toPromise();
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
