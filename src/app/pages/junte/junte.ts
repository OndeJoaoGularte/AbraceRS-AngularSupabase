import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Membership } from '../../services/membership/membership';

@Component({
  selector: 'app-junte',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './junte.html',
  styleUrl: './junte.scss'
})
export class Junte implements OnInit {
  membershipForm: FormGroup;
  isSubmitting = false;
  submittedSuccessfully: boolean | null = null;

  constructor(
    private fb: FormBuilder,
    private membershipService: Membership
  ) {
    this.membershipForm = this.fb.group({
      submission_type: ['PESSOA_FISICA', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      document: [''],
      contact_person: [''],
      how_to_help: ['']
    });
  }

  ngOnInit(): void {
    this.membershipForm.get('submission_type')?.valueChanges.subscribe(type => {
      this.onSubmissionTypeChange(type);
    });
  }

  onSubmissionTypeChange(type: string): void {
    const contactPersonControl = this.membershipForm.get('contact_person');
    if (type === 'PESSOA_JURIDICA') {
      contactPersonControl?.setValidators([Validators.required]);
    } else {
      contactPersonControl?.clearValidators();
    }
    contactPersonControl?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (this.membershipForm.invalid) {
      this.membershipForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const result = await this.membershipService.submitForm(this.membershipForm.value);
    
    if (result.success) {
      this.submittedSuccessfully = true;
    } else {
      this.submittedSuccessfully = false;
      alert('Ocorreu um erro ao enviar seu formulário. Tente novamente.');
    }

    this.isSubmitting = false;
  }

  isInvalid(controlName: string): boolean {
    const control = this.membershipForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
