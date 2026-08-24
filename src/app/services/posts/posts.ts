import { Injectable, inject } from '@angular/core';
import { Supabase } from '../supabase/supabase'; 

export interface Post {
  id?: number;
  title: string;
  summary: string;
  content?: string;
  image_url?: string;
  published_at?: string | null;
  updated_at?: string;
  gallery_img?: string[];
  status: boolean;
  public: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Posts {
  private supabaseService = inject(Supabase);
  private supabase = this.supabaseService.client;
  
  private readonly TABLE = 'posts';
  private readonly BUCKET = 'post-images';

  async getPosts(
    filterOrdination: string, 
    searchTool: string,
    isUserAdmin: boolean
  ): Promise<Post[]> {
    let query = this.supabase.from(this.TABLE).select('*').eq('status', true);

    if (!isUserAdmin) {
      query = query.eq('public', true);
    }

    if (searchTool) {
      query = query.or(`title.ilike.%${searchTool}%,summary.ilike.%${searchTool}%`);
    }

    const [column, direction] = filterOrdination.split('-');
    const asc = direction === 'asc';

    query = query.order(column, { ascending: asc });

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar postagem:', error);
      return [];
    }
    return data as Post[];
  }

  async getPaginatedPosts(page: number, limit: number, isUserAdmin: boolean) {
    const from = page * limit;
    const to = from + limit - 1;

    let query = this.supabase
      .from(this.TABLE)
      .select('*', { count: 'exact' })
      .eq('status', true)
      .order('published_at', { ascending: false })
      .range(from, to);

    if (!isUserAdmin) {
      query = query.eq('public', true);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar posts paginados:', error);
      return { data: [], count: 0 };
    }
    return { data: (data || []) as Post[], count: count || 0 };
  }

  async getPostById(id: number): Promise<Post | null> {
    const { data, error } = await this.supabase
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      console.error('Erro ao buscar postagem por ID:', error);
      return null;
    }
    return data as Post;
  }

  async createPost(post: Partial<Post>) {
    const { data, error } = await this.supabase
      .from(this.TABLE)
      .insert([post])
      .select();
    
    if (error) console.error('Erro ao criar postagem:', error);
    return { data, error };
  }

  async updatePost(id: number, post: Partial<Post>) {
    post.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from(this.TABLE)
      .update(post)
      .eq('id', id)
      .select();
    
    if (error) console.error('Erro ao atualizar postagem:', error);
    return { data, error };
  }

  async deletePost(id: number) {
    const { error } = await this.supabase
      .from(this.TABLE)
      .update({ status: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) console.error('Erro ao fazer soft delete da postagem:', error);
    return { error };
  }

  async uploadPostImage(file: File): Promise<string | null> {
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
      console.error('Erro no upload da imagem da postagem:', error);
      return null;
    }
  }

  async deletePostImage(fileName: string): Promise<{ error: any }> {
    const { error } = await this.supabase.storage
      .from(this.BUCKET)
      .remove([fileName]);

    if (error) {
      console.error('Erro ao deletar imagem do storage:', error);
    }
    return { error };
  }
}