(function () {
    // Inicializa o canvas com id='snake-game' e obtém context para desenhar
    let { canvas, context } = kontra.init('snake-game');

    let score = 0;

    // Inicializa o sistema de captura de teclas da Kontra.js
    kontra.initKeys();

    // Lista de códigos de teclas das setas (esquerda, cima, direita, baixo)
    let arrows = [37, 38, 39, 40];

    // Adiciona um evento ao canvas para prevenir a rolagem da página
    // quando o usuário aperta as setas (especialmente em browsers que rolam a tela)
    canvas.addEventListener(
        'keydown',
        function (e) {
            if (arrows.indexOf(e.which) !== -1) {
                e.preventDefault();
            }
        },
        true
    );

    // Tamanho de cada célula do grid (cada quadradinho no jogo)
    let grid = 20;

    // Calcula quantas linhas e colunas cabem no canvas
    let numRows = canvas.height / grid;
    let numCols = canvas.width / grid;


    // Cria dois sprites: um para a cobra (snake) e outro para a maçã (apple)
    let snake = kontra.Sprite();
    let apple = kontra.Sprite();

    // Vetor que guardará índices de cada célula livre do grid.
    // Cada célula do grid é numerada de 0 até numRows*numCols - 1
    // Ex: se numCols=20, a célula (row=1, col=5) teria índice 1*20 + 5 = 25
    let freeCells = [];
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            freeCells.push(row * numCols + col);
        }
    }

    /**
     * Retorna um inteiro aleatório entre min (inclusivo) e max (exclusivo)
     * Usado aqui para escolher uma célula livre aleatória
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Retorna a posição (x, y) de uma célula aleatória que esteja livre
     * para colocar a maçã
     */
    function getApplePos() {
        // Escolhe um índice aleatório no array de células livres
        let cell = getRandomInt(0, freeCells.length - 1);

        // Converte esse índice de volta para coordenadas x e y
        return {
            x: (cell % numCols) * grid,
            y: ((cell / numCols) | 0) * grid
        };
    }

    /**
     * Reinicia o estado do jogo: posiciona a cobra e a maçã,
     * definindo também tamanho e células iniciais da cobra
     */
    function reset() {
        score = 0;
        document.getElementById("score").innerHTML = score;
        snake.init({
            x: 10 * grid,     // Posição inicial (coluna 10)
            y: 5 * grid,      // Posição inicial (linha 5)
            dx: grid,         // Movimento horizontal (vai se mover para a direita)
            color: 'green',
            cells: [],        // Lista de coordenadas ocupadas pela cobra
            maxCells: 4,      // Tamanho inicial da cobra (4 segmentos)

            // Função de atualização (chamada a cada frame do jogo)
            update: function () {
                this.advance();

                // Faz a cobra “aparecer do outro lado” se passar do limite
                // Efeito de wrap horizontal e vertical
                if (this.x < 0) {
                    this.x = canvas.width - grid;
                } else if (this.x >= canvas.width) {
                    this.x = 0;
                }
                if (this.y < 0) {
                    this.y = canvas.height - grid;
                } else if (this.y >= canvas.height) {
                    this.y = 0;
                }

                // Coloca a nova posição da cabeça da cobra
                // no início do array (unshift)
                this.cells.unshift({ x: this.x, y: this.y });

                // Remove a célula da lista de livres, pois agora a cobra ocupa esse espaço
                let cellIndex = freeCells.indexOf((this.y / grid) * numCols + this.x / grid);
                freeCells.splice(cellIndex, 1);

                // Se a cobra ultrapassou o tamanho máximo, remove a cauda
                if (this.cells.length > this.maxCells) {
                    let cell = this.cells.pop();
                    // Adiciona de volta a célula removida (cauda) na lista de células livres
                    freeCells.push((cell.y / grid) * numCols + cell.x / grid);
                }

                // Verifica colisões com maçã e com o próprio corpo
                this.cells.forEach(
                    function (cell, index) {
                        // Se a cabeça da cobra (index === 0) ocupa mesma posição da maçã,
                        // então a cobra "come" a maçã
                        if (index === 0 && cell.x === apple.x && cell.y === apple.y) {
                            score++;
                            document.getElementById("score").innerHTML = score;
                            this.maxCells++;
                            // Gera nova posição para a maçã
                            let pos = getApplePos();
                            apple.x = pos.x;
                            apple.y = pos.y;
                        }

                        // Verifica colisão da cobra consigo mesma
                        for (let i = index + 1; i < this.cells.length; i++) {
                            // Se algum outro segmento ocupa a mesma posição, reset do jogo
                            if (cell.x === this.cells[i].x && cell.y === this.cells[i].y) {
                                reset();
                            }
                        }
                    }.bind(this)
                );
            },

            // Função para renderizar a cobra
            render: function () {
                // Define cor para desenhar a cobra
                this.context.fillStyle = this.color;

                // Para cada segmento da cobra, desenha um retângulo
                // Note que é desenhado relativo à posição atual do sprite
                this.cells.forEach(
                    function (cell) {
                        this.context.fillRect(
                            cell.x - this.x,
                            cell.y - this.y,
                            grid - 1,
                            grid - 1
                        );
                    }.bind(this)
                );
            }
        });

        // Posiciona a maçã (apple)
        let pos = getApplePos();
        apple.init({
            x: pos.x,
            y: pos.y,
            color: 'red',
            width: grid - 1,
            height: grid - 1
        });
    }

    // Configurações de controle de direção da cobra usando as setas
    // Observação: isso ocorre fora do loop principal para ter uma resposta
    // mais imediata (não limitada a 15fps)
    kontra.onKey('arrowleft', function () {
        // Evita que a cobra volte diretamente para trás se estiver indo para a direita
        if (snake.dx === 0) {
            snake.dx = -grid;
            snake.dy = 0;
        }
    });
    kontra.onKey('arrowup', function () {
        if (snake.dy === 0) {
            snake.dy = -grid;
            snake.dx = 0;
        }
    });
    kontra.onKey('arrowright', function () {
        if (snake.dx === 0) {
            snake.dx = grid;
            snake.dy = 0;
        }
    });
    kontra.onKey('arrowdown', function () {
        if (snake.dy === 0) {
            snake.dy = grid;
            snake.dx = 0;
        }
    });

    // Cria um GameLoop da Kontra.js
    // Define a taxa de quadros em 15fps (que funciona bem para Snake)
    let loop = kontra.GameLoop({
        fps: 10,
        update: function () {
            snake.update();
        },
        render: function () {
            apple.render();
            snake.render();
        }
    });

    // Inicializa as posições da cobra e da maçã
    reset();
    // Inicia o loop de jogo
    loop.start();
})();