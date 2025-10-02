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
    searchTool: string,
    isUserAdmin: boolean
  ) {
    let query = this.supabaseService.client.from('projects').select('*'); // seleciona todos os campos da tabela

    if (!isUserAdmin) {
      query = query.eq('public', true);
    }

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus); // se o valor não for 'all', o filtro é adicionado
    }

    if (searchTool) {
      query = query.or(
        `name.ilike.%${searchTool}%,description.ilike.%${searchTool}%` //busca o termo em diversas colunas da tabela
      );
    }

    const [column, direction] = filterOrdination.split('-'); // regra de ordenação, column é variável enquanto
    const asc = direction === 'asc'; // direction vai ser sempre ascendente ou descendente

    if (column === 'updated') {
      query = query.order(column, { ascending: asc, nullsFirst: false }); // valores vazios de 'updated' por último
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

  /*
    CRUD de Projetos
  */

  async getProjectById(id: number) { // busca um projeto pelo ID
    const { data, error } = await this.supabaseService.client
      .from('projects')
      .select('*') // seleciona todos os campos da tabela
      .eq('id', id) // filtra pelo ID
      .single(); // resultado único

    if (error) {
      console.error('Erro ao buscar projeto pelo ID:', error);
      return null;
    }
    return data;
  }

  async createProject(project: any) {
    const { data, error } = await this.supabaseService.client
      .from('projects')
      .insert([project]) // insere um novo objeto na tabela
      .select(); // retorna o objeto criado
    if (error) console.error('Erro ao criar projeto:', error);
    return { data, error };
  }

  async updateProject(id: number, project: any) {
    const { data, error } = await this.supabaseService.client
      .from('projects')
      .update(project) // atualiza o objeto
      .eq('id', id) // seleciona o ID correspondente
      .select(); // retorna o objeto atualizado
    if (error) console.error('Erro ao atualizar projeto:', error);
    return { data, error };
  }

  async deleteProject(id: number) {
    const { error } = await this.supabaseService.client
      .from('projects')
      .delete()    // apaga o objeto
      .eq('id', id); // seleciona o ID correspondente
    if (error) console.error('Erro ao deletar projeto:', error);
    return { error };
  }

  /*
    Upload de imagens
  */

  async uploadProjectImage(file: File): Promise<string | null> {
    try {
      const fileName = `${Date.now()}-${file.name}`; // cria um nome único ao arquivo
      const bucket = 'project-images'; // define o destino

      const { data, error: uploadError } =
        await this.supabaseService.client.storage
          .from(bucket)
          .upload(fileName, file); // envia o arquivo para o bucket

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = this.supabaseService.client.storage
        .from(bucket)
        .getPublicUrl(fileName); // pega a URL pública da imagem

      return publicUrl; // retorna a URL da imagem enviada
    } catch (error) {
      console.error('Erro no upload da imagem do projeto:', error);
      return null;
    }
  }

  /*
    Projetos de destaque para a Home
  */

  async getLatestProjects(limit: number = 3) {
  const { data, error } = await this.supabaseService.client
    .from('projects')
    .select('*')
    .eq('status', true)
    .eq('public', true)
    .order('updated', { ascending: false })
    .limit(limit);

  if (error) console.error('Erro ao buscar últimos projetos:', error);
  return data || [];
}

async deleteProjectImage(fileName: string): Promise<{ error: any }> {
    const { error } = await this.supabaseService.client.storage
      .from('project-images')
      .remove([fileName]);

    if (error) {
      console.error('Erro ao deletar imagem do storage:', error);
    }
    return { error };
  }
}