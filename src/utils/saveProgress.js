import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save sudoku progress 
 * @param {*} value - Store Sudoku progress
 */
const storeData = async (value, location = '@save_game') => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(location, jsonValue)
    console.log('Successful save of data')
  } catch (e) { // saving error
    console.log('There has been an error saving data!')
  }
}

/**
 * Retrieve sudoku progress
 */
const getData = async (location = '@save_game') => {
  try {
    const jsonValue = await AsyncStorage.getItem(location)
    console.log('Successful read of data')
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) { // error reading value
    console.log('There has been an error reading saved data!')
  }
}

/**
 * Remove sudoku progress
 */
const deleteData = async (location = '@save_game') => {
  try {
      await AsyncStorage.removeItem(location);
      console.log('Successful deletion of old data')
  } catch(e) {
    console.log('There has been an error deleting saved data!')
  }
}

export {
  storeData as storeData,
  getData as getData,
  deleteData as deleteData,
}