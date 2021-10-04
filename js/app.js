"use strict";

var SMILEY = '🙂';
var COOL = '😎';
var MAYBE = '😯';
var DEAD = '😖';

var MINE_IMG = '<img src="img/bomb.png" />';
var FLAG_IMG = '<img src="img/flag.png" />';
var gBoard = [];
var gStartTime;
var gTimeInterval;
var gLevel = {
    size: 4,
    mines: 2
};
var gLevels = [{ s: 4, m: 2 }, { s: 8, m: 12 }, { s: 12, m: 30 }];
var gGame;




function initGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        timePassed: 0,
        minesRevealed: 0
    }
    renderCell('.resetBtn', SMILEY);
    clearInterval(gTimeInterval);
    resetTime();
    buildBoard();
}

function gameLevel(elRadioBtn) {
    switch (elRadioBtn.value) {
        case 'Beginner':
            gLevel.size = gLevels[0].s;
            gLevel.mines = gLevels[0].m;
            console.log('beginner');
            break;
        case 'medium':
            gLevel.size = gLevels[1].s;
            gLevel.mines = gLevels[1].m;
            break;
        case 'Expert':
            gLevel.size = gLevels[2].s;
            gLevel.mines = gLevels[2].m;
            break;
    }
    initGame();
}


function buildBoard() {
    gBoard = createPlainMatrix(gLevel.size);
    // initCells();
    // setMinesCount();
    renderBoard();
}



// Render the board to an HTML table
function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            var cellId = getIdName({ i: i, j: j });
            var innerTxt = '';
            var mineImg = '';
            if (currCell.isMine) {
                // cellClass += ' mine';
                mineImg = MINE_IMG;
            } else if (currCell.minesAroundCount) {
                innerTxt = currCell.minesAroundCount;
            }
            strHTML += `\t<td id="${cellId}" oncontextmenu="rightButton(event,this)"  onclick="clicked(this)" >\n\t</td>\n`;
            // strHTML += `\t<td class=" ${cellClass} "  onclick="clicked(this)" >${mineImg}${innerTxt}\n\t</td>\n`;
        }
        strHTML += '</tr>\n';
    }
    // console.log(strHTML)
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function calcTime() {
    var currTime = Date.now();
    var diffTime = Math.floor((currTime - gStartTime) / 1000);
    var elTime = document.querySelector('.gameTime');
    elTime.innerText = `time: ${diffTime}`;
}

function resetTime() {
    var elTime = document.querySelector('.gameTime');
    elTime.innerText = `time: 0`;
}

function gameOver() {
    clearInterval(gTimeInterval);
    renderCell('.resetBtn', DEAD);
    // revealing all mines:
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine) {
                var id = getIdName({ i: i, j: j });
                var elCell = document.querySelector('#' + id);
                elCell.innerHTML = MINE_IMG;
            }
        }

    }

}

function victory() {
    var gFinishTime = Date.now();
    // var isRecord = (gFinishTime - gStartTime) / 1000;
    clearInterval(gTimeInterval);
    renderCell('.resetBtn', COOL);
    // if (!gBest[gLevel]) {
    //     setNewRecord(isRecord);
    // } else if (isRecord < gBest[gLevel][1]) {
    //     setNewRecord(isRecord);
    // }

}

function clicked(elCell) {
    var cellId = elCell.id;
    var pos = getPosFromId(cellId);
    // var initCell = gBoard[pos.i][pos.j];
    if (!gGame.isOn) {
        // debugger;
        gGame.isOn = true;
        gStartTime = Date.now();
        gTimeInterval = setInterval(calcTime, 200);
        // setInitNeighbors(pos.i, pos.j);
        initCells(pos.i, pos.j);
        setMinesCount();
    }
    var currCell = gBoard[pos.i][pos.j];
    // if the cell is flagged
    if (currCell.isMarked || currCell.isShown) return;
    currCell.isShown = true;
    if (currCell.isMine) {
        elCell.innerHTML = MINE_IMG;
        gGame.minesRevealed += 1;
        if (gGame.minesRevealed === 3) {
            gameOver()
        }
    } else {
        elCell.classList.add('shown');
        gGame.shownCount += 1;
        if (currCell.minesAroundCount) {
            elCell.innerText = currCell.minesAroundCount;
        } else {
            openNeigbCells(+pos.i, +pos.j);
        }
    }
    if (gGame.shownCount + gGame.markedCount + gGame.minesRevealed === gLevel.size ** 2) victory();
}

function rightButton(ev, el) {
    ev.preventDefault();
    var id = el.id;
    var pos = getPosFromId(id);
    var currCell = gBoard[pos.i][pos.j];
    if (currCell.isShown) return;
    if (currCell.isMarked) {
        currCell.isMarked = false;
        gGame.markedCount -= 1;
        el.innerHTML = '';
        console.log('gGame.markedCount', gGame.markedCount)

    } else {
        currCell.isMarked = true;
        gGame.markedCount += 1;
        el.innerHTML = FLAG_IMG;
        if (gGame.shownCount + gGame.markedCount + gGame.minesRevealed === gLevel.size ** 2) victory();
    }
}

function initCells(rowIdx, colIdx) {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isInitNeig: false
            }
        }
    }
    setInitNeighbors(+rowIdx, +colIdx);
    var randNums = createRandArray(gLevel.size ** 2);
    for (var i = 0; i < gLevel.mines; i++) {
        // getting random number of the total count of the cells
        var num = randNums[0];
        // getting rid of first number
        randNums.shift();
        // decrypting the row and column from that number
        var rowIdxRand = Math.floor((num - 1) / gLevel.size);
        var colIdxRand = (num - 1) % gLevel.size;
        var currCell = gBoard[rowIdxRand][colIdxRand];
        if (currCell.isInitNeig) {
            i -= 1;
            continue;
        }
        // setting the mines
        gBoard[rowIdxRand][colIdxRand].isMine = true;
    }
}

function setMinesCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            countMinesAround(i, j);
        }
    }
}

function setInitNeighbors(rowIdx, colIdx) {
    // so the first click will always be empty
    if (gBoard[rowIdx][colIdx].isMine) {
        gBoard[rowIdx][colIdx].minesAroundCount = -1;
        return;
    }
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue;
            // if (i === rowIdx && j === colIdx) continue;
            var cell = gBoard[i][j];
            cell.isInitNeig = true;
        }
    }
}
function countMinesAround(rowIdx, colIdx) {
    // in case this cell is a mine
    if (gBoard[rowIdx][colIdx].isMine) {
        gBoard[rowIdx][colIdx].minesAroundCount = -1;
        return;
    }
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            var cell = gBoard[i][j];
            if (cell.isMine) gBoard[rowIdx][colIdx].minesAroundCount += 1;
        }
    }
}

function openNeigbCells(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            var cellId = getIdName({ i: i, j: j })
            var elCell = document.querySelector('#' + cellId);
            var currCell = gBoard[i][j];
            // Recursion
            if (!currCell.isShown) clicked(elCell);
        }
    }
}

function renderCell(el, value) {
    var elBtn = document.querySelector(el);
    elBtn.innerHTML = value;
}


