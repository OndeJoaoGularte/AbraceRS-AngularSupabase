import { Injectable } from '@angular/core';
import { Supabase } from '../supabase/supabase';

@Injectable({
  providedIn: 'root'
})
export class Membership {

  constructor(private supabaseService: Supabase) { }

  async submitForm(formData: any) {
    const { data, error } = await this.supabaseService.client
      .from('membership_submissions')
      .insert([formData]);

    if (error) {
      console.error('Erro ao enviar formulário de associação:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }
}