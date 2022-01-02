# :bank: Jogo de Gerenciamento de Caixa de Banco
Um jogo que simula uma jornada de trabalho para ambiente de caixa de banco.

<!-- LINK DA PUBLICAÇÃO -->
:link: [Abra o projeto hospedado no AWS Amplify](https://main.d2yhxng3an37h2.amplifyapp.com/)

<!-- SOBRE -->
## :page_with_curl: Sobre o projeto
Como um propósito de desafio, decidi usar apenas HTML/CSS/JS puro. Página única, 3 arquivos. Sem framework ou biblioteca.

### :construction: Feito com
* [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
* [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
* [Javascript](https://developer.mozilla.org/en/JavaScript)

<!-- USO -->
## :video_game: Uso básico
Estas são informações básicas de uso para a perspectiva de um jogador. Mais detalhes os jogadores precisarão descobrir jogando. :)
* O objetivo é atender os clientes dentro do período de espera, buscando utilizar o mínimo orçamento possível.
* Os clientes chegam entre 10h e 15h e o expediente encerra às 16h.
* Você pode pontuar com documentos processados e clientes atendidos dentro do prazo.
* Você será penalizado por reclamações de clientes, acionadas quando os clientes esperam muito, abandonam a espera ou são recusados.
* As ativações do caixa debitam o orçamento e as reativações ao final do dia creditam parcialmente.
* Você tem 3 níveis de dificuldade.
* Quando uma partida começa, você tem 10 minutos (no relógio do jogo) para configurar seus primeiros caixas. Você pode ativar mais a qualquer momento até o limite do orçamento. Uma vez que um caixa é ativado, você só poderá desativá-lo após as 15h00 e se ele não estiver atendendo a nenhum cliente.
* Em seguida, você observará as filas de espera e o status dos caixas, atendendo a novos clientes antes que eles entrem por conta própria, alterando o tipo de caixa e assim por diante.
* É melhor verificar a guia Estatísticas do jogo durante e após o término de uma partida, para ver o que deu errado e tentar obter uma pontuação melhor na próxima vez.
* Sua pontuação após cada partida será salva no "armazenamento local" do seu navegador, e você pode verificá-la na guia Estatísticas.

<!-- NOTAS PARA DESENVOLVEDORES -->
## :keyboard: Notas para desenvolvedores
#### :game_die: Random
A lógica do jogo faz uso de muitos números randômicos com porcentagens de probabilidade, afetando muitos aspectos da simulação, desde o nível de dificuldade até comportamentos baseados no horário do jogo.
#### :arrows_counterclockwise: Loop do jogo
O loop do jogo é feito usando a função básica _setInterval_ apenas para simplificar, uma vez que não é necessária alta taxa de atualização ou precisão.
#### :iphone: Responsividade
Foi feita responsividade básica usando CSS puro, para ajustar em um monitor widescreen padrão e um celular no modo retrato.
#### :earth_americas: Idioma
Por enquanto, a interface do usuário (texto html) está toda em português do Brasil. Por outro lado, todo o código está em inglês.

<!-- CONSIDERAÇÕES FINAIS -->
## Considerações finais
Escrevi este jogo de simulação anos atrás para Windows Phone com C # e Unity3D, quando estava aprendendo a programar.
Infelizmente não fiz nenhum backup e perdi todo o projeto. Então decidi escrevê-lo novamente do zero, desta vez como parte do aprendizado sobre desenvolvimento web.
