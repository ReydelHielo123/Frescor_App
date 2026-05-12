import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class login {

  usuario = '';
  contrasena = '';
  error = '';
  cargando = false;

  constructor(private authService: AuthService, private router: Router) { }

  login(): void {
    if (!this.usuario || !this.contrasena) {
      this.error = 'Completá todos los campos.';
      return;
    }

    this.error = '';
    this.cargando = true;

    this.authService.login({ usuario: this.usuario, contrasena: this.contrasena }).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.cargando = false;
        this.error = 'Usuario o contraseña incorrectos.';
      }
    });
  }
}