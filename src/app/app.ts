import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Supabase } from './services/supabase/supabase';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('abracers-angular-supabase');

  constructor(private supabaseService: Supabase) {}

  async ngOnInit(): Promise<void> {
    console.log('Buscando dados no Supabase...');
    try {
      const { data, error } = await this.supabaseService.client
        .from('projects')
        .select('*');

      if (error) {
        throw error;
      }

      console.log('Dados recebidos:', data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
    try {
      const { data, error } = await this.supabaseService.client
        .from('posts')
        .select('*');

      if (error) {
        throw error;
      }

      console.log('Dados recebidos:', data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }
}
