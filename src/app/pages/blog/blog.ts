import { Component } from '@angular/core';
import { PostsList } from "../../components/posts/posts-list/posts-list";

@Component({
  selector: 'app-blog',
  imports: [PostsList],
  templateUrl: './blog.html',
  styleUrl: './blog.scss'
})
export class Blog {

}
