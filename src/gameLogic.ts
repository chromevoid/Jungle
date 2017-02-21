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
    let board: Board =  [
      ['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'RTiger'],
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
   * Returns true if the game ended in a tie. To do.
   */
  function isTie(board: Board): boolean {
     return false;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(
      stateBeforeMove: IState, row: number, col: number, 
      pre_row: number, pre_col: number, turnIndexBeforeMove: number): IMove {

    // if there is no game status, then create a new game
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }

    // if the move is illegal, then throw an error
    let pair: [number, number] = canMove(row, col, pre_row, pre_col);
    if (pair === [-1, -1]) {
      throw new Error("Invalid move!");
    }
    
    // if the move is legal, define variables
    // get the board before the move and copy it as the boardAfterMove
    let board: Board = stateBeforeMove.board;
    let boardAfterMove = angular.copy(board);
    // define the coordinate before and after move
    let coordinate: BoardDelta = {row: row, col: col};
    let pre_coordinate: BoardDelta = {row: pre_row, col: pre_col};
    // define the winner string, end scores, and turnindex;
    let winner: string = '';
    let endMatchScores: number[];
    let turnIndex: number;

    // deal with the move
    // the [row, col] position is replaced with the piece moved in this round
    boardAfterMove[row][col] = board[pre_row][pre_col];
    if (isOppentTrap(turnIndexBeforeMove, coordinate)) {
      // rank becomes -1;
    }
    if (isOppentHome(turnIndexBeforeMove, coordinate)) {
      // win!!!
      winner = boardAfterMove[row][col].substring(0, 1);
      turnIndex = -1;
      endMatchScores = winner === 'B' ? [1, 0] : winner === 'R' ? [0, 1] : [0, 0];
    }
    // the [pre_row, pre_col] position resumes it's original status
    if (isRiver(pre_coordinate)) {
      boardAfterMove[pre_row][pre_col] = 'R';
    }
    else if (isBlueTrap(pre_coordinate)) {
      boardAfterMove[pre_row][pre_col] = 'BT';
      if (isOppentTrap(turnIndexBeforeMove, pre_coordinate)) {
        // resume it's rank
      }
    }
    else if (isRedTrap(pre_coordinate)) {
      boardAfterMove[pre_row][pre_col] = 'RT';
      if (isOppentTrap(turnIndexBeforeMove, pre_coordinate)) {
        // resume it's rank
      }
    }
    else {
      boardAfterMove[pre_row][pre_col] = 'G';
    }

    if (winner !== '' || isTie(boardAfterMove)) {
      // Gameover
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


    function canEat(board: Board, turn: number, currentAnimalRank: number, target: BoardDelta){
      
    }

    // not implemented
    function canMove(row: number, col: number, pre_row: number, pre_col: number): [number, number] {
      return [-1, -1];
    }
















  }




  










