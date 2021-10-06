"use strict";

var SMILEY = '🙂';
var COOL = '😎';
var MAYBE = '😯';
var INJURED = '😵';
var DEAD = '😖';
var HINT = '💡';
var HINT_USED = '✖';
var SAFE_CLICK = '❕';
var SAFE_CLICK_USED = '❗';

var MINE_IMG = '<img src="img/bomb.png" />';
var FLAG_IMG = '<img src="img/flag.png" />';

var gBoard = [];
var gStartTime;
var gBestScores = {}
var gTimeInterval;
var gIsManualMode = false;
var gManualMineLocations;
var gMarkedNumber = 0;
var gLevel = {
    size: 4,
    mines: 2,
    name: 'begginer'
};
var gLevels = [{ s: 4, m: 2, n: 'begginer' }, { s: 8, m: 12, n: 'medium' }, { s: 12, m: 30, n: 'expert' }];
var gGame;

function initGame() {
    gGame = {
        isOn: false,
        isTimeOn: false,
        shownCount: 0,
        markedCount: 0,
        timePassed: 0,
        minesRevealed: 0,
        isHint: false,
        hintsCount: 0,
        safeClickCount: 0,
        manuelMineCount: 0,
        isEnd: false
    }
    gManualMineLocations = [];
    gMarkedNumber = 0;
    renderCell('.resetBtn', SMILEY);
    clearInterval(gTimeInterval);
    resetTime();
    buildBoard();
    renderCellTxt('.liveLeft span', '3 LIVES')
    renderCellTxt('.markedMines span', gLevel.mines);
    resetElements('.hints span', HINT);
    resetElements('.safe-click span', SAFE_CLICK);
    renderCellTxt('.mine-number', gLevel.mines);
    // var elLives = document.querySelector('.liveLeft span');
    // elLives.innerText = '3 LIVES';

}

function resetGame() {
    gIsManualMode = false;
    initGame();
}

function gameLevel(elRadioBtn) {
    switch (elRadioBtn.value) {
        case 'Beginner':
            gLevel.size = gLevels[0].s;
            gLevel.mines = gLevels[0].m;
            gLevel.name = gLevels[0].n;
            break;
        case 'medium':
            gLevel.size = gLevels[1].s;
            gLevel.mines = gLevels[1].m;
            gLevel.name = gLevels[1].n;
            break;
        case 'Expert':
            gLevel.size = gLevels[2].s;
            gLevel.mines = gLevels[2].m;
            gLevel.name = gLevels[2].n;
            break;
    }
    resetGame();
}

function buildBoard() {
    gBoard = createPlainMatrix(gLevel.size);
    renderBoard();
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
    gGame.isEnd = true;
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
    gGame.isEnd = true;
    var gFinishTime = Date.now();
    var isRecord = Math.floor((gFinishTime - gStartTime) / 1000);
    clearInterval(gTimeInterval);
    renderCell('.resetBtn', COOL);
    if (!gBestScores[gLevel.name]) {
        // setTimeout(setNewRecord, 50, isRecord);   why this fun continue to run on the recursion if I use the setTimeOut here?... 
        setNewRecord(isRecord);
    } else if (isRecord < gBestScores[gLevel.name][1]) {
        // setTimeout(setNewRecord, 50, isRecord);
        setNewRecord(isRecord);
    }
}

function setNewRecord(isRecord) {
    var bestName = prompt('You set a new record! what is your name?');
    if (!bestName) bestName = (Math.random() > 0.5) ? 'John Doe' : 'Jane Doe'; //  (:

    // localStorage.setItem('bestName',bestName);
    // document.querySelector('.test').innerHTML = localStorage.getItem('bestName');

    gBestScores[gLevel.name] = [];
    gBestScores[gLevel.name][0] = bestName;
    gBestScores[gLevel.name][1] = isRecord;
    var nameClass = `.size-${gLevel.name}-record-name`;
    var timeClass = `.size-${gLevel.name}-record-time`;
    var elRecordName = document.querySelector(nameClass);
    var elRecordTime = document.querySelector(timeClass);
    elRecordName.innerText = gBestScores[gLevel.name][0];
    elRecordTime.innerText = gBestScores[gLevel.name][1];
}

function clicked(elCell) {
    if (gGame.isEnd) return;
    var cellId = elCell.id;
    var pos = getPosFromId(cellId);
    if (gIsManualMode) {
        insertMines(elCell);
        return;
    }
    if (!gGame.isOn) {
        gGame.isOn = true;
        if (!gGame.isTimeOn) setTime();
        initCells(pos.i, pos.j);
        setMinesCount();
    }
    var currCell = gBoard[pos.i][pos.j];
    if (currCell.isMarked || currCell.isShown) {
        gGame.isHint = false;
        return;
    }
    if (gGame.isHint) {
        showHint(pos);
        return;
    }
    // if the cell is flagged
    currCell.isShown = true;
    // if cell is a mine
    if (currCell.isMine) {
        elCell.innerHTML = MINE_IMG;
        renderCell('.resetBtn', INJURED);
        elCell.classList.add('mine');
        gGame.minesRevealed += 1;
        var livesLeft = 3 - gGame.minesRevealed;
        var livesLeftTxt = (livesLeft === 1) ? livesLeft + ' LIFE' : livesLeft + ' LIVES';
        renderCellTxt('.liveLeft span', livesLeftTxt)
        if (gGame.minesRevealed === 3) {
            gameOver()
        }
    } else {
        // set and render cell
        renderCell('.resetBtn', SMILEY);
        elCell.classList.add('shown');
        gGame.shownCount += 1;
        if (currCell.minesAroundCount) {
            elCell.innerHTML = '<b>' + currCell.minesAroundCount + '</b>';
            colorNumber(elCell, currCell.minesAroundCount);
        } else {
            openNeigbCells(+pos.i, +pos.j);
        }
    }
    if (gGame.shownCount + gGame.markedCount + gGame.minesRevealed === gLevel.size ** 2 && !gMarkedNumber) {
        // debugger;
        renderCell('.resetBtn', COOL);
        setTimeout(victory, 50);
        // victory();
    }
}

function colorNumber(el, number) {
    switch (number) {
        case 1:
            el.style.color = 'blue';
            break;
        case 2:
            el.style.color = 'green';
            break;
        case 3:
            el.style.color = 'red';
            break;
        case 4:
            el.style.color = 'brown';
            break;
        case 5:
            el.style.color = 'orange';
            break;
        case 6:
            el.style.color = 'coral';
            break;
        case 7:
            el.style.color = 'olivedrab';
            break;
        case 8:
            el.style.color = 'black';
            break;
    }
}
function setTime() {
    gStartTime = Date.now();
    gGame.isTimeOn = true;
    gTimeInterval = setInterval(calcTime, 200);
}
function rightButton(ev, el) {
    ev.preventDefault();
    if (gGame.isEnd) return;
    if (!gGame.isTimeOn) setTime();
    var id = el.id;
    var pos = getPosFromId(id);
    var currCell = gBoard[pos.i][pos.j];
    if (currCell.isShown) return;
    if (currCell.isMarked) {
        currCell.isMarked = false;
        gGame.markedCount -= 1;
        el.innerHTML = '';
        renderCellTxt('.markedMines span', gLevel.mines - gGame.markedCount);
        if (!currCell.isMine) {
            gMarkedNumber--;
        }
    } else {
        currCell.isMarked = true;
        gGame.markedCount += 1;
        el.innerHTML = FLAG_IMG;
        renderCellTxt('.markedMines span', gLevel.mines - gGame.markedCount);
        if (!currCell.isMine) {
            gMarkedNumber++;
        }
        if (gGame.shownCount + gGame.markedCount + gGame.minesRevealed === gLevel.size ** 2 && !gMarkedNumber) {
            renderCell('.resetBtn', COOL);
            setTimeout(victory, 50);
            // victory();
        }
    }
}

function initCells(rowIdx, colIdx) {
    // for (var i = 0; i < gLevel.size; i++) {
    //     for (var j = 0; j < gLevel.size; j++) {
    //         gBoard[i][j] = {
    //             minesAroundCount: 0,
    //             isShown: false,
    //             isMine: false,
    //             isMarked: false,
    //             isInitNeig: false
    //         }
    //     }
    // }
    if (!gIsManualMode) {
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
}

function getHint() {
    if (gGame.hintsCount > 2) return;
    gGame.isHint = true;
}
function showHint(pos) {
    var rowIdx = +pos.i;
    var colIdx = +pos.j;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue;
            var currCell = gBoard[i][j];
            var id = getIdName({ i: i, j: j });
            var elCell = document.querySelector('#' + id);
            if (currCell.isShown || currCell.isMarked) continue;
            if (gGame.isHint) {
                elCell.classList.add('showHint');
                if (currCell.minesAroundCount > 0) renderCellTxt('#' + id, currCell.minesAroundCount);
                else if (currCell.minesAroundCount === -1) renderCell('#' + id, MINE_IMG);
            } else {
                elCell.classList.remove('showHint');
                if (currCell.minesAroundCount > 0) renderCellTxt('#' + id, '');
                else if (currCell.minesAroundCount === -1) renderCell('#' + id, '');
            }
        }
    }
    if (gGame.isHint) setTimeout(removeHint, 1000, pos);
}

function removeHint(pos) {
    gGame.isHint = false;
    showHint(pos);
    gGame.hintsCount++;
    var spanClassName = '.hint' + gGame.hintsCount;
    renderCell(spanClassName, HINT_USED);
}

function resetElements(el, value) {
    var elCells = document.querySelectorAll(el);
    for (var i = 0; i < elCells.length; i++) {
        elCells[i].innerHTML = value;
    }
}

function safeClick() {
    if (gGame.safeClickCount > 2) return;
    var closedNonMinesCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            if (!currCell.isMine && !currCell.isShown && !currCell.isMarked) {
                closedNonMinesCells.push({ i: i, j: j });
            }
        }
    }
    if (!closedNonMinesCells.length) return;
    var randIdx = getRandomInt(0, closedNonMinesCells.length);
    var randpos = closedNonMinesCells[randIdx];
    var id = getIdName(randpos);
    var elCell = document.querySelector('#' + id);
    elCell.classList.add('show-safe');
    setTimeout(function () { elCell.classList.remove('show-safe'); }, 3000);
    gGame.safeClickCount++;
    var spanClassName = '.click' + gGame.safeClickCount;
    // console.log(spanClassName);
    renderCell(spanClassName, SAFE_CLICK_USED);
}

function setMinesManual() {
    gIsManualMode = true;
    initGame();
    initCells();
}

function insertMines(elCell) {
    var cellId = elCell.id;
    var pos = getPosFromId(cellId);
    var currCell = gBoard[+pos.i][+pos.j];
    gGame.manuelMineCount++;
    // Model:
    currCell.isMine = true;
    // DOM:
    elCell.innerHTML = MINE_IMG;
    gManualMineLocations.push(pos);
    renderCellTxt('.mine-number', gLevel.mines - gGame.manuelMineCount);
    if (gGame.manuelMineCount === gLevel.mines) {
        gGame.isOn = true;
        gIsManualMode = false;
        setMinesCount();
        setTimeout(function () {
            for (var i = 0; i < gManualMineLocations.length; i++) {
                var cellId = '#' + getIdName(gManualMineLocations[i]);
                renderCell(cellId, '');
            }
            renderCell('.mine-number', 'Go');
            gStartTime = Date.now();
            gTimeInterval = setInterval(calcTime, 200);
            gIsManualMode = false;
        }, 1000)
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
            if (gGame.isEnd) return;
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




