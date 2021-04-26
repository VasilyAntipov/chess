const newGame = document.getElementById('new-game');
const deleteFigure = document.getElementById('delete-figure');
const board = document.getElementById('chessboard-blank');
const svgLayot = document.querySelector('.svg-layot');
const layot = document.getElementById('chessboard-layot');
const arrayWords = ['a', 'b', 'c', 'd', 'e', 'f', 'j', 'h'];
const kef = 60;
let gameColor;
const borda = [];
let onClickBoard;
initialization();

function initialization() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            borda.push({ x: i, y: j });
        }
    }
}

newGame.addEventListener('click', function (event) {
    clearNewGame();
    checkColorGame();
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
} //++

function generateFigures() {
    const arrayFigures = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    const arrayPawns = ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'];
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

function newFigure(x, y, name) {
    const div = document.createElement('div');
    if ((gameColor == 'white' && y > 5) || (gameColor == 'black' && y < 2))
        div.style.color = 'white';
    if ((gameColor == 'black' && y > 5) || (gameColor == 'white' && y < 2))
        div.style.color = 'black';
    div.className = `piece ${
        div.style.color.slice(0, 1) + name
    } square-${x}${y}`;
    div.style.backgroundImage = `url('/chess/client/img/figures/${
        div.style.color.slice(0, 1) + name
    }.png')`;
    div.style.transform = `
		matrix(1, 0, 0, 1,
		${x * kef},
		${y * kef}
	  `;
    div.id = 'id' + x + y;
    div.style.cursor = 'grabbing';
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
        }
        moveAt(event.pageX, event.pageY);

		clearStep();
		highlightMoves(x, y, canMove(x, y).all);
		highlightEnemy(canMove(x, y).enemy);

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
                    canMove(x, y).all.find(
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
                        'ahtung! открывается шах, или под шах или прочие причины'
                    ) {
                        putFigure(x, y, newX, newY);
                    }
                } else {
                    putFigure(x, y, x, y);
                }
            }

            document.removeEventListener('mousemove', onMouseMove);
            div.onmouseup = null;

            function checkAndRemoveTarget(newX, newY) {
                let target = document.querySelector(`.square-${newX}${newY}`);

                if (target) {
                    if (target.id != div.id) {
                        if (
                            target.classList[1].slice(0, 1) !=
                            div.classList[1].slice(0, 1)
                        ) {
                            target.remove();
                            return 'sector clear';
                        }
                    }
                } else return 'sector clear';
            }

            function clickFigure() {
                svgLayot.removeEventListener('click', onClickBoard, true);

                clearStep();
                highlightMoves(x, y, canMove(x, y).all);
                highlightEnemy(canMove(x, y).enemy);

                onClickBoard = function (event) {
                    const layot = svgLayot.getBoundingClientRect();
                    const pageX = event.pageX;
                    const pageY = event.pageY;

                    let clickX = Math.floor((pageX - layot.x) / 60);
                    let clickY = Math.floor((pageY - layot.y) / 60);

                    if (
                        canMove(x, y).all.find(
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

function clearNewGame() {
    let svg = document.getElementById('svg');
    if (svg) {
        svg.remove();
    }
    board.innerHTML = null;
    svgLayot.innerHTML = null;
    document.removeEventListener('click', onClickBoard, true);
    onClickBoard = null;
}

async function animation(fromX, fromY, toX, toY) {
    return await new Promise((resolve) => {
        let div = document.getElementById('id' + fromX + fromY);
        let kefX = fromX >= toX ? 1 : -1;
        let kefY = fromY >= toY ? 1 : -1;

        let flagX = false;
        let flagY = false;

        // let timerId =
        setTimeout(function move() {
            if (fromY == toY) flagY = true;
            if (fromX == toX) flagX = true;

            if (flagY == true && flagX == true) {
                // putFigure(div.id, toX, toY);
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
    let div = document.getElementById('id' + x + y);
    div.style.left = 0;
    div.style.top = 0;
    div.style.transform = `
	  matrix(1, 0, 0, 1, 
	  ${newX * kef},
	  ${newY * kef})
	`;
    div.classList.remove(div.classList[2]);
    div.classList.add(`square-${newX}${newY}`);
    div.id = 'id' + newX + newY;
}

function canMove(x, y) {
    let div = document.getElementById('id' + x + y);
    let color;
    let name;

    name = div.classList[1].slice(1, 2);
    if (div.classList[1].slice(0, 1) == 'w') {
        color = 'white';
    } else {
        color = 'black';
    }

    let result = borda;
    let enemy = [];

    let S;
    if (gameColor == color) S = 1;
    else S = -1;

    switch (name) {
        case 'p':
            result = result.filter((elem) => {
                let a = elem.x;
                let b = elem.y;
                let target = document.getElementById('id' + a + b);

                if (elem.x == x) {
                    if (elem.y - y == -S && !target) return true;
                    if (
                        (y == 6 && elem.y - y == -2 && color == gameColor) ||
                        (y == 1 && elem.y - y == 2 && color == gameColor)
                    )
                        return true;
                }
                if ((elem.y - y) * S == -1 && eAbs(elem.x - x) == 1 && target) {
                    if (
                        target.classList[1].slice(0, 1) !=
                        div.classList[1].slice(0, 1)
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
                    if (!isHeEnemy(div.id, elem.x, elem.y)) return true;
                    if (isHeEnemy(div.id, elem.x, elem.y) == 'enemy')
                        return true;
                }
            });
            enemy = result.filter((elem) => {
                if (isHeEnemy(div.id, elem.x, elem.y) == 'enemy') return true;
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

    if (name != 'p' && name != 'n') {
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
                    br.all.concat(
                        b.all.concat(bl.all.concat(l.all.concat(tl.all)))
                    )
                )
            )
        );

        let enemy = t.enemy.concat(
            tr.enemy.concat(
                r.enemy.concat(
                    br.enemy.concat(
                        b.enemy.concat(
                            bl.enemy.concat(l.enemy.concat(tl.enemy))
                        )
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
            let x = arr[i].x;
            let y = arr[i].y;
            let target = document.getElementById('id' + x + y);
            if (!target) {
                arrAll.push(arr[i]);
            } else {
                if (div) {
                    if (
                        target.classList[1].slice(0, 1) !=
                        div.classList[1].slice(0, 1)
                    ) {
                        flag = 1;
                        arrAll.push(arr[i]);
                        arrEnemy.push(arr[i]);
                    } else if (
                        target.classList[1].slice(0, 1) ==
                        div.classList[1].slice(0, 1)
                    ) {
                        break;
                    }
                }
            }
        }
        return { all: arrAll, enemy: arrEnemy };
    }
}

function isHeEnemy(id, x, y) {
    let div = document.getElementById(id);
    let target = document.getElementById('id' + x + y);
    if (target) {
        if (target.classList[1].slice(0, 1) != div.classList[1].slice(0, 1))
            return 'enemy';
        else return 'friend';
    }
}

function highlightMoves(x, y, arr) {
    arr.forEach((elem) => {
        let ex = elem.x;
        let ey = elem.y;
        svgLayot.innerHTML += `<circle cx="${ex * kef + kef / 2}" cy="${
            ey * kef + kef / 2
        }" r="5" fill="green" />`;
        svgLayot.innerHTML += `<rect width="${kef}" height="${kef}" stroke="yellow" fill="silver" stroke-width="2" transform="matrix(1,0,0,1,${
            x * kef
        },${y * kef})"/>
	`;
    });
}

function highlightEnemy(arr) {
    arr.forEach((elem) => {
        let ex = elem.x;
        let ey = elem.y;
        svgLayot.innerHTML += `<circle cx="${ex * kef + kef / 2}" cy="${
            ey * kef + kef / 2
        }" r="20" fill="transparent" stroke="green" stroke-width="5"/>`;
    });
}

function checkColorGame() {
    const checkBox = document.querySelectorAll('input[name="choice"]');
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
