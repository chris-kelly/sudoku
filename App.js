// Existing libraries
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { TouchableHighlight, TouchableOpacity, StyleSheet, Text, View, Button, Image, ImageBackground, Alert, Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, HeaderBackButton} from '@react-navigation/stack';
import 'react-native-gesture-handler';
import { AsyncStorage } from 'react-native';
import {index,reshape,subset,floor,matrix} from 'mathjs'

const Stack = createStackNavigator();

// Tailored libraries
import {styles,lightMode,darkMode} from './src/styles/Styles.js'
import {generateNewSudokuFromSeed,sudokuSets,constraints,setupSudoku} from './src/utils/generateNewSudoku'
import {megaSudokuInput,checkIndexDivisibleThree} from './src/utils/renderHelperFunctions'
import {isItemInArray,gRange,shuffleArray} from './src/utils/mathHelperFunctions'
import {storeData,getData,removeData} from './src/utils/saveProgress'
import {
  removePotentialNumbersWhenResultCellPoplulated,removePotentialNumbersFromSameResultConstraint,
  cleanup,populateResultCellIfOnlyOnePotentialNumber,populateResultCellIfOnlyPotentialNumberInSameConstraint,
  eliminatePotentialNumbersInSameConstraint,removeMistakeResult,removeMistakePotential
} from './src/utils/hintHelperFunctions'

/*
 * Render pre/user-filled cells in the sudoku board.
 */
export class NormalCell extends React.Component {
  render() {
    return (
      <TouchableHighlight onPress={this.props.onClick}>
        <View style={[styles.sudokuCell,{
          borderTopWidth: this.props.isSelectedCell ? 4 : 0.5, // If selected, make the border width 4. Otherwise, it has a width of 0.5
          borderBottomWidth: this.props.isSelectedCell ? 4 : 0.5,
          backgroundColor: this.props.backgroundColor, borderColor: this.props.borderColor,
          borderLeftWidth: this.props.isSelectedCell ? 4 : checkIndexDivisibleThree(this.props.j) ? 2 : 0.5, // If the left edge of the cell is bordering a box (e.g. in columns 0,3,6) then that has width of 2
          borderRightWidth: this.props.isSelectedCell ? 4 : this.props.j === 8 ? 2 : 0.5, // If the cell is on the end of a row (e.g. in column 8) then the right border width is also 2
          }]}>
          <Text style={[styles.defaultText,{color: this.props.textColor}]}>  {/* Cell colour depends on if it is user input or not */}
            {this.props.value === 0 ? null : this.props.value} {/* If input is zero, render cell as blank */}
          </Text>
        </View>
      </TouchableHighlight>
    )
  }
}

/**
 * Render potential number cells in the sudoku board
 */
export class PotentialCell extends React.Component {
  /**
   * Render individual number in potential cell row array
   * @param {number} Value - Number that is rendered. If zero, rendered as null.
   */
  PotentialValue(value) {
    return (
      <View style={styles.potentialCell}>
        <Text style={[styles.potentialText,{color: this.props.textColor}]}>{value != 0 ? value : null}</Text>
      </View>
      

    )
  }
  /**
   * Render potential number row (there are 3 rows per potential cell, 1:3, 4:6, 7:9)
   * @param {object} potentialRow - Array of potential numbers to render
   */
  PotentialValueRow(potentialRow) {
    return (
      <View style={[styles.sudokuRow,{borderColor: this.props.borderColor}]}>
        {potentialRow.map(potentialCol => this.PotentialValue(potentialCol))}
      </View>
    )
  }
  /**
   * Render potential number cell (dim 3x3)
   */
  render() {
    return (
      <TouchableHighlight onPress={this.props.onClick}>
        <View style={[styles.sudokuCell,{
          backgroundColor: this.props.backgroundColor, borderColor: this.props.borderColor, 
          borderLeftWidth: this.props.isSelectedCell ? 4 : checkIndexDivisibleThree(this.props.j) ? 2 : 0.5, 
          borderRightWidth: this.props.isSelectedCell ? 4 : this.props.j === 8 ? 2 : 0.5,
          borderTopWidth: this.props.isSelectedCell ? 4 : 0.5,
          borderBottomWidth: this.props.isSelectedCell ? 4 : 0.5,
          }]}>
          {this.props.value.map(potentialRow => this.PotentialValueRow(potentialRow))}
        </View>
      </TouchableHighlight>
    )
  }
}

/**
 * Render all cells in sudokuboard (either pre, user-filled or potential cells depending on output from megagrid function)
 * @see {@link megaSudokuInput} 
 * @param {*} props 
 */
const RenderCell = (props) => {
  if(props.value.length === undefined || props.value.length === 1) { // if pre-filled or user-filled (else render potential grid) 
    return(
      <NormalCell
        value = {props.value} 
        onClick = {props.onClick}
        textColor = {props.textColor}
        backgroundColor = {props.backgroundColor}
        borderColor = {props.borderColor}
        i = {props.i}
        j = {props.j}
        isSelectedCell = {props.isSelectedCell}
      />
      )
  } else {
    return(
      <PotentialCell
        value = {props.value}
        onClick = {props.onClick}
        textColor = {props.potentialtextColor}
        backgroundColor = {props.backgroundColor}
        borderColor = {props.borderColor}
        i = {props.i}
        j = {props.j}
        isSelectedCell = {props.isSelectedCell}
      />
      )
  }
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
        key = {'SudokuBoardCells_'+i.toString() + j.toString()} 
        value = {element}
        i = {i}
        j = {j}
        onClick = {() => this.props.onClick(i,j)}
        textColor = {
          element.length !== undefined && this.props.editPotentialToggle ? colours['userFilledTextPotential'] :
          element.length !== undefined ? colours['userFilledText'] :
          this.props.editPotentialToggle ? colours['preFilledTextPotential'] : 
          colours['preFilledText']
        }
        potentialtextColor = {colours['potentialTextColor']}
        backgroundColor = {
          JSON.stringify(this.props.selectedCell) === JSON.stringify([i,j]) ? (this.props.editPotentialToggle ? this.props.colours['selectedNumberPotential'] : colours['selectedNumber']) : // selected cell
          isItemInArray(this.props.hintCellsChanged.map(x => [x[0],x[1]]),[i,j]).length > 0 ? (this.props.hintType === 'mistake' ? colours['mistakeCell'] : colours['opportunityHighlight']) : // highlight wrong cell as red
          (element === this.props.selectedValue || element[0] === this.props.selectedValue) && element != 0 ? (this.props.editPotentialToggle ? this.props.colours['selectedNumberPotential'] : colours['selectedNumber']) : // prefilled/userfilled cell is same as selected cell number // '#DFE3EE' : // '#474542' :
          (isItemInArray(lightNumberIndicies,[i,j]).length > 0 || (element != 0 && element.length != 3)) && this.props.fToggle ? colours['floodlight'] : // same constraint as same number as selected cell, or prefilled, and flashlight mode turned on
          isItemInArray(this.props.hintCellsChanged,[i,j,0]).length > 0 || this.props.hintCellsChanged.filter(x => isItemInArray(x,[i,j,0]).length > 0).length > 0 ? colours['opportunityHighlight'] : // highlight hint cell(s)
          this.props.hintRelevantConstraints.filter(x => isItemInArray(x,[i,j]).length > 0).length > 0 ? colours['opportunityConstraintHighlight'] : // '#ffe1c5' : // '#AF5700' : // highlight relevant constraint hint cell(s)
          colours['cellBackground']
        }
        borderColor = {this.props.editPotentialToggle ? this.props.colours['borderColorPotential'] : this.props.colours['borderColor']}
        isSelectedCell = {JSON.stringify(this.props.selectedCell) === JSON.stringify([i,j])}
      />
    )
  }
  renderSudokuRow(pRow,i,lightNumberIndicies) {
    // Render cells in sudokuboard row
    return (
      <View style={[styles.sudokuRow,{
        borderColor: this.props.editPotentialToggle ? this.props.colours['borderColorPotential'] : this.props.colours['borderColor'], 
        borderTopWidth: checkIndexDivisibleThree(i) ? 2 : 0.5, borderBottomWidth: i === 8 ? 2 : 0.5}]}>
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
        var lightNumberIndicies = lightNumberIndicies.map(y => this.props.constraints.filter(x => isItemInArray(x,y).length > 0).flat()).flat()
      } else {
        var lightNumberIndicies = 0
      }
    } else {
      var lightNumberIndicies = 0
    }
    // Render each sudokuboard row
    var megaGrid = megaSudokuInput(reshape(this.props.preFilled,[9,9]),this.props.sudoku,this.props.showPotentialGrid);
    return(
      megaGrid.map((pRow,i) => this.renderSudokuRow(pRow,i,lightNumberIndicies))
    )
  }
}

/**
 * Render number selector row
 */
export class NumberSelector extends React.Component {
  // onClick = (element) => {
  //   this.props.onClick(element)
  // }
  renderCell(element,complete) {
    // Render cell as preFilled, userFilled or potentialGrid
    return (
      <RenderCell 
        key = {'NumberSelectorCell_'+element.toString()} 
        value = {element}
        onClick = {() => this.props.onClick(element)}// {this.onClick}
        backgroundColor = {(complete ? this.props.colours['floodlight']: this.props.colours['cellBackground'])} // make this grey if filled in 
        textColor = {this.props.editPotentialToggle ? this.props.colours['preFilledTextPotential'] : this.props.colours['preFilledText']}
        borderColor = {this.props.editPotentialToggle ? this.props.colours['borderColorPotential'] : this.props.colours['borderColor']}
      />
    )
  }
  render() {    
    return(
      <View style={[styles.sudokuRow,{
        borderColor: this.props.editPotentialToggle ? this.props.colours['borderColorPotential'] : this.props.colours['borderColor'], 
        borderWidth: 2
        }]}>
        {gRange(1,9).map((x,i) => this.renderCell(x,this.props.completeNumbers[i]))}
      </View> 
    )
  }
}

/**
 * Render hint selector row
 */
export class HintSelector extends React.Component {
  renderCell(element) {
    // Render cell as preFilled, userFilled or potentialGrid
    return (
      <RenderCell 
        value = {element}
        onClick = {
          JSON.stringify(element[0]) === JSON.stringify("EP") ? () => this.props.pClick(element) : 
          JSON.stringify(element[0]) === JSON.stringify("FL") ? () => this.props.fClick(element) :
          JSON.stringify(element[0]) === JSON.stringify("H1") ? () => this.props.h1Click(element) : 
          JSON.stringify(element[0]) === JSON.stringify("H2") ? () => this.props.h2Click(element) : 
          JSON.stringify(element[0]) === JSON.stringify("H3") ? () => this.props.h3Click(element) : 
          () => this.props.spClick()
        }
        backgroundColor = {JSON.stringify(element[0]) === JSON.stringify("EP") && this.props.pToggle || 
                           JSON.stringify(element[0]) === JSON.stringify("FL") && this.props.fToggle ||
                           JSON.stringify(element[0]) === JSON.stringify("H1") && this.props.h1Toggle || 
                           JSON.stringify(element[0]) === JSON.stringify("H2") && this.props.h2Toggle || 
                           JSON.stringify(element[0]) === JSON.stringify("SP") && this.props.spToggle 
                           ? (this.props.pToggle ? this.props.colours['selectedNumberPotential'] : this.props.colours['selectedNumber']) :
                           this.props.colours['cellBackground']
                           }
        textColor = {this.props.colours['preFilledText']}
      />
    )
  }
  render() {
    let nextHintLevel = [[this.props.h2Toggle ? 'H3' : this.props.h1Toggle ? 'H2' : 'H1']];
    let imgStyle = {width: 70, height: 70}
    // let nextHintClick = this.props.h2Toggle ? () => this.props.h3Click() : this.props.h1Toggle ? () => this.props.h2Click() : () => this.props.h1Click();
    // let nextHintLevel = [['H1'],['H2'],['H3']];
    return(
      <View style={[styles.sudokuRow,{borderColor: this.props.colours['borderColor']}]}>
        {/* {([['SP'],['EP'],['FL']].concat(nextHintLevel)).map(x => this.renderCell(x))} */}
        <TouchableHighlight onPress={() => this.props.p2Click()}>
          <Image
          style={imgStyle}
          source={
            this.props.pToggle ? require('./src/img/hidePotential.jpg') :
            this.props.spToggle ? require('./src/img/editPotential.jpg') :
            require('./src/img/showPotential.jpg')
          }
          />
        </TouchableHighlight>
        <TouchableHighlight onPress={() => this.props.fClick()}>
          <Image
          style={imgStyle}
          source={
            this.props.fToggle ? require('./src/img/floodlightOff.jpg') :
            require('./src/img/floodlightOn.jpg')
          }
          />
        </TouchableHighlight>
        <TouchableHighlight onPress={
          this.props.h2Toggle ? () => this.props.h3Click() : this.props.h1Toggle ? () => this.props.h2Click() : () => this.props.h1Click()
        }>
          <Image
          style={imgStyle}
          source={
            this.props.h2Toggle ? require('./src/img/H3.jpg') :
            this.props.h1Toggle ? require('./src/img/H2.jpg') :
            require('./src/img/H1.jpg')
          }
          />
        </TouchableHighlight>
      </View>
    )
  }
}

/**
 * Game class to interact with the sudoku board (all user inputs/hints)
 */
export class Game extends React.Component {
  constructor(props) {
    super(props);
    let { 
      seedWinner, seedPreFilled, seedSudoku, colours, 
      hint1Counter, hint2Counter, solveCounter, mistakeCounter,
      hintCellsChanged, hintNewValues, hintRelevantConstraints, hintType,
      h1Toggle, h2Toggle,
    } = this.props.route.params;
    this.state = {
      constraints: constraints,  
      sudoku: seedSudoku, // cleanup(setup_sudoku(preFilled),constraints,0), // 
      preFilled: reshape(seedPreFilled,[9,9]), // reshape(preFilled,[9,9]), // 
      seedWinner: reshape(seedWinner,[9,9]),
      showPotentialToggle: false,
      editPotentialToggle: false,
      flashlightToggle: false,
      h1Toggle: h1Toggle,
      h2Toggle: h2Toggle,
      selectedCell: [null,null],
      selectedValue: 0,
      hintCellsChanged: hintCellsChanged,
      hintNewValues: hintNewValues,
      hintRelevantConstraints: hintRelevantConstraints,
      hintType: hintType,
      cleanup: false,              
      winner: reshape(seedWinner,[9,9]), 
      flashlightCounter: 0,
      hint1Counter: hint1Counter,
      hint2Counter: hint2Counter,
      solveCounter: solveCounter,
      mistakeCounter: mistakeCounter,
      colours: colours,
      time: 0
     }
  }
  // componentDidUpdate() { // prevProps
  //   let seed = {preFilled: this.state.preFilled, winner: this.state.winner, sudoku: cleanup(this.state.sudoku,constraints)};  
  //   storeData(seed)
  // }
  handleSudokuBoardClick(i,j) {
    this.setState({
      selectedCell:[i,j],
      selectedValue: this.state.sudoku['sudoku'].subset(index(i,j,0))
    });
  };
  handleNumberSelectorClick(k) {
    let i = this.state.selectedCell[0]
    let j = this.state.selectedCell[1]
    let s_dict = this.state.sudoku
    if( // Edit result cell
      i != null // number selected
      && this.state.preFilled[i][j] === 0 // not prefilled
      && !(this.state.editPotentialToggle) // change result number, not potential
      ) {
        if(s_dict['sudoku'].subset(index(i,j,0)) != k) {
          s_dict['sudoku'] = s_dict['sudoku'].subset(index(i,j,0),k) // set result cell to k
        } else {
          s_dict['sudoku'] = s_dict['sudoku'].subset(index(i,j,0),0) // set result cell to 0
        }
        var indicies_to_repopulate = constraints.map(x => isItemInArray(x,[i,j]).length > 0 ? x : []).flat() // need to refill potential numbers in relevant constraints
          indicies_to_repopulate.map(x => s_dict['sudoku'].subset(index(x[0],x[1],gRange(1,9)),gRange(1,9)))
        this.setState({sudoku: cleanup(s_dict,constraints)})
        var seed = {
          preFilled: this.state.preFilled, winner: this.state.winner, sudoku: cleanup(s_dict,constraints), 
          hint1Counter: this.state.hint1Counter, hint2Counter: this.state.hint2Counter, solveCounter: this.state.solveCounter, mistakeCounter: this.state.mistakeCounter,
          hintCellsChanged: this.state.hintCellsChanged, hintNewValues: this.state.hintNewValues, hintRelevantConstraints: this.state.hintRelevantConstraints, hintType: this.state.hintType,
          h1Toggle: this.state.h1Toggle, h2Toggle: this.state.h2Toggle
        };
    } else if( // Edit potential cell
      i != null 
      && k != 0
      && this.state.preFilled[i][j] === 0
      && this.state.editPotentialToggle // change potential number, not result
      ) {
        if(s_dict['sudoku'].subset(index(i,j,k)) === 0) {
          s_dict['sudoku'].subset(index(i,j,k),k) // add k to potential cell
        } else {
          s_dict['sudoku'].subset(index(i,j,k),0) // remove k from potential cell
        }
        this.setState({sudoku: s_dict})
        var seed = {
          preFilled: this.state.preFilled, winner: this.state.winner, sudoku: s_dict,
          hint1Counter: this.state.hint1Counter, hint2Counter: this.state.hint2Counter, solveCounter: this.state.solveCounter, mistakeCounter: this.state.mistakeCounter,
          hintCellsChanged: this.state.hintCellsChanged, hintNewValues: this.state.hintNewValues, hintRelevantConstraints: this.state.hintRelevantConstraints, hintType: this.state.hintType,
          h1Toggle: this.state.h1Toggle, h2Toggle: this.state.h2Toggle
        };
      }
      this.setState({
        selectedCell: [i,j],
        // selectedCell: [null,null]
      })

      if(this.state.hintCellsChanged.length > 0) {
        if(this.state.hintCellsChanged[0][2] === 0) { // result cell to be changed
          if(this.state.hintType == 'mistake') { // cell incorrect, can be either blank or filled with correct value
            var hintComplete = this.state.hintCellsChanged.map((v,i) => isItemInArray([0,this.state.hintNewValues[i]],this.state.sudoku['sudoku'].subset(index(v[0],v[1],v[2]))).length > 0)
          } else { // cell not incorrect but blank, should be filled with correct value
            var hintComplete = this.state.hintCellsChanged.map((v,i) => isItemInArray([this.state.hintNewValues[i]],this.state.sudoku['sudoku'].subset(index(v[0],v[1],v[2]))).length > 0)
          }
        } else { // potential cell to be changed
          if(this.state.hintType == 'mistake') { // potential cell or result cell should contain winning value
            var hintComplete = this.state.hintCellsChanged.map((v,i) => isItemInArray(this.state.sudoku['sudoku'].subset(index(v[0],v[1],gRange(0,9)))._data[0][0],this.state.hintNewValues[i]).length > 0)
          } else { // potential cell(s) needs values to be removed from it/them
            var hintComplete = this.state.hintCellsChanged.map(v => this.state.sudoku['sudoku'].subset(index(v[0],v[1],v[2])) === 0)
          }
        }
        console.log('Hint complete: ' + hintComplete)
        if(hintComplete.filter(x => x === true).length === hintComplete.length) { // if all cells complete
          this.setState({
            h1Toggle: false,
            h2Toggle: false,
            hintCellsChanged: [],
            hintNewValues: [],
            hintRelevantConstraints: [],
            hintType: [], 
          })
        }
      }
    // setTimeout(console.log('a'), 5000);
    storeData(seed);
  }

  handleShowPotentialGrid() {
    this.setState({
      showPotentialToggle: !this.state.showPotentialToggle,
    });
  };

  handleEditPotentialGrid() {
    this.setState({
      editPotentialToggle: !this.state.editPotentialToggle,
      showPotentialToggle: true,
    });
  };

  handlePotentialGrid() {
    if(this.state.editPotentialToggle) { // already editing potential grid
      this.setState({ // hide everything
        editPotentialToggle: false,
        showPotentialToggle: false,
      })
    } else if(this.state.showPotentialToggle) { // already showing potential grid
      this.setState({ // edit potential grid
        editPotentialToggle: true,
        showPotentialToggle: true,
      })
    } else { // not showing potential grid
      this.setState({ // show potential grid (no edit)
        editPotentialToggle: false,
        showPotentialToggle: true,
      })
    }
  };

  handleFlashlight() {
    this.setState({
      flashlightToggle: !this.state.flashlightToggle,
    });
  };  

  generateHints(hint2=false,solve=false) {
    if(solve == true) {
      this.setState({solveCounter: this.state.solveCounter + 1})
    } else if(hint2 == true) {
      this.setState({hint2Counter: this.state.hint2Counter + 1})
    } else {
      this.setState({hint1Counter: this.state.hint1Counter + 1})
    }
    while (true) {
      var nextMove = removeMistakeResult(this.state.sudoku,this.state.winner,constraints,!solve)
      if(nextMove['change']) {
        if(!hint2) {this.setState({mistakeCounter: this.state.mistakeCounter + 1})} break
      };
      var nextMove = removeMistakePotential(this.state.sudoku,this.state.winner,constraints,!solve)
      if(nextMove['change']) {this.setState({showPotentialToggle: true}); this.setState({mistakeCounter: this.state.mistakeCounter + 1}); break};
      var nextMove = populateResultCellIfOnlyOnePotentialNumber(this.state.sudoku,constraints,!solve)
      if(nextMove['change']) {break};
      var nextMove = populateResultCellIfOnlyPotentialNumberInSameConstraint(this.state.sudoku,constraints,!solve)
      if(nextMove['change']) {break};
      var nextMove = eliminatePotentialNumbersInSameConstraint(this.state.sudoku,constraints,2,!solve)
      if(nextMove['change']) {this.setState({showPotentialToggle: true}); break};
      var nextMove = eliminatePotentialNumbersInSameConstraint(this.state.sudoku,constraints,3,!solve)
      if(nextMove['change']) {this.setState({showPotentialToggle: true}); break};
      var nextMove = eliminatePotentialNumbersInSameConstraint(this.state.sudoku,constraints,4,!solve)
      if(nextMove['change']) {this.setState({showPotentialToggle: true}); break};
      console.log('No more human moves!!')
      break;
    }
    this.setState({
      hintCellsChanged: solve ? [] : nextMove['cellsChanged'],
      hintNewValues: solve ? [] : nextMove['newValues'],
      hintRelevantConstraints: solve ? [] : nextMove['relevantConstraints'],
      hintType: solve ? [] : nextMove['type'],
      selectedCell: [null,null]
    })
    let seed = {
      preFilled: this.state.preFilled, winner: this.state.winner, sudoku: cleanup(this.state.sudoku,constraints),
      hint1Counter: this.state.hint1Counter, hint2Counter: this.state.hint2Counter, solveCounter: this.state.solveCounter, mistakeCounter: this.state.mistakeCounter,
      hintCellsChanged: solve ? [] : nextMove['cellsChanged'], hintNewValues: solve ? [] : nextMove['newValues'], 
      hintRelevantConstraints: solve ? [] : nextMove['relevantConstraints'], hintType: solve ? [] : nextMove['type'],
      h1Toggle: solve ? false : true, h2Toggle: hint2 ? true: false
    }; 
    storeData(seed); // store progress
    if(solve) {
      if (Platform.OS === 'web') {
        alert(nextMove['solveText'])
      } else {
        Alert.alert(
          "Here's your solution!", nextMove['solveText'],
          [{text: "OK", onPress: () => console.log("OK Pressed")}],
          {cancelable: false}
        );
      }
    } else if(hint2) {
      if (Platform.OS === 'web') {
        alert(nextMove['hintText'])
      } else {
        Alert.alert(
          "Here's your hint!", nextMove['hintText'],
          [{text: "OK", onPress: () => console.log("OK Pressed")}],
          {cancelable: false}
        );
      }
    }
  }

  handleHint1() {
    this.setState({
      h1Toggle: true,
      h2Toggle: false,
      selectedCell: [null,null]
    })
    if(!this.state.h1Toggle) {
      this.generateHints(false,false);
    }
  }

  handleHint2() {
    this.setState({
      h1Toggle: true,
      h2Toggle: true,
      selectedCell: [null,null]
    })
    if(!this.state.h2Toggle) {
      this.generateHints(true,false);
    }
  }

  handleHint3() {
    this.setState({
      h1Toggle: false,
      h2Toggle: false,
      selectedCell: [null,null]
    })
    this.generateHints(true,true)
  }

  checkWinner(winner, sudoku) {
    if(JSON.stringify(winner) === 
       JSON.stringify(reshape(sudoku['sudoku'].subset(index(gRange(9),gRange(9),0)),[9,9])._data)) {
         console.log('Winner!');
         this.props.navigation.navigate('Winner',{ 
          hint1Counter: this.state.hint1Counter,
          hint2Counter: this.state.hint2Counter,
          solveCounter: this.state.solveCounter,
          mistakeCounter: this.state.mistakeCounter,
        });
       }
  }

  render() {
    // let { seedWinner } = this.props.route.params;
    // let { seedPreFilled } = this.props.route.params;
    // let { seedSudoku } = this.props.route.params;
    // let { colours } = this.props.route.params;
    // seedPreFilled ? seedPreFilled : this.state.preFilled;
    // seedWinner ? seedWinner : this.state.seedWinner;
    // seedSudoku ? seedSudoku : this.state.seedSudoku;
    // console.log(seedWinner);
    // console.log(seedPreFilled);
    // console.log(seedSudoku);
    // let seed = {preFilled: seedPreFilled, winner: seedWinner, sudoku: cleanup(seedSudoku,constraints)}; 
    // // let seed = {preFilled: seedPreFilled, winner: seedWinner, sudoku: cleanup(seedSudoku,constraints)}; 
    // // storeData(seed); // store progress
    // this.checkWinner(seedWinner,seedSudoku);
    this.checkWinner(this.state.winner,this.state.sudoku);
    // console.log(this.state.solveCounter)
    // console.log(this.state.hint1Counter)
    // console.log(this.state.hint2Counter)
    // console.log(this.state.mistakeCounter)
    // console.log(console.time)
    return(
      <View style={[styles.container,{backgroundColor: this.state.colours['backgroundColor']}]}>
        <SudokuBoard 
          preFilled = {this.state.preFilled} // {seedPreFilled}
          sudoku = {this.state.sudoku} // {seedSudoku}
          constraints = {this.state.constraints}
          showPotentialGrid = {this.state.showPotentialToggle}
          editPotentialToggle = {this.state.editPotentialToggle}
          fToggle = {this.state.flashlightToggle}
          selectedCell = {this.state.selectedCell}
          selectedValue = {this.state.selectedValue}
          onClick = {(i,j) => this.handleSudokuBoardClick(i,j)}
          h1Toggle = {this.state.h1Toggle}
          h2Toggle = {this.state.h2Toggle}
          hintCellsChanged = {this.state.hintCellsChanged}
          hintRelevantConstraints = {this.state.hintRelevantConstraints}
          hintType = {this.state.hintType}
          colours = {this.state.colours}
          key = {reshape(this.state.seedWinner,[81]).join('')}
        />
        <View style={[{height: 10}]}></View>
        <NumberSelector 
          onClick = {(k) => this.handleNumberSelectorClick(k)}
          colours = {this.state.colours}
          completeNumbers = {
            gRange(1,9).map(x => this.state.sudoku['sudoku'].subset(index(gRange(9),gRange(9),0))._data.flat().flat().filter(y => x === y).length === 9)
          }
          editPotentialToggle = {this.state.editPotentialToggle}
        />
        <View style={[{height: 10}]}></View>
        <HintSelector
          pToggle = {this.state.editPotentialToggle}
          spToggle = {this.state.showPotentialToggle}
          fClick = {() => this.handleFlashlight()}
          fToggle = {this.state.flashlightToggle}
          h1Click = {() => this.handleHint1()}
          h1Toggle = {this.state.h1Toggle}
          h2Click = {() => this.handleHint2()}
          h2Toggle = {this.state.h2Toggle}
          h3Click = {() => this.handleHint3()}
          colours = {this.state.colours}
          p2Click = {() => this.handlePotentialGrid()}
        />
        <View style={[{height: 10}]}></View>
      </View>
    )
  }
}

/**
 * Homescreen
 */
export class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    let { continueButton } = this.props.route.params;
    this.state = {
      seed: null,
      darkModeToggle: false,
      continueButton: continueButton,
    }
  }
  generateGame(Resume=false,data_exists=false) {  
    if(this.state.darkModeToggle) {
      var colours = darkMode
      console.log('Dark mode')
    } else {
      var colours = lightMode
      console.log('Light mode')
    }
    if(!Resume) {
      if(data_exists) {
        if (Platform.OS === 'web') {
          let c = confirm('This will erase your existing game, do you want to continue?')
          if(c) {
            this.setState({continueButton: false})
            this.props.navigation.navigate('Difficulty')
          }
        } else {
          Alert.alert(
            "Warning!","This will erase your existing game, do you want to continue?",
            [{text: "OK", onPress: () => {
              this.setState({continueButton: false});
              this.props.navigation.navigate('Difficulty')
            }},
             {text: "cancel"}],
            {cancelable: true}
          );
        }
      } else {
        this.props.navigation.navigate('Difficulty')
      }
    } else {
      getData().then((value) => { // wait to navigate until game has loaded
        let seed = value;
        seed['sudoku']['sudoku'] = matrix(seed['sudoku']['sudoku'].data) // mathjs matrix doesn't read/save correctly
        this.props.navigation.navigate('Sudoku', { 
          seedWinner: seed['winner'], 
          seedPreFilled: seed['preFilled'],
          seedSudoku: seed['sudoku'],
          seedStart: seed['time'],
          colours: colours,
          hint1Counter: seed['hint1Counter'],
          hint2Counter: seed['hint2Counter'],
          solveCounter: seed['solveCounter'],
          mistakeCounter: seed['mistakeCounter'],
          hintCellsChanged: seed['hintCellsChanged'], 
          hintNewValues: seed['hintNewValues'], 
          hintRelevantConstraints: seed['hintRelevantConstraints'], 
          hintType: seed['hintType'],
          h1Toggle: seed['h1Toggle'],
          h2Toggle: seed['h2Toggle'],
        })
      })
    }
  }
  render() { 
    let { continueButton } = this.props.route.params;
    if(this.state.continueButton === null) {
      getData().then((value) => {value != null ? this.setState({continueButton: true}) : this.setState({continueButton: false})})
    }
    if(continueButton != null) {
      continueButton = continueButton;
    } else {
      continueButton = this.state.continueButton
    }
    return (
      <View style = {{flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22}}>
        <ImageBackground
          style={{height:400, width: 400, alignItems: "center"}}
          source={require('./src/img/homescreen.jpg')}
          >
          <View style = {{width: 200, paddingLeft: 50, paddingTop: 170}}>
            <TouchableOpacity
              onPress = {
                () => {
                  this.generateGame(false,continueButton)
                }
              }
              style = {{backgroundColor: '#263962', height: 50, width: 150, justifyContent: "center", alignItems: "center"}}
              >
              <Text style={{color: '#FFFFFF', fontSize: 20}}>New Game</Text> 
            </TouchableOpacity>
            <View style = {{height: 15}}></View>
            <TouchableOpacity
              onPress = {() => {this.generateGame(true)}}
              style = {{
                backgroundColor: '#263962', height: 50, width: 150, justifyContent: "center", alignItems: "center",
                display: continueButton === true ? 'flex' : 'none'
              }}
              >
              <Text style={{color: '#FFFFFF', fontSize: 20}}>Continue Game</Text> 
            </TouchableOpacity>
            {/* <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={this.state.darkModeToggle ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => {
                this.setState({darkModeToggle: !this.state.darkModeToggle});
              }} 
              value={this.state.darkModeToggle}
            /> */}
          </View>
        </ImageBackground>
      </View>
    );
  }
};

/**
 * Difficulty screen
 */
export class newGameDifficulty extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seed: null,
      darkModeToggle: false,
      continueButton: null,
    }
  }
  generateGame(difficulty) {  
    if(this.state.darkModeToggle) {
      var colours = darkMode
      console.log('Dark mode')
    } else {
      var colours = lightMode
      console.log('Light mode')
    }
    var seed = generateNewSudokuFromSeed(sudokuSets[difficulty],constraints);
    storeData(seed); // save progress
    this.setState({continueButton: true})
    this.props.navigation.navigate('Sudoku', { 
      seedWinner: seed['winner'], 
      seedPreFilled: seed['preFilled'],
      seedSudoku: seed['sudoku'],
      colours: colours,
      hint1Counter: 0,
      hint2Counter: 0,
      solveCounter: 0,
      mistakeCounter: 0,
      hintCellsChanged: [],
      hintNewValues: [],
      hintRelevantConstraints: [],
      hintType: false,
      h1Toggle: false,
      h2Toggle: false,
      })
  }
  render() { 
    return (
      <View style = {{flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22}}>
        <ImageBackground
          style={{height:400, width: 400, alignItems: "center"}}
          source={require('./src/img/homescreen.jpg')}
          >
          <View style = {{width: 200, paddingLeft: 50, paddingTop: 170}}>
            <TouchableOpacity
              onPress = {() => {this.generateGame('Easy')}}
              style = {{backgroundColor: '#263962', height: 50, width: 150, justifyContent: "center", alignItems: "center"}}
              >
              <Text style={{color: '#FFFFFF', fontSize: 20}}>Easy</Text> 
            </TouchableOpacity>
            <View style = {{height: 15}}></View>
            <TouchableOpacity
              onPress = {() => {this.generateGame('Medium')}}
              style = {{backgroundColor: '#263962', height: 50, width: 150, justifyContent: "center", alignItems: "center"}}
              >
              <Text style={{color: '#FFFFFF', fontSize: 20}}>Medium</Text> 
            </TouchableOpacity>
            <View style = {{height: 15}}></View>
            <TouchableOpacity
              onPress = {() => {this.generateGame('Hard')}}
              style = {{backgroundColor: '#263962', height: 50, width: 150, justifyContent: "center", alignItems: "center"}}
              >
              <Text style={{color: '#FFFFFF',  fontSize: 20}}>Hard</Text> 
            </TouchableOpacity>
            <View style = {{height: 15}}></View>
          </View>
        </ImageBackground>
      </View>
    );
  }
};

/** 
 * Winner screen 
 */
export class winnerScreen extends React.Component {
  continue() {
    if (Platform.OS === 'web') {
      let c = confirm('Well done! Play again?')
      if(c) {
        removeData().then((value) => { 
          this.props.navigation.navigate('Home',{continueButton: false})
        })
      }
    } else {
      removeData().then((value) => { 
        this.props.navigation.navigate('Home',{continueButton: false})
      }) 
    }
  }
  render() { 
    let { hint1Counter, hint2Counter, solveCounter, mistakeCounter } = this.props.route.params;
    console.log(hint1Counter)
    return (
      <View style = {{flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22}}>
        <ImageBackground
          style={{height:400, width: 400, alignItems: "center"}}
          source={require('./src/img/winner.jpg')}
          >
          <View style = {{width: 450, paddingLeft: 0, paddingTop: 300, alignItems: "center"}}>
            <Text>Total mistakes made: {mistakeCounter}</Text>
            <Text>Total hints: {hint1Counter + hint2Counter}</Text>
            <Text>Total cells filled by CPU: {solveCounter}</Text>
            <View style = {{width: 150, paddingTop: 20}}>
              <TouchableOpacity onPress = {() => {this.continue()}}
                  style = {{backgroundColor: '#263962', height: 50, width: 150, justifyContent: "center", alignItems: "center"}}
                >
                  <Text style={{color: '#FFFFFF', fontSize: 20}}>Continue</Text> 
                  </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
};

// BUILD NAVIGATION BETWEEN SCREENS
export class MyStack extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            initialParams={{ continueButton: null }}
            options={{ 
              title: 'Main Menu',
              cardStyle: {
                backgroundColor: '#F7F7F7'
              }
              // headerStyle: {color: 'blue'},
              // headerTintColor: '#fff',
              // headerTitleStyle: {fontWeight: 'bold'},
            }}
          />
          <Stack.Screen 
            name="Difficulty"
            component={newGameDifficulty} 
            options={{
              cardStyle: {
                backgroundColor: '#F7F7F7'
              }
            }}
            />
          <Stack.Screen 
            name="Sudoku"
            component={Game} 
            options={({ navigation }) => ({
              headerLeft: () => (<HeaderBackButton onPress={() => {navigation.navigate('Home', {continueButton: true})}} />
                ),
              })
            } 
            />
          <Stack.Screen 
            name="Winner"
            component={winnerScreen}
            options={{
              cardStyle: {
                backgroundColor: '#F7F7F7'
              }
            }} 
            />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
};

export default MyStack;