import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { Posts } from '../../services/posts/posts';

@Component({
  selector: 'app-post-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgxEditorModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.scss'
})
export class PostForm implements OnInit, OnDestroy {
  postForm: FormGroup;
  isEditMode = false;
  postId: number | null = null;
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline'],
    ['blockquote'],
    [{ heading: ['h2', 'h3'] }],
    ['ordered_list', 'bullet_list'],
    ['link'],
  ];

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private postsService: Posts
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      summary: ['', Validators.required],
      content: [''], 
      image_url: ['']
    });
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.postId !== null && !isNaN(this.postId)) {
      this.isEditMode = true;
      this.loadPostData(this.postId);
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  async loadPostData(id: number): Promise<void> {
    const post = await this.postsService.getPostById(id);
    if (post) {
      this.postForm.patchValue(post);

      if (post.image_url) {
        this.imagePreview = post.image_url;
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
    if (this.postForm.invalid) {
      return;
    }

    this.isUploading = true;
    let imageUrl = this.postForm.value.image_url || '';

    // 1. Faz o upload da nova imagem, se uma foi selecionada
    if (this.selectedFile) {
      // Certifique-se que a função 'uploadpostImage' existe no seu 'posts.service.ts'
      const uploadedUrl = await this.postsService.uploadPostImage(this.selectedFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        alert('Falha ao fazer upload da imagem. A notícia não foi salva.');
        this.isUploading = false;
        return;
      }
    }

    // 2. Prepara os dados do formulário com a URL da imagem
    const formValue = { ...this.postForm.value, image_url: imageUrl };

    // 3. Salva os dados no banco
    if (this.isEditMode && this.postId) {
      await this.postsService.updatePost(this.postId, formValue);
    } else {
      await this.postsService.createPost(formValue);
    }

    this.isUploading = false;
    this.router.navigate(['/posts']);
  }
}