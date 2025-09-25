import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Junte } from './junte';

describe('Junte', () => {
  let component: Junte;
  let fixture: ComponentFixture<Junte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Junte]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Junte);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
