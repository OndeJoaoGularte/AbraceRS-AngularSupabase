import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, AuthError } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private supabase: SupabaseClient;
  
  private currentUser = new BehaviorSubject<User | null>(null); // guarda o estado atual do usuário
  public currentUser$: Observable<User | null> = this.currentUser.asObservable();

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.onAuthStateChange((event, session) => { // monitora a mudança do estado de usuário
      this.currentUser.next(session?.user ?? null); // atualiza o BehaviorSubject com os novos dados
    });
  }

  async signInWithPassword(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser.value;
  }
}