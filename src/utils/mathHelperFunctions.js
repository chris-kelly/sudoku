// FUNCTIONS TO HELP WITH MATHS

import { range, floor, random, pow } from 'mathjs'
// const mathjs = require('mathjs'); const floor = mathjs.floor; const random = mathjs.random; const subset = mathjs.subset; const index = mathjs.index

/**
 * Returns index where item is found in an array.
 * (Useful if item is another object)
 * @param {object} array - Array to search through
 * @param {object} item - Item to find
 */
const isItemInArray = function(array,item) {
    let indicies = []
    for(let i = 0; i < array.length; i++) {
        if(JSON.stringify(array[i]) == JSON.stringify(item)) {
            indicies.push(i)
        }
    }
    return(indicies)
}

/**
 * Generates a sequence of numbers from num1 to num2. 
 * If num2 not specified, then generates sequence from 0 to num1.
 * @param {number} num1
 * @param {number} [num2]
 */
const gRange = function(num1,num2) {
    if(num2 === undefined) {
        return(range(0, num1)._data)
    } else {
        return(range(num1, num2+1)._data)
    }
};

/**
 * Randomly shuffles an array
 * @param {object} array
 */
const shuffleArray = function(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return(array)
}

/**
 * Generate all unordered combinations of an array
 * @param {object} array - Array to generate all combinations from
 */
const recursive_combinations = function(array) {
    var permArr = []
    for(let i = 0; i < array.length; i++) {
        var nArray = [...array] // make a copy (as splice changes nArray inplace, if not it would screw up array.length in for loop)
        var constant_bit = nArray.splice(i,1) // note now nArray has had constant_bit removed at index i (inplace)
        if(nArray.length >= 3) {
            permArr.push(recursive_combinations(nArray).map(v => constant_bit.concat(v))) // recursive
        } else {
            permArr.push(constant_bit.concat(nArray)) // normal order
            permArr.push(constant_bit.concat(nArray.reverse())) // reverse order      
        }
    }
    if(nArray.length >= 3) {
        permArr = permArr.flat() // otherwise nested, change before being fed to higher level recursion
    }
    return(permArr)
}

/**
 * Generate n choose k ordered combinations from an array
 * @param {object} x - Array to generate combinations from
 * @param {object} k - Number of items to select from
 */
const generate_n_choose_k_combination = function(x,k) {
    var permArr = []
    for(let i = 0; i < x.length; i++) {
      var remainder = [...x] // make a copy (as splice changes x inplace, if not it would screw up x.length in for loop)
      var constant_bit = remainder.splice(i,1) // note remainder has had constant_bit removed at index i (inplace)
      remainder = remainder.filter(v => v > constant_bit) // filter for ordering
      if(k == 2) {
        for(var v of remainder) {
          permArr.push(constant_bit.concat(v))
        }
      } else {
        if(remainder.length >= k-1) {
            generate_n_choose_k_combination(remainder,k-1).map(v2 => permArr.push(constant_bit.concat(v2))) // recursive
        }
      }
    }
    return(permArr)
}

/**
 * Convert number from base x to base 10
 * @param {number} x - Integer to convert
 * @param {number} old_base - Original base of integer
 */
const convert_base_x_to_10 = function(x,old_base) {
    var z = x.toString().split('')
    var z = z.map((v,i) => parseInt(v)*pow(old_base,z.length-i-1))
    var result = 0
    for(i = 0; i < z.length; i++) {
      var result = result + z[i]
    }
    return(result)
}

/**
 * Convert number from base 10 to base x
 * @param {number} x - Integer to convert
 * @param {number} new_base - New base for integer
 */
const convert_base_10_to_x = function(x,new_base) {
    var remainder = x % new_base
    var big = (x - remainder)/new_base
    if(big <= 6) {
      return(parseInt(big.toString().concat(remainder)))
    } else {
      return(parseInt(convert_base_10_to_x(big,new_base).toString().concat(remainder)))
    }
}

export {
    isItemInArray as isItemInArray,
    gRange as gRange,
    shuffleArray as shuffleArray,
    recursive_combinations as recursive_combinations,
    generate_n_choose_k_combination as generate_n_choose_k_combination,
    convert_base_x_to_10 as convert_base_x_to_10,
    convert_base_10_to_x as convert_base_10_to_x,
}