// FUNCTIONS TO HELP WITH RENDERING

import { reshape,index } from 'mathjs'
import { gRange, isItemInArray } from './mathHelperFunctions'
let stri = JSON.stringify.bind({})

/**
 * Check if index is divisible by 3 (to make every 3rd border thicker in sudoku grid)
 * @param {number} n 
 */
export const checkIndexDivisibleThree = (n) => {
    return n % 3 === 0
};

export const cellViewStyle = function(props, defaultStyle = {borderWidth: 0.5}) {
  let borderWidths = {
    // Make the top border of the selected cell very thick (4). Otherwise, make the top border of rows 0,3,6 medium thick (2). Otherwise, thin (0.5).
    borderTopWidth: props.isSelectedCell ? 4 : checkIndexDivisibleThree(props.i) ? 2 : 0.5,
    // Make the left border of the selected cell very thick (4). Otherwise, make the left border of columns 0,3,6 medium thick (2). Otherwise, thin (0.5).
    borderLeftWidth: props.isSelectedCell ? 4 : checkIndexDivisibleThree(props.j) ? 2 : 0.5,
    // Make the bottom border of the selected cell very thick (4). Otherwise, make the bottom border of last row 8 medium thick (2). Otherwise, thin (0.5).
    borderBottomWidth: props.isSelectedCell ? 4 : props.i === 8 ? 2 : 0.5,
    // Make the right border of the selected cell very thick (4). Otherwise, make the right border of last column 8 medium thick (2). Otherwise, thin (0.5).
    borderRightWidth: props.isSelectedCell ? 4 : props.j === 8 ? 2 : 0.5,
  }
  let cellColors = {
    backgroundColor : props.backgroundColor,
    borderColor : props.borderColor,
  }
  return([defaultStyle,cellColors,borderWidths])
}

export const cellTextStyle = function(props, defaultStyle = {fontSize: 20}) {
  // Text colour depends on if it is user input or pre-filled 
  return([
    {color: props.textColor},
    defaultStyle,
  ])
}

export const numberValueRender = function(rValue) {
  // If value is zero, render cell text as blank
  let valueRender = rValue === 0 ? null : rValue;
  return(valueRender)
}

export const cellBackgroundColor = (props, element, i, j, lightNumberIndicies) => {
  
    let prop = props
    let colours = prop.colours
  
    if (
      stri(prop.selectedCell) === stri([i,j]) // cell is selected by user
      ) { 
        return prop.pToggle == 'edit' ? prop.colours['selectedNumberPotential'] : colours['selectedNumber'] // different colour depending on whether "edit" potential cell mode is turned on
    } else if (
      isItemInArray(prop.hintCellsChanged.map(x => [x[0],x[1]]),[i,j]).length > 0 // hint cell: either has an error or opportunity (hintCellsChanged generates both) 
      ) { 
        return prop.hintType === 'mistake' ? colours['mistakeCell'] : colours['opportunityHighlight']
    } else if(
      (element === prop.selectedValue && element != 0) || element[0] === prop.selectedValue // pre-filled or user-filled is same as number selected
    ) {
      return prop.pToggle == 'edit' ? prop.colours['selectedNumberPotential'] : colours['selectedNumber'] // NB same as first if statement, but error/hint colour takes priority over this one
    } else if(
      prop.fToggle && // flashlight mode turned on 
      (isItemInArray(lightNumberIndicies,[i,j]).length > 0 || (element != 0 && element.length != 3)) // same constraint as same number as selected cell, or prefilled
    ) {
      return colours['floodlight']
    } else if(
      isItemInArray(prop.hintCellsChanged,[i,j,0]).length > 0 || // highlight hint cell(s)
      prop.hintCellsChanged.filter(x => isItemInArray(x,[i,j,0]).length > 0).length > 0 // highlight hint cell(s)
    ) {
      return colours['opportunityHighlight']
    } else if(
      prop.hintRelevantConstraints.filter(x => isItemInArray(x,[i,j]).length > 0).length > 0 // highlight relevant constraint hint cell(s)
    ) {
      return colours['opportunityConstraintHighlight']
    } else {
      return colours['cellBackground'] // default colour before anything else has loaded
    }
  }

// 
/**
 Generate megaGrid for rendering: 
 * Pre filled is just a number. 
 * User filled is a single number in an array. 
 * Potential numbers are an array of 9 numbers (where zeros are not rendered). 
  
 @param {object} preFilled 
 @param {object} s_dict 
 @param {boolean} showPotentialGrid 
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
