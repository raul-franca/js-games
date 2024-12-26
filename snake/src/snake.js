(function () {

    /* ----------------------------------------------------------------
     * 1) CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
     * ---------------------------------------------------------------- */
    // Inicializa o canvas com id='snake-game' e obtém context para desenhar
    const { canvas } = kontra.init("snake-game");

    // Elementos de interface
    const displayScore = document.getElementById("score");
    const infos = document.getElementById("infos");

    // Variável de pontuação
    let score = 0;

    // Variável para controle do modo automático
    let autoPilotActive = true;

    // Tamanho de cada célula do grid
    const grid = 30;

    // Taxa de atualização do jogo (frames por segundo)
    let fps = 10;

    // Calcula quantas linhas e colunas cabem no canvas
    const numRows = canvas.height / grid;
    const numCols = canvas.width / grid;

    // Vetor que guardará índices de cada célula livre do grid.
    let freeCells = [];

    // Sprites da cobra (snake) e da maçã (apple)
    const snake = kontra.Sprite();
    const apple = kontra.Sprite();

    // Inicializa o sistema de captura de teclas da Kontra.js
    kontra.initKeys();


    /* ----------------------------------------------------------------
     * 2) FUNÇÕES AUXILIARES
     * ---------------------------------------------------------------- */


    /**
     * Função para controle automático da cobra (modo auto-pilot).
     */
    function autoPilot(snake, apple, grid) {
        if (!snake.cells || snake.cells.length === 0) return;

        // Posição da cabeça da cobra (primeiro segmento)
        const headX = snake.cells[0].x;
        const headY = snake.cells[0].y;

        // Se a cabeça está à esquerda da maçã, vá para a direita
        if (headX < apple.x) {
            // Evita virar 180 graus instantaneamente se estiver indo para esquerda
            if (snake.dx !== -grid) {
                snake.dx = grid;
                snake.dy = 0;
            }
        }
        else if (headX > apple.x) {
            // Evita virar para a direita se está indo para esquerda
            if (snake.dx !== grid) {
                snake.dx = -grid;
                snake.dy = 0;
            }
        }
        // Se a cobra está alinhada no eixo X, tenta alinhar no eixo Y
        else {
            // Se a cabeça está acima da maçã, vá para baixo
            if (headY < apple.y) {
                if (snake.dy !== -grid) {
                    snake.dy = grid;
                    snake.dx = 0;
                }
            }
            // Senão, se está abaixo da maçã, vá para cima
            else if (headY > apple.y) {
                if (snake.dy !== grid) {
                    snake.dy = -grid;
                    snake.dx = 0;
                }
            }
        }
    }

    /**
     * Gera o array inicial de células livres (todas as posições do grid).
     */
    function initFreeCells() {
        freeCells = [];
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                freeCells.push(row * numCols + col);
            }
        }
    }

    /**
     * Retorna um inteiro aleatório entre min (inclusivo) e max (exclusivo).
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Retorna a posição (x, y) de uma célula aleatória livre para posicionar a maçã.
     */
    function getApplePos() {
        // Escolhe um índice aleatório no array de células livres
        const randomIndex = getRandomInt(0, freeCells.length - 1);
        const cell = freeCells[randomIndex]; // Índice da célula livre escolhida
        // Converte esse índice de volta para coordenadas x e y
        return {
            x: (cell % numCols) * grid,
            y: Math.floor(cell / numCols) * grid
            // * grid para obter a posição em píxeis
        };
    }

    /**
     * Atualiza na tela as informações de debug (score, dimensões, etc.).
     */
    function updateInfos() {
        infos.innerHTML = `
      Informações: <br>
      Tamanho grid: ${grid} <br>
      Velocidade: ${fps}fps <br>
      Canvas: ${canvas.width}x${canvas.height} <br>
      numRows: ${numRows} | numCols: ${numCols} <br>
        freeCells: ${freeCells.length} <br>
      <br>
      autoPilot: ${autoPilotActive} <br>
      snake.dx: ${snake.dx} | snake.dy: ${snake.dy} <br>
      snake.cells: ${snake.cells.length} <br>
      snake(x,y): (${snake.x}, ${snake.y}) <br>
      apple(x,y): (${apple.x}, ${apple.y}) <br>
      
    `;
        displayScore.innerHTML = score;
    }


    /* ----------------------------------------------------------------
     * 3) FUNÇÃO PRINCIPAL DE REINÍCIO (RESET) DO JOGO
     * ---------------------------------------------------------------- */
    function reset() {
        // Reinicia a pontuação e o texto do score
        score = 0;

        // Recria lista de células livres
        initFreeCells();

        // Inicializa a cobra
        snake.init({
            x: 10 * grid,     // Posição inicial (coluna 10)
            y: 5 * grid,      // Posição inicial (linha 5)
            dx: grid,         // Movimento inicial para a direita
            dy: 0,
            color: "green",
            cells: [],        // Lista de coordenadas ocupadas pela cobra
            maxCells: 4,      // Tamanho inicial da cobra

            // Atualização da cobra a cada frame
            update: function () {
                this.advance();

                // Faz wrap da cobra nas bordas do canvas
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

                // Adiciona nova posição da cabeça no início do array
                this.cells.unshift({ x: this.x, y: this.y });

                // Remove a célula da lista de livres (cobra ocupa agora)
                const headCellIndex = (this.y / grid) * numCols + (this.x / grid);
                const freeIndex = freeCells.indexOf(headCellIndex);
                if (freeIndex !== -1) {
                    freeCells.splice(freeIndex, 1);
                }

                // Remove a cauda se ultrapassou o tamanho máximo
                if (this.cells.length > this.maxCells) {
                    const tailCell = this.cells.pop();
                    // Devolve a célula removida à lista de livres
                    freeCells.push((tailCell.y / grid) * numCols + (tailCell.x / grid));
                }

                // Verifica colisões (maçã e corpo da cobra)
                this.checkCollisions();
            },

            // Checa colisões da cobra com a maçã e com ela mesma
            checkCollisions: function () {
                // Percorre todos os segmentos (primeiro é a cabeça)
                this.cells.forEach(
                    function (cell, index) {
                        // Cabeça da cobra encontra a maçã
                        if (index === 0 && cell.x === apple.x && cell.y === apple.y) {
                            score++;
                            this.maxCells++;
                            // Escolhe nova posição para a maçã
                            const pos = getApplePos();
                            apple.x = pos.x;
                            apple.y = pos.y;
                        }

                        // Checa colisão da cabeça com os outros segmentos (auto-colisão)
                        for (let i = index + 1; i < this.cells.length; i++) {
                            if (cell.x === this.cells[i].x && cell.y === this.cells[i].y) {
                                reset();
                            }
                        }
                    }.bind(this)
                );
            },

            // Renderiza a cobra (cada segmento)
            render: function () {
                this.context.fillStyle = this.color;
                this.cells.forEach(
                    function (cell) {
                        // Desenha cada segmento com base na posição de cada célula
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

        // Inicializa a posição da maçã
        const pos = getApplePos();
        apple.init({
            x: pos.x,
            y: pos.y,
            color: "red",
            width: grid - 1,
            height: grid - 1
        });
    }


    /* ----------------------------------------------------------------
     * 4) CONFIGURANDO CONTROLES (TECLAS DE DIREÇÃO)
     * ---------------------------------------------------------------- */
    kontra.onKey("p", function () {
        autoPilotActive = !autoPilotActive;
    });

    kontra.onKey("arrowleft", function () {
        if (autoPilotActive) {
            autoPilotActive = false;
        }
        if (snake.dx === 0) { // snake esta se movendo na vertical
            snake.dx = -grid;   // Muda para esquerda
            snake.dy = 0;
        }
    });

    kontra.onKey("arrowright", function () {
        if (autoPilotActive) {
            autoPilotActive = false;
        }
        if (snake.dx === 0) {
            snake.dx = grid;    // Muda para direita
            snake.dy = 0;
        }
    });

    kontra.onKey("arrowup", function () {
        if (autoPilotActive) {
            autoPilotActive = false;
        }
        if (snake.dy === 0) { // snake esta se movendo na horizontal
            snake.dy = -grid; // Muda para cima
            snake.dx = 0;
        }
    });

    kontra.onKey("arrowdown", function () {
        if (autoPilotActive) {
            autoPilotActive = false;
        }
        if (snake.dy === 0) {
            snake.dy = grid; // Muda para baixo
            snake.dx = 0;
        }
    });

    /* ----------------------------------------------------------------
     * 5) LOOP PRINCIPAL DO JOGO
     * ---------------------------------------------------------------- */
    const loop = kontra.GameLoop({
        fps: fps, // Taxa de atualização ~10fps (ou 15fps conforme desejado)
        update: function () {
            // Se autopilot estiver ligado, atualiza a direção antes de update()
            if (autoPilotActive) {
                autoPilot(snake, apple, grid);
            }
            snake.update();
        },
        render: function () {
            updateInfos();   // Atualiza informações de debug
            apple.render();  // Render da maçã
            snake.render();  // Render da cobra
        }
    });


    /* ----------------------------------------------------------------
     * 6) INICIALIZAÇÃO
     * ---------------------------------------------------------------- */
    reset();     // Reseta (posiciona cobra e maçã)
    loop.start(); // Inicia o loop do jogo
})();