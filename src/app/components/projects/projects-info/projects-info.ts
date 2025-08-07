import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Projects } from '../../../services/projects/projects';

@Component({
  selector: 'app-projects-info',
  imports: [CommonModule, RouterModule],
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
        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.project.content);
      }
    }
    this.loading = false;
  }
} 