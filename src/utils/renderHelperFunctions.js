// FUNCTIONS TO HELP WITH RENDERING

import { reshape,index } from 'mathjs'
import { gRange } from './mathHelperFunctions'

/**
 * Check if index is divisible by 3 (to make every 3rd border thicker in sudoku grid)
 * @param {number} n 
 */
export const checkIndexDivisibleThree = (n) => {
    return(n % 3 === 0)
};

export const cellViewStyle = function(props, defaultStyle = {borderWidth: 0.5}) {
  var borderWidths = {
    // Make the top border of the selected cell very thick (4). Otherwise, make the top border of rows 0,3,6 medium thick (2). Otherwise, thin (0.5).
    borderTopWidth: props.isSelectedCell ? 4 : checkIndexDivisibleThree(props.i) ? 2 : 0.5,
    // Make the left border of the selected cell very thick (4). Otherwise, make the left border of columns 0,3,6 medium thick (2). Otherwise, thin (0.5).
    borderLeftWidth: props.isSelectedCell ? 4 : checkIndexDivisibleThree(props.j) ? 2 : 0.5,
    // Make the bottom border of the selected cell very thick (4). Otherwise, make the bottom border of last row 8 medium thick (2). Otherwise, thin (0.5).
    borderBottomWidth: props.isSelectedCell ? 4 : props.i === 8 ? 2 : 0.5,
    // Make the right border of the selected cell very thick (4). Otherwise, make the right border of last column 8 medium thick (2). Otherwise, thin (0.5).
    borderRightWidth: props.isSelectedCell ? 4 : props.j === 8 ? 2 : 0.5,
  }
  var cellColors = {
    backgroundColor : props.backgroundColor,
    borderColor : props.borderColor,
  }
  return([defaultStyle,cellColors,borderWidths])
}

export const cellTextStyle = function(props, defaultStyle = {fontSize: 20}) {
  // Text colour depends on if it is user input or not 
  return([
    {color: this.props.textColor},
    defaultStyle,
  ])
}

export const numberValueRender = function(rValue) {
  // If value is zero, render cell text as blank
  var valueRender = rValue === 0 ? null : rValue;
  return(valueRender)
}

// 
/**
 * Generate megaGrid for rendering. 
 * Pre filled is just a number. User filled is a single number in an array. Potential numbers are an array of 9 numbers (where zeros are not rendered).  
 * @param {object} preFilled 
 * @param {object} s_dict 
 * @param {boolean} showPotentialGrid 
 */
 export const megaSudokuInput = function(preFilled,s_dict,showPotentialGrid=false) {
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
