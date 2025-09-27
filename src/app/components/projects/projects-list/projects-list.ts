import { Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { Projects } from '../../../services/projects/projects';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../services/auth/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './projects-list.html',
  styleUrl: './projects-list.scss'
})
export class ProjectsList implements OnInit, OnDestroy {
  projects: any[] = [];
  loading = true;
  searchTool: string = '';

  filterStatus: 'all' | boolean = 'all';
  presentOrdination: string = 'name-asc';

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  constructor(
    private projectsService: Projects,
    private router: Router,
    public authService: Auth
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTool = term;
      this.loadProjects();
    });

    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  onSearchInput(term: string): void {
    this.searchSubject.next(term);
  }

  async loadProjects(): Promise<void> {
    this.loading = true;
    const isAdmin = this.authService.isLoggedIn();
    this.projects = await this.projectsService.getProjects(
      this.filterStatus,
      this.presentOrdination,
      this.searchTool,
      isAdmin
    );
    this.loading = false;
  }

  filterByStatus(status: 'all' | boolean): void {
    this.filterStatus = status;
    this.loadProjects();
  }

  showDetails(id: number): void {
    this.router.navigate(['/project', id]);
  }

  async deleteProject(id: number, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    if (confirm('Tem certeza que deseja deletar este projeto? Esta ação não pode ser desfeita.')) {
      const { error } = await this.projectsService.deleteProject(id);
      if (!error) {
        this.projects = this.projects.filter(p => p.id !== id);
      } else {
        alert('Ocorreu um erro ao deletar o projeto.');
      }
    }
  }
}
