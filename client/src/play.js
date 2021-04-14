const newGame = document.getElementById('new-game');
const deleteFigure = document.getElementById('delete-figure');
const board = document.getElementById('chessboard-blank');
const kef = 60;
let selectedValue;

newGame.addEventListener('click', function (event) {
  clearAll();
  let checkBox = document.querySelectorAll('input[name="choice"]');

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
  const pawn = {
    name: 'p',
    move: ['p', 'one', 'd'],
  };
  const rook = {
    name: 'r',
    move: ['f', 'b', 's'],
  };
  const knight = {
    name: 'n',
    move: ['h'],
  };
  const bishop = {
    name: 'b',
    move: ['d'],
  };
  const king = {
    name: 'k',
    move: ['f', 'b', 's', 'd', 'one'],
  };
  const queen = {
    name: 'q',
    move: ['f', 'b', 's', 'd'],
  };

  const arrayChess = [
    [rook, pawn, , , , , pawn, rook],
    [knight, pawn, , , , , pawn, knight],
    [bishop, pawn, , , , , pawn, bishop],
    [queen, pawn, , , , , pawn, queen],
    [king, pawn, , , , , pawn, king],
    [bishop, pawn, , , , , pawn, bishop],
    [knight, pawn, , , , , pawn, knight],
    [rook, pawn, , , , , pawn, rook],
  ];

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (arrayChess[i][j]) {
        if (arrayChess[i][j]) {
          let figure = new Figure(i + 1, j + 1, arrayChess[i][j]);
          figure.addFigure(color);
        }
      }
    }
  }
}

class Figure {
  constructor(x, y, obj) {
    this.x = x;
    this.y = y;
    this.elemDiv = document.createElement('div');
    let name;

    if (this.y < 3) {
      name = 'w' + obj.name;
    }
    if (this.y > 6) {
      name = 'b' + obj.name;
    }

    let color = selectedValue;

    this.addFigure = function (color) {
      const board = document.getElementById('chessboard-blank');

      this.elemDiv.className = `piece ${name} square${x}${y}`;

      this.elemDiv.style.backgroundImage = `url('/chess/client/img/figures/${name}.png')`;
      this.elemDiv.style.transform = `
      matrix(1, 0, 0, 1, 
      ${getCoordinates(x, y, color).x},
      ${getCoordinates(x, y, color).y}
    `;
      this.elemDiv.id = name + x + y;
      board.appendChild(this.elemDiv);
    };

    const ball = this.elemDiv;
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
        let flag;
        let xDif = Math.round(Cx / kef);
        let yDif = Math.round(Cy / kef);

        let newMatrixX = getCoordinates(x, y, color).x + xDif * kef;
        let newMatrixY = getCoordinates(x, y, color).y + yDif * kef;

        let newX, newY;

        if (color == 'white') {
          newX = x + xDif;
          newY = y - yDif;
        } else if (color == 'black') {
          newX = x - xDif;
          newY = y + yDif;
        }

        if (canMove() == 'can') {
          putFigure(newX, newY, newMatrixX, newMatrixY);
        } else {
          backFigure();
        }

        checkTarget();

        document.removeEventListener('mousemove', onMouseMove);
        ball.onmouseup = null;

        function checkTarget() {
          if (flag == 'stopCheckTarget') return;

          let target = document.querySelector(`.square${newX}${newY}`);

          if (
            colorFigure(target.classList[1]) != colorFigure(ball.classList[1])
          ) {
            target.remove();
            x = newX;
            y = newY;
          } else {
            if (target.id != ball.id) {
              backFigure();
            } else {
              x = newX;
              y = newY;
            }
          }
        }

        function backFigure() {
          putFigure(
            x,
            y,
            getCoordinates(x, y, color).x,
            getCoordinates(x, y, color).y
          );
          flag = 'stopCheckTarget';
        }

        function putFigure(x, y, matrixX, matrixY) {
          ball.style.left = 0;
          ball.style.top = 0;
          ball.style.transform = `
            matrix(1, 0, 0, 1, 
            ${matrixX},
            ${matrixY})
          `;
          ball.className = `piece ${name} square${x}${y}`;
        }

        function colorFigure(name) {
          if (name.slice(0, 1) == 'w') return 'white';
          else return 'black';
        }

        function canMove() {
          let S;
          if (ball.classList[1].slice(0, 1) == 'w') S = 1;
          if (ball.classList[1].slice(0, 1) == 'b') S = -1;

          if (obj.move.includes('p')) {
            let target = document.querySelector(`.square${newX}${newY}`);

            if (xDif == 0 && yDif * S == -1) {
              if (target) return;
              return 'can';
            }

            if ((y == 2 && yDif == -2) || (y == 7 && yDif == 2)) {
              if (target || document.querySelector(`.square${newX}${newY - S}`))
                return;
              return 'can';
            }
          }

          if (
            obj.move.includes('one') &&
            (Math.abs(xDif) > 1 || Math.abs(yDif) > 1)
          ) {
            return;
          }

          if (obj.move.includes('f') && xDif == 0 && yDif < 0) {
            return 'can';
          }

          if (obj.move.includes('b') && xDif == 0 && yDif > 0) {
            return 'can';
          }

          if (obj.move.includes('s') && yDif == 0 && xDif != 0) {
            return 'can';
          }

          if (
            obj.move.includes('d') &&
            xDif != 0 &&
            Math.abs(xDif) == Math.abs(yDif)
          ) {
            return 'can';
          }

          if (
            obj.move.includes('h') &&
            yDif != 0 &&
            xDif != 0 &&
            Math.abs(xDif) + Math.abs(yDif) == 3
          ) {
            return 'can';
          }
        }
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
  let texts = document.getElementsByClassName('text');
  board.innerHTML = '';
}
