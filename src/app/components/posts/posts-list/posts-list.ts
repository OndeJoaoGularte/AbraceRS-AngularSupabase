import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { Posts } from '../../../services/posts/posts';
import { Auth } from '../../../services/auth/auth';

@Component({
  selector: 'app-posts-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './posts-list.html',
  styleUrl: './posts-list.scss'
})
export class PostsList implements OnInit, OnDestroy {
  posts: any[] = [];
  loading = true;
  searchTool: string = '';
  presentOrdination: string = 'publish-desc';

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  constructor(
    private postsService: Posts,
    private router: Router,
    public authService: Auth
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(termo => {
      this.searchTool = termo;
      this.loadPosts();
    });
    this.loadPosts();
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  onSearchInput(termo: string): void {
    this.searchSubject.next(termo);
  }

  async loadPosts(): Promise<void> {
    this.loading = true;
    const isAdmin = this.authService.isLoggedIn();
    this.posts = await this.postsService.getPosts(
      this.presentOrdination, 
      this.searchTool, 
      isAdmin
    );
    this.loading = false;
  }

  showDetails(id: number): void {
    this.router.navigate(['/post', id]);
  }

  async deletePost(id: number, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    if (confirm('Tem certeza que deseja deletar esta notícia?')) {
      const { error } = await this.postsService.deletePost(id);
      if (!error) {
        this.posts = this.posts.filter(n => n.id !== id);
        alert('Notícia deletada com sucesso!');
      } else {
        alert('Ocorreu um erro ao deletar a notícia.');
      }
    }
  }
}