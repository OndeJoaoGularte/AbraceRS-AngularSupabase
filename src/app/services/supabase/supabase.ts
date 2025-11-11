import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Supabase {
  public client: SupabaseClient;

  constructor() {
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;

    if (!supabaseUrl || !supabaseKey) {
       throw new Error("Erro crítico: Variáveis de ambiente do Supabase não encontradas.");
    }

    this.client = createClient(supabaseUrl!, supabaseKey!);
  }
}
