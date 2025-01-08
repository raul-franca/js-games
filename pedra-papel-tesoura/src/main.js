import { init, GameLoop } from 'kontra';

let { canvas, context } = init();

// Exemplo simples de loop de jogo
let loop = GameLoop({
    update: function() {
        // Lógica do jogo
    },
    render: function() {
        // Desenho na tela
    }
});

loop.start();