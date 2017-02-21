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


  /** Returns the initial Jungle board, which is a ROWSxCOLS matrix 9*7. */
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
      stateBeforeMove: IState, row: number, col: number, 
      pre_row: number, pre_col: number, turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }
    // get the board before the move and copy it as the boardAfterMove
    let board: Board = stateBeforeMove.board;
    let boardAfterMove = angular.copy(board);
    let coordinate: BoardDelta = {row: row, col: col};
    let pre_coordinate: BoardDelta = {row: pre_row, col: pre_col};

    // if the move is illegal
    let pair: BoardDelta = canMove(board, row, col, pre_row, pre_col, turnIndexBeforeMove);
    if (pair === {row: -1, col: -1}) {
      throw new Error("Invalid move!");
    }
    // if the move is legal
    // the [row, col] position is replaced with the piece moved in this round
    boardAfterMove[row][col] = board[pre_row][pre_col];
    if (isOppentTrap(turnIndexBeforeMove, coordinate)) {
      // rank becomes -1;
    }
    if (isOppentHome(turnIndexBeforeMove, coordinate)) {
      // win
    }
    // the [pre_row, pre_col] position resumes it's original status
    if (isBlueTrap(pre_coordinate)) {
      boardAfterMove[pre_row][pre_col] = 'BT';
      if (isOppentTrap(turnIndexBeforeMove, pre_coordinate)) {
        // resume it's rank
      }
    }
    if (isRedTrap(pre_coordinate)) {
      boardAfterMove[pre_row][pre_col] = 'RT';
      if (isOppentTrap(turnIndexBeforeMove, pre_coordinate)) {
        // resume it's rank
      }
    }

    // not done - 20170221 1:10am

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
    var move = gameLogic.createMove(null, 0, 0, 0, 0, 0);
    log.log("move=", move);
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


    function isTrap(coordinate: BoardDelta): boolean{
      return isBlueTrap(coordinate) || isRedTrap(coordinate);  
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
        // if(!isRiver(cell) && !isOutOfBound(cell) && (board[cell.row][cell.col] === 'G' || isHome(cell) || isTrap(cell)
        //     || canEat(board, turn, animalRank))){
        //   nextValidMove.push(cell);
        // }
      }  

      // just to eliminate the error message
      let returnboard: BoardDelta[];
      return returnboard; 
    }







    /* given the coordinate of surrounding coordinate to decide if can move, return the coordinate after move */
   function canMove(board: Board, row: number, col: number, pre_row: number, pre_col: number, turnIndex: number): BoardDelta {
      let destination: BoardDelta = {row: -1, col: -1};
      //if the destination is out of bound
      if(isOutOfBound(row,col)) return destination;
  
      //if the destination is river cell
      var possibleMove: BoardDelta = {row: row, col: col};
      if(isRiver(possibleMove)){
        //if the animal is mouse, could move one step.
        if(board[pre_row][pre_col].substring(1) === 'mouse'){
          destination.row = row;
          destination.col = col;
          return destination;
        }
        //if the animal is tiger or lion. They could jump through the river, calculate the newRow and newCol
        if(board[pre_row][pre_col].substring(1) === 'tiger' || board[pre_row][pre_col].substring(1) === 'lion'){
        //if there is mouse in the river, can't move
          if(board[row][col].substring(1) === 'mouse'){
            return destination;
          }
          let newRow = -1, newCol = -1;
          //move horizontally
          if(Math.abs(col - pre_col) != 0){
            newRow = row;
            //positive moves right, negative moves left
            newCol = col + 2 * (col - pre_col); 
          }
          //move vertivally
          if(Math.abs(row - pre_row) != 0){
            //positive move up, negative moves down.
            newRow = row - (pre_row - row);
            newCol = col;
          }
          
          //if the land after river is 'G', can move
          if(board[newRow][newCol] === 'G'){
            destination.row = newRow;
            destination.col = newCol;
            return destination;
          }
          //fly over the river to see if can eat animals
          destination = canEat(board, turnIndex, pre_col, pre_col, newRow, newCol);
          return destination;
        }       
      }

      let possibleDestination: BoardDelta = {row: row, col: col};
      
      //if it is a trap and no animal in it.
      if(board[row][col].substring(1) === 'T'){
        destination.row = row;
        destination.col = col;
        return destination;
      }

      //if it's opponent's trap and have animal in it.
      if(isOppentTrap(turnIndex, possibleDestination) && board[row][col].substring(1) !== 'T'){
        return canEat(board, turnIndex, pre_row, pre_col, row, col);   
      }
      //if it's own trap and have animal in it.
      if(isOwnTrap(turnIndex, possibleDestination) && board[row][col].substring(1) !== 'T'){       
      // 1. if it is an animal of same color, can't move
      let curColor = getTurn(turnIndex);
      if(board[row][col].substring(0,1) === curColor){
       return destination;
      }
      // 2. if it is an animal of different color in trap, can move and eat.
      if(board[row][col].substring(0,1) !== curColor){
        destination.row = row;
        destination.col = col;
        return destination;
       }
      }

      //if it is a land and no animal in it.
      if(board[row][col] === 'G'){
        destination.row = row;
        destination.col = col;
        return destination;
      }
      //if it is a land and have animal in it
      return canEat(board, turnIndex, pre_row, pre_col, row, col);   
}


  /* coordinate out of bound. */
  function isOutOfBound(row: number, col: number): boolean{
    if(row < 0 || row >= ROWS || col < 0 || col >= COLS){
      return true;
    }
    return false;
  }

  function isRiver(coordinate: BoardDelta): boolean{
      for(let pos of River){
      if(pos.row === coordinate.row && pos.col === coordinate.col) {
        return true;
      }
      }
      return false;
  }


  /* get turn index, 0 is blue animals' turn and 1 is read animals'turn. */ 
  export function getTurn(turn: number): string{
    return (turn === 0 ? 'B' : 'R');
  }
  
  /* can eat opponent' lower or same rank animals. */
  function canEat(board: Board, turnIndex: number, pre_row: number, pre_col: number, pos_row: number, pos_col: number): BoardDelta{
    let destination: BoardDelta = {row: -1, col: -1};
    let curColor = getTurn(turnIndex);
    let curAnimal = board[pre_row][pre_col];
    
     // 1. if it is an animal of same color, can't move
     if(board[pos_row][pos_col].substring(0,1) === curColor){
       return destination;
     }
   
     // 2. if it is an animal of different color 
     if(board[pos_row][pos_col].substring(0,1) !== curColor){
       let facedAnimal = board[pos_row][pos_col];
       //if it has lower or same rank, or curAnimal is mouse while oppenen's animal is elephant, can eat
       if(getRank(curAnimal.substring(1)) >= getRank(facedAnimal.substring(1))||
            (curAnimal.substring(1) === 'mouse' && board[pos_row][pos_col].substring(1) === 'elephant')){
         destination.row = pos_row;
         destination.col = pos_col;
         return destination;
       }
       //if it has higher rank, can't move.
       else{
         return destination;
       }
     }
 
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

    function isBlueTrap(coordinate: BoardDelta): boolean{
      for(let pos of BlueTrap){
        if(angular.equals(pos, coordinate)){
          return true;
        }
      }
      return false;  
    }

    function isRedTrap(coordinate: BoardDelta): boolean{
      for(let pos of RedTrap){
        if(angular.equals(pos, coordinate)){
          return true;
        }
      }
      return false;  
    }









  }






  










