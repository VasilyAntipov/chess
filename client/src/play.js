const newGame = document.getElementById('new-game');
const board = document.getElementById('chessboard-blank');

const kef = 60;

newGame.addEventListener('click', function (event) {
  generateCoordinate('white');
  generateFigures('white');
});

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

function generateFigures(color) {
  // const arrayChess = [
  //   ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
  //   ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
  //   [],
  //   [],
  //   [],
  //   [],
  //   ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
  //   ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
  // ];

  const arrayChess = [
    ['wr', 'wp', , , , , 'bp' ,'br'],
    ['wn', 'wp', , , , , 'bp' ,'bn'],
    ['wb', 'wp', , , , , 'bp' ,'bb'],
    ['wq', 'wp', , , , , 'bp' ,'bq'],
    ['wk', 'wp', , , , , 'bp' ,'bk'],
    ['wb', 'wp', , , , , 'bp' ,'bb'],
    ['wn', 'wp', , , , , 'bp' ,'bn'],
    ['wr', 'wp', , , , , 'bp' ,'br'],
  ];

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (arrayChess[i][j]) {
        let figure = new Figure(i + 1, j + 1, arrayChess[i][j]);
        figure.addFigure(color);
        figure.move(color);
      }
    }
  }
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
    this.ElemDiv = document.createElement('div');

    this.addFigure = function (color) {
      const board = document.getElementById('chessboard-blank');

      this.ElemDiv.className = `piece ${name} square${x}${y}`;
      this.ElemDiv.style.backgroundImage = `url('/chess/client/img/figures/${name}.png')`;
      this.ElemDiv.style.transform = `
      matrix(1, 0, 0, 1, 
      ${getCoordinates(x, y, color).x},
      ${getCoordinates(x, y, color).y}
    `;
      getCoordinates(x, y, color, kef);
      // this.ElemDiv.id = 'ch' + x + y;
      board.appendChild(this.ElemDiv);
    };

    this.move = function (color) {
      const ball = this.ElemDiv;

      let Cx, Cy;

      ball.onmousedown = function (event) {
        board.appendChild(ball);

        ball.style.cursor = 'grabbing';

        moveAt(event.pageX, event.pageY);

        function moveAt(pageX, pageY) {
          const rect = board.getBoundingClientRect();

          Cx =
            pageX -
            rect.x -
            getCoordinates(x, y, color, kef).x -
            ball.offsetWidth / 2;
          Cy =
            pageY -
            rect.y -
            getCoordinates(x, y, color, kef).y -
            ball.offsetHeight / 2;

          ball.style.left = Cx + 'px';
          ball.style.top = Cy + 'px';
        }

        function onMouseMove(event) {
          moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        ball.onmouseup = function () {
          // ball.style.left = Math.round(Cx / 60) * 60 + 'px';
          // ball.style.top = Math.round(Cy / 60) * 60 + 'px';
          let xDif = Math.round(Cx / 60);
          let yDif = Math.round(Cy / 60);

          let NewCorX = getCoordinates(x, y, color).x + xDif*kef
          let NewCorY = getCoordinates(x, y, color).y + yDif*kef
          alert(`${xDif} ${yDif}
          ${x} ${y}
          ${x+xDif} ${y-yDif}
          ${ball.style.transform}
          `)
          //0 -2
          //5 2
         

          ball.style.left = 0;
          ball.style.top = 0;
          ball.style.transform = `
          matrix(1, 0, 0, 1, 
          ${NewCorX},
          ${NewCorY}
        `;

          ball.className = `piece ${name} square${x+xDif}${y-yDif}`;
          document.removeEventListener('mousemove', onMouseMove);
          ball.onmouseup = null;
          x = x + xDif;
          y = y - yDif;
        };
      };
    };
  }
}

// function getCoordinates(x, y, color, kef) {
//   let strX, strY;
//   switch (color) {
//     case 'white':
//       strX = (y - 1) * kef;
//       strY = (8 - x) * kef;
//       break;
//     case 'black':
//       strX = (8 - y) * kef;
//       strY = (x - 1) * kef;
//       break;
//   }
//   return { x: strX, y: strY };
// }

function getCoordinates(x, y, color) {
  let strX, strY;
  switch (color) {
    case 'white':
      strX = (x - 1) * kef;
      strY = (8 - y) * kef;
      break;
    case 'black':
      strX = (8 - x) * kef;
      strY = (y - 1) * kef;
      break;
  }
  return { x: strX, y: strY };
}
