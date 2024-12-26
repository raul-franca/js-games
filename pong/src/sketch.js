// Classe da paleta
class Paleta {
  constructor(x, y) {
    this.x = x; // Posição x da paleta
    this.y = y; // Posição y da paleta
    this.largura = 10; // Largura da paleta
    this.altura = 90; // Altura da paleta
    this.velocidade = 5; // Velocidade de movimento da paleta
  }

  // Movimenta a paleta automaticamente em direção à posição vertical da bola
  pilotoAutomatico(bolaY){

    if (bolaY < this.y + this.altura / 2 && this.y > 0) {
      this.movimentarParaCima(); // Move a paleta do jogador 2 para cima em direção à posição da bola
    } else if (bolaY > this.y + this.altura / 2 && this.y < height - this.altura) {
      this.movimentarParaBaixo(); // Move a paleta do jogador 2 para baixo em direção à posição da bola
    }
  }

  controlarComTeclado() {
    if (keyIsDown(UP_ARROW) && this.y > alturaBarraHorizontal) {
      this.movimentarParaCima(); // Move a paleta para cima
    }
    if (keyIsDown(DOWN_ARROW) && this.y < height - this.altura - alturaBarraHorizontal) {
      this.movimentarParaBaixo(); // Move a paleta para baixo
    }
  }


  setPosition(y) {
    // Define a posição y da paleta, mantendo-a dentro dos limites da tela
    this.y = constrain(y, alturaBarraHorizontal, height - this.altura - alturaBarraHorizontal);
  }

  movimentarParaCima() {
    if (this.y > alturaBarraHorizontal) {
      this.y -= this.velocidade; // Move a paleta para cima
    }
  }

  movimentarParaBaixo() {
    if (this.y < height - this.altura - alturaBarraHorizontal) {
      this.y += this.velocidade; // Move a paleta para baixo
    }
  }

  desenhar() {
    fill(255);
    rect(this.x, this.y, this.largura, this.altura); // Desenha a paleta na tela
  }
}

// Classe da bola
class Bola {
  constructor() {
    this.x = width / 2; // Posição x inicial da bola (centro horizontal)
    this.y = height / 2; // Posição y inicial da bola (centro vertical)
    this.tamanho = 15; // Tamanho da bola
    this.velocidadeX = 5; // Velocidade de movimento da bola no eixo x
    this.velocidadeY = 5; // Velocidade de movimento da bola no eixo y
     this.somColisao = loadSound('assets/impact-sound-effect-8-bit-retro-151796.mp3');
  }

  mover() {
    this.x += this.velocidadeX; // Move a bola no eixo x
    this.y += this.velocidadeY; // Move a bola no eixo y
  }

  verificarColisaoComParede() {
    if (this.y < alturaBarraHorizontal ) {
      this.velocidadeY *= -1; // Inverte a direção da bola ao colidir com as paredes superior e inferior
    }
    else if(this.y + this.tamanho > height - alturaBarraHorizontal ) {
      this.velocidadeY *= -1; // Inverte a direção da bola ao colidir com as paredes superior e inferior
    }
  }

  verificarColisaoComPaleta(paleta) {

    if (
        this.x + this.tamanho / 2 > paleta.x && // A divisão por 2 pega o centro da bola
        this.x - this.tamanho / 2 < paleta.x + paleta.largura &&
        this.y + this.tamanho / 2 > paleta.y &&
        this.y - this.tamanho / 2 < paleta.y + paleta.altura
    ) {
      // Calcular a diferença entre o centro da bola e o centro da paleta
      let diff = this.y - (paleta.y + paleta.altura / 2);

      // Normalizar essa diferença (-0.5 a 0.5)
      let normalizedDiff = diff / (paleta.altura / 2);

      // Multiplicar a diferença normalizada por um fator (menor que a velocidade máxima em Y)
      // para suavizar o efeito.
      let factor = 3;
      this.velocidadeY = normalizedDiff * factor;

      // Inverter a direção da bola no eixo X para refletir a bola
      this.velocidadeX *= -1;

      // Tocar som de colisão
      this.somColisao.play();

    }
  }

  verificarGol() {
    if (this.x < 0) {
      placarJogador2++; // Incrementa o placar do jogador 2 ao gol do jogador 1
      this.resetar(); // Reseta a posição e velocidade da bola
    }

    if (this.x > width - this.tamanho) {
      placarJogador1++; // Incrementa o placar do jogador 1 ao gol do jogador 2
      this.resetar(); // Reseta a posição e velocidade da bola
    }
  }

  resetar() {
    this.x = width / 2; // Posição x inicial da bola (centro horizontal)
    this.y = height / 2; // Posição y inicial da bola (centro vertical)
    this.velocidadeX *= -1; // Inverte a direção horizontal da bola
    this.velocidadeY *= random([-1, 1]); // Define uma direção vertical aleatória para a bola
  }

  desenhar() {
    fill(255);
    ellipse(this.x, this.y, this.tamanho, this.tamanho); // Desenha a bola na tela
  }
}

// Variáveis do jogo
const alturaBarraHorizontal = 10; // Altura das barras horizontais
let placarJogador1 = 0; // Placar do jogador 1
let placarJogador2 = 0; // Placar do jogador 2
let player; // Objeto da paleta do jogador 1
let computador; // Objeto da paleta do jogador 2
let bola; // Objeto da bola


// Função de configuração (executada uma vez no início)
function setup() {
  createCanvas(800, 400); // Cria o canvas com as dimensões especificadas

  // Criação das instâncias das classes
  player = new Paleta(0, height / 2 - 30); // Cria a paleta do jogador 1 na posição inicial
  computador = new Paleta(width - 10, height / 2 - 30); // Cria a paleta do jogador 2 na posição inicial
  bola = new Bola(); // Cria a bola na posição inicial
}

// Função de desenho (executada repetidamente)
function draw() {
  background(0); // Limpa o canvas com a cor preta

  // Desenho das barras horizontais
  fill(245);
  rect(0, 0, width, alturaBarraHorizontal); // Desenha a barra horizontal superior
  rect(0, height - alturaBarraHorizontal, width, alturaBarraHorizontal); // Desenha a barra horizontal inferior

// Desenho da linha tracejada no meio
  stroke(255);
  strokeWeight(2);
  for (let y = alturaBarraHorizontal + 20; y < height - alturaBarraHorizontal; y += 40) {
    line(width / 2, y, width / 2, y + 20);
  }

  // Movimento das paletas
  player.controlarComTeclado();
  computador.pilotoAutomatico(bola.y);

  // Movimento da bola
  bola.mover(); // Move a bola

  // Verificação de colisões
  bola.verificarColisaoComParede(); // Verifica colisão da bola com as paredes superior e inferior
  bola.verificarColisaoComPaleta(player); // Verifica colisão da bola com a paleta do jogador 1
  bola.verificarColisaoComPaleta(computador); // Verifica colisão da bola com a paleta do jogador 2
  bola.verificarGol(); // Verifica se ocorreu gol

  // Desenho das paletas e da bola
  player.desenhar(); // Desenha a paleta do jogador 1
  computador.desenhar(); // Desenha a paleta do jogador 2
  bola.desenhar(); // Desenha a bola

  // Exibição do placar
  textAlign(CENTER);
  textSize(32);
  fill(255);
  text(placarJogador1, width / 4, 50); // Exibe o placar do jogador 1 no canto superior esquerdo
  text(placarJogador2, 3 * width / 4, 50); // Exibe o placar do jogador 2 no canto superior direito
}
