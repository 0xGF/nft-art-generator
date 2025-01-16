"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffleArrayInPlace = exports.arrayFilledWith = void 0;
function arrayFilledWith(itemGenerator, numItems = 1) {
    return Array(numItems)
        .fill(null)
        .map(() => itemGenerator());
}
exports.arrayFilledWith = arrayFilledWith;
function shuffleArrayInPlace(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
exports.shuffleArrayInPlace = shuffleArrayInPlace;
