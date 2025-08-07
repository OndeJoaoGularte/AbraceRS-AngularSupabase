import { Injectable } from '@angular/core';
import { Supabase } from '../supabase/supabase';

@Injectable({
  providedIn: 'root',
})
export class Posts {
  constructor(private supabaseService: Supabase) {}

  async getPosts(filterOrdination: string, searchTool: string) {
    let query = this.supabaseService.client.from('posts').select('*');

    if (searchTool) {
      query = query.or(
        `title.ilike.%${searchTool}%,summary.ilike.%${searchTool}%`
      );
    }

    const [column, direction] = filterOrdination.split('-');
    const asc = direction === 'asc';

    query = query.order(column, { ascending: asc });

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar postagem:', error);
      return [];
    }
    return data;
  }

  async getPostById(id: number) {
    const { data, error } = await this.supabaseService.client
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar postagem por ID:', error);
      return null;
    }
    return data;
  }

  async createPost(post: any) {
    const { data, error } = await this.supabaseService.client
      .from('posts')
      .insert([post])
      .select();
    if (error) console.error('Erro ao criar postagem:', error);
    return { data, error };
  }

  async updatePost(id: number, post: any) {
    const { data, error } = await this.supabaseService.client
      .from('posts')
      .update(post)
      .eq('id', id)
      .select();
    if (error) console.error('Erro ao atualizar postagem:', error);
    return { data, error };
  }

  async deletePost(id: number) {
    const { error } = await this.supabaseService.client
      .from('posts')
      .delete()
      .eq('id', id);
    if (error) console.error('Erro ao deletar postagem:', error);
    return { error };
  }

  async uploadPostImage(file: File): Promise<string | null> {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const bucket = 'post-images';

      const { data, error: uploadError } =
        await this.supabaseService.client.storage
          .from(bucket)
          .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = this.supabaseService.client.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload da imagem da postagem:', error);
      return null;
    }
  }
}
