import AsyncStorage from '@react-native-community/async-storage';

const STORAGE_KEY = '@save_game'

/**
 * Save sudoku progress 
 * @param {*} value - Store Sudoku progress
 */
const storeData = async (value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue)
    console.log('Successful save of data')
  } catch (e) { // saving error
    console.log('There has been an error saving data!')
  }
}

/**
 * Retrieve sudoku progress
 */
const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY)
    console.log('Successful read of data')
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) { // error reading value
    console.log('There has been an error reading saved data!')
  }
}

export {
  STORAGE_KEY as STORAGE_KEY,
  storeData as storeData,
  getData as getData,
}