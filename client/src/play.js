const newGame = document.getElementById('new-game');
const deleteFigure = document.getElementById('delete-figure');
const board = document.getElementById('chessboard-blank');
const svgLayot = document.querySelector('.svg-layot');
const layot = document.getElementById('chessboard-layot');
const arrayWords = ['a', 'b', 'c', 'd', 'e', 'f', 'j', 'h'];
const kef = 60;
let gameColor;

newGame.addEventListener('click', function (event) {
  clearAll();

  checkColorGame();
  function checkColorGame() {
    const checkBox = document.querySelectorAll('input[name="choice"]');
    let selectValue;

    for (const rb of checkBox) {
      if (rb.checked) {
        selectValue = rb.value;
        break;
      }
    }
    if (selectValue == 'white') gameColor = { top: 'black', bot: 'white' };
    else gameColor = { top: 'white', bot: 'black' };
  }

  generateCoordinate();
  generateFigures();
}); //++

function generateCoordinate() {
  const xmlns = 'http://www.w3.org/2000/svg';
  const kef = 12.5;

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
          switch (gameColor.bot) {
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
          switch (gameColor.bot) {
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
} //++

function generateFigures() {
  const pawn = {
    name: 'p',
    move: ['p'],
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
  const arrayFigures = [
    rook,
    knight,
    bishop,
    queen,
    king,
    bishop,
    knight,
    rook,
  ];
  const arrayPawns = [pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn];
  const arrayChess = [
    arrayFigures,
    arrayPawns,
    [],
    [],
    [],
    [],
    arrayPawns,
    arrayFigures,
  ];

  if (gameColor.bot == 'black') {
    arrayFigures.reverse();
  }

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let figure = new Figure(x, y, arrayChess[y][x]);
      figure.addFigure();
    }
    if (y == 1) y = 5;
  }
}

class Figure {
  constructor(coorX, coorY, obj) {
    this.coorX = coorX;
    this.coorY = coorY;

    this.elemDiv = document.createElement('div');
    let name, color;

    let [x, y] = CalcChessCoor(coorX, coorY);

    if (y < 3) {
      color = 'white';
      name = 'w' + obj.name;
    }
    if (y > 6) {
      color = 'black';
      name = 'b' + obj.name;
    }

    this.addFigure = function () {
      this.elemDiv.className = `piece ${name} square${x}${y}`;

      this.elemDiv.style.backgroundImage = `url('/chess/client/img/figures/${name}.png')`;
      this.elemDiv.style.transform = `
        matrix(1, 0, 0, 1,
        ${coorX * kef},
        ${coorY * kef}
      `;
      this.elemDiv.id = name + x + y;
      board.appendChild(this.elemDiv);
    };

    const ball = this.elemDiv;

    let mouseX, mouseY;

    ball.onmousedown = function (event) {
      document.addEventListener('mousemove', onMouseMove);

      function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
      }

      function moveAt(pageX, pageY) {
        const rect = board.getBoundingClientRect();

        mouseX = pageX - rect.x - coorX * kef - ball.offsetWidth / 2;
        mouseY = pageY - rect.y - coorY * kef - ball.offsetHeight / 2;

        ball.style.left = mouseX + 'px';
        ball.style.top = mouseY + 'px';
      }

      board.appendChild(ball);

      moveAt(event.pageX, event.pageY);

      ball.style.cursor = 'grabbing';
      ball.onmouseup = function () {
        let flag;

        let xDif = Math.round(mouseX / kef);
        let yDif = Math.round(mouseY / kef);

        let newCoorX = coorX + xDif;
        let newCoorY = coorY + yDif;

        let [newX, newY] = CalcChessCoor(newCoorX, newCoorY);

        // clickFigure();
        //////////////////////////не работает

        function clickFigure() {
          if (x == newCoorX && y == newCoorY) {
            svgLayot.innerHTML = `<rect class="rect"
            transform = "matrix(1, 0, 0, 1, ${
              getCoordinates(x, y, gameColor.bot).x
            },${getCoordinates(x, y, gameColor.bot).y})"/>`;
          }

          board.addEventListener('click', function (event) {
            const layot = board.getBoundingClientRect();
            const pageX = event.pageX;
            const pageY = event.pageY;

            const clickX = Math.floor((pageX - layot.x) / kef);
            const clickY = Math.floor((pageY - layot.y) / kef);

            //animation(ball, clickX, clickY);
          });

          function animation(elem, x, y) {
            // let start = Date.now(); // запомнить время начала

            let timer = setInterval(function () {
              // сколько времени прошло с начала анимации?
              // let timePassed = Date.now() - start;

              if (timePassed >= 2000) {
                clearInterval(timer); // закончить анимацию через 2 секунды
                return;
              }

              // отрисовать анимацию на момент timePassed, прошедший с начала анимации
              draw(timePassed);
            }, 20);

            // в то время как timePassed идёт от 0 до 2000
            // left изменяет значение от 0px до 400px
            function draw(timePassed) {
              ball.style.left = timePassed / 5 + 'px';
            }
          }
        }

        function updateCoordinates() {
          x = newX;
          y = newY;
          coorX = newCoorX;
          coorY = newCoorY;
        }

        if (canMove() == 'can' && checkAndRemoveTarget() == 'check') {
          putFigure(newCoorX, newCoorY);
          updateCoordinates();
        } else {
          putFigure(coorX, coorY);
          flag = 'stopCheckTarget';
        }

        document.removeEventListener('mousemove', onMouseMove);
        ball.onmouseup = null;

        function checkAndRemoveTarget() {
          let target = document.querySelector(`.square${newX}${newY}`);
          if (target) {
            if (target.id != ball.id) {
              if (
                target.classList[1].slice(0, 1) != ball.classList[1].slice(0, 1)
              ) {
                target.remove();
                return 'check';
              }
            }
          } else return 'check';
        }

        function putFigure(a, b) {
          ball.style.left = 0;
          ball.style.top = 0;
          ball.style.transform = `
            matrix(1, 0, 0, 1, 
            ${a * kef},
            ${b * kef})
          `;
          ball.className = `piece ${name} square${CalcChessCoor(a, b)[0]}${
            CalcChessCoor(a, b)[1]
          }`;
          ball.id = name + CalcChessCoor(a, b)[0] + CalcChessCoor(a, b)[1];
        }

        function canMove() {
          let S;
          let chessDifX = x - newX;
          let chessDifY = y - newY;

          if (color == 'white') S = 1;
          if (color == 'black') S = -1;

          if (obj.move.includes('p')) {
            let target = document.querySelector(`.square${newX}${newY}`);

            if (chessDifY * S == -1 && chessDifX == 0) {
              if (target) return;
              return 'can';
            }

            if ((y == 2 && chessDifY == -2) || (y == 7 && chessDifY == 2)) {
              if (target || document.querySelector(`.square${newX}${newY}`))
                return;
              return 'can';
            }

            if (chessDifY * S == -1 && Math.abs(chessDifX) == 1) {
              if (target) {
                return 'can';
              }
            }

            if (
              (y == 5 && S == 1) ||
              (y == 4 && S == -1)
              //&& ()
              //тут идет проверка последнего хода противника от обработчика ходов
            ) {
              return 'can';
              //удаляем div пешки сбоку по координатам
            }
          }

          if (obj.move.includes('k')) {
          }

          if (
            obj.move.includes('one') &&
            (Math.abs(chessDifX) > 1 || Math.abs(chessDifY) > 1)
          ) {
            return;
          }

          if (obj.move.includes('f') && chessDifX == 0 && chessDifY * S < 0) {
            return 'can';
          }

          if (obj.move.includes('b') && chessDifX == 0 && chessDifY * S > 0) {
            return 'can';
          }

          if (obj.move.includes('s') && chessDifY == 0 && chessDifX != 0) {
            return 'can';
          }

          if (
            obj.move.includes('d') &&
            chessDifX != 0 &&
            Math.abs(chessDifX) == Math.abs(chessDifY)
          ) {
            return 'can';
          }

          if (
            obj.move.includes('h') &&
            chessDifY != 0 &&
            chessDifX != 0 &&
            Math.abs(chessDifX) + Math.abs(chessDifY) == 3
          ) {
            return 'can';
          }
        }
      };
    };

    ball.ondragstart = function () {
      return false;
    };
  }
}

function CalcChessCoor(a, b) {
  if (gameColor.bot == 'white') {
    return [a + 1, 8 - b];
  } else {
    return [8 - a, b + 1];
  }
}

function clearAll() {
  let svg = document.getElementById('svg');
  if (svg) {
    svg.remove();
  }
  board.innerHTML = '';
}
