import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsInfo } from './projects-info';



describe('ProjectsInfo', () => {
  let component: ProjectsInfo;
  let fixture: ComponentFixture<ProjectsInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
