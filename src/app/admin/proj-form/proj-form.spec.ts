import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjForm } from './proj-form';

describe('ProjForm', () => {
  let component: ProjForm;
  let fixture: ComponentFixture<ProjForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
