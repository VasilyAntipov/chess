const newGame = document.getElementById('new-game');
const board = document.getElementById('chessboard-blank');

const widthCell = 60;
const heightCell = 60;
const startX = 50;
const startY = 0;

function generateCoordinate(color) {
  const layot = document.getElementById('chessboard-layot');
  const xmlns = 'http://www.w3.org/2000/svg';
  const kef = 12.5;
  const arrayWords = ['a', 'b', 'c', 'd', 'e', 'f', 'j', 'h'];

  let svg = document.createElementNS(xmlns, 'svg');
  svg.id = 'svg';
  svg.setAttributeNS(null, 'class', 'coordinates-outside');
  svg.setAttributeNS(null, 'viewBox', '0 0 100 100');
  svg.setAttributeNS(null, 'width', '480');
  svg.setAttributeNS(null, 'height', '480');
  svg.style.display = 'block';
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 8; i++) {
      let text = document.createElementNS(xmlns, 'text');
      text.setAttributeNS(null, 'class', `coordinate-grey`);
      switch (j) {
        case 0:
          text.setAttributeNS(null, 'x', '2');
          text.setAttributeNS(null, 'y', 3.5 + kef * i);
          switch (color) {
            case 'black':
              text.textContent = i + 1;
              break;
            case 'white':
              text.textContent = 8 - i;
          }
          break;
        case 1:
          text.setAttributeNS(null, 'x', 10.35 + kef * i);
          text.setAttributeNS(null, 'y', '99.25');
          switch (color) {
            case 'black':
              text.textContent = arrayWords[7 - i];
              break;
            case 'white':
              text.textContent = arrayWords[i];
          }
      }

      svg.appendChild(text);
    }
  }

  layot.appendChild(svg);
}

newGame.addEventListener('click', function (event) {
  generateCoordinate('black');
  generateFigures();
});

function generateFigures() {
  const arrayChess = [
    ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
    ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
    [],
    [],
    [],
    [],
    ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
    ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
  ];

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (arrayChess[i][j]) {
        // createFigure(i, j, arrayChess[i][j]);
        let figure = new Figure(i+1,j+1,arrayChess[i][j]);
        figure.addFigure();
        figure.move();
      }
    }
  }
  // createFigure(1, 1, wp);
  // createFigure(1, 2, wp);
  // dragAndDrop(1,1,wp)
  // dragAndDrop(1,2,wp)
  // let chessWp = new Figure(1, 1, 'wp');
  // let chessWr = new Figure(1, 2, 'br');
  // chessWp.addFigure();
  // chessWr.addFigure();
  // chessWp.move();
}

function createFigure(x, y, obj) {
  const kef = 60;
  const figure = document.createElement('div');
  figure.className = `piece ${obj.name} square${x}${y}`;
  figure.style.backgroundImage = `url('/chess/client/img/figures/${obj.name}.png')`;
  figure.style.transform = `
      matrix(1, 0, 0, 1, 
      ${(y - 1) * kef}, 
      ${(x - 1) * kef})
    `;
  figure.id = 'ch' + x + y;
  board.appendChild(figure);
}

class Figure {
  constructor(x, y, name) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.figure = document.createElement('div');

    this.addFigure = function () {
      const kef = 60;
      // const figure = document.createElement('div');
      const board = document.getElementById('chessboard-blank');
      this.figure.className = `piece ${this.name} square${this.x}${this.y}`;
      this.figure.style.backgroundImage = `url('/chess/client/img/figures/${this.name}.png')`;
      this.figure.style.transform = `
        matrix(1, 0, 0, 1, 
        ${(this.y - 1) * kef}, 
        ${kef * 8 - this.x * kef})
      `;
      this.figure.id = 'ch' + this.x + this.y;
      board.appendChild(this.figure);
    };

    this.move = function () {
      const x = this.x;
      const y = this.y;
      const ball = this.figure;

      // ball.ondragstart = function () {
      //   return false;
      // };
      let Cx, Cy;

      ball.onmousedown = function (event) {

        board.appendChild(ball);
        ball.style.cursor = 'grabbing';
        
        moveAt(event.pageX, event.pageY);

        function moveAt(pageX, pageY) {
          const kef = 60;
          Cx = pageX - 165 - x * kef - ball.offsetWidth / 2;
          Cy = pageY - y * 60 - ball.offsetHeight / 2;
          ball.style.left = Cx + 'px';
          ball.style.top = Cy + 'px';
          // console.log(pageX + ';' + pageY)
          // ball.style.left = pageX -x*kef + 'px';
          // ball.style.top = pageY -120+ 'px'
        }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           

        function onMouseMove(event) {
          moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        // ball.onmouseup = function () {
        //   ball.style.left = Math.round(Cx / 60) * 60 + 'px';
        //   ball.style.top = Math.round(Cy / 60) * 60 + 'px';
        //   document.removeEventListener('mousemove', onMouseMove);
        //   ball.onmouseup = null;
        // };
        ball.onmouseup = function () {
          ball.style.left = Math.round(Cx / 60) * 60 + 'px';
          ball.style.top = Math.round(Cy / 60) * 60 + 'px';
          document.removeEventListener('mousemove', onMouseMove);
          ball.onmouseup = null;
        };

      };
    };
  }
}

function dragAndDrop(i, j, type) {
  // const ball = document.getElementsByClassName('ch' + (i + 1) + (j + 1));
  // let ball = document.getElementsByClassName('ch' + (i + 1) + (j + 1));
  let ball = document.getElementById('ch' + i + j);
  ball.ondragstart = function () {
    return false;
  };
  let x, y;

  ball.onmousedown = function (event) {
    board.appendChild(ball);

    ball.style.cursor = 'grabbing';
    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
      x = pageX - 165 - j * 60 - ball.offsetWidth / 2;
      y = pageY - i * 60 - ball.offsetHeight / 2;
      ball.style.left = x + 'px';
      ball.style.top = y + 'px';
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    ball.onmouseup = function () {
      ball.style.left = Math.round(x / 60) * 60 + 'px';
      ball.style.top = Math.round(y / 60) * 60 + 'px';
      document.removeEventListener('mousemove', onMouseMove);
      ball.onmouseup = null;
    };
  };
}
