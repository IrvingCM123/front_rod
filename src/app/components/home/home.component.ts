import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';
import { ProductosService } from '../../services/productos.service';
import { HomeService } from 'src/app/services/home.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Client {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface Product {
  producto_ID: string,
  name: string;
  price: number;
  quantity: number;
}

interface CartItem extends Product {
  cartQuantity: number;
  total: number;
}

interface response {
  httpStatusCode: string | number;
  mensajeRespuesta: string | any;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  selectedClient: Client | null = null;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  cartItems: CartItem[] = [];
  cartTotal: number = 0;

  ventaRealizada: boolean = false;
  ultimaVenta: any;

  // Notificaciones
  showToast = false;
  isSuccess = false;
  toastMessage = '';

  isModalOpen = false;

  constructor(
    private clientesService: ClientesService,
    private productosService: ProductosService,
    private homeService: HomeService
  ) { }

  async ngOnInit(): Promise<void> {
    this.clients = await this.clientesService.getClients();
    this.products = await this.productosService.getProducts();
  }

  onClientSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredClients = this.clients.filter(client =>
      client.name.toLowerCase().includes(query)
    );
  }

  selectClient(client: Client): void {
    this.selectedClient = client;
    this.filteredClients = [];
  }

  onProductSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(query)
    );
  }

  selectProduct(product: Product): void {
    const existingItem = this.cartItems.find(item => item.name === product.name);
    if (existingItem) {
      existingItem.cartQuantity++;
      this.updateCartItem(this.cartItems.indexOf(existingItem));
    } else {
      const newItem: CartItem = {
        ...product,
        cartQuantity: 1,
        total: product.price
      };
      this.cartItems.push(newItem);
    }
    this.filteredProducts = [];
    this.updateCartTotal();
  }

  updateCartItem(index: number): void {
    const item = this.cartItems[index];
    item.total = item.price * item.cartQuantity;
    this.updateCartTotal();
  }

  updateCartTotal(): void {
    this.cartTotal = this.cartItems
      .reduce((sum, item) => sum + item.total, 0);

    this.cartTotal = Number(this.cartTotal);
  }


  incrementQuantity(item: CartItem): void {
    if (item.cartQuantity < item.quantity) {
      item.cartQuantity++;
      this.updateCartItem(this.cartItems.indexOf(item));
    }
  }

  decrementQuantity(item: CartItem): void {
    if (item.cartQuantity > 1) {
      item.cartQuantity--;
      this.updateCartItem(this.cartItems.indexOf(item));
    }
  }

  removeItem(item: CartItem): void {
    const index = this.cartItems.indexOf(item);
    if (index > -1) {
      this.cartItems.splice(index, 1);
      this.updateCartTotal();
      this.showToastMessage('Producto eliminado del carrito', false);
    }
  }

  async realizarVenta(): Promise<void> {
    if (this.cartItems.length === 0) {
      this.showToastMessage('El carrito está vacío. Agrega productos antes de realizar la venta.', false);
      return;
    }

    const cantidadTotal = this.cartItems.reduce((acc, item) => acc + item.cartQuantity, 0);

    this.ultimaVenta = {
      productos: this.cartItems.map(item => ({
        nombre: item.name,
        cantidad: item.cartQuantity,
        precioUnitario: item.price,
        total: item.total,
        producto_ID: item.producto_ID
      })),
      totalVenta: this.cartTotal,
      cliente: this.selectedClient,
      totalProductos: cantidadTotal
    };

    const response: response = await this.homeService.addVentas(this.ultimaVenta);

    if (response.httpStatusCode == 500) {
      alert(response.mensajeRespuesta);
    }

    if (response.httpStatusCode == 201) {
      alert(response.mensajeRespuesta);
      this.cartItems = [];
      this.updateCartTotal();
      this.selectedClient = null;

      this.ventaRealizada = true;
      this.openModal();
      //window.location.reload();
    }

  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.ventaRealizada = false;
  }

  async generarPDF(){

    const DATA = document.getElementById('pdfContent');

    if (!DATA) {
      this.showToastMessage('Error al generar el PDF. Elemento no encontrado.', false);
      return;
    }

    // Guardamos el estilo original
    const originalStyle = DATA.style.display;

    // Hacemos visible el elemento temporalmente
    DATA.style.display = 'block';

    await html2canvas(DATA).then(async (canvas) => {
      // Restauramos el estilo original
      DATA.style.display = originalStyle;

      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const doc = new jsPDF('p', 'mm');
      doc.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');

      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }

      // Generar el archivo como Blob
      const pdfBlob = doc.output('blob');

      // Convertir el Blob en un archivo con nombre específico
      const pdfFile = new File([pdfBlob], `venta_${new Date().toISOString()}.pdf`, { type: 'application/pdf' });

      // Crear un enlace temporal para abrir el PDF e imprimirlo
      const pdfURL = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(pdfURL, '_blank');

      if (newWindow) {
        newWindow.onload = () => {
          URL.revokeObjectURL(pdfURL);
        };
      } else {
        console.error('No se pudo abrir la ventana para imprimir el PDF.');
      }

    }).catch((error) => {
      // Aseguramos que el estilo se restaure incluso si hay un error
      DATA.style.display = originalStyle;
      console.error('Error al generar el PDF:', error);
      this.showToastMessage('Error al generar el PDF', false);
    });

  }

  async generarPDFEmail(){

    const DATA = document.getElementById('pdfContent');

    if (!DATA) {
      this.showToastMessage('Error al generar el PDF. Elemento no encontrado.', false);
      return;
    }

    // Guardamos el estilo original
    const originalStyle = DATA.style.display;

    // Hacemos visible el elemento temporalmente
    DATA.style.display = 'block';

    const pdf = await html2canvas(DATA).then(async (canvas) => {
      // Restauramos el estilo original
      DATA.style.display = originalStyle;

      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const doc = new jsPDF('p', 'mm');
      doc.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');

      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }

      // Generar el archivo como Blob
      const pdfBlob = doc.output('blob');

      // Convertir el Blob en un archivo con nombre específico
      const pdfFile = new File([pdfBlob], `venta_${new Date().toISOString()}.pdf`, { type: 'application/pdf' });
    
      return pdfFile;
    }).catch((error) => {
      // Aseguramos que el estilo se restaure incluso si hay un error
      DATA.style.display = originalStyle;
      console.error('Error al generar el PDF:', error);
      this.showToastMessage('Error al generar el PDF', false);
    });

    return pdf;

  }


  async enviarPorCorreo(): Promise<void> {
    if (this.ultimaVenta && this.ultimaVenta.cliente && this.ultimaVenta.cliente.email) {
      (async () => {
        const pdfFile = await this.generarPDFEmail();
        const response: response = await this.homeService.enviarEmail(this.ultimaVenta, pdfFile)

        if (response.httpStatusCode == 201) {
          alert(response.mensajeRespuesta)
        }
        if (response.httpStatusCode == 500) {
          alert(response.mensajeRespuesta)
        }
      })();
    } else {
      this.showToastMessage('No se pudo enviar el correo. Información del cliente incompleta.', false);
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
}

