const newGame = document.getElementById('new-game');
const board = document.getElementById('chessboard-blank');
const svgLayot = document.querySelector('.svg-layot');
const layot = document.getElementById('chessboard-layot');

//размер клетки
const kef = 60;

let onClickBoard;
let gameColor;

const matrixOfMoves = [];

initialization();

function initialization() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            matrixOfMoves.push({ x: i, y: j });
        }
    }
}

newGame.addEventListener('click', function (event) {
    clearAll();
    checkColorGame();
    generateCoordinate();
    generateFigures();
});

function generateCoordinate() {
    const arrayWords = ['a', 'b', 'c', 'd', 'e', 'f', 'j', 'h'];
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
                    switch (gameColor) {
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
                    switch (gameColor) {
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

function generateFigures() {
    const pawn = { name: 'p', moves: ['pawn'] };
    const rook = { name: 'r', moves: ['direct'] };
    const knight = { name: 'n', moves: ['horse'] };
    const bishop = { name: 'b', moves: ['diagonal'] };
    const queen = { name: 'q', moves: ['diagonal', 'direct'] };
    const king = { name: 'k', moves: ['king', 'diagonal', 'direct'] };

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

    if (gameColor == 'black') {
        arrayFigures.reverse();
    }

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            newFigure(x, y, arrayChess[y][x]);
        }
        if (y == 1) y = 5;
    }
}

function newFigure(x, y, obj) {
    const div = document.createElement('div');
    if ((gameColor == 'white' && y > 5) || (gameColor == 'black' && y < 2))
        div.style.color = 'white';
    if ((gameColor == 'black' && y > 5) || (gameColor == 'white' && y < 2))
        div.style.color = 'black';
    div.className = `piece ${
        div.style.color.slice(0, 1) + obj.name
    } square-${x}${y}`;
    div.style.backgroundImage = `url('/chess/client/img/figures/${
        div.style.color.slice(0, 1) + obj.name
    }.png')`;
    div.style.transform = `matrix(1, 0, 0, 1,${x * kef},${y * kef}`;
    div.id = 'id' + x + y;
    board.appendChild(div);

    let mouseX, mouseY;

    div.onmousedown = function (event) {
        document.addEventListener('mousemove', onMouseMove);

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        function moveAt(pageX, pageY) {
            const rect = board.getBoundingClientRect();

            mouseX = pageX - rect.x - x * kef - div.offsetWidth / 2;
            mouseY = pageY - rect.y - y * kef - div.offsetHeight / 2;

            div.style.left = mouseX + 'px';
            div.style.top = mouseY + 'px';
            div.style.transform = `matrix(1, 0, 0, 1,${x * kef},${y * kef}`;
        }
        moveAt(event.pageX, event.pageY);

        clearStep();
        const moves = obj.moves;
        const canMoves = returnPossibleMoves(moves, x, y);
        div.style.zIndex = 1001;

        highlightMoves(x, y, canMoves.all);
        highlightEnemy(canMoves.enemy);

        div.onmouseup = function () {
            let xDif = Math.round(mouseX / kef);
            let yDif = Math.round(mouseY / kef);

            let newX = x + xDif;
            let newY = y + yDif;

            if (x == newX && y == newY) {
                putFigure(x, y, x, y);
                clickFigure();
            } else if (x != newX || y != newY) {
                clearStep();
                if (
                    canMoves.all.find(
                        (elem) => elem.x == newX && elem.y == newY
                    )
                ) {
                    if (checkAndRemoveTarget(newX, newY) == 'sector clear') {
                        putFigure(x, y, newX, newY);
                        x = newX;
                        y = newY;
                    }
                    if (
                        checkAndRemoveTarget(newX, newY) ==
                        'ahtung! если дали шах'
                    ) {
                        putFigure(x, y, newX, newY); //\
                    }
                } else {
                    putFigure(x, y, x, y);
                }
            }

            document.removeEventListener('mousemove', onMouseMove);
            div.onmouseup = null;
            div.style.zIndex = null;

            function checkAndRemoveTarget(newX, newY) {
                let target = document.querySelector(`.square-${newX}${newY}`);

                if (target) {
                    if (target.id != div.id) {
                        if (target.style.color != div.style.color) {
                            target.remove();
                            return 'sector clear';
                        }
                    }
                } else return 'sector clear';
            }

            function clickFigure() {
                svgLayot.removeEventListener('click', onClickBoard, true);

                clearStep();
                highlightMoves(x, y, canMoves.all);
                highlightEnemy(canMoves.enemy);

                onClickBoard = function (event) {
                    const layot = svgLayot.getBoundingClientRect();
                    const pageX = event.pageX;
                    const pageY = event.pageY;

                    let clickX = Math.floor((pageX - layot.x) / 60);
                    let clickY = Math.floor((pageY - layot.y) / 60);

                    if (
                        canMoves.all.find(
                            (elem) => elem.x == clickX && elem.y == clickY
                        )
                    ) {
                        animation(x, y, clickX, clickY).then(() => {
                            clearStep();
                            putFigure(x, y, clickX, clickY);
                            svgLayot.removeEventListener(
                                'click',
                                onClickBoard,
                                true
                            );
                            x = clickX;
                            y = clickY;
                        });
                    } else {
                        putFigure(x, y, x, y);
                        clearStep();
                        svgLayot.removeEventListener(
                            'click',
                            onClickBoard,
                            true
                        );
                    }
                };
                svgLayot.addEventListener('click', onClickBoard, true);
            }
        };
    };
}

function eAbs(elem) {
    return Math.abs(elem);
}

function clearStep() {
    svgLayot.innerHTML = null;
}

function clearAll() {
    clearStep();
    let svg = document.getElementById('svg');
    if (svg) {
        svg.remove();
    }
    board.innerHTML = null;
    svgLayot.removeEventListener('click', onClickBoard, true);
}

function animation(fromX, fromY, toX, toY) {
    return new Promise((resolve) => {
        let div = document.getElementById('id' + fromX + fromY);
        let kefX = fromX >= toX ? 1 : -1;
        let kefY = fromY >= toY ? 1 : -1;

        let flagX = false;
        let flagY = false;

        setTimeout(function move() {
            if (fromY == toY) flagY = true;
            if (fromX == toX) flagX = true;

            if (flagY == true && flagX == true) {
                resolve('foo');
                return;
            }
            if (flagX == false) fromX -= kefX * 0.25;
            if (flagY == false) fromY -= kefY * 0.25;

            if (div)
                div.style.transform = `matrix(1, 0, 0, 1,${fromX * kef},${
                    fromY * kef
                })`;
            x = fromX;
            y = fromY;

            timerId = setTimeout(move, 25);
        }, 25);
    });
}

function putFigure(x, y, newX, newY) {
    const div = document.getElementById('id' + x + y);
    div.style.left = 0;
    div.style.top = 0;
    div.style.transform = `matrix(1, 0, 0, 1, ${newX * kef},${newY * kef})`;
    div.classList.remove(div.classList[2]);
    div.classList.add(`square-${newX}${newY}`);
    div.id = 'id' + newX + newY;
}

function returnPossibleMoves(moves, x, y) {
    const div = document.getElementById('id' + x + y);
    const color = div.style.color;
    let direct = { all: [], enemy: [] };
    let diagonal = { all: [], enemy: [] };
    let all = [];
    let enemy = [];

    const S = gameColor === color ? 1 : -1;

    // ходы по 'прямо' и 'по-диагонали' - разбиваю каждый тип на 4 направления(массивы),
    //нахожу ближайшие фигуры по каждому из них и фильтрую до этих фигур

    if (moves.includes('direct')) {
        const up = analysisWay(
            matrixOfMoves
                .filter((elem) => elem.x == x && elem.y < y)
                .sort((a, b) => b.y - a.y)
        );

        const right = analysisWay(
            matrixOfMoves
                .filter((elem) => elem.x > x && elem.y == y)
                .sort((a, b) => a.x - b.x)
        );
        const down = analysisWay(
            matrixOfMoves
                .filter((elem) => elem.x == x && elem.y > y)
                .sort((a, b) => a.y - b.y)
        );
        const left = analysisWay(
            matrixOfMoves
                .filter((elem) => elem.x < x && elem.y == y)
                .sort((a, b) => b.x - a.x)
        );

        direct.all = [].concat(up.all, down.all, left.all, right.all);
        direct.enemy = [].concat(up.enemy, down.enemy, left.enemy, right.enemy);
    }

    if (moves.includes('diagonal')) {
        const upRight = analysisWay(
            matrixOfMoves
                .filter(
                    (elem) =>
                        elem.x > x &&
                        elem.y < y &&
                        eAbs(elem.x - x) == eAbs(elem.y - y)
                )
                .sort((a, b) => b.y - a.y)
        );

        const downRight = analysisWay(
            matrixOfMoves
                .filter(
                    (elem) =>
                        elem.x > x &&
                        elem.y > y &&
                        eAbs(elem.x - x) == eAbs(elem.y - y)
                )
                .sort((a, b) => a.y - b.y)
        );

        const downLeft = analysisWay(
            matrixOfMoves
                .filter(
                    (elem) =>
                        elem.x < x &&
                        elem.y > y &&
                        eAbs(elem.x - x) == eAbs(elem.y - y)
                )
                .sort((a, b) => a.y - b.y)
        );

        const upLeft = analysisWay(
            matrixOfMoves
                .filter(
                    (elem) =>
                        elem.x < x &&
                        elem.y < y &&
                        eAbs(elem.x - x) == eAbs(elem.y - y)
                )
                .sort((a, b) => b.y - a.y)
        );
        console.log(upRight);
        diagonal.all = [].concat(
            upRight.all,
            downRight.all,
            downLeft.all,
            upLeft.all
        );
        diagonal.enemy = [].concat(
            upRight.enemy,
            downRight.enemy,
            downLeft.enemy,
            upLeft.enemy
        );
    }

    all = [].concat(direct.all, diagonal.all);
    enemy = [].concat(direct.enemy, diagonal.enemy);

    if (moves.includes('pawn')) {
        all = matrixOfMoves.filter((elem) => {
            let target = document.getElementById('id' + elem.x + elem.y);
            let targetBeforeDouble = document.getElementById(
                'id' + elem.x + (y - S)
            );

            if (elem.x == x) {
                if (elem.y - y == -S && !target) return true;
                if (!target && elem.y - y == -2 * S && !targetBeforeDouble) {
                    if (
                        (y == 6 && color == gameColor) ||
                        (y == 1 && color != gameColor)
                    ) {
                        return true;
                    }
                }
            }

            if ((elem.y - y) * S == -1 && eAbs(elem.x - x) == 1 && target) {
                if (target.style.color != div.style.color) return true;
            }
        });
        enemy = all.filter(
            (elem) => (elem.y - y) * S == -1 && eAbs(elem.x - x) == 1
        );
    }

    if (moves.includes('horse')) {
        all = matrixOfMoves.filter((elem) => {
            if (
                eAbs(elem.x - x) + eAbs(elem.y - y) == 3 &&
                elem.x - x != 0 &&
                elem.y - y != 0
            ) {
                if (!isEnemy(div.id, elem.x, elem.y)) return true;
                if (isEnemy(div.id, elem.x, elem.y)) return true;
            }
        });
        enemy = all.filter((elem) => {
            if (isEnemy(div.id, elem.x, elem.y)) return true;
        });
    }

    if (moves.includes('king')) {
        all = all.filter(
            (elem) =>
                (eAbs(elem.x - x) == 1 && eAbs(elem.y - y) == 1) ||
                eAbs(elem.x - x) + eAbs(elem.y - y) == 1
        );
        enemy = all.filter((elem) => {
            if (isEnemy(div.id, elem.x, elem.y)) return true;
        });
    }

    return { all, enemy };

    function analysisWay(arr) {
        let arrAll = [];
        let arrEnemy = [];
        let flag = 0;

        for (let i = 0; i < arr.length; i++) {
            if (flag == 1) break;
            let x = arr[i].x;
            let y = arr[i].y;
            let target = document.getElementById('id' + x + y);
            if (!target) {
                arrAll.push(arr[i]);
            } else {
                if (target.style.color != div.style.color) {
                    flag = 1;
                    arrAll.push(arr[i]);
                    arrEnemy.push(arr[i]);
                } else if (target.style.color == div.style.color) {
                    break;
                }
            }
        }
        return { all: arrAll, enemy: arrEnemy };
    }
}

function isEnemy(id, x, y) {
    let doc = document.getElementById(id);
    let target = document.getElementById('id' + x + y);
    if (target) {
        if (target.style.color != doc.style.color) return true;
        else return false;
    }
}

function highlightMoves(a, b, arr) {
    arr.forEach(({ x, y }) => {
        svgLayot.innerHTML += `<circle class="circle-our" cx="${
            x * kef + kef / 2
        }" cy="${y * kef + kef / 2}"/>`;
        svgLayot.innerHTML += `<rect width="${kef}" height="${kef}" transform="matrix(1,0,0,1,${
            a * kef
        },${b * kef})"/>
	`;
    });
}

function highlightEnemy(arr) {
    arr.forEach(({ x, y }) => {
        svgLayot.innerHTML += `<circle class="circle-enemy" cx="${
            x * kef + kef / 2
        }" cy="${y * kef + kef / 2}"/>`;
    });
}

function checkColorGame() {
    const choiceColorGame = document.getElementById('choice-color-game');
    const checkBox = choiceColorGame.querySelectorAll('input[name="choice"]');
    let selectValue;

    for (const rb of checkBox) {
        if (rb.checked) {
            selectValue = rb.value;
            break;
        }
    }
    if (selectValue == 'white') gameColor = 'white';
    else gameColor = 'black';
}
