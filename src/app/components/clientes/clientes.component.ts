import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';


interface response {
  httpStatusCode: string | number;
  mensajeRespuesta: string | any;
}

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  // Modelo de cliente
  client = {
    cliente_ID: '',
    name: '',
    phone: '',
    email: '',
    address: ''
  };

  clients: any

  async ngOnInit(): Promise<void> {
    this.clients = await this.clientesService.getClients() ?? [];
  }

  // Variables para notificaciones (toast)
  showToast = false;
  isSuccess = false;
  toastMessage = '';

  constructor(private clientesService: ClientesService) { }

  // Método para registrar un cliente
  async registerClient(clientForm: any) {

    let response: response = {
      httpStatusCode: '500',
      mensajeRespuesta: 'Error'
    };

    if (clientForm.valid) {
      try {
        // Agregar cliente al servicio
        response = await this.clientesService.addClient({ ...this.client });

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
      // Limpiar formulario
      this.resetForm();
      clientForm.resetForm();
    } else {
      // Mostrar notificación de error
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
    this.client = {
      cliente_ID: '',
      name: '',
      phone: '',
      email: '',
      address: ''
    };
  }

  // Editar un cliente
  async editClient(client: any) {
    let response: response = {
      httpStatusCode: '500',
      mensajeRespuesta: 'Error'
    };

    try {
      response = await this.clientesService.updateClient({ ...this.client });

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

  // Eliminar un cliente
  async deleteClient(client: any) {
    let response: response = {
      httpStatusCode: '500',
      mensajeRespuesta: 'Error'
    };

    try {
      response = await this.clientesService.deleteClient(client);

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
