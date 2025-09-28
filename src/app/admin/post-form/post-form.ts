import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
  standalone: true,
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

  ngOnInit(): void {
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.postId !== null && !isNaN(this.postId)) {
      this.isEditMode = true;
      this.loadPostData(this.postId);
    }
  }

  ngOnDestroy(): void {}

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

  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.galleryFiles = Array.from(input.files);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.isUploading = true;
    let imageUrl = this.postForm.value.image_url || '';

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

    const formValue = {
      ...this.postForm.value,
      image_url: imageUrl,
      gallery_images: galleryImageUrls,
    };
    formValue.public = formValue.public === 'true' || formValue.public === true;

    let savedPostData;

    if (this.isEditMode && this.postId) {
      savedPostData = await this.postsService.updatePost(
        this.postId,
        formValue
      );
    } else {
      savedPostData = await this.postsService.createPost(formValue);
    }

    this.isUploading = false;
    if (savedPostData && savedPostData.data) {
      const newPostId = savedPostData.data[0].id;
      this.router.navigate(['/post', newPostId]);
    } else {
      this.router.navigate(['/posts']);
    }
  }
}
