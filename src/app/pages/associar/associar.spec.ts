import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Associar } from './associar';

describe('Associar', () => {
  let component: Associar;
  let fixture: ComponentFixture<Associar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Associar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Associar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
