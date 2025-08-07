import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Posts } from '../../../services/posts/posts';

@Component({
  selector: 'app-posts-info',
  imports: [CommonModule, RouterModule],
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
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.post = await this.postsService.getPostById(Number(id));
      if (this.post && this.post.content) {
        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.post.content);
      }
    }
    this.loading = false;
  }
} 