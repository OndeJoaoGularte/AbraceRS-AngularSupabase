import { Injectable, inject } from '@angular/core';
import { Supabase } from '../supabase/supabase'; 

export interface Project {
  id?: number;
  name: string;
  description: string;
  started_at?: string | null;
  finished_at?: string | null;
  content?: string;
  image_url?: string;
  updated_at?: string;
  gallery_img?: string[];
  status: boolean;
  active: boolean;
  public: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Projects {
  private supabaseService = inject(Supabase);
  private supabase = this.supabaseService.client;
  private readonly TABLE = 'projects';
  private readonly BUCKET = 'project-images';

  async getProjects(
    filterActive: 'all' | boolean, 
    filterOrdination: string,
    searchTool: string,
    isUserAdmin: boolean
  ): Promise<Project[]> {
    let query = this.supabase.from(this.TABLE).select('*').eq('status', true);

    if (!isUserAdmin) {
      query = query.eq('public', true);
    }

    if (filterActive !== 'all') {
      query = query.eq('active', filterActive);
    }

    if (searchTool) {
      query = query.or(`name.ilike.%${searchTool}%,description.ilike.%${searchTool}%`);
    }

    const [column, direction] = filterOrdination.split('-');
    const asc = direction === 'asc';

    if (column === 'updated_at') {
      query = query.order(column, { ascending: asc, nullsFirst: false });
    } else {
      query = query.order(column, { ascending: asc });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar projetos:', error);
      return [];
    }
    return data as Project[];
  }

  async getLatestProjects(limit: number = 3): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from(this.TABLE)
      .select('*')
      .eq('status', true)
      .eq('public', true)
      .eq('active', true)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar últimos projetos da Home:', error);
      return [];
    }
    return (data || []) as Project[];
  }

  async getProjectById(id: number): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      console.error('Erro ao buscar projeto pelo ID:', error);
      return null;
    }
    return data as Project;
  }

  async createProject(project: Partial<Project>) {
    const { data, error } = await this.supabase
      .from(this.TABLE)
      .insert([project])
      .select();
      
    if (error) console.error('Erro ao criar projeto:', error);
    return { data, error };
  }

  async updateProject(id: number, project: Partial<Project>) {
    project.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from(this.TABLE)
      .update(project)
      .eq('id', id)
      .select();
      
    if (error) console.error('Erro ao atualizar projeto:', error);
    return { data, error };
  }

  async deleteProject(id: number) {
    const { error } = await this.supabase
      .from(this.TABLE)
      .update({ status: false, updated_at: new Date().toISOString() })
      .eq('id', id);
      
    if (error) console.error('Erro ao fazer soft delete do projeto:', error);
    return { error };
  }

  async uploadProjectImage(file: File): Promise<string | null> {
    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      const { error: uploadError } = await this.supabase.storage
        .from(this.BUCKET)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = this.supabase.storage
        .from(this.BUCKET)
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro no upload da imagem do projeto:', error);
      return null;
    }
  }

  async deleteProjectImage(fileName: string): Promise<{ error: any }> {
    const { error } = await this.supabase.storage
      .from(this.BUCKET)
      .remove([fileName]);

    if (error) console.error('Erro ao deletar imagem do storage:', error);
    return { error };
  }
}