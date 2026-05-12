import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'frescor_token';
  private usuarioKey = 'frescor_usuario';
  private rolKey = 'frescor_rol';
  private timerInactividad: any = null;
  private tiempoInactividad = 30 * 60 * 1000; // 30 minutos

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {
    if (this.isLoggedIn()) {
      this.iniciarTimerInactividad();
      this.escucharActividad();
    }
  }

  login(request: { usuario: string; contrasena: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap((response) => {
        if (response.success) {
          sessionStorage.setItem(this.tokenKey, response.data.token);
          sessionStorage.setItem(this.usuarioKey, response.data.usuario);
          sessionStorage.setItem(this.rolKey, response.data.rol);
          this.iniciarTimerInactividad();
          this.escucharActividad();
        }
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.usuarioKey);
    sessionStorage.removeItem(this.rolKey);
    this.detenerTimerInactividad();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUsuario(): string | null {
    return sessionStorage.getItem(this.usuarioKey);
  }

  getRol(): string | null {
    return sessionStorage.getItem(this.rolKey);
  }

  isAdmin(): boolean {
    return this.getRol() === 'admin';
  }

  isEmpleado(): boolean {
    return this.getRol() === 'empleado';
  }

  private iniciarTimerInactividad(): void {
    this.detenerTimerInactividad();
    this.ngZone.runOutsideAngular(() => {
      this.timerInactividad = setTimeout(() => {
        this.ngZone.run(() => {
          this.logout();
        });
      }, this.tiempoInactividad);
    });
  }

  private detenerTimerInactividad(): void {
    if (this.timerInactividad) {
      clearTimeout(this.timerInactividad);
      this.timerInactividad = null;
    }
  }

  private escucharActividad(): void {
    const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const resetear = () => this.iniciarTimerInactividad();
    eventos.forEach(evento => {
      window.addEventListener(evento, resetear, { passive: true });
    });
  }
}