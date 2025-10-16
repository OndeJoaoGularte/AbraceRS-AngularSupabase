import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Posts } from '../../../services/posts/posts';
import { GalleriaModule } from 'primeng/galleria';

@Component({
  selector: 'app-posts-info',
  imports: [CommonModule, RouterModule, GalleriaModule],
  templateUrl: './posts-info.html',
  styleUrl: './posts-info.scss'
})
export class PostsInfo implements OnInit {
  post: any = null;
  loading = true;
  safeHtmlContent: SafeHtml | null = null;

  constructor(
    private route: ActivatedRoute,
    private postsService: Posts,
    private sanitizer: DomSanitizer,
    private location: Location
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.post = await this.postsService.getPostById(Number(id));
      if (this.post && this.post.content) {
        console.log('Conteúdo vindo do Supabase:', this.post.content);
        let dirtyHtml = this.post.content;
        
        const nonBreakingSpace = /&nbsp;/g;
        
        const cleanHtml = dirtyHtml.replace(nonBreakingSpace, ' ');

        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
      }
    }
    this.loading = false;
  }

  goBack(): void {
    this.location.back();
  }
} 