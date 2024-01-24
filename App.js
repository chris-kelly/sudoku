// Existing libraries
// import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { TouchableOpacity, Text, View, ImageBackground, Alert, Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HeaderBackButton } from '@react-navigation/elements'
import 'react-native-gesture-handler';
import {matrix} from 'mathjs'

// Specific functions
import {menuStyles} from './src/styles/Styles.js'
import {lightMode,darkMode} from './src/styles/Styles.js'
import {generateNewSudokuFromSeed,sudokuSets,constraints} from './src/utils/generateNewSudoku'
import {storeData,getData,deleteData} from './src/utils/saveProgress'
import {Game} from './Game.js'

const Stack = createStackNavigator();

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
          style={menuStyles.background}
          source={require('./src/img/homescreen.jpg')}
          >
          <View style = {{width: 200, paddingLeft: 50, paddingTop: 170}}>
            <TouchableOpacity
              onPress = { () => { this.generateGame(false,continueButton) } }
              style = { menuStyles.buttonFormat }
              >
              <Text style={menuStyles.buttonText}>New Game</Text> 
            </TouchableOpacity>
            <TouchableOpacity
              onPress = {() => {this.generateGame(true)}}
              style = {{
                ...menuStyles.buttonFormat,
                ...{display: continueButton === true ? 'flex' : 'none'}
              }}
              >
              <Text style={menuStyles.buttonText}>Continue Game</Text> 
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
export class NewGameDifficulty extends React.Component {
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
          style={menuStyles.background}
          source={require('./src/img/homescreen.jpg')}
          >
          <View style = {{width: 200, paddingLeft: 50, paddingTop: 170}}>
            <TouchableOpacity
              onPress = {() => {this.generateGame('Easy')}}
              style = { menuStyles.buttonFormat }
              >
              <Text style={menuStyles.buttonText}>Easy</Text> 
            </TouchableOpacity>
            <TouchableOpacity
              onPress = {() => {this.generateGame('Medium')}}
              style = { menuStyles.buttonFormat }
              >
              <Text style={menuStyles.buttonText}>Medium</Text> 
            </TouchableOpacity>
            <TouchableOpacity
              onPress = {() => {this.generateGame('Hard')}}
              style = { menuStyles.buttonFormat }
              >
              <Text style={menuStyles.buttonText}>Hard</Text> 
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  }
};

/** 
 * Winner screen 
 */
export class WinnerScreen extends React.Component {
  continue() {
    if (Platform.OS === 'web') {
      let c = confirm('Well done! Play again?')
      if(c) {
        deleteData().then((value) => { 
          this.props.navigation.navigate('Home',{continueButton: false})
        })
      }
    } else {
      deleteData().then((value) => { 
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
          style={menuStyles.background}
          source={require('./src/img/winner.jpg')}
          >
          <View style = {{width: 450, paddingLeft: 0, paddingTop: 300, alignItems: "center"}}>
            <Text>Total mistakes made: {mistakeCounter}</Text>
            <Text>Total hints: {hint1Counter + hint2Counter}</Text>
            <Text>Total cells filled by CPU: {solveCounter}</Text>
            <View style = {{width: 150, paddingTop: 20}}>
              <TouchableOpacity onPress = {() => {this.continue()}}
                  style = { menuStyles.buttonFormat }
                >
                  <Text style={menuStyles.buttonText}>Continue</Text> 
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
            component={NewGameDifficulty} 
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
          {/* <Stack.Screen 
            name="Settings"
            component={SettingScreen} 
            options={{
              cardStyle: {
                backgroundColor: '#F7F7F7'
              }
            }}
            /> */}
          <Stack.Screen 
            name="Winner"
            component={WinnerScreen}
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