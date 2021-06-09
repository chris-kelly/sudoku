// GENERATE NEW SUDOKU GAME

import { matrix,index,subset,reshape,floor,random,transpose,pow,add } from 'mathjs'
import { gRange,shuffleArray,recursive_combinations,convert_base_10_to_x } from './mathHelperFunctions'
import { cleanup } from './hintHelperFunctions'

// Sudoku seeds
const sudokuSets = {
    'Easy': {
        1: {winner: 
            [[9, 2, 6, 8, 7, 1, 5, 3, 4],
             [8, 5, 1, 3, 4, 9, 6, 7, 2],
             [4, 7, 3, 2, 5, 6, 1, 8, 9],
             [6, 8, 5, 1, 3, 2, 9, 4, 7],
             [7, 3, 4, 5, 9, 8, 2, 1, 6],
             [2, 1, 9, 7, 6, 4, 8, 5, 3],
             [3, 4, 2, 9, 1, 5, 7, 6, 8],
             [5, 6, 8, 4, 2, 7, 3, 9, 1],
             [1, 9, 7, 6, 8, 3, 4, 2, 5]
            ],
            preFilled: 
            [[9,0,6,8,0,0,0,0,0],
             [0,5,0,0,4,9,6,0,2],
             [4,7,3,2,0,6,0,0,9],
             [0,0,0,1,3,2,9,0,7],
             [7,0,4,5,9,0,0,1,0],
             [0,0,9,0,0,0,0,0,0],
             [0,0,2,0,1,5,7,6,8],
             [5,6,0,0,0,7,3,0,1],
             [1,0,0,6,0,0,4,0,0],
            ],
        },
        2: {winner: 
            [[9, 2, 6, 3, 4, 5, 8, 7, 1],
             [8, 5, 1, 7, 2, 6, 3, 4, 9],
             [4, 7, 3, 8, 9, 1, 2, 5, 6],
             [2, 1, 9, 5, 3, 8, 7, 6, 4],
             [7, 3, 4, 1, 6, 2, 5, 9, 8],
             [6, 8, 5, 4, 7, 9, 1, 3, 2],
             [5, 6, 8, 9, 1, 3, 4, 2, 7],
             [1, 9, 7, 2, 5, 4, 6, 8, 3],
             [3, 4, 2, 6, 8, 7, 9, 1, 5]
            ],
            preFilled: 
            [[0,2,0,3,4,0,0,0,1],
             [8,5,0,0,2,0,0,4,0],
             [0,0,3,0,0,1,2,5,6],
             [0,0,0,0,3,0,7,6,0],
             [0,0,4,1,6,0,5,9,0],
             [6,8,0,4,0,0,0,0,0],
             [5,0,8,0,0,3,0,0,0],
             [1,9,7,2,5,4,0,0,0],
             [0,4,2,0,0,7,9,1,0],
            ], 
        },
        3: {winner: 
            [[1, 9, 7, 6, 8, 3, 2, 5, 4],
             [5, 6, 8, 4, 2, 7, 9, 1, 3],
             [3, 4, 2, 9, 1, 5, 6, 8, 7],
             [6, 8, 5, 1, 3, 2, 4, 7, 9],
             [7, 3, 4, 5, 9, 8, 1, 6, 2],
             [2, 1, 9, 7, 6, 4, 5, 3, 8],
             [8, 5, 1, 3, 4, 9, 7, 2, 6],
             [4, 7, 3, 2, 5, 6, 8, 9, 1],
             [9, 2, 6, 8, 7, 1, 3, 4, 5]
            ],
            preFilled: 
            [[0,0,0,6,8,3,0,5,0],
             [5,0,0,4,2,7,9,1,0],
             [0,4,2,0,0,0,0,0,0],
             [6,0,5,0,0,2,0,7,9],
             [0,3,0,0,9,0,1,6,0],
             [2,0,9,7,6,4,5,3,8],
             [0,0,0,0,0,0,7,0,0],
             [0,7,0,0,0,6,8,9,1],
             [0,2,6,8,0,0,0,0,0]
            ], 
        }   
    },
    'Medium': {
        1: {winner: 
            [[3, 7, 8, 4, 1, 5, 9, 6, 2],
             [4, 2, 9, 7, 6, 3, 1, 8, 5],
             [5, 6, 1, 9, 2, 8, 3, 7, 4],
             [9, 8, 4, 6, 7, 2, 5, 3, 1],
             [2, 5, 7, 8, 3, 1, 6, 4, 9],
             [6, 1, 3, 5, 4, 9, 8, 2, 7],
             [8, 3, 2, 1, 5, 7, 4, 9, 6],
             [7, 4, 5, 3, 9, 6, 2, 1, 8],
             [1, 9, 6, 2, 8, 4, 7, 5, 3]
            ],
            preFilled: 
            [[3,0,8,0,1,5,0,0,0],
             [4,0,9,7,0,0,0,0,5],
             [5,6,1,0,0,8,0,0,0],
             [9,0,4,0,0,0,5,3,0],
             [0,5,0,0,0,1,0,4,9],
             [0,0,0,0,0,0,8,0,0],
             [0,3,0,0,0,7,0,0,6],
             [7,0,0,3,9,0,2,0,0],
             [0,0,0,0,8,0,7,0,0]
            ],
        },
        2: {winner: 
            [[9, 7, 1, 6, 3, 8, 2, 5, 4],
             [6, 8, 5, 4, 7, 2, 9, 1, 3],
             [4, 2, 3, 9, 5, 1, 6, 8, 7],
             [7, 3, 4, 2, 6, 5, 8, 9, 1],
             [5, 1, 8, 3, 9, 4, 7, 2, 6],
             [2, 6, 9, 8, 1, 7, 3, 4, 5],
             [1, 9, 2, 7, 4, 6, 5, 3, 8],
             [3, 4, 7, 5, 8, 9, 1, 6, 2],
             [8, 5, 6, 1, 2, 3, 4, 7, 9]
            ],
            preFilled: 
            [[0,7,0,0,3,0,2,0,0],
             [0,0,5,0,0,2,9,0,0],
             [4,0,0,9,0,0,0,0,0],
             [0,0,4,2,0,5,0,9,0],
             [0,1,0,3,9,0,7,0,6],
             [2,0,0,0,0,0,0,0,5],
             [1,9,2,7,0,0,0,3,0],
             [0,4,7,5,0,0,1,0,0],
             [0,0,0,1,0,3,0,0,0],
            ],
        },
        3: {winner: 
            [[5, 6, 8, 9, 3, 1, 4, 2, 7],
             [3, 4, 2, 6, 7, 8, 9, 1, 5],
             [1, 9, 7, 2, 4, 5, 6, 8, 3],
             [9, 2, 6, 3, 5, 4, 8, 7, 1],
             [8, 5, 1, 7, 6, 2, 3, 4, 9],
             [4, 7, 3, 8, 1, 9, 2, 5, 6],
             [2, 1, 9, 5, 8, 3, 7, 6, 4],
             [7, 3, 4, 1, 2, 6, 5, 9, 8],
             [6, 8, 5, 4, 9, 7, 1, 3, 2]
            ],
            preFilled: 
            [[5,0,0,0,3,0,4,0,7],
             [3,0,2,6,0,0,9,0,0],
             [0,0,7,0,4,0,0,8,0],
             [0,2,6,0,0,0,8,0,1],
             [0,0,0,7,6,0,0,4,0],
             [4,7,0,0,0,0,2,0,0],
             [2,1,0,0,0,0,7,0,0],
             [0,0,4,0,0,6,5,0,0],
             [0,0,0,0,9,7,0,3,0]
           ], 
        }   
    },
    'Hard': {
        1: {winner: 
            [[9,8,2,1,4,5,7,3,6],
            [7,5,3,9,2,6,4,8,1],
            [6,4,1,8,7,3,2,5,9],
            [4,9,8,3,5,1,6,2,7],
            [2,1,7,6,8,4,5,9,3],
            [5,3,6,2,9,7,1,4,8],
            [8,6,5,4,1,9,3,7,2],
            [3,7,9,5,6,2,8,1,4],
            [1,2,4,7,3,8,9,6,5],
            ],
            preFilled: 
            [[0,0,0,0,4,0,0,3,6],
            [0,0,0,0,2,6,0,8,0],
            [0,0,1,0,0,0,0,0,0],
            [0,9,0,0,0,0,0,0,7],
            [0,0,0,6,8,4,5,0,0],
            [0,0,0,0,0,0,1,0,0],
            [8,6,5,0,0,0,0,0,0],
            [3,0,0,0,0,0,0,0,0],
            [1,0,0,7,0,8,9,0,0],
            ],
        },
        2: {winner: 
            [[1,5,4,8,9,6,3,2,7],
            [3,9,7,4,2,1,8,5,6],
            [8,2,6,7,5,3,1,4,9],
            [7,6,2,1,8,9,5,3,4],
            [9,8,5,6,3,4,7,1,2],
            [4,1,3,2,7,5,9,6,8],
            [2,7,1,3,4,8,6,9,5],
            [6,4,9,5,1,7,2,8,3],
            [5,3,8,9,6,2,4,7,1],
            ],
            preFilled: 
            [[1,0,0,0,0,0,0,2,0],
            [3,0,0,0,0,1,0,0,0],
            [0,2,0,7,0,0,0,4,0],
            [0,0,0,0,0,0,5,3,4],
            [9,0,0,6,0,0,7,0,0],
            [0,0,3,2,7,0,0,0,0],
            [0,0,1,3,0,8,6,0,5],
            [0,0,9,0,0,0,0,0,0],
            [5,3,8,0,0,0,0,0,0],
            ],
        },
        3: {winner: 
            [[8,1,9,2,4,7,3,6,5],
            [6,3,7,5,9,8,1,2,4],
            [2,4,5,3,6,1,8,7,9],
            [4,9,6,7,8,5,2,1,3],
            [1,7,2,6,3,9,4,5,8],
            [3,5,8,1,2,4,7,9,6],
            [5,2,3,4,1,6,9,8,7],
            [7,8,1,9,5,3,6,4,2],
            [9,6,4,8,7,2,5,3,1],
            ],
            preFilled: 
            [[0,1,9,2,0,0,0,0,0],
            [6,0,7,0,0,0,0,0,0],
            [0,0,0,0,6,1,0,0,0],
            [0,0,6,0,0,0,2,1,0],
            [0,0,0,0,3,0,4,0,0],
            [0,5,0,0,0,4,0,9,0],
            [0,0,3,0,0,0,0,8,0],
            [7,0,0,9,5,0,0,0,2],
            [9,6,0,0,7,0,0,0,0],
            ],
        }   
    }     
}

// Constraints
const cs_help = [0,3,6].map(i => gRange(i,i+2)) // helper for constraints
const constraints = [
    gRange(9).map(j => gRange(9).map(i => [j,i])), // rows
    gRange(9).map(j => gRange(9).map(i => [i,j])), // cols
    cs_help.flatMap(i2 => cs_help.map(j2 => [i2,j2])).map(x => x[0].map(i => x[1].map(j => [i,j])).flat()), // boxes
].flat()

const shuffle_line = recursive_combinations([0,1,2]) // helper for line shuffling in generateSudoku
const shuffle_box = recursive_combinations([0,3,6]) // helper for box shuffling in generateSudoku
const shuffle_9 = recursive_combinations(gRange(1,9)) // helper for number shuffling in generateSudoku

/**
 * Setup sudoku object from pre-filled sudoku numbers 
 * @param {object} preFilled - Array of pre-filled sudoku numbers. Missing cells recorded as a zero.
 */
const setupSudoku = function(preFilled) {
    // Create 3d matrix of zeros
    let sudoku = matrix(
        reshape(
            Array(9*9*10).fill(0),
            [9,9,10]
            )
        );
    // populate filled in result cells
    sudoku.subset(
        index(gRange(9),gRange(9),0),
        matrix(preFilled)
        );
    // populate potential numbers
    sudoku.subset(
        index(gRange(9),gRange(9),gRange(1,9)),
        reshape(Array(81).fill(gRange(1,9)),[9,9,9])
        );
    return({sudoku: sudoku})
};

/**
 * Setup sudoku object from pre-filled sudoku numbers 
 * @param {object} sudokuSets - Array of sets of prefilled/filled-in sudokus
 * @param {object} constraints - Array of constraints (e.g. row indicies, column indicies, box indicies) 
 * @param {string} reference - Reference string of sudoku
 */
const generateNewSudokuFromSeed = function(sudokuSets,constraints,reference=(
        floor(random()*pow(6,8) + 1).toString() + '-' + 
        floor(random()*shuffle_9.length + 1).toString() + '-' + 
        // floor(random()*recursive_combinations(gRange(1,9)).length + 1).toString() + '-' +
        floor(random()*3 + 1).toString()
    )) {
    // Parse reference
    var [shuffle_index,value_index,seed_index] = reference.split('-').map(x => parseInt(x)) // index_converter(reference)
    // Choose sudoku seed
    let sudoku_chosen = Object.keys(sudokuSets)[seed_index-1]
    let pref = sudokuSets[sudoku_chosen]['preFilled']
    let win = sudokuSets[sudoku_chosen]['winner']
    // Parse shuffle index
    shuffle_index = convert_base_10_to_x(shuffle_index-1,6)
    shuffle_index = '0'.repeat(8-shuffle_index.toString().length).concat(shuffle_index).split('').map(x => parseInt(x))
    var generate_rowcol_shuffle_from_index = function(shuffle_index) {
        var line_shuffle =  shuffle_index.slice(0,3)
        var line_shuffle = line_shuffle.map(v => shuffle_line[v])
        var box_shuffle = (shuffle_box[shuffle_index.slice(3,4)]).map(v => [v,v,v])
        var result = line_shuffle.map((v,i) => add(v,box_shuffle[i]))
        return(result.flat())
      }
    // shuffle boxes row-wise and within-box rows
    var row_index = generate_rowcol_shuffle_from_index(shuffle_index.slice(0,4))
    pref = subset(pref,index(row_index,gRange(9)))
    win = subset(win,index(row_index,gRange(9)))
    // shuffle boxes col-wise and within-box cols
    var col_index = generate_rowcol_shuffle_from_index(shuffle_index.slice(4,8))
    pref = subset(pref,index(gRange(9),col_index))
    win = subset(win,index(gRange(9),col_index))
    // switch all the numbers around
    value_index = shuffle_9[value_index-1]
    pref = pref.map(row => row.map(x => x != 0 ? value_index[x-1] : 0).flat())
    win = win.map(row => row.map(x => value_index[x-1]).flat())
    let sudoku = cleanup(setupSudoku(pref),constraints)
    return({'preFilled': pref, 'winner': win, 'sudoku': sudoku, 'time': console.time})
}

export {
    sudokuSets as sudokuSets,     
    constraints as constraints,
    setupSudoku as setupSudoku,
    generateNewSudokuFromSeed as generateNewSudokuFromSeed,
}