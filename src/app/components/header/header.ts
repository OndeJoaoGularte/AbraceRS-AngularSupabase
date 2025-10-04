import { Component, HostListener } from '@angular/core';
import { Auth } from '../../services/auth/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  isMenuOpen = false; //mantém menu mobile fechado
  isScrolled = false; //mantém barra superior aparecendo

  constructor(
    public authService: Auth,
    private router: Router
) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50; //barra superior some ao descer 50 pixels
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen; //alterna entre true ou false ao ser clicado
  }

  openVakinha(): void {
    this.isMenuOpen = false; //fecha menu mobile ao ser clicado

    window.open('https://www.vakinha.com.br/5580617', '_blank');
  }

  async onSignOut(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
