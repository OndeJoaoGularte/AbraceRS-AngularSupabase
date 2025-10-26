import { Component, OnInit } from '@angular/core';
import { Projects } from '../../services/projects/projects';
import { Posts } from '../../services/posts/posts';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth/auth';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  loading = true;

  heroImageUrl = 'assets/images/home/instituto.jpg';
  
  // Propriedades para os projetos
  featuredProject: any = null;
  secondaryProjects: any[] = [];

  // Placeholders para os logos dos apoiadores
  masterSupporters = [
    { name: 'Nau Live Spaces', logo: 'assets/images/home/nau.jpg', linkUrl: 'https://nau.com.br/' },
    { name: 'Vakinha', logo: 'assets/images/home/vakinha.jpg', linkUrl: 'https://www.vakinha.com.br/' }
  ];
  supporters = [
    { name: 'Campo Minado RS', logo: 'assets/images/home/campominado.png', linkUrl: 'https://www.instagram.com/campominado_rs/' },
    { name: 'Elitte Reformas', logo: 'assets/images/home/elittereformas.jpg', linkUrl: 'https://www.instagram.com/elitte__reformas/' },
    { name: 'Feminina RS', logo: 'assets/images/home/feminina.jpg', linkUrl: 'https://www.instagram.com/femininars/' }
  ];

  // Propriedades para o blog
  latestPosts: any[] = [];
  private currentPage = 0;
  private postsPerPage = 3;
  totalPosts = 0;
  allPostsLoaded = false;

  constructor(
    private projectsService: Projects,
    private postsService: Posts,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    const projects = await this.projectsService.getLatestProjects(3);
    
    await this.loadMorePosts(); 

    if (projects && projects.length > 0) {
      this.featuredProject = projects[0];
      this.secondaryProjects = projects.slice(1);
    }
    this.loading = false;
  }

  // Carregamento de novos Posts
  async loadMorePosts(): Promise<void> {
    const isUserAdmin = this.authService.isLoggedIn();
    const { data, count } = await this.postsService.getPaginatedPosts(
      this.currentPage,
      this.postsPerPage,
      isUserAdmin
    );

    this.latestPosts.push(...data);
    this.totalPosts = count;

    this.currentPage++;

    if (this.latestPosts.length >= this.totalPosts) {
      this.allPostsLoaded = true;
    }
  }
}


  