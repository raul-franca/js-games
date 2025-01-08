
const Tipo = {
    pedra:"🪨",
    papel: "🧻",
    tesoura:"✂️"
};
function vencedor(x,y) {
    if (x.tipo === y.tipo) {
        return null;
    } else if (x.tipo === Tipo.pedra && y.tipo === Tipo.tesoura) {
        return x;
    } else if (x.tipo === Tipo.tesoura && y.tipo === Tipo.papel) {
        return x;
    } else if (x.tipo === Tipo.papel && y.tipo === Tipo.pedra) {
        return x;
    } else {
        return y;
    }
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
class Item {
    constructor(x,y,tipo) {
        this.x = x;
        this.y = y;
        this.tipo = tipo;
        this.dx = getRandomInt(1,4);
        this.dy = getRandomInt(1,4);
    }
}

const { init, GameLoop, Sprite, initPointer, track, on, emit } = kontra;

(function (){
    const { canvas } = kontra.init("game");
})();

