import { Component, OnInit } from '@angular/core';
import { Projects } from '../../services/projects/projects';
import { Posts } from '../../services/posts/posts';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  loading = true;

  heroImageUrl = 'assets/images/quemsomos/instituto.jpg';
  
  // Propriedades para os projetos
  featuredProject: any = null;
  secondaryProjects: any[] = [];

  // Propriedades para o blog
  latestPosts: any[] = [];

  // Placeholders para os logos dos apoiadores
  masterSupporters = [
    { name: 'Apoiador Master 1', logo: 'https://placehold.co/250x100/CCCCCC/4a4a4a?text=Apoiador+Master' },
    { name: 'Apoiador Master 2', logo: 'https://placehold.co/250x100/CCCCCC/4a4a4a?text=Grande+Parceiro' }
  ];
  supporters = [
    { name: 'Apoiador 1', logo: 'https://placehold.co/150x80/CCCCCC/999999?text=Apoiador' },
    { name: 'Apoiador 2', logo: 'https://placehold.co/150x80/CCCCCC/999999?text=Apoiador' },
    { name: 'Apoiador 3', logo: 'https://placehold.co/150x80/CCCCCC/999999?text=Apoiador' },
    { name: 'Apoiador 4', logo: 'https://placehold.co/150x80/CCCCCC/999999?text=Apoiador' }
  ];

  constructor(
    private projectsService: Projects,
    private postsService: Posts
  ) {}

  ngOnInit(): void {
    this.loadHomePageData();
  }

  async loadHomePageData(): Promise<void> {
    this.loading = true;
    
    const [projects, posts] = await Promise.all([
      this.projectsService.getLatestProjects(3),
      this.postsService.getLatestPosts(3)
    ]);

    if (projects && projects.length > 0) {
      this.featuredProject = projects[0];
      this.secondaryProjects = projects.slice(1);
    }

    this.latestPosts = posts;
    
    this.loading = false;
  }
}