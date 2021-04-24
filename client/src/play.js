const newGame = document.getElementById('new-game');
const deleteFigure = document.getElementById('delete-figure');
const board = document.getElementById('chessboard-blank');
const svgLayot = document.querySelector('.svg-layot');
const layot = document.getElementById('chessboard-layot');
const arrayWords = ['a', 'b', 'c', 'd', 'e', 'f', 'j', 'h'];
const kef = 60;
let gameColor;
const borda = [];

initialization();

function initialization() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      borda.push({ x: i, y: j });
    }
  }
}

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


    this.addFigure = function () {
      this.elemDiv.className = `piece ${name} square-${x}${y}`;

      this.elemDiv.style.backgroundImage = `url('/chess/client/img/figures/${name}.png')`;
      this.elemDiv.style.transform = `
        matrix(1, 0, 0, 1,
        ${coorX * kef},
        ${coorY * kef}
      `;
      this.elemDiv.id = 'id' + x + y;
      this.elemDiv.color = color;
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

        // if (mouseX > rect.x + rect.width) mouseX = rect.x + rect.width;
        ball.style.left = mouseX + 'px';
        ball.style.top = mouseY + 'px';
      }

      let canMoveArray = canMove(coorX, coorY);

      highlightMoves(canMoveArray.all);
      highlightEnemy(canMoveArray.enemy);
      board.appendChild(ball);

      moveAt(event.pageX, event.pageY);

      ball.style.cursor = 'grabbing';
      ball.onmouseup = function () {
        let xDif = Math.round(mouseX / kef);
        let yDif = Math.round(mouseY / kef);

        let newCoorX = coorX + xDif;
        let newCoorY = coorY + yDif;

        let [newX, newY] = CalcChessCoor(newCoorX, newCoorY);

        if (x == newX && y == newY) {
          putFigure(ball, coorX, coorY);

          clickFigure();
        } else {
          if (
            canMoveArray.all.find(
              (coordinate) =>
                coordinate.x == newCoorX && coordinate.y == newCoorY
            )
          ) {
            console.log(newCoorX, newCoorY);

            if (checkFigures(newX, newY) == 'check') {
              putFigure(ball, newCoorX, newCoorY);
              updateCoordinates();
              svgLayot.innerHTML = null;
            } else {
              putFigure(ball, coorX, coorY);
            }
          } else {
            putFigure(ball, coorX, coorY);
          }
        }

        document.removeEventListener('mousemove', onMouseMove);
        ball.onmouseup = null;

        // svgLayot.innerHTML = null;

        function checkFigures(newX, newY) {
          let target = document.querySelector(`.square-${newX}${newY}`);

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

        function clickFigure() {
          let timerId;
          svgLayot.innerHTML = null;
          svgLayot.innerHTML += `<rect width="${kef}" height="${kef}" stroke="yellow" fill="silver" stroke-width="2" transform="matrix(1,0,0,1,${
            coorX * kef
          },${coorY * kef})"/>
          `;
          // svgLayot.style.zIndex = '00'

          svgLayot.addEventListener('click', onClickBoard);
          highlightMoves(canMoveArray.all);
          highlightEnemy(canMoveArray.enemy);

          function onClickBoard(event) {
            const layot = svgLayot.getBoundingClientRect();
            const pageX = event.pageX;
            const pageY = event.pageY;

            let clickX = Math.floor((pageX - layot.x) / 60);
            let clickY = Math.floor((pageY - layot.y) / 60);

            [newX, newY] = CalcChessCoor(clickX, clickY);

            if (
              canMove(coorX, coorY).all.find(
                (elem) => elem.x == clickX && elem.y == clickY
              )
            ) {
              animation(coorX, coorY, clickX, clickY);

              coorY = clickY;
              coorX = clickX;
              x = newX;
              y = newY;
              // clearTimeout(timerId);
            } else {
              svgLayot.innerHTML = null;
              svgLayot.removeEventListener('click', onClickBoard);
              clearTimeout(timerId);
            }

            document.removeEventListener('mousemove', onMouseMove);
            ball.onmouseup = null;
          }
        }

        function updateCoordinates() {
          x = newX;
          y = newY;
          coorX = newCoorX;
          coorY = newCoorY;
        }
      };

      function isHeEnemy(x, y) {
        let [a, b] = CalcChessCoor(x, y);
        let doc = document.getElementById('id' + a + b);
        if (doc) {
          if (doc.classList[1].slice(0, 1) != ball.classList[1].slice(0, 1))
            return 'enemy';
          else return 'friend';
        }
      }

      function canMove(x, y) {
        let result = borda;
        let enemy = [];
        let S;
        if (gameColor.bot == color) S = 1;
        else S = -1;

        switch (obj.name) {
          case 'p':
            result = result.filter((elem) => {
              let [a, b] = CalcChessCoor(elem.x, elem.y);
              let doc = document.getElementById('id' + a + b);

              if (elem.x == x) {
                if (elem.y - y == -S && !doc) return true;
                if (
                  (y == 6 && elem.y - y == -2 && color == gameColor.bot) ||
                  (y == 1 && elem.y - y == 2 && color == gameColor.top)
                )
                  return true;
              }
              if ((elem.y - y) * S == -1 && eAbs(elem.x - x) == 1 && doc) {
                if (
                  doc.classList[1].slice(0, 1) != ball.classList[1].slice(0, 1)
                )
                  return true;
              }
            });
            enemy = result.filter((elem) => {
              if (isHeEnemy(elem.x, elem.y) == 'enemy') return true;
            });
            break;

          case 'r':
            result = result.filter((elem) => elem.x == x || elem.y == y);
            break;

          case 'n':
            result = result.filter((elem) => {
              if (
                eAbs(elem.x - x) + eAbs(elem.y - y) == 3 &&
                elem.x - x != 0 &&
                elem.y - y != 0
              ) {
                if (!isHeEnemy(elem.x, elem.y)) return true;
                if (isHeEnemy(elem.x, elem.y) == 'enemy') return true;
              }
            });
            enemy = result.filter((elem) => {
              if (isHeEnemy(elem.x, elem.y) == 'enemy') return true;
            });
            break;

          case 'b':
            result = result.filter(
              (elem) => eAbs(elem.x - x) == eAbs(elem.y - y)
            );
            break;
          case 'q':
            result = result.filter(
              (elem) =>
                elem.x == x ||
                elem.y == y ||
                eAbs(elem.x - x) == eAbs(elem.y - y)
            );
            break;
          case 'k':
            result = result.filter(
              (elem) =>
                (eAbs(elem.x - x) == 1 && eAbs(elem.y - y) == 1) ||
                eAbs(elem.x - x) + eAbs(elem.y - y) == 1
            );
            break;
        }

        if (obj.name != 'p' && obj.name != 'n') {
          result = removeInaccessible(result).all;
          enemy = removeInaccessible(result).enemy;
        }

        return { all: result, enemy: enemy };

        function removeInaccessible(arr) {
          let t = [];
          let tr = [];
          let r = [];
          let br = [];
          let b = [];
          let bl = [];
          let l = [];
          let tl = [];

          for (let i = 0; i < arr.length; i++) {
            let res = arr[i];
            let rx = arr[i].x;
            let ry = arr[i].y;

            if (rx == x && ry < y) t.push(res);
            if (rx > x && ry < y) tr.push(res);
            if (rx > x && ry == y) r.push(res);
            if (rx > x && ry > y) br.push(res);
            if (rx == x && ry > y) b.push(res);
            if (rx < x && ry > y) bl.push(res);
            if (rx < x && ry == y) l.push(res);
            if (rx < x && ry < y) tl.push(res);
          }

          t = analysisWay(t.sort((a, b) => b.y - a.y));
          tr = analysisWay(tr.sort((a, b) => b.y - a.y));
          r = analysisWay(r.sort((a, b) => a.x - b.x));
          br = analysisWay(br.sort((a, b) => a.y - b.y));
          b = analysisWay(b.sort((a, b) => a.y - b.y));
          bl = analysisWay(bl.sort((a, b) => a.y - b.y));
          l = analysisWay(l.sort((a, b) => b.x - a.x));
          tl = analysisWay(tl.sort((a, b) => b.y - a.y));

          let all = t.all.concat(
            tr.all.concat(
              r.all.concat(
                br.all.concat(b.all.concat(bl.all.concat(l.all.concat(tl.all))))
              )
            )
          );

          let enemy = t.enemy.concat(
            tr.enemy.concat(
              r.enemy.concat(
                br.enemy.concat(
                  b.enemy.concat(bl.enemy.concat(l.enemy.concat(tl.enemy)))
                )
              )
            )
          );
          return { all: all, enemy: enemy };
        }

        function analysisWay(arr) {
          let arrAll = [];
          let arrEnemy = [];
          let flag = 0;

          for (let i = 0; i < arr.length; i++) {
            if (flag == 1) break;
            let [x, y] = CalcChessCoor(arr[i].x, arr[i].y);
            let doc = document.getElementById('id' + x + y);
            if (!doc) {
              arrAll.push(arr[i]);
            } else {
              if (
                doc.classList[1].slice(0, 1) != ball.classList[1].slice(0, 1)
              ) {
                flag = 1;
                arrAll.push(arr[i]);
                arrEnemy.push(arr[i]);
              } else if (
                doc.classList[1].slice(0, 1) == ball.classList[1].slice(0, 1)
              ) {
                break;
              }
            }
          }
          return { all: arrAll, enemy: arrEnemy };
        }
      }

      function highlightMoves(arr) {
        arr.forEach((elem) => {
          let x = elem.x;
          let y = elem.y;
          svgLayot.innerHTML += `<circle cx="${x * kef + kef / 2}" cy="${
            y * kef + kef / 2
          }" r="5" fill="green" />`;
          svgLayot.innerHTML += `<rect width="${kef}" height="${kef}" stroke="yellow" fill="silver" stroke-width="2" transform="matrix(1,0,0,1,${
            coorX * kef
          },${coorY * kef})"/>
      `;
        });
      }

      function highlightEnemy(arr) {
        arr.forEach((elem) => {
          let x = elem.x;
          let y = elem.y;
          svgLayot.innerHTML += `<circle cx="${x * kef + kef / 2}" cy="${
            y * kef + kef / 2
          }" r="20" fill="transparent" stroke="green" stroke-width="5"/>`;
        });
      }
    };

    ball.ondragstart = function () {
      return false;
    };
  }
}

function eAbs(elem) {
  return Math.abs(elem);
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
  board.innerHTML = null;
  // svgLayot.innerHTML = null;
}

function animation(fromX, fromY, toX, toY) {
  let [x, y] = CalcChessCoor(fromX, fromY);
  let ball = document.getElementById('id' + x + y);
  let kefX = fromX >= toX ? 1 : -1;
  let kefY = fromY >= toY ? 1 : -1;

  let flagX = false;
  let flagY = false;

  timerId = setTimeout(function move() {
    if (fromY == toY) flagY = true;
    if (fromX == toX) flagX = true;

    if (flagY == true && flagX == true) {
      putFigure(ball, toX, toY);
      clearTimeout(timerId);
      return;
    }
    if (flagX == false) fromX -= kefX * 0.25;
    if (flagY == false) fromY -= kefY * 0.25;

    ball.style.transform = `matrix(1, 0, 0, 1,${fromX * kef},${fromY * kef})`;

    // coorY = fromY;
    // coorX = fromX;
    // x = newX;
    // y = newY;

    timerId = setTimeout(move, 25);
  }, 25);
  // svgLayot.removeEventListener('click', onClickBoard);
  svgLayot.innerHTML = null;
}

function putFigure(htmlElem, a, b) {
  let ball = htmlElem;
  let [x, y] = CalcChessCoor(a, b);
  ball.style.left = 0;
  ball.style.top = 0;
  ball.style.transform = `
    matrix(1, 0, 0, 1, 
    ${a * kef},
    ${b * kef})
  `;
  ball.className = `piece ${name} square-${x}${y}`;
  ball.id = 'id' + x + y;
}
