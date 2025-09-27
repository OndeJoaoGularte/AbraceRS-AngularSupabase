import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Projects } from '../../services/projects/projects';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-proj-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, EditorModule],
  templateUrl: './proj-form.html',
  styleUrl: './proj-form.scss'
})
export class ProjForm implements OnInit, OnDestroy {
  projectForm: FormGroup;
  isEditMode = false;
  projectId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;
  galleryFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: Projects
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      status: [true, Validators.required],
      public: [false, Validators.required],
      start: ['', Validators.required],
      finish: [''],
      content: [''],
      image_url: [''] 
    });
  }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.projectId !== null && !isNaN(this.projectId)) {
      this.isEditMode = true;
      this.loadProjectData(this.projectId);
    }
  }

  ngOnDestroy(): void {
  }

  async loadProjectData(id: number): Promise<void> {
    const project = await this.projectsService.getProjectById(id);
    if (project) {
      project.start = new Date(project.start).toISOString().split('T')[0];
      project.finish = project.finish ? new Date(project.finish).toISOString().split('T')[0] : '';
      this.projectForm.patchValue(project);
      
      if (project.image_url) {
        this.imagePreview = project.image_url;
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.galleryFiles = Array.from(input.files);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isUploading = true;
    let imageUrl = this.projectForm.value.image_url || '';

    if (this.selectedFile) {
      const uploadedUrl = await this.projectsService.uploadProjectImage(this.selectedFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        alert('Falha ao fazer upload da imagem. O projeto não foi salvo.');
        this.isUploading = false;
        return;
      }
    }

    const galleryImageUrls = [];
    if (this.galleryFiles.length > 0) {
      for (const file of this.galleryFiles) {
        const url = await this.projectsService.uploadProjectImage(file);
        if (url) {
          galleryImageUrls.push({
            itemImageSrc: url,
            thumbnailImageSrc: url,
            alt: this.projectForm.value.name,
            title: this.projectForm.value.name
          });
        }
      }
    }

    const formValue = { ...this.projectForm.value, image_url: imageUrl, gallery_images: galleryImageUrls };
    formValue.status = (formValue.status === 'true' || formValue.status === true);
    formValue.public = (formValue.public === 'true' || formValue.public === true);

    let savedProjectData;

    if (this.isEditMode && this.projectId) {
      savedProjectData = await this.projectsService.updateProject(this.projectId, formValue);
    } else {
      savedProjectData = await this.projectsService.createProject(formValue);
    }

    this.isUploading = false;
    if (savedProjectData && savedProjectData.data) {
      const newProjectId = savedProjectData.data[0].id;
      this.router.navigate(['/project', newProjectId]);
    } else {
      this.router.navigate(['/projects']);
    }
  }
}