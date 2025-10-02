import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Posts } from '../../services/posts/posts';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-post-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, EditorModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.scss',
})
export class PostForm implements OnInit {
  postForm: FormGroup;
  isEditMode = false;
  postId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;
  galleryFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private postsService: Posts
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      summary: ['', Validators.required],
      public: [false, Validators.required],
      content: [''],
      image_url: [''],
    });
  }

  // função para buscar os dados iniciais
  ngOnInit(): void {
    // procura o id do post
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    // se encontrar um id, entra em "modo de edição"
    if (this.postId) {
      this.isEditMode = true;
      this.loadPostData(this.postId);
    }
  }

  // função para preencher o formulário com os dados de uma postagem já existente
  async loadPostData(id: number): Promise<void> {
    const post = await this.postsService.getPostById(id);
    if (post) {
      this.postForm.patchValue(post);

      if (post.image_url) {
        this.imagePreview = post.image_url;
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
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.isUploading = true;
    let imageUrl = this.postForm.value.image_url || '';

    // upload da imagem de destaque para o supabase
    if (this.selectedFile) {
      const uploadedUrl = await this.postsService.uploadPostImage(
        this.selectedFile
      );
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        alert('Falha ao fazer upload da imagem. A notícia não foi salva.');
        this.isUploading = false;
        return;
      }
    }

    // upload das imagens da galeria para o supabase
    const galleryImageUrls = [];
    if (this.galleryFiles.length > 0) {
      for (const file of this.galleryFiles) {
        const url = await this.postsService.uploadPostImage(file);
        if (url) {
          galleryImageUrls.push({
            itemImageSrc: url,
            thumbnailImageSrc: url,
            alt: this.postForm.value.title,
            title: this.postForm.value.title,
          });
        }
      }
    }

    // monta o objeto final para salvar
    const formValue = {
      ...this.postForm.value,
      image_url: imageUrl,
      gallery_images: galleryImageUrls,
    };
    // converte os valores dos selects para boolean
    formValue.public = formValue.public === 'true' || formValue.public === true;

    let savedPostData;

    // diferencia entre uma nova postagem ou atualização de uma existente
    if (this.isEditMode && this.postId) {
      savedPostData = await this.postsService.updatePost(
        this.postId,
        formValue
      );
    } else {
      savedPostData = await this.postsService.createPost(formValue);
    }

    this.isUploading = false;

    // redireciona para a nova página
    if (savedPostData && savedPostData.data) {
      const newPostId = savedPostData.data[0].id;
      this.router.navigate(['/post', newPostId]);
    } else {
      this.router.navigate(['/blog']);
    }
  }

  // função para verificar os erros do formulário
  isInvalid(controlName: string): boolean {
    const control = this.postForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
