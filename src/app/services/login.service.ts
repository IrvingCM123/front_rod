import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

interface response {
  httpStatusCode: string | number;
  mensajeRespuesta: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://localhost:3000/servidor/login/iniciarSesion';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<response> {

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { "Correo_electronico": email, "Contraseña": password };

    return this.http.post<response>(this.apiUrl, body, { headers }).pipe(
      catchError(error => {
        console.error('Error en el login:', error);
        return throwError(() => new Error('Error al iniciar sesión'));
      })
    );
  }

  logout(): Observable<boolean> {
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }
}