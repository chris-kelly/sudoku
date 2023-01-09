// Global libraries
import React from 'react'
import {TouchableHighlight, Text, View, Image, Alert, Platform } from 'react-native'
import {index,reshape} from 'mathjs'
let stri = JSON.stringify.bind({})

// Custom libraries
import {styles} from './src/styles/Styles.js'
import {constraints} from './src/utils/generateNewSudoku'
import {
  checkIndexDivisibleThree,
  cellViewStyle,
  cellTextStyle,
  numberValueRender,
  cellBackgroundColor,
  megaSudokuInput,
} from './src/utils/renderHelperFunctions'
import {isItemInArray,gRange} from './src/utils/mathHelperFunctions'
import {storeData} from './src/utils/saveProgress'
import {
  cleanup,populateResultCellIfOnlyOnePotentialNumber,populateResultCellIfOnlyPotentialNumberInSameConstraint,
  eliminatePotentialNumbersInSameConstraint,removeMistakeResult,removeMistakePotential
} from './src/utils/hintHelperFunctions'

/*
 * Render pre/user-filled cells in the sudoku board.
 */
const NormalCell = (props) => {
  let prop = props.props
  return (
    <TouchableHighlight onPress={prop.onClick}>
      <View style={cellViewStyle(props = prop, defaultStyle = styles.sudokuCell)}>
        <Text style={cellTextStyle(props = prop, defaultStyle = styles.defaultText)}> 
          {numberValueRender(rValue = prop.value)}
        </Text>
      </View>
    </TouchableHighlight>
  )
}

/**
 * Render potential number cells in the sudoku board
 **/
const PotentialCell = (props) => {

  let prop = props.props

  /**
   * Render individual number in potential cell row array
   * @param {number} rValue - Number that is rendered. If zero, rendered as null.
   **/
  let PotentialValue = function(rValue)  {
    return (
      <View style={styles.potentialCell}>
        <Text style={cellTextStyle(props = prop, defaultStyle = styles.potentialText)}> 
          {numberValueRender(rValue = rValue)}
        </Text>
      </View>
    )
  }

  /**
   * Render potential number row (there are 3 rows per potential cell, 0:2, 3:5, 6:8)
   * @param {object} potentialRow - Array of potential numbers to render
   **/
  let PotentialValueRow = function(potentialRow) {
    return (
      <View style={[styles.sudokuRow,{borderColor: prop.borderColor}]}>
        {potentialRow.map(potentialCol => PotentialValue(potentialCol))}
      </View>
    )
  }

  /**
   * Render potential number cell (dim 3x3)
   **/
  return (
    <TouchableHighlight onPress={prop.onClick}>
      <View style={cellViewStyle(props = prop, defaultStyle = styles.sudokuCell)}>
        {prop.value.map(potentialRow => PotentialValueRow(potentialRow))}
      </View>
    </TouchableHighlight>
  )

}
  
/**
 * Render any cells in sudokuboard (either pre, user-filled or potential cells depending on output from megagrid function)
 * @see {@link megaSudokuInput} 
 * @param {*} props 
 */
const RenderCell = (props) => {
  if(props.value.length === undefined || props.value.length === 1) { // if pre-filled or user-filled (else render potential grid) 
    return <NormalCell props = {props}/>
  } else {
    return <PotentialCell props = {props}/>
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
        <View style={[styles.sudokuRow,{
          borderColor: this.props.pToggle == 'edit' ? this.props.colours['borderColorPotential'] : this.props.colours['borderColor'], 
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
  
  /**
   * Render number selector row
   */
  export class NumberSelector extends React.Component {
    renderNumberSelectorCell(element,complete) {
      // Render cell as preFilled, userFilled or potentialGrid
      return (
        <RenderCell 
          key = {'NumberSelectorCell_'+element.toString()} 
          value = {element}
          onClick = {() => this.props.onClick(element)}// {this.onClick}
          backgroundColor = {(complete ? this.props.colours['floodlight']: this.props.colours['cellBackground'])} // make this grey if filled in 
          textColor = {this.props.pToggle == 'edit' ? this.props.colours['preFilledTextPotential'] : this.props.colours['preFilledText']}
          borderColor = {this.props.pToggle == 'edit' ? this.props.colours['borderColorPotential'] : this.props.colours['borderColor']}
        />
      )
    }
    render() {    
      return(
        <View style={[styles.sudokuRow,{
          borderColor: this.props.pToggle ? this.props.colours['borderColorPotential'] : this.props.colours['borderColor'], 
          borderWidth: 2
          }]}>
          {gRange(1,9).map((x,i) => this.renderNumberSelectorCell(x,this.props.completeNumbers[i]))}
        </View> 
      )
    }
  }
  
  /**
   * Render hint selector row
   */
  export class HintSelector extends React.Component {
    render() {
      let nextHintLevel = [[this.props.h2Toggle ? 'H3' : this.props.h1Toggle ? 'H2' : 'H1']];
      let imgStyle = {width: 70, height: 70}
      return(
        <View style={[styles.sudokuRow,{borderColor: this.props.colours['borderColor']}]}>
          <TouchableHighlight onPress={() => this.props.p2Click()}>
            <Image style={imgStyle}
            source={
              this.props.pToggle == 'edit' ? require('./src/img/hidePotential.jpg') :
              this.props.pToggle == 'show' ? require('./src/img/editPotential.jpg') :
              require('./src/img/showPotential.jpg')
            }
            />
          </TouchableHighlight>
          <TouchableHighlight onPress={() => this.props.fClick()}>
            <Image style={imgStyle}
            source={
              this.props.fToggle ? require('./src/img/floodlightOff.jpg') :
              require('./src/img/floodlightOn.jpg')
            }
            />
          </TouchableHighlight>
          <TouchableHighlight onPress={
            this.props.h2Toggle ? () => this.props.h3Click() : this.props.h1Toggle ? () => this.props.h2Click() : () => this.props.h1Click()
          }>
            <Image style={imgStyle}
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
        sudoku: seedSudoku, // 9x9x9 matrix, made up of user and pre-filled values. Populated with 0 if not filled in. 
        preFilled: reshape(seedPreFilled,[9,9]), // 9x9 matrix, made up of pre-filled values in the sudoku
        seedWinner: reshape(seedWinner,[9,9]), // 9x9 matrix, made up of the winning sudoku values
        pToggle: 'hide', // toggle to state whether to 'hide', 'show' or 'edit' the potential numbers
        flashlightToggle: false, // toggle to state whether to activate flashlight mode
        h1Toggle: h1Toggle,
        h2Toggle: h2Toggle,
        selectedCell: [null,null],
        selectedValue: 0,
        hintCellsChanged: hintCellsChanged,
        hintNewValues: hintNewValues,
        hintRelevantConstraints: hintRelevantConstraints,
        hintType: hintType,
        hintText: '',
        solveText: '',
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
        i != null // cell selected
        && this.state.preFilled[i][j] === 0 // not prefilled
        && this.state.pToggle != 'edit' // change result number, not potential
        ) {
          if(s_dict['sudoku'].subset(index(i,j,0)) != k) {
            s_dict['sudoku'] = s_dict['sudoku'].subset(index(i,j,0),k) // set result cell to k
          } else {
            s_dict['sudoku'] = s_dict['sudoku'].subset(index(i,j,0),0) // set result cell to 0
          }
          var indicies_to_repopulate = constraints.map(x => isItemInArray(x,[i,j]).length > 0 ? x : []).flat() // need to refill potential numbers in relevant constraints
          indicies_to_repopulate.map(x => s_dict['sudoku'].subset(index(x[0],x[1],gRange(1,9)),gRange(1,9)))
          this.setState({sudoku: cleanup(s_dict,constraints)})
          var sudokuForSeed = cleanup(s_dict,constraints)
      } else if( // Edit potential cell
        i != null 
        && k != 0
        && this.state.preFilled[i][j] === 0
        && this.state.pToggle == 'edit' // change potential number, not result
        ) {
          if(s_dict['sudoku'].subset(index(i,j,k)) === 0) {
            s_dict['sudoku'].subset(index(i,j,k),k) // add k to potential cell
          } else {
            s_dict['sudoku'].subset(index(i,j,k),0) // remove k from potential cell
          }
          this.setState({sudoku: s_dict})
          var sudokuForSeed = s_dict
        }
        this.setState({selectedCell: [i,j],})
        if(this.state.hintCellsChanged.length > 0) { // Check if this fixes a hint
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
      var seed = {
        preFilled: this.state.preFilled, winner: this.state.winner, sudoku: cleanup(s_dict,constraints), 
        hint1Counter: this.state.hint1Counter, hint2Counter: this.state.hint2Counter, solveCounter: this.state.solveCounter, mistakeCounter: this.state.mistakeCounter,
        hintCellsChanged: this.state.hintCellsChanged, hintNewValues: this.state.hintNewValues, hintRelevantConstraints: this.state.hintRelevantConstraints, hintType: this.state.hintType,
        h1Toggle: this.state.h1Toggle, h2Toggle: this.state.h2Toggle
      };
      seed['sudoku'] = sudokuForSeed
      storeData(seed);
    }
  
    handlePotentialGrid() {
      if(this.state.pToggle == 'edit') { // already editing potential grid
        this.setState({pToggle: 'hide'}) // hide everything        
      } else if(this.state.pToggle == 'show') { // already showing potential grid
        this.setState({pToggle: 'edit'})
      } else { // not showing potential grid
        this.setState({pToggle: 'show'})
      }
    };
  
    handleFlashlight() {
      this.setState({
        flashlightToggle: !this.state.flashlightToggle,
      });
    };  
  
    generateHints(hint2=false,solve=false) {
      if(hint2 == true) {
        this.setState({hint2Counter: this.state.hint2Counter + 1})
      }
      else {
        if (solve == true) {
          this.setState({solveCounter: this.state.solveCounter + 1})
        } else {
          this.setState({hint1Counter: this.state.hint1Counter + 1})
        }
        while (true) { // only run generate hints if one doesn't already exist, or need solution populated
          var nextMove = removeMistakeResult(this.state.sudoku,this.state.winner,constraints,!solve)
          if(nextMove['change']) {
            if(!hint2) {this.setState({mistakeCounter: this.state.mistakeCounter + 1})} break
          };
          var nextMove = removeMistakePotential(this.state.sudoku,this.state.winner,constraints,!solve)
          if(nextMove['change']) {this.setState({pToggle: 'show'}); this.setState({mistakeCounter: this.state.mistakeCounter + 1}); break};
          var nextMove = populateResultCellIfOnlyOnePotentialNumber(this.state.sudoku,constraints,!solve)
          if(nextMove['change']) {break};
          var nextMove = populateResultCellIfOnlyPotentialNumberInSameConstraint(this.state.sudoku,constraints,!solve)
          if(nextMove['change']) {break};
          var nextMove = eliminatePotentialNumbersInSameConstraint(this.state.sudoku,constraints,2,!solve)
          if(nextMove['change']) {this.setState({pToggle: 'show'}); break};
          var nextMove = eliminatePotentialNumbersInSameConstraint(this.state.sudoku,constraints,3,!solve)
          if(nextMove['change']) {this.setState({pToggle: 'show'}); break};
          var nextMove = eliminatePotentialNumbersInSameConstraint(this.state.sudoku,constraints,4,!solve)
          if(nextMove['change']) {this.setState({pToggle: 'show'}); break};
          console.log('No more human moves!!')
          break;
        }
        this.setState({
          hintCellsChanged: solve ? [] : hint2 ? this.state.hintCellsChanged : nextMove['cellsChanged'],
          hintNewValues: solve ? [] : hint2 ? this.state.hintNewValues : nextMove['newValues'],
          hintRelevantConstraints: solve ? [] : hint2 ? this.state.hintRelevantConstraints : nextMove['relevantConstraints'],
          hintType: solve ? [] : hint2 ? this.state.hintType : nextMove['type'],
          hintText: solve ? [] : hint2 ? this.state.hintText : nextMove['hintText'], 
          solveText: solve ? [] : hint2 ?  this.state.solveText : nextMove['solveText'],
          selectedCell: [null,null]
        })
      }
      let seed = {
        preFilled: this.state.preFilled, winner: this.state.winner, sudoku: cleanup(this.state.sudoku,constraints),
        hint1Counter: this.state.hint1Counter, hint2Counter: this.state.hint2Counter, solveCounter: this.state.solveCounter, mistakeCounter: this.state.mistakeCounter,
        hintCellsChanged: solve ? [] : hint2 ? this.state.hintCellsChanged : nextMove['cellsChanged'],
        hintNewValues: solve ? [] : hint2 ? this.state.hintNewValues : nextMove['newValues'],
        hintRelevantConstraints: solve ? [] : hint2 ? this.state.hintRelevantConstraints : nextMove['relevantConstraints'],
        hintType: solve ? [] : hint2 ? this.state.hintType : nextMove['type'],
        hintText: solve ? [] : hint2 ? this.state.hintText : nextMove['hintText'], 
        solveText: solve ? [] : hint2 ?  this.state.solveText : nextMove['solveText'],
        h1Toggle: solve ? false : true, h2Toggle: hint2 ? true: false
      }; 
      storeData(seed); // store progress
      if(solve) {
        if (Platform.OS === 'web') {
          alert(this.state.solveText)
        } else {
          Alert.alert(
            "Here's your solution!", this.state.solveText,
            [{text: "OK", onPress: () => console.log("OK Pressed")}],
            {cancelable: false}
          );
        }
      } else if(hint2) {
        if (Platform.OS === 'web') {
          alert(this.state.hintText)
        } else {
          Alert.alert(
            "Here's your hint!", this.state.hintText,
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
      this.generateHints(false,true)
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
            props = {this.state.props}
            preFilled = {this.state.preFilled} // {seedPreFilled}
            sudoku = {this.state.sudoku} // {seedSudoku}
            pToggle = {this.state.pToggle}
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
            pToggle = {this.state.pToggle}
          />
          <View style={[{height: 10}]}></View>
          <HintSelector
            pToggle = {this.state.pToggle}
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