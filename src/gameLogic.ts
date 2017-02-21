/**
 * This is the implementation of the game logic of Jungle.
 * The game's board is 2D array 9*7 (9 rows and 7 columns).
 * One round has two players: represented by color Red vs. Blue
 * 
 * Each player has 8 kinds of chess pieces.
 * Red: Relephant, Rlion, Rtiger, Rcheetah, Rwolf, Rdog, Rcat, Rmouse.
 * Blue: Belephant, Blion, Btiger, Bcheetah, Bwolf, Bdog, Bcat, Bmouse.
 * 
 * The game boad(9*7) consists of:
 * River: R
 * Glass: G
 * Trap: RT(read animals' trap), BT(blue animals' trap)
 * Home: RH(red animals' home), BH(blue animals' home)
 * 
 * The initial state is 
 *    
 * 0 [[Rlion, G, RT, RH, RT, G, RTiger],
 * 1 [G, Rdog, G, RT, G, Rcat, G],
 * 2 [Rmouse, G, Rcheetah, G, Rwolf, G, Relephant],
 * 3 [G, R, R, G, R, R, G],
 * 4 [G, R, R, G, R, R, G],
 * 5 [G, R, R, G, R, R, G],
 * 6 [Belephant, G, Bwolf, G, Bcheetah, G, Bmouse],
 * 7 [G, Bcat, G, BT, G, Bdog, G],
 * 8 [Btiger, G, BT, BH, BT, G, Blion]]
 * 
 * Win Codintion(e.g. Read win, Blue fails), satisfy any one of the following
 * 1. none of blue alive.
 * 2. any piece of read animals is in the BH(blue animals' home).
 * 
 * 
 * 
 */
type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
}
type IProposalData = BoardDelta;
interface IState {
  board: Board;
  delta: BoardDelta;
}

import gameService = gamingPlatform.gameService;
import alphaBetaService = gamingPlatform.alphaBetaService;
import translate = gamingPlatform.translate;
import resizeGameAreaService = gamingPlatform.resizeGameAreaService;
import log = gamingPlatform.log;
import dragAndDropService = gamingPlatform.dragAndDropService;

module gameLogic {
  export const ROWS = 9;
  export const COLS = 7;
 
  // special cells in the game board
  export const BlueTrap: BoardDelta[] =
    [{ row: 8, col: 2 }, { row: 7, col: 3 }, { row: 8, col: 4 }];
  export const RedTrap: BoardDelta[] =
    [{ row: 0, col: 2 }, { row: 1, col: 3 }, { row: 0, col: 4 }];
  
  export const River: BoardDelta[] = [{ row: 3, col: 1 }, { row: 3, col: 2 },
    { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 4, col: 1 }, { row: 4, col: 2 },
    { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 5, col: 1 }, { row: 5, col: 2 },
    { row: 5, col: 4 }, { row: 5, col: 5 }];
  export const Rhome: BoardDelta = { row: 0, col: 3 };
  export const Bhome: BoardDelta = { row: 8, col: 3 };


  /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix 9*7. */
  export function getInitialBoard(): Board {
    let board: Board =  [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'RTiger'],
 ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
 ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
 ['G', 'R', 'R', 'G', 'R', 'R', 'G'],
 ['G', 'R', 'R', 'G', 'R', 'R', 'G'],
 ['G', 'R', 'R', 'G', 'R', 'R', 'G'],
 ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
 ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
 ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']];
    return board;
  }

  export function getInitialState(): IState {
    return {board: getInitialBoard(), delta: null};
  }

  /**
   * Returns true if the game ended in a tie because there are no empty cells.
   * E.g., isTie returns true for the following board:
   *     [['X', 'O', 'X'],
   *      ['X', 'O', 'O'],
   *      ['O', 'X', 'X']]
   */
  function isTie(board: Board): boolean {
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (board[i][j] === '') {
          // If there is an empty cell then we do not have a tie.
          return false;
        }
      }
    }
    // No empty cells, so we have a tie!
    return true;
  }

  /**
   * Return the winner (either 'X' or 'O') or '' if there is no winner.
   * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
   * E.g., getWinner returns 'X' for the following board:
   *     [['X', 'O', ''],
   *      ['X', 'O', ''],
   *      ['X', '', '']]
   */
  function getWinner(board: Board): string {
    let boardString = '';
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        let cell = board[i][j];
        boardString += cell === '' ? ' ' : cell;
      }
    }
    let win_patterns = [
      'XXX......',
      '...XXX...',
      '......XXX',
      'X..X..X..',
      '.X..X..X.',
      '..X..X..X',
      'X...X...X',
      '..X.X.X..'
    ];
    for (let win_pattern of win_patterns) {
      let x_regexp = new RegExp(win_pattern);
      let o_regexp = new RegExp(win_pattern.replace(/X/g, 'O'));
      if (x_regexp.test(boardString)) {
        return 'X';
      }
      if (o_regexp.test(boardString)) {
        return 'O';
      }
    }
    return '';
  }


  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(
      stateBeforeMove: IState, row: number, col: number, turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }
    let board: Board = stateBeforeMove.board;
    if (board[row][col] !== '') {
      throw new Error("One can only make a move in an empty position!");
    }
    if (getWinner(board) !== '' || isTie(board)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    let boardAfterMove = angular.copy(board);
    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
    let winner = getWinner(boardAfterMove);
    let endMatchScores: number[];
    let turnIndex: number;
    if (winner !== '' || isTie(boardAfterMove)) {
      // Game over.
      turnIndex = -1;
      endMatchScores = winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0];
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      turnIndex = 1 - turnIndexBeforeMove;
      endMatchScores = null;
    }
    let delta: BoardDelta = {row: row, col: col};
    let state: IState = {delta: delta, board: boardAfterMove};
    return {endMatchScores: endMatchScores, turnIndex: turnIndex, state: state};
  }
  
  export function createInitialMove(): IMove {
    return {endMatchScores: null, turnIndex: 0, 
        state: getInitialState()};  
  }

  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null, 0, 0, 0);
    log.log("move=", move);
  }

/**
 * judge of next move is out of the gameboard
 */
  function isOutOfBound(boardDelta : BoardDelta): boolean{
    if(boardDelta.row < 0 || boardDelta.row >= ROWS || boardDelta.col < 0 || boardDelta.col >= COLS){
      return true;
    }
    return false;
  }


/**
 * get the rank of animals
 */
  function getRank(animal: string): number{
    switch(animal.substring(1)){
      case'mouse' : return 0;
      case'cat' : return 1;
      case'dog' : return 2;
      case'wolf': return 3;
      case'cheetah': return 4;
      case'tiger': return 5;
      case'lion' : return 6;
      case'elephant': return 7;
    }
  }

/**
 * get turn index, 0 is blue animals' turn and 1 is read animals'turn.
 */
  export function getTurn(turn: number): string{
    return (turn === 0 ? 'B' : 'R');
  }


   function isOwnTrap(turn: number, coordinate: BoardDelta): boolean {
    if (turn === 0) {
      for (let pos of BlueTrap) {
        if (angular.equals(pos, coordinate)) {
          return true;
        }
      }
      return false;
    } else if (turn === 1) {
      for (let pos of RedTrap) {
        if (angular.equals(pos, coordinate)) {
          return true;
        }
      }
      return false;
    } 
  }


  function isRiver(coordinate: BoardDelta): boolean{
    for(let pos of River){
      if(angular.equals(pos, coordinate)) {
        return true;
      }
    }
    return false;
  }


  function isOppentHome(turn: number, coordinate: BoardDelta): boolean{
    //blue animals' turn
    if(turn === 0 && angular.equals(coordinate, Rhome)){
      return true;
    }
    //read animals' turn
    if(turn === 1 && angular.equals(coordinate, Bhome)){
      return true;
    }
    return false;
  }


  function isOppentTrap(turn: number, coordinate: BoardDelta): boolean{
    //blue animals' turn
     if(turn === 0){
       for(let pos of RedTrap){
         if(angular.equals(coordinate, pos)){
           return true;
         }
       }
     }
      if(turn === 1){
       for(let pos of BlueTrap){
         if(angular.equals(coordinate, pos)){
           return true;
         }
       }
     }
     return false;  
    }

    function isTrap(coordinate: BoardDelta): boolean{
      for(let pos of BlueTrap){
        if(angular.equals(pos, coordinate)){
          return true;
        }
      }
      for(let pos of RedTrap){
        if(angular.equals(pos, coordinate)){
          return true;
        }
      }
      return false;  
    }

    function isHome(coordinate: BoardDelta): boolean{
      if(angular.equals(coordinate, Rhome) || angular.equals(coordinate, Bhome)){
        return true;
      }
    }


    //export var dx = [1, -1, 0, 0];
    //export var dy = [0, 0, 1, -1];
    //only one move to land except water or could eat the animal
    function landMove(board: Board, turn: number, posBeforeMove: BoardDelta, animalRank: number): BoardDelta[]{
      var fourMove: BoardDelta[] = [];
      var up: BoardDelta = {row: posBeforeMove.row + 1, col: posBeforeMove.col};
      var down: BoardDelta = {row: posBeforeMove.row - 1, col: posBeforeMove.col};
      var left: BoardDelta = {row: posBeforeMove.row, col: posBeforeMove.col - 1};
      var right: BoardDelta = {row: posBeforeMove.row, col: posBeforeMove.col + 1};
      fourMove.push(up);
      fourMove.push(down);
      fourMove.push(left);
      fourMove.push(right);
      
      var nextValidMove: BoardDelta[] = [];
      for(let cell of fourMove){
        if(!isRiver(cell) && !isOutOfBound(cell) && (board[cell.row][cell.col] === 'G' || isHome(cell) || isTrap(cell)
            || canEat(board, turn, animalRank))){
          nextValidMove.push(cell);
        }
      }   
    }


    function canEat(board: Board, turn: number, currentAnimalRank: number, target: BoardDelta){
      
    }
















  }




  










