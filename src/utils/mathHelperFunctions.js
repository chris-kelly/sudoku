// FUNCTIONS TO HELP WITH MATHS

import { range, floor, random } from 'mathjs'

/**
 * Returns index where item is found in an array.
 * (Useful if item is another object)
 * @param {object} array - Array to search through
 * @param {object} item - Item to find
 */
const isItemInArray = function(array,item) {
    let indicies = []
    for(let i = 0; i < array.length; i++) {
        if(JSON.stringify(array[i]) == JSON.stringify(item)) {
            indicies.push(i)
        }
    }
    return(indicies)
}

/**
 * Generates a sequence of numbers from num1 to num2. 
 * If num2 not specified, then generates sequence from 0 to num1.
 * @param {number} num1
 * @param {number} [num2]
 */
const gRange = function(num1,num2) {
    if(num2 === undefined) {
        return(range(0, num1)._data)
    } else {
        return(range(num1, num2+1)._data)
    }
};

/**
 * Randomly shuffles an array
 * @param {object} array
 */
const shuffleArray = function(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return(array)
}

export {
    isItemInArray as isItemInArray,
    gRange as gRange,
    shuffleArray as shuffleArray,
}