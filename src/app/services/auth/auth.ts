import { Injectable } from '@angular/core';
import { User, AuthError } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Supabase } from '../supabase/supabase';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  
  private currentUser = new BehaviorSubject<User | null>(null); // guarda o estado atual do usuário
  public currentUser$: Observable<User | null> = this.currentUser.asObservable();

  constructor(
    private router: Router,
    private supabaseService: Supabase
  ) {

    this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      this.currentUser.next(session?.user ?? null);
    });
  }

  async signInWithPassword(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  }

  async signOut(): Promise<void> {
    await this.supabaseService.client.auth.signOut();
    this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser.value;
  }
}