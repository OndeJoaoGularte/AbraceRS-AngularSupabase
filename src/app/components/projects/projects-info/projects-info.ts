import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Projects } from '../../../services/projects/projects';
import { GalleriaModule } from 'primeng/galleria';

@Component({
  selector: 'app-projects-info',
  imports: [CommonModule, RouterModule, GalleriaModule],
  templateUrl: './projects-info.html',
  styleUrl: './projects-info.scss'
})
export class ProjectsInfo implements OnInit {
  project: any = null;
  loading = true;
  safeHtmlContent: SafeHtml | null = null;

  constructor(
    private route: ActivatedRoute,
    private projectsService: Projects,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.project = await this.projectsService.getProjectById(Number(id));
      if (this.project && this.project.content) {
        console.log('Conteúdo vindo do Supabase:', this.project.content);
        let dirtyHtml = this.project.content;
        
        const nonBreakingSpace = /&nbsp;/g;
        
        const cleanHtml = dirtyHtml.replace(nonBreakingSpace, ' ');

        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
      }
    }
    this.loading = false;
  }
} 