import { Component } from '@angular/core';

@Component({
  selector: 'app-quem-somos',
  imports: [],
  templateUrl: './quem-somos.html',
  styleUrl: './quem-somos.scss'
})
export class QuemSomos {
  teamMembers = [
    { name: 'Marcelo Gularte', role: 'Presidente', image: 'assets/images/quemsomos/equipe/marcelo.jpg' },
    { name: 'Benny P. Dorneles', role: 'Vice-Presidente', image: 'assets/images/quemsomos/equipe/benny.jpg' },
    { name: 'Camila Borelli', role: 'Diretora Financeira', image: 'assets/images/quemsomos/equipe/camila.jpg' },
    { name: 'Alexandre de Oliveira', role: 'Diretor de Infraestrutura', image: 'assets/images/quemsomos/equipe/alexandre.jpg' },
    { name: 'Shaiane Tessmann', role: 'Diretora Técnica', image: 'assets/images/quemsomos/equipe/shaiane.jpg' },
    { name: 'Rosane Casanova', role: 'Diretora de Ajuda Humanitária', image: 'assets/images/quemsomos/equipe/rosane.png' }
  ];
}
