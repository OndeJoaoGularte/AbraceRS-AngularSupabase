import { Injectable } from '@angular/core';
import { Supabase } from '../supabase/supabase';

@Injectable({
  providedIn: 'root'
})
export class Membership {

  constructor(private supabaseService: Supabase) { }

  async submitAssociateForm(formData: any) {
    const { data, error } = await this.supabaseService.client
      .from('associates')
      .insert([formData]);

    if (error) {
      console.error('Erro ao enviar formulário de associado:', error);
      return { success: false, error };
    }
    return { success: true, data };
  }

  async submitVolunteerForm(formData: any) {
    const { data, error } = await this.supabaseService.client
      .from('volunteers')
      .insert([formData]);
      
    if (error) {
      console.error('Erro ao enviar formulário de voluntário:', error);
      return { success: false, error };
    }
    return { success: true, data };
  }
}