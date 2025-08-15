import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Posts } from '../../services/posts/posts';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.scss'
})
export class PostForm implements OnInit {
  postForm: FormGroup;
  isEditMode = false;
  postId: number | null = null;

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
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.postId !== null && !isNaN(this.postId)) {
      this.isEditMode = true;
      this.loadPostData(this.postId);
    }
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

    if (this.selectedFile) {
      const uploadedUrl = await this.postsService.uploadPostImage(this.selectedFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        alert('Falha ao fazer upload da imagem. A notícia não foi salva.');
        this.isUploading = false;
        return;
      }
    }

    const formValue = { ...this.postForm.value, image_url: imageUrl };

    if (this.isEditMode && this.postId) {
      await this.postsService.updatePost(this.postId, formValue);
    } else {
      await this.postsService.createPost(formValue);
    }

    this.isUploading = false;
    this.router.navigate(['/blog']);
  }
}