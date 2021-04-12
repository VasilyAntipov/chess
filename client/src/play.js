const newGame = document.getElementById('new-game');
const deleteFigure = document.getElementById('delete-figure');
const board = document.getElementById('chessboard-blank');

const kef = 60;

newGame.addEventListener('click', function (event) {
  clearAll();
  let checkBox = document.querySelectorAll('input[name="choice"]');
  let selectedValue;
  for (const rb of checkBox) {
    if (rb.checked) {
      selectedValue = rb.value;
      break;
    }
  }

  generateCoordinate(selectedValue);
  generateFigures(selectedValue);
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
  const arrayChess = [
    ['wr', 'wp', , , , , 'bp', 'br'],
    ['wn', 'wp', , , , , 'bp', 'bn'],
    ['wb', 'wp', , , , , 'bp', 'bb'],
    ['wq', 'wp', , , , , 'bp', 'bq'],
    ['wk', 'wp', , , , , 'bp', 'bk'],
    ['wb', 'wp', , , , , 'bp', 'bb'],
    ['wn', 'wp', , , , , 'bp', 'bn'],
    ['wr', 'wp', , , , , 'bp', 'br'],
  ];

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (arrayChess[i][j]) {
        let figure = new Figure(i + 1, j + 1, arrayChess[i][j]);
        figure.addFigure(color);
        figure.canMove(color);
      }
    }
  }
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
      this.ElemDiv.id = name + x + y;
      board.appendChild(this.ElemDiv);
    };

    this.canMove = function (color) {
      const ball = this.ElemDiv;

      let Cx, Cy;

      ball.onmousedown = function (event) {
        document.addEventListener('mousemove', onMouseMove);

        function onMouseMove(event) {
          moveAt(event.pageX, event.pageY);
        }

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

        board.appendChild(ball);
        moveAt(event.pageX, event.pageY);

        ball.style.cursor = 'grabbing';
        ball.onmouseup = function () {
          let xDif = Math.round(Cx / kef);
          let yDif = Math.round(Cy / kef);

          let NewCorX = getCoordinates(x, y, color).x + xDif * kef;
          let NewCorY = getCoordinates(x, y, color).y + yDif * kef;

          let signX, signY;

          if (color == 'white') {
            signX = x + xDif;
            signY = y - yDif;
          } else if (color == 'black') {
            signX = x - xDif;
            signY = y + yDif;
          }

          putFigure(signX, signY, NewCorX, NewCorY);

          checkTarget();

          document.removeEventListener('mousemove', onMouseMove);
          ball.onmouseup = null;

          function checkTarget() {
            let target = document.querySelector(`.square${signX}${signY}`);
            if (
              colorFigure(target.classList[1]) != colorFigure(ball.classList[1])
            ) {
              target.remove();
              x = signX;
              y = signY;
            } else {
              if (target.id != ball.id) {
                putFigure(
                  x,
                  y,
                  getCoordinates(x, y, color).x,
                  getCoordinates(x, y, color).y
                );
              } else {
                x = signX;
                y = signY;
              }
            }
          }

          function putFigure(xtemp, ytemp, newCorTempX, newCorTempY) {
            ball.style.left = 0;
            ball.style.top = 0;
            ball.style.transform = `
            matrix(1, 0, 0, 1, 
            ${newCorTempX},
            ${newCorTempY}
          `;
            ball.className = `piece ${name} square${xtemp}${ytemp}`;
          }

          // checkTarget();
        };
      };
    };
  }
}

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

function clearAll() {
  const layot = document.getElementById('chessboard-layot');

  board.innerHTML = '';
}

function colorFigure(name) {
  let colorFigure;
  if (name.slice(0, 1) == 'w') return 'white';
  else return 'black';
}
