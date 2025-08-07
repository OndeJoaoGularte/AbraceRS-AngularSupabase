import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';
import { Projects } from '../../services/projects/projects';

@Component({
  selector: 'app-proj-form',
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule, RouterModule],
  templateUrl: './proj-form.html',
  styleUrl: './proj-form.scss'
})
export class ProjForm implements OnInit, OnDestroy {
  projectForm: FormGroup;
  isEditMode = false;
  projectId: number | null = null;
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h2', 'h3', 'h4'] }],
    ['link'],
  ];

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;

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
      start: ['', Validators.required],
      finish: [''],
      content: [''],
      image_url: [''] 
    });
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.projectId !== null && !isNaN(this.projectId)) {
      this.isEditMode = true;
      this.loadProjectData(this.projectId);
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
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

  async onSubmit(): Promise<void> {
    if (this.projectForm.invalid) {
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

    const formValue = { ...this.projectForm.value, image_url: imageUrl };
    formValue.status = (formValue.status === 'true' || formValue.status === true);

    if (this.isEditMode && this.projectId) {
      await this.projectsService.updateProject(this.projectId, formValue);
    } else {
      await this.projectsService.createProject(formValue);
    }

    this.isUploading = false;
    this.router.navigate(['/projects']);
  }
}