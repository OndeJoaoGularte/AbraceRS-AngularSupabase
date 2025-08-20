import { Component, OnInit } from '@angular/core';
import { PostsList } from '../../components/posts/posts-list/posts-list';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Posts } from '../../services/posts/posts';

@Component({
  selector: 'app-blog',
  imports: [CommonModule, RouterModule, PostsList],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog implements OnInit {
  featuredPost: any = null;
  loading = true;

  constructor(private postsService: Posts) {}

  async ngOnInit(): Promise<void> {
    const allPosts = await this.postsService.getPosts('publish-desc', ''); // puxa todos os posts ordenado pelo mais recente

    if (allPosts && allPosts.length > 0) {
      this.featuredPost = allPosts[0]; // mostra o post mais recente
    }

    this.loading = false;
  }
}
