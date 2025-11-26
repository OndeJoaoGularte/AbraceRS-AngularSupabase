import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Supabase } from './services/supabase/supabase';
import { injectSpeedInsights } from '@vercel/speed-insights';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected readonly title = signal('abracers-angular-supabase');

  constructor(private supabaseService: Supabase) {}

  ngOnInit() {
    injectSpeedInsights({
      framework: 'angular'
    });
  }
}
