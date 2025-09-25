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
  activeForm: 'associate' | 'volunteer' | null = null;
  isSubmitting = false;
  submittedSuccessfully: boolean | null = null;
  submittedFormType: string = '';

  associateForm: FormGroup;
  volunteerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private membershipService: Membership
  ) {
    this.associateForm = this.fb.group({
      person_type: ['PESSOA_FISICA', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      document: ['', Validators.required],
      contact_person: [''],
    });

    this.volunteerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      cpf: ['', Validators.required],
      how_to_help: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.associateForm.get('person_type')?.valueChanges.subscribe(type => {
      this.onPersonTypeChange(type);
    });
  }
  
  showForm(type: 'associate' | 'volunteer') {
    this.activeForm = type;
  }

  onPersonTypeChange(type: string): void {
    const contactPersonControl = this.associateForm.get('contact_person');
    if (type === 'PESSOA_JURIDICA') {
      contactPersonControl?.setValidators([Validators.required]);
    } else {
      contactPersonControl?.clearValidators();
    }
    contactPersonControl?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    const form = this.activeForm === 'associate' ? this.associateForm : this.volunteerForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    let result;

    if (this.activeForm === 'associate') {
      this.submittedFormType = 'de associação';
      result = await this.membershipService.submitAssociateForm(form.value);
    } else {
      this.submittedFormType = 'de voluntariado';
      result = await this.membershipService.submitVolunteerForm(form.value);
    }
    
    this.submittedSuccessfully = result.success;
    if (!result.success) {
      alert(`Ocorreu um erro ao enviar seu formulário ${this.submittedFormType}. Tente novamente.`);
    }

    this.isSubmitting = false;
  }

  isAssociateInvalid(controlName: string): boolean {
    const control = this.associateForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
  isVolunteerInvalid(controlName: string): boolean {
    const control = this.volunteerForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}