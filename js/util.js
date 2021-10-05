"use strict";


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function createPlainMatrix(size) {
    var myMat = [];
    for (var i = 0; i < size; i++) {
        myMat[i] = [];
        for (var j = 0; j < size; j++) {
            myMat[i][j] = '';
        }
    }
    return myMat;
}

function getIdName(location) {
	var cellId = 'cell-' + location.i + '-' + location.j;
	return cellId;
}

function getPosFromId(str){
    var tempArr = str.split("-");
    return {i:tempArr[1],j:tempArr[2]}
}

function getTime() {
    return new Date().toString().split(' ')[4];
}

function createRandArray(size) {
    var sortedNums = [];
    for (var i = 0; i < size; i++) {
        sortedNums.push(i + 1);
    }
    var shuffNums = [];
    for (i = 0; i < size; i++) {
        var rand = getRandomInt(0, size - i);
        var tempNum = sortedNums[rand];
        sortedNums.splice(rand, 1);
        shuffNums.push(tempNum);
    }
    return shuffNums;
}

function renderCell(el, value) {
    var elBtn = document.querySelector(el);
    elBtn.innerHTML = value;
}

function renderCellTxt(el, value){
    var elBtn = document.querySelector(el);
    elBtn.innerText = value;
}