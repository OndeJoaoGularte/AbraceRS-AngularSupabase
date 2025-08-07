import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComoAtuamos } from './como-atuamos';

describe('ComoAtuamos', () => {
  let component: ComoAtuamos;
  let fixture: ComponentFixture<ComoAtuamos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComoAtuamos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComoAtuamos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
