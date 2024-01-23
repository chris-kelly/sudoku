import { StyleSheet } from 'react-native'

// styles common across all colour modes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F7F7F7', // '#362819', //
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  defaultText: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    alignSelf:'center',
    padding:0,
  },
  sudokuCell: {
    height: 39,
    width: 39,
    padding: 0,
    marginRight: 0,
    marginTop: 0,
    marginLeft: 0,
    marginBottom: 0,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sudokuRow: {
    flexDirection: 'row',
    padding: 0,
  },
  potentialRow: {
    flexDirection: 'row',
    padding: 0,
  },
  potentialCell: {
    height: 11,
    width: 12,
    padding: 0,
    marginRight: 0,
    marginTop: 0,
    justifyContent: 'center',
  },
  potentialText: {
    fontSize: 10,
    textAlign: 'center'//,
  },
})

// "light-mode" styling
const lightMode = {
  // constant styles
  backgroundColor: '#F7F7F7', // colour of background (colour outside of sudoku board)
  cellBackground: '#FFFFFF', // non-selected cell background
  potentialTextColor: "#808080", // colour of potential numbers (static)
  mistakeCell: '#ff6666', // colour to make mistake cell
  opportunityHighlight: '#FF9F45', // colour of hint cell
  opportunityConstraintHighlight: '#FFE1C5', // colour of cells in same relevant constraint as hint cell 
  floodlight: "#DCDCDC", // what colours to make non-valid cells when using floodlight
  // normal mode styles
  selectedNumber: '#DFE3EE', // selected cell colour
  preFilledText: "#263962", // pre-filled text colour
  userFilledText: "#8B9DC3",  // user-filled text colour
  borderColor: "#3B5998", // colour of cell border
  // potential mode stypes
  selectedNumberPotential: '#C6D6CB', // selected cell colour
  preFilledTextPotential: "#2D3C2D", // pre-filled text colour
  userFilledTextPotential: "#8D9F8D", // user-filled text colour
  borderColorPotential: "#2D3C2D" // colour of cell border
}

// "dark-mode" styling
const darkMode = {
  // constant styles
  backgroundColor: '#000000', // colour of background (colour outside of sudoku board)
  cellBackground: '#221A10', // non-selected cell background
  potentialTextColor: "#AEACAC", // colour of potential numbers (static)
  mistakeCell: '#990000', // colour to make mistake cell
  opportunityHighlight: '#DB6D00', // colour of hint cell
  opportunityConstraintHighlight: '#AF5700', // colour of cells in same relevant constraint as hint cell 
  floodlight: "#474542", // what colours to make non-valid cells when using floodlight
  // normal mode styles
  selectedNumber: '#5E4111', // selected cell colour
  preFilledText: "#DC8909", // pre-filled text colour
  userFilledText: "#FFC772",  // user-filled text colour
  borderColor: "#E3A951", // colour of cell border
  // potential mode stypes
  selectedNumberPotential: '#165E16', // selected cell colour
  preFilledTextPotential: "#59B459", // pre-filled text colour
  userFilledTextPotential: "#91EA91", // user-filled text colour
  borderColorPotential: "#61CE61" // colour of cell border
}

export {
    styles as styles,
    lightMode as lightMode,
    darkMode as darkMode, 
}
