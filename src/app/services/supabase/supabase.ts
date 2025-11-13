import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  public client: SupabaseClient;

  constructor() {
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;

    if (!supabaseUrl) {
      throw new Error(
        'Erro de build: A variável SUPABASE_URL não foi definida no Vercel.'
      );
    }
    if (!supabaseKey) {
      throw new Error(
        'Erro de build: A variável SUPABASE_KEY não foi definida no Vercel.'
      );
    }

    this.client = createClient(supabaseUrl, supabaseKey);
  }
}
