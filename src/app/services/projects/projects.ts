import { Injectable } from '@angular/core';
import { Supabase } from '../supabase/supabase';

@Injectable({
  providedIn: 'root',
})
export class Projects {
  constructor(private supabaseService: Supabase) {}

  async getProjects(
    filterStatus: 'all' | boolean,
    filterOrdination: string,
    searchTool: string
  ) {
    let query = this.supabaseService.client.from('projects').select('*');

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    if (searchTool) {
      query = query.or(
        `name.ilike.%${searchTool}%,description.ilike.%${searchTool}%`
      );
    }

    const [column, direction] = filterOrdination.split('-');
    const asc = direction === 'asc';

    if (column === 'updated') {
      query = query.order(column, { ascending: asc, nullsFirst: false });
    } else {
      query = query.order(column, { ascending: asc });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar projetos:', error);
      return [];
    }
    return data;
  }

  async getProjectById(id: number) {
    const { data, error } = await this.supabaseService.client
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar projeto por ID:', error);
      return null;
    }
    return data;
  }

  async createProject(project: any) {
    const { data, error } = await this.supabaseService.client
      .from('projects')
      .insert([project])
      .select();
    if (error) console.error('Erro ao criar projeto:', error);
    return { data, error };
  }

  async updateProject(id: number, project: any) {
    const { data, error } = await this.supabaseService.client
      .from('projects')
      .update(project)
      .eq('id', id)
      .select();
    if (error) console.error('Erro ao atualizar projeto:', error);
    return { data, error };
  }

  async deleteProject(id: number) {
    const { error } = await this.supabaseService.client
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) console.error('Erro ao deletar projeto:', error);
    return { error };
  }

  async uploadProjectImage(file: File): Promise<string | null> {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const bucket = 'project-images';

      const { data, error: uploadError } =
        await this.supabaseService.client.storage
          .from(bucket)
          .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = this.supabaseService.client.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload da imagem do projeto:', error);
      return null;
    }
  }
}
