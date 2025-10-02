import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Projects } from '../../services/projects/projects';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-proj-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, EditorModule],
  templateUrl: './proj-form.html',
  styleUrl: './proj-form.scss',
})
export class ProjForm implements OnInit {
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
      image_url: [''],
    });
  }

  // função para buscar os dados iniciais
  ngOnInit(): void {
    // procura o id do projeto
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    // se encontrar um id, entra em "modo de edição"
    if (this.projectId) {
      this.isEditMode = true;
      this.loadProjectData(this.projectId);
    }
  }

  // função para preencher o formulário com os dados de um projeto já existente
  async loadProjectData(id: number): Promise<void> {
    const project = await this.projectsService.getProjectById(id);
    if (project) {
      project.start = new Date(project.start).toISOString().split('T')[0];
      project.finish = project.finish
        ? new Date(project.finish).toISOString().split('T')[0]
        : '';
      this.projectForm.patchValue(project);

      if (project.image_url) {
        this.imagePreview = project.image_url;
      }
    }
  }

  // função para guardar e visualizar uma imagem de destaque
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

  // função para guardar arquivos da galeria
  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.galleryFiles = Array.from(input.files);
    }
  }

  // função chamada ao submeter formulário
  async onSubmit(): Promise<void> {
    // exibe os erros, se houver, e interrompe a função
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isUploading = true;
    let imageUrl = this.projectForm.value.image_url || '';

    // upload da imagem de destaque para o supabase
    if (this.selectedFile) {
      const uploadedUrl = await this.projectsService.uploadProjectImage(
        this.selectedFile
      );
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        alert('Falha ao fazer upload da imagem. O projeto não foi salvo.');
        this.isUploading = false;
        return;
      }
    }

    // upload das imagens da galeria para o supabase
    const galleryImageUrls = [];
    if (this.galleryFiles.length > 0) {
      for (const file of this.galleryFiles) {
        const url = await this.projectsService.uploadProjectImage(file);
        if (url) {
          galleryImageUrls.push({
            itemImageSrc: url,
            thumbnailImageSrc: url,
            alt: this.projectForm.value.name,
            title: this.projectForm.value.name,
          });
        }
      }
    }

    // monta o objeto final para salvar
    const formValue = {
      ...this.projectForm.value,
      image_url: imageUrl,
      gallery_images: galleryImageUrls,
    };
    // converte os valores dos selects para boolean
    formValue.status = formValue.status === 'true' || formValue.status === true;
    formValue.public = formValue.public === 'true' || formValue.public === true;

    let savedProjectData;

    // diferencia entre um novo projeto ou atualização de um existente
    if (this.isEditMode && this.projectId) {
      savedProjectData = await this.projectsService.updateProject(
        this.projectId,
        formValue
      );
    } else {
      savedProjectData = await this.projectsService.createProject(formValue);
    }

    this.isUploading = false;

    // redireciona para a nova página
    if (savedProjectData && savedProjectData.data) {
      const newProjectId = savedProjectData.data[0].id;
      this.router.navigate(['/project', newProjectId]);
    } else {
      this.router.navigate(['/atuamos']);
    }
  }

  // função para verificar os erros do formulário
  isInvalid(controlName: string): boolean {
    const control = this.projectForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
