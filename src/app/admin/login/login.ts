import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: Auth
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // função chamada ao submeter formulário
  async onSubmit(): Promise<void> {
    // exibe os erros, se houver, e interrompe a função
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true; // ativa estado de carregamento
    this.errorMessage = null; // limpa mensagens de erro anteriores

    // extrai os valores e chama o método de login
    const { email, password } = this.loginForm.value;
    const { error } = await this.authService.signInWithPassword(email, password);

    if (error) {
      this.errorMessage = 'Email ou senha inválidos. Tente novamente.';
      this.loading = false;
    } else {
      this.router.navigate(['/home']);
    }
  }

  // função para verificar os erros do formulário
  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}