const newGame = document.getElementById('new-game');
const deleteFigure = document.getElementById('delete-figure');
const board = document.getElementById('chessboard-blank');
const svgLayot = document.querySelector('.svg-layot');
const layot = document.getElementById('chessboard-layot');
const arrayWords = ['a', 'b', 'c', 'd', 'e', 'f', 'j', 'h'];
const kef = 60;
let gameColor;
let borda = [];
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    borda.push({ x: i, y: j });
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

    if (y < 3) {
      color = 'white';
      name = 'w' + obj.name;
    }
    if (y > 6) {
      color = 'black';
      name = 'b' + obj.name;
    }

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

        console.log(canMoveArray.all);
        if (
          canMoveArray.all.find(
            (coordinate) => coordinate.x == newCoorX && coordinate.y == newCoorY
          )
        ) {
          console.log(newCoorX - coorX, newCoorY - coorY);
          console.log(newCoorX, newCoorY);
          // clickFigure()
          if (checkFigures(newX, newY) == 'check') {
            putFigure(newCoorX, newCoorY);
            updateCoordinates();
          } else {
            putFigure(coorX, coorY);
          }
        } else {
          putFigure(coorX, coorY);
        }

        document.removeEventListener('mousemove', onMouseMove);
        ball.onmouseup = null;
        svgLayot.innerHTML = null;

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

        function putFigure(a, b) {
          ball.style.left = 0;
          ball.style.top = 0;
          ball.style.transform = `
            matrix(1, 0, 0, 1, 
            ${a * kef},
            ${b * kef})
          `;
          ball.className = `piece ${name} square-${CalcChessCoor(a, b)[0]}${
            CalcChessCoor(a, b)[1]
          }`;
          ball.id = 'id' + CalcChessCoor(a, b)[0] + CalcChessCoor(a, b)[1];
        }

        function clickFigure() {
          console.log('click x:' + x + ' y:' + y);
          svgLayot.innerHTML = `<rect class="rect"
            transform = "matrix(1, 0, 0, 1, ${coorX * kef},${coorY * kef})"/>`;

          // svgLayot.innerHTML += `<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />`

          svgLayot.addEventListener('click', onClickBoard);

          function onClickBoard(event) {
            svgLayot.innerHTML = '';
            const layot = svgLayot.getBoundingClientRect();
            const pageX = event.pageX;
            const pageY = event.pageY;

            let clickX = Math.floor((pageX - layot.x) / 60);
            let clickY = Math.floor((pageY - layot.y) / 60);

            [newX, newY] = CalcChessCoor(clickX, clickY);

            if (canMove(x, y, newX, newY) == 'can')
              animation(coorX, coorY, clickX, clickY);
            else {
              svgLayot.removeEventListener('click', onClickBoard);
            }

            document.removeEventListener('mousemove', onMouseMove);
            ball.onmouseup = null;

            function animation(fromX, fromY, toX, toY) {
              console.log(fromX, fromY, toX, toY);
              console.log(x, y, newX, newY);

              let kefX = fromX >= toX ? 1 : -1;
              let kefY = fromY >= toY ? 1 : -1;

              let flagX = false;
              let flagY = false;

              let timerId = setTimeout(function move() {
                if (fromY == toY) flagY = true;
                if (fromX == toX) flagX = true;

                if (flagY == true && flagX == true) {
                  putFigure(toX, toY);
                  clearTimeout(timerId);
                  return;
                }
                if (flagX == false) fromX -= kefX * 0.25;
                if (flagY == false) fromY -= kefY * 0.25;

                ball.style.transform = `matrix(1, 0, 0, 1,${fromX * kef},${
                  fromY * kef
                })`;

                coorY = fromY;
                coorX = fromX;
                x = newX;
                y = newY;

                timerId = setTimeout(move, 25);
              }, 25);
              svgLayot.removeEventListener('click', onClickBoard);
            }
          }
        }

        function updateCoordinates() {
          x = newX;
          y = newY;
          coorX = newCoorX;
          coorY = newCoorY;
        }
      };

      function canMove(x, y) {
        let result = borda;
        let enemy = [];
        let S;
        if (gameColor.bot == color) S = 1;
        else S = -1;

        switch (obj.name) {
          case 'p':
            result = result.filter((elem) => {
              let a = CalcChessCoor(elem.x, elem.y)[0];
              let b = CalcChessCoor(elem.x, elem.y)[1];
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
              let a = CalcChessCoor(elem.x, elem.y)[0];
              let b = CalcChessCoor(elem.x, elem.y)[1];
              let doc = document.getElementById('id' + a + b);

              if (doc) {
                return true;
              }
            });

            break;

          case 'r':
            result = result.filter((elem) => elem.x == x || elem.y == y);
            break;
          case 'n':
            result = result.filter(
              (elem) =>
                eAbs(elem.x - x) + eAbs(elem.y - y) == 3 &&
                elem.x - x != 0 &&
                elem.y - y != 0
            );
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
                eAbs(elem.x - x) + (eAbs(elem.y - y) == 1) ||
                eAbs(elem.x - x) + (elem.y - y) == 2
            );
            break;
        }

        let t = [];
        let tr = [];
        let r = [];
        let br = [];
        let b = [];
        let bl = [];
        let l = [];
        let tl = [];

        for (let i = 0; i < result.length; i++) {
          let res = result[i];
          let rx = result[i].x;
          let ry = result[i].y;

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

        if (obj.name != 'p')
          result = t.all.concat(
            tr.all.concat(
              r.all.concat(
                br.all.concat(b.all.concat(bl.all.concat(l.all.concat(tl.all))))
              )
            )
          );

        if (obj.name != 'p')
          enemy = t.enemy.concat(
            tr.enemy.concat(
              r.enemy.concat(
                br.enemy.concat(
                  b.enemy.concat(bl.enemy.concat(l.enemy.concat(tl.enemy)))
                )
              )
            )
          );

        return { all: result, enemy: enemy };

        function analysisWay(arr) {
          let arrAll = [];
          let arrEnemy = [];
          let flag = 0;

          for (let i = 0; i < arr.length; i++) {
            if (flag == 1) break;
            let x = CalcChessCoor(arr[i].x, arr[i].y)[0];
            let y = CalcChessCoor(arr[i].x, arr[i].y)[1];
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

        function eAbs(elem) {
          return Math.abs(elem);
        }
      }

      function highlightMoves(arr) {
        arr.forEach((elem) => {
          let x = elem.x;
          let y = elem.y;
          svgLayot.innerHTML += `<circle cx="${x * kef + kef / 2}" cy="${
            y * kef + kef / 2
          }" r="5" fill="green" />`;
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
