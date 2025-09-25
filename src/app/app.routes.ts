import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { QuemSomos } from './pages/quem-somos/quem-somos';
import { ComoAtuamos } from './pages/como-atuamos/como-atuamos';
import { Blog } from './pages/blog/blog';
import { Junte } from './pages/junte/junte';
import { ProjForm } from './admin/proj-form/proj-form';
import { PostForm } from './admin/post-form/post-form';
import { authGuard } from './guards/auth-guard';
import { Login } from './admin/login/login';
import { ProjectsList } from './components/projects/projects-list/projects-list';
import { ProjectsInfo } from './components/projects/projects-info/projects-info';
import { PostsList } from './components/posts/posts-list/posts-list';
import { PostsInfo } from './components/posts/posts-info/posts-info';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'somos', component: QuemSomos },
    { path: 'atuamos', component: ComoAtuamos },
    { path: 'blog', component: Blog },
    { path: 'junte', component: Junte },
    { path: 'projects', component: ProjectsList },
    { path: 'project/:id', component: ProjectsInfo },
    { path: 'posts', component: PostsList },
    { path: 'post/:id', component: PostsInfo },
    { path: 'login', component: Login },
    { path: 'admin/project/new', component: ProjForm, canActivate: [authGuard] },
    { path: 'admin/project/edit/:id', component: ProjForm, canActivate: [authGuard] },
    { path: 'admin/post/new', component: PostForm, canActivate: [authGuard] },
    { path: 'admin/post/edit/:id', component: PostForm, canActivate: [authGuard] },
];
