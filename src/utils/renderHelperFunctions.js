// FUNCTIONS TO HELP WITH RENDERING

import { reshape,index } from 'mathjs'
import { gRange } from './mathHelperFunctions'

/**
 * Check if index is divisible by 3 (to make every 3rd border thicker in sudoku grid)
 * @param {number} n 
 */
const checkIndexDivisibleThree = (n) => {
    return(n % 3 === 0)
};

// 
/**
 * Generate megaGrid for rendering. 
 * Pre filled is just a number. User filled is a single number in an array. Potential numbers are an array of 9 numbers (where zeros are not rendered).  
 * @param {object} preFilled 
 * @param {object} s_dict 
 * @param {boolean} showPotentialGrid 
 */
const megaSudokuInput = function(preFilled,s_dict,showPotentialGrid=false) {
    var megaGrid = preFilled // pre-filled are just scalars
    var s_matrix = s_dict['sudoku']._data
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(s_matrix[i][j][0] !== 0 && preFilled[i][j] === 0) { // filled in by user
                megaGrid[i][j] = [s_matrix[i][j][0]] // user-filled are scalars in an array
            } else if(s_matrix[i][j][0] === 0 && showPotentialGrid) {  // not prefilled or filled by user
                megaGrid[i][j] = reshape(s_dict['sudoku'].subset(index(i,j,gRange(1,9))),[3,3])._data // potentials are array of 3 arrays
            }
        }
    }
    return(megaGrid)
};


export {
    megaSudokuInput as megaSudokuInput,
    checkIndexDivisibleThree as checkIndexDivisibleThree,
}

