import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsInfo } from './posts-info';

describe('PostsInfo', () => {
  let component: PostsInfo;
  let fixture: ComponentFixture<PostsInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
