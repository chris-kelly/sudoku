// Global libraries
import React from 'react'
import {TouchableHighlight, Text, View } from 'react-native'
import {index,reshape} from 'mathjs'
let stri = JSON.stringify.bind({})

// Custom libraries
import {styles} from './src/styles/Styles.js'
import {constraints} from './src/utils/generateNewSudoku.js'
import {
  cellViewStyle,
  cellBackgroundColor,
  megaSudokuInput,
} from './src/utils/renderHelperFunctions.js'
import {isItemInArray,gRange} from './src/utils/mathHelperFunctions.js'

const numberValueRender = function(rValue) {
  // If value is zero, render cell text as blank
  return( rValue === 0 ? null : rValue )
}

/*
 * Render pre/user-filled cells in the sudoku board.
 */
const NormalCell = (props) => {
  return (
    <Text style = { {...{color: props.textColor}, ...styles.defaultStyle} }> 
      { numberValueRender(props.value) }
    </Text>
  )
}

/**
 * Render individual number in potential cell row array
 * @param {number} rValue - Number that is rendered. If zero, rendered as null.
 **/
const PotentialValue = function(val, props)  {
  return (
    <View style={styles.potentialCell}>
      <Text style = { {...{color: props.textColor}, ...styles.potentialText} }>
        { numberValueRender(val) }
      </Text>
    </View>
  )
}

/**
 * Render potential number row (there are 3 rows per potential cell, 0:2, 3:5, 6:8)
 * @param {object} potentialRow - Array of potential numbers to render
 **/
const PotentialValueRow = function(potentialRow, props) {
  return (
    <View style={styles.sudokuRow}>
      {potentialRow.map(potentialCol => PotentialValue(potentialCol, props))}
    </View>
  )
}

/**
 * Render potential number cells in the sudoku board (dim 3x3)
 **/
const PotentialCell = (props) => {
  let prop = props.props
  return ( 
    prop.value.map(potentialRow => PotentialValueRow(potentialRow, props)) 
  )
}
  
/**
 * Render any cells in sudokuboard (either pre, user-filled or potential cells depending on output from megagrid function)
 * @see {@link megaSudokuInput} 
 * @param {*} props 
 */
const RenderCell = (props) => {
  let prop = props.props
  if(props.value.length === undefined || props.value.length === 1) { // if pre-filled or user-filled (else render potential grid) 
    let cellStyle = <NormalCell props = {prop}/>
  } else {
    let cellStyle = <PotentialCell props = {prop}/>
  }
  return (
    <TouchableHighlight onPress={prop.onClick}>
      <View style={ cellViewStyle( {props: prop, defaultStyle: styles.sudokuCell }) }>
        cellStyle
      </View>
    </TouchableHighlight>
  )
}

/**
 * Render entire sudoku board
 */
export class SudokuBoard extends React.Component {
  /**
   * Render cell in sudoku board
   * @param {object} element - Value or potential array to render in cell
   * @param {number} i - Row i of cell to render
   * @param {number} j - Row j of cell to render
   * @param {number} lightNumberIndicies - 
   */
  renderSudokuCell(element,i,j,lightNumberIndicies) {
    let colours = this.props.colours;
    return (
      <RenderCell
        key = {'SudokuBoardCells_' + i.toString() + j.toString()} 
        value = {element}
        i = {i}
        j = {j}
        onClick = {() => this.props.onClick(i,j)}
        textColor = {
          element.length !== undefined && this.props.pToggle == 'edit' ? colours['userFilledTextPotential'] : // 
          element.length !== undefined ? colours['userFilledText'] :
          this.props.pToggle == 'edit' ? colours['preFilledTextPotential'] : 
          colours['preFilledText']
        }
        potentialtextColor = {colours['potentialTextColor']}
        backgroundColor = {cellBackgroundColor(this.props, element, i, j, lightNumberIndicies)}
        borderColor = {this.props.pToggle == 'edit' ? this.props.colours['borderColorPotential'] : this.props.colours['borderColor']}
        isSelectedCell = {stri(this.props.selectedCell) === stri([i,j])}
      />
    )
  }
  renderSudokuRow(pRow,i,lightNumberIndicies) {
    // Render cells in sudokuboard row
    return (
      <View style={[styles.sudokuRow, {
        borderColor: this.props.pToggle == 'edit' ? this.props.colours['borderColorPotential'] : this.props.colours['borderColor'], 
        }]}>
        {pRow.map((element,j) => this.renderSudokuCell(element,i,j,lightNumberIndicies))}
      </View>
    )
  }
  render() {
    if(this.props.selectedCell[0] != null) {
      var lightNumber = this.props.sudoku['sudoku']._data[this.props.selectedCell[0]][this.props.selectedCell[1]][0]
      if(lightNumber != 0) {
        var resultGrid = reshape(this.props.sudoku['sudoku'].subset(index(gRange(9),gRange(9),0))._data,[9,9])
        var lightNumberIndicies = resultGrid.map((x,ind) => isItemInArray(x,lightNumber).length > 0 ? [ind,isItemInArray(x,lightNumber)[0]] : null).filter(x => x != null)
        var lightNumberIndicies = lightNumberIndicies.map(y => constraints.filter(x => isItemInArray(x,y).length > 0).flat()).flat()
      } else {
        var lightNumberIndicies = 0
      }
    } else {
      var lightNumberIndicies = 0
    }
    // Render each sudokuboard row
    var megaGrid = megaSudokuInput(reshape(this.props.preFilled,[9,9]),this.props.sudoku,this.props.pToggle != 'hide');
    return(
      megaGrid.map((pRow,i) => this.renderSudokuRow(pRow,i,lightNumberIndicies))
    )
  }
}