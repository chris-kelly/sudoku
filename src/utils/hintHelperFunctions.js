// FUNCTIONS TO HELP WITH SUDOKU SOLVER

import { matrix,reshape,index,flatten } from 'mathjs'
import { gRange,isItemInArray,generate_n_choose_k_combination } from './mathHelperFunctions'

/**
 * When a result cell is populated, replace all numbers from the potential array for the same cell with zero
 * @param {object} s_dict - Sudoku object
 */
const removePotentialNumbersWhenResultCellPoplulated = function(s_dict) {
    let s_matrix = s_dict['sudoku'], change = false, cellsChanged = [], newValues = [], logging = [];
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(s_matrix.subset(index(i,j,0)) != 0) {
                s_matrix.subset(index(i,j,gRange(1,9)),Array(9).fill(0));
                change = true;
            }
        }
    }
    return({
        sudoku: s_matrix,
        change: change,
        cellsChanged: [],
        newValues: [],
        relevantConstraints: [],
        log: [],
    });
};

/**
 * When a result cell is populated with a number, remove that number from potential arrays in those cells in the same constraint
 * @param {object} s_dict - Sudoku object
 * @param {object} constraints - Array of constraints (e.g. row indicies, column indicies, box indicies)
 */
const removePotentialNumbersFromSameResultConstraint = function(s_dict,constraints) {
    let s_matrix = s_dict['sudoku'], change = false, cellsChanged = [], newValues = [], logging = [];
    for(let cs of constraints) {
        for(let num = 1; num <= 9; num++) {
            let csResultValues = cs.map(x => s_matrix.subset(index(x[0],x[1],0))); // result numbers in constraint array
            let csNotNumIndicies = cs.filter((x,i) => i!= csResultValues.indexOf(num)); // indicies of array that are not equal to the same result number
            let csPotentialNotNum = csNotNumIndicies.map(x => s_matrix.subset(index(x[0],x[1],gRange(1,9)))._data); // potential numbers from cells not populated with the same result number 
            if(csResultValues.includes(num) // number is in result array
                && flatten(csPotentialNotNum).includes(num)) { // other cells in same constraint still have that number in their potential numbers
                change = true;    
                cellsChanged.push(gRange(9).filter(x => x != csResultValues.indexOf(num)).map(x => cs[x]));
                newValues.push(num);  
                logging.push('Remove potential number '+num+' from cells '+ gRange(9).filter(x => x != csResultValues.indexOf(num)).map(x => '['+cs[x]+']'));
                cs.map(x => s_matrix.subset(index(x[0],x[1],num),0));
            };        
        }
    }
    return({sudoku: s_matrix,
            change: change,
            cellsChanged: cellsChanged,
            newValues: newValues,
            relevantConstraints: [],
            log: logging});
};

/**
 * When a result cell is populated, remove all those numbers from potential arrays in the same cell and those cells in the same constraint. Wrapper for two remove potential number functions (see below)
 * @see {@link removePotentialNumbersWhenResultCellPoplulated} 
 * @see {@link removePotentialNumbersFromSameResultConstraint} 
 * @param {object} s_dict - Sudoku object
 * @param {object} constraints - Array of constraints (e.g. row indicies, column indicies, box indicies)
 */
const cleanup = function(s_dict,constraints) {
    s_dict = removePotentialNumbersWhenResultCellPoplulated(s_dict);
    s_dict = removePotentialNumbersFromSameResultConstraint(s_dict,constraints);
    return(s_dict);
};

/**
 * Identify incorrectly populated cells (and turn them back to zero)
 * @param {object} s_dict - Sudoku object
 * @param {object} winner - 9x9 array of correct sudoku  
 */
const removeMistakeResult = function(s_dict,winner,constraints,hint=false) {
    let change = false, cellsChanged = [], newValues = [], logging = [];
    let s_matrix = s_dict['sudoku'].subset(index(gRange(9),gRange(9),0))._data
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(s_matrix[i][j] != 0 && s_matrix[i][j] != winner[i][j]) {
                change = true
                cellsChanged.push([i,j,0])
                newValues.push(winner[i][j])
                logging.push('Result cell ['+i+','+j+'] is incorrect')
            }
        }
    }
    if(!hint && change) {
        cellsChanged.map(x => s_dict['sudoku'].subset(index(x[0],x[1],gRange(0,9)),gRange(0,9)))
        var indicies_to_repopulate = cellsChanged.map(c => 
            constraints.map(x => isItemInArray(x, c.slice(0,2)).length > 0 ? x : []).flat()
            ).flat() // also need to refill potential numbers in relevant constraints
        indicies_to_repopulate.map(x => s_dict['sudoku'].subset(index(x[0],x[1],gRange(1,9)),gRange(1,9)))
        s_dict = cleanup(s_dict,constraints);
    }
    return({sudoku: s_dict['sudoku'],
            change: change,
            type: 'mistake',
            cellsChanged: cellsChanged, // highlight all mistakes
            newValues: newValues, // highlight all mistakes
            relevantConstraints: [],
            log: logging,
            hintText: (change ? 'Remove or correct mistakes from the boxes highlighted in red!' : []),
            solveText: (change ? 'The incorrect numbers were removed' :[]),
        });
}

/**
 * Identify incorrectly removed potential cells (and repopulate them)
 * @param {object} s_dict - Sudoku object
 * @param {object} winner - 9x9 array of correct sudoku  
 */
const removeMistakePotential = function(s_dict,winner,constraints,hint=false) {
    winner = matrix(reshape(winner,[9,9]));
    let change = false, cellsChanged = [], newValues = [], logging = [];
    let s_matrix = reshape(s_dict['sudoku'].subset(index(gRange(9),gRange(9),0)),[9,9]) 
    let potentialGridUser = matrix(reshape(s_dict['sudoku'].subset(index(gRange(9),gRange(9),gRange(1,9))),[9,9,9]));
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(s_matrix.subset(index(i,j)) === 0 && // not prefilled and user has not filled it in
               potentialGridUser.subset(index(i,j,winner.subset(index(i,j))-1)) === 0 // user has removed potential opton from potential grid
            ) {
                change = true
                cellsChanged.push([i,j,winner.subset(index(i,j))])
                newValues.push(winner.subset(index(i,j)))
                logging.push('Cell ['+i+','+j+'] has had the correct potential number incorrectly removed')
            }
        }
    }
    if(!hint && change) {
        cellsChanged.map((x,i) => s_dict['sudoku'].subset(index(x[0],x[1],newValues[i]),newValues[i]))
        s_dict = cleanup(s_dict,constraints);
    }
    return({sudoku: s_dict['sudoku'],
            change: change,
            type: 'mistake',
            cellsChanged: cellsChanged, // highlight all mistakes
            newValues: newValues, // highlight all mistakes
            relevantConstraints: [],
            log: logging,
            hintText: (change ? 'The correct potential numbers were incorrectly removed from the boxes highlighted in red. Add them back in!' : []),
            solveText: (change ? 'The potential numbers incorrectly removed were added back in' :[])
        });
};

/**
 * Populate result cell if there is only one number available in potential number array
 * @param {object} s_dict - Sudoku object
 * @param {object} constraints - Array of constraints (e.g. row indicies, column indicies, box indicies)
 * @param {boolean} hint - Whether or not to make the change or run a hint
 */
const populateResultCellIfOnlyOnePotentialNumber = function(s_dict,constraints,hint=false) {
    let s_matrix = s_dict['sudoku'], change = false, cellsChanged = [], newValues = [], logging = [];
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            let num = reshape(s_matrix.subset(index(i,j,gRange(1,9))),[9])._data.filter(x => x != 0) // potential numbers remaining
            if(num.length === 1) { // if only one potential number remaining
                change = true;
                logging.push('Cell ' + i + ',' + j + ' should be filled with ' + num[0] + ' (only option for cell)');
                cellsChanged.push([i,j,0]);
                newValues.push(num[0]);
            }
        }
    }
    if(!hint && change) {               
        s_dict['sudoku'] = s_matrix.subset(index(cellsChanged[0][0],cellsChanged[0][1],0),newValues[0]); // populate result cell with only potential number remaining
        s_dict = cleanup(s_dict,constraints);
    }
    return({sudoku: s_dict['sudoku'],
            change: change,
            type: 'opportunity',
            cellsChanged: [cellsChanged[0]], // only return one next move
            newValues: [newValues[0]], // only return one next move
            relevantConstraints: [],
            log: logging,
            hintText: (change ? 'The orange box can only be one number. Look at the potential numbers if you are stuck!' : []),  
            solveText: (change ? 'The orange box was filled with ' + newValues[0] + ' (there was no other number it could be!)' :[])  
        });
};

/**
 * Populate result cell if it is the only option in that constraint
 * @param {object} s_dict - Sudoku object
 * @param {object} constraints - Array of constraints (e.g. row indicies, column indicies, box indicies)
 * @param {boolean} hint - Whether or not to make the change or run a hint. If false, then only does 'one' hint move.
 */
const populateResultCellIfOnlyPotentialNumberInSameConstraint = function(s_dict,constraints,hint=false) {
    let s_matrix = cleanup(s_dict,constraints)['sudoku'], change = false, cellsChanged = [], newValues = [], relevantConstraints = [], logging = [];
    for(var cs of constraints) {
        for(var k of gRange(1,9)) {
            let cellsInConstraintWithNumber = cs.map(x => s_matrix.subset(index(x[0],x[1],k))) // Filter sudoku to be in the same constraint 
            if(cellsInConstraintWithNumber.filter(x => x === k).length === 1) { // Return all indicies in constraint that contain k in the potential array, and if there is only one instance that result cell has to be that value
                change = true;
                let cell_ref_to_update = cs[cellsInConstraintWithNumber.findIndex(x => x === k)]; // return index of cell that contains the only number
                cellsChanged.push(cell_ref_to_update.concat(0))
                newValues.push(k)
                relevantConstraints.push(cs.filter(x => x != cell_ref_to_update))
                logging.push('Cell [' + cell_ref_to_update[0] + ',' + cell_ref_to_update[1] + '] should be filled with ' + k + ' as no other cells in ' + cs.filter(x => x !=  cell_ref_to_update).map(x => '['+x+']') + ' can be this value');
            }
        }
    }
    if(!hint && change) {
        s_dict['sudoku'] = s_matrix.subset(index(cellsChanged[0][0],cellsChanged[0][1],0),newValues[0]);
        s_dict = cleanup(s_dict,constraints);
    }
    return({sudoku: s_matrix,
            change: change,
            type: 'opportunity',
            cellsChanged: [cellsChanged[0]], // only return one next move
            newValues: [newValues[0]], // only return one next move
            relevantConstraints: [relevantConstraints[0]], // only return one next move
            log: logging,
            hintText: (change ? "None of the light orange boxes can be the number in the dark orange box. Look at the potential numbers if you are stuck!" : []),
            solveText: (change ? 'The light orange box was filled with ' + newValues[0] + ' (none of the dark orange boxes could be this number!)' :[])  
        });
};

/**
 * Eliminate candidates based on restricted combinations
 * @param {object} s_dict - Sudoku object
 * @param {object} constraints - Array of constraints (e.g. row indicies, column indicies, box indicies)
 * @param {number} comparisons - Number of  
 * @param {boolean} hint - Whether or not to make the change or run a hint
 */
var eliminatePotentialNumbersInSameConstraint = function(s_dict,constraints,comparisons = 2,hint=false) {
    let s_matrix = s_dict['sudoku'], change = false, cellsChanged = [], newValues = [], relevantConstraints = [], logging = [], solveText = [];
    for(let cs of constraints) {
        // Get all potential numbers within constraint
        let vector_list = cs.map(x => s_matrix.subset(index(x[0],x[1],gRange(1,9)))._data[0][0]);
        // For all potential numbers within constraint, return column indicies that contain numbers other than zero (do not have populated results)
        let col_indicies = vector_list.map(cs => cs.filter(col => col != 0).length > 0).flatMap((bool, index) => bool ? index : []) 
        // Get n choose k combinations of columns (where order matters)
        if(col_indicies.length >= comparisons) {
            // generate n choose k combinations from indicies
            var combn_element_indicies = generate_n_choose_k_combination(col_indicies,comparisons)
            // get unique length of potential numbers in each of the combinations of columns
            let unique_num_combinations = combn_element_indicies.map(combn =>
                vector_list.filter((v,i) => combn.includes(i)).flat().filter((v,i,arr) => v != 0 && arr.indexOf(v) === i).length
            )
            // get column indicies of those columns which have to be those potential numbers
            let elements_with_option = unique_num_combinations.flatMap((ele,ind) => (ele <= comparisons) ? ind: []).flatMap(x => combn_element_indicies[x]).filter((ele,ind,arr) => arr.indexOf(ele) == ind);
            // get the potential numbers that are unique to those columns
            let candidate_elements = elements_with_option.flatMap(x => vector_list[x]).filter((ele,ind,arr) => arr.indexOf(ele) == ind & ele != 0);
            // remove those potential numbers from other columns
            if(candidate_elements.length > 0 // more than zero options
                && candidate_elements.some(x => col_indicies.flatMap(x => elements_with_option.includes(x) ? [] : x).map(y => vector_list[y]).flat().includes(x)) // potential numbers exist in other columns
                ) {
                change = true
                let all_could_remove_from = col_indicies.flatMap(x => elements_with_option.includes(x) ? [] : x).map(y => cs[y]).filter(x => candidate_elements.some(y => s_matrix._data[x[0]][x[1]].includes(y)))
                // let num = all_could_remove_from.map(i => reshape(s_matrix.subset(index(i[0],i[1],gRange(1,9))),[9])._data.filter(x => x != 0))
                // console.log(num)
                relevantConstraints.push(col_indicies.flatMap(x => elements_with_option.includes(x) ? x : []).map(i => cs[i]))
                let cell_ref_to_update = all_could_remove_from.map(x => candidate_elements.map(y => x.concat(y))).flat()
                cellsChanged.push(cell_ref_to_update)
                newValues.push(Array(cell_ref_to_update.length).fill(0))
                logging.push('The potential numbers ['+candidate_elements+']' + ' can be removed from ' + all_could_remove_from.map(i => '['+i+']'))
                solveText.push('The potential numbers ' + candidate_elements + ' can be removed from the dark orange boxes, because they have to in the light orange boxes!')
            }
        }
    }    
    // console.log(logging)
    // console.log(cellsChanged[0])
    // let a = JSON.parse(JSON.stringify(s_dict['sudoku']._data))
    // let a = cellsChanged[0].map(x => s_dict['sudoku'].subset(index(x[0],x[1],gRange(0,9)))._data)
    // a = matrix(a)
    // console.log(a)
    // cellsChanged[0].map(x => a.subset(index(x[0],x[1],x[2]),0))
    // console.log(a)
    if(!hint && change) {
        // cellsChanged[0].map((x,i) => s_dict['sudoku'].subset(index(x[0],x[1],gRange(1,9)),newValues[0][i]))
        cellsChanged[0].map(x => s_dict['sudoku'].subset(index(x[0],x[1],x[2]),0))
        s_dict = cleanup(s_dict,constraints);
    }
    return({sudoku: s_matrix,
            change: change,
            type: 'opportunity',
            log: logging,
            cellsChanged: cellsChanged[0], // only return one next move
            newValues: [newValues[0]], // only return one next move
            relevantConstraints: [relevantConstraints[0]], // only return one next move
            hintText: (change ? 'The potential numbers in the light orange boxes cannot be in the dark orange boxes, so you can remove them!' : []),    
            solveText: (change ? solveText[0] : [])  
        });
};

export {
    removePotentialNumbersWhenResultCellPoplulated as removePotentialNumbersWhenResultCellPoplulated,
    removePotentialNumbersFromSameResultConstraint as removePotentialNumbersFromSameResultConstraint,
    cleanup as cleanup,
    populateResultCellIfOnlyOnePotentialNumber as populateResultCellIfOnlyOnePotentialNumber,
    populateResultCellIfOnlyPotentialNumberInSameConstraint as populateResultCellIfOnlyPotentialNumberInSameConstraint,
    eliminatePotentialNumbersInSameConstraint as eliminatePotentialNumbersInSameConstraint,
    removeMistakeResult as removeMistakeResult,
    removeMistakePotential as removeMistakePotential,    
}; 

// // get result cell data
// a.subset(index(3,0,0))

// // get result data
// a.subset(index(gRange(9),gRange(9),0))._data

// // check row totals
// a.subset(index(gRange(9),gRange(9),0))._data.map(x => math.sum(x))

// // check column totals
// math.transpose(reshape(a.subset(index(gRange(9),gRange(9),0)),[9,9]))._data.map(x => math.sum(x))
