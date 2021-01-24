import { StyleSheet } from 'react-native'

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
  },
  sudokuCell: {
    height: 39,
    width: 39,
    padding: 0,
    marginRight: 0,
    marginTop: 0,
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
    textAlign: 'center',
    color: 'gray'
  },
})

const lightMode = {
  cellBackground: '#FFFFFF',
  selectedNumber: '#DFE3EE',
  mistakeCell: '#ff6666',
  opportunityHighlight: '#FF9F45',
  opportunityConstraintHighlight: '#FFE1C5',
  floodlight: "#DCDCDC",
  preFilledText: "#263962",
  userFilledText: "#8B9DC3", 
  borderColor: "#3B5998",
  backgroundColor: '#F7F7F7', 
  selectedNumberPotential: '#C6D6CB',
  borderColorPotential: "#2D3C2D",
  preFilledTextPotential: "#2D3C2D",
  userFilledTextPotential: "#8D9F8D"
}

const darkMode = {
  cellBackground: '#221A10',
  selectedNumber: '#474542',
  mistakeCell: '#990000',
  opportunityHighlight: '#DB6D00',
  opportunityConstraintHighlight: '#AF5700',
  floodlight: "#474542",
  preFilledText: "#FFC772",
  userFilledText: "#DC8909",
  borderColor: "#FFC772",
  backgroundColor: '#362819', 
}
export {
    styles as styles,
    lightMode as lightMode,
    darkMode as darkMode, 
}
