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
 * Water: W
 * Grass: G
 * Trap: RT(red animals' trap), BT(blue animals' trap)
 * Home: RH(red animals' home), BH(blue animals' home)
 * 
 * The initial state is 
 *    
 * 0 [[Rlion, G, RT, RH, RT, G, Rtiger],
 * 1 [G, Rdog, G, RT, G, Rcat, G],
 * 2 [Rmouse, G, Rcheetah, G, Rwolf, G Relephant],
 * 3 [G, W, W, G, W, W, G],
 * 4 [G, W, W, G, W, W, G],
 * 5 [G, W, W, G, W, W, G],
 * 6 [Belephant, G, Bwolf, G, Bcheetah, G, Bmouse],
 * 7 [G, Bcat, G, BT, G, Bdog, G],
 * 8 [Btiger, G, BT, BH, BT, G, Blion]]
 * 
 * Win Codintion (e.g. Red win, Blue fails), satisfy any one of the following
 * 1. none of blue alive.
 * 2. any piece of red animals is in the BH (blue animals' home).
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

  export const Water: BoardDelta[] = [{ row: 3, col: 1 }, { row: 3, col: 2 },
  { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 4, col: 1 }, { row: 4, col: 2 },
  { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 5, col: 1 }, { row: 5, col: 2 },
  { row: 5, col: 4 }, { row: 5, col: 5 }];
  export const Rhome: BoardDelta = { row: 0, col: 3 };
  export const Bhome: BoardDelta = { row: 8, col: 3 };


  /** Returns the initial Jungle board, which is a ROWSxCOLS matrix 9*7. */
  export function getInitialBoard(): Board {
    let board: Board = [
      ['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']];
    return board;
  }

  export function getInitialState(): IState {
    return { board: getInitialBoard(), delta: null };
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

    // get the board before the move and copy it as the boardAfterMove
    let board: Board = stateBeforeMove.board;
    let boardAfterMove = angular.copy(board);
    // define the coordinate before and after move
    let coordinate: BoardDelta = { row: row, col: col };
    let pre_coordinate: BoardDelta = { row: pre_row, col: pre_col };
    // define the winner string, end scores, and turnindex;
    let winner: string = '';
    let endMatchScores: number[];
    let turnIndex: number;

    // if the move is illegal, then throw an error
    // let pair: BoardDelta = canMove(board, row, col, pre_row, pre_col, turnIndexBeforeMove);
    let fourPairs: BoardDelta[] = possibleMove(board, pre_row, pre_col, turnIndexBeforeMove);
    // while (fourPairs !== []) {
    //   let pair: BoardDelta = fourPairs.pop();
    //   if (pair.row === row && pair.col === col) {
    //     foundPossibleMove = true;
    //     break;
    //   }
    // }
    let foundPossibleMove: boolean = false;
    for(let pair of fourPairs){
      if(pair.row === row && pair.col === col){
        foundPossibleMove = true;
        break;
      }
    }
    if (!foundPossibleMove) {
      throw new Error("Invalid move!");
    }
    // if the move is legal, define variables

    // deal with the move
    // the [row, col] position is replaced with the piece moved in this round
    boardAfterMove[row][col] = board[pre_row][pre_col];
    if (isOppentHome(turnIndexBeforeMove, coordinate)) {
      // win!!!
      winner = boardAfterMove[row][col].substring(0, 1);
    }
    // the [pre_row, pre_col] position resumes it's original status
    if (isWater(pre_coordinate)) {
      boardAfterMove[pre_row][pre_col] = 'W';
    }
    else if (isBlueTrap(pre_coordinate)) {
      boardAfterMove[pre_row][pre_col] = 'BT';
    }
    else if (isRedTrap(pre_coordinate)) {
      boardAfterMove[pre_row][pre_col] = 'RT';
    }
    else {
      boardAfterMove[pre_row][pre_col] = 'G';
    }

    // check whether the opponent's animals are all eaten, 0 is B, 1 is R
    let pieceCount = 0;
    let oppentColor = turnIndexBeforeMove === 0 ? 'R' : 'B';
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (boardAfterMove[i][j].substring(0, 1) === oppentColor) {
          pieceCount++;
        }
      }
    }
    // if it is true, then win
    if (pieceCount === 0) {
      winner = boardAfterMove[row][col].substring(0, 1);
    }

    // whether the game ends or not
    if (winner !== '' || isTie(boardAfterMove)) {
      // Gameover
      turnIndex = -1;
      endMatchScores = winner === 'B' ? [1, 0] : winner === 'R' ? [0, 1] : [0, 0];
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      turnIndex = 1 - turnIndexBeforeMove;
      endMatchScores = null;
    }
    let delta: BoardDelta = { row: row, col: col };
    let state: IState = { delta: delta, board: boardAfterMove };
    return { endMatchScores: endMatchScores, turnIndex: turnIndex, state: state };
  }

  export function createInitialMove(): IMove {
    return {
      endMatchScores: null, turnIndex: 0,
      state: getInitialState()
    };
  }

  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null, 0, 0, 0, 0, 0);
    log.log("move=", move);
  }

  /**
  * judge of next move is out of the gameboard
  */
  function isOutOfBound(boardDelta: BoardDelta): boolean {
    if (boardDelta.row < 0 || boardDelta.row >= ROWS || boardDelta.col < 0 || boardDelta.col >= COLS) {
      return true;
    }
    return false;
  }

  /**
  * get the rank of animals
  */
  function getRank(animal: string): number {
    switch (animal) {
      case 'mouse': return 0;
      case 'cat': return 1;
      case 'dog': return 2;
      case 'wolf': return 3;
      case 'cheetah': return 4;
      case 'tiger': return 5;
      case 'lion': return 6;
      case 'elephant': return 7;
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

    function possibleMove(board: Board, pre_row: number, pre_col: number, turnIndex: number): BoardDelta[]{    
        var fourMove: BoardDelta[] = [];
        var up: BoardDelta = {row: pre_row - 1, col: pre_col};
        var down: BoardDelta = {row: pre_row + 1, col: pre_col};
        var left: BoardDelta = {row: pre_row, col: pre_col - 1};
        var right: BoardDelta = {row: pre_row, col: pre_col + 1};
       
       var pos_up: BoardDelta = canMove(board, up.row, up.col, pre_row, pre_col,turnIndex);
       var pos_down: BoardDelta = canMove(board, down.row, down.col, pre_row, pre_col, turnIndex);
       var pos_left: BoardDelta = canMove(board, left.row, left.col, pre_row, pre_col, turnIndex);
       var pos_right: BoardDelta = canMove(board, right.row, right.col, pre_row, pre_col, turnIndex);
        
        if(pos_up.row !== -1 && pos_up.col !== -1){
          fourMove.push(pos_up);
        }
        if(pos_down.row !== -1 && pos_down.col !== -1){
          fourMove.push(pos_down);
        }
        if(pos_left.row !== -1 && pos_left.col !== -1){
          fourMove.push(pos_left);
        }
        if(pos_right.row !== -1 && pos_right.col !== -1){
          fourMove.push(pos_right);
        }
        return fourMove;
  }

  export function isPossibleMove(stateBeforeMove: IState, pre_row: number, pre_col: number, row:number, col:number, turnIndex: number): boolean {  
       let board: Board = stateBeforeMove.board;
       let fourPairs: BoardDelta[] = possibleMove(board, pre_row, pre_col, turnIndex);
      //  while (fourPairs !== []) {
      //    let pair: BoardDelta = fourPairs.pop();
      //     if (pair.row === row && pair.col === col) {
      //       return true;
      //     }
      //  }
       for(let pair of fourPairs){
         if(pair.row === row && pair.col === col){
           return true;
         }
       }
       return false;
  }

    /* given the coordinate of surrounding coordinate to decide if can move, return the coordinate after move */
   function canMove(board: Board, row: number, col: number, pre_row: number, pre_col: number, turnIndex: number): BoardDelta {
      let destination: BoardDelta = {row: -1, col: -1};

      //if currentChosen piece is not the turnIndex's color. 
      let currentColor = getTurn(turnIndex);
      if(board[pre_row][pre_col].substring(0,1) !== currentColor){
        return destination;
      }

      //if currentChosen piece is not animal (trap, home, water, grass, invalid)
        if(board[pre_row][pre_col].substring(1) === 'T' || board[pre_row][pre_col].substring(1) === 'H' || board[pre_row][pre_col] === 'G' || board[pre_row][pre_col] === 'W') {
          return destination;
      }
      

      //if the destination is out of bound
      if(isOutOfBound({row: row, col: col})) return destination;
  

      //if the destination is river cell
      let possibleMove: BoardDelta = {row: row, col: col};
      
      if(isWater(possibleMove)){
        // //any other animals except mouse, tiger and lion meet the water, can't move. 
        // if(board[pre_row][pre_col].substring(1) !== 'mouse' && board[pre_row][pre_col].substring(1) !== 'tiger' && board[pre_row][pre_col].substring(1) !== 'lion'){
        //   return destination;
        // }
        //if the animal is mouse, could move one step.
        if(board[pre_row][pre_col].substring(1) === 'mouse'){
          destination.row = row;
          destination.col = col;
          return destination;
        }
        //if the animal is tiger or lion. They could jump through the river, calculate the newRow and newCol=
        else if(board[pre_row][pre_col].substring(1) === 'tiger' || board[pre_row][pre_col].substring(1) === 'lion'){
         
          //if there is mouse in the river, can't move (any mouse in the horizental line or vertical line)
          // if move up and there is a mouse in between 
          if(pre_row - row === 1){
            if(board[pre_row-1][col].substring(1) === 'mouse' || board[pre_row-2][col].substring(1) === 'mouse' ||  board[pre_row-3][col].substring(1) === 'mouse'){
            return destination;
           }
          }

          //if move down and there is a mouse in between 
           if(row - pre_row === 1){
            if(board[pre_row+1][col].substring(1) === 'mouse' || board[pre_row+2][col].substring(1) === 'mouse' ||  board[pre_row+3][col].substring(1) === 'mouse'){
            return destination;
           }
          }
           // if move right and there is a mouse in between 
           if(col - pre_col === 1){
            if(board[row][pre_col+1].substring(1) === 'mouse' || board[row][pre_col+2].substring(1) === 'mouse'){
            return destination;
            }
           }

           // if move left and there is a mouse in between 
           if(pre_col - col === 1){
            if(board[row][pre_col-1].substring(1) === 'mouse' || board[row][pre_col-2].substring(1) === 'mouse'){
            return destination;
            }
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
            newRow = row - 3 * (pre_row - row);
            newCol = col;
          }
          
          //if the land after river is 'G', can move
          if(board[newRow][newCol] === 'G'){
            destination.row = newRow;
            destination.col = newCol;
            return destination;
          }
          //fly over the river to see if can eat animals
          destination = canEat(board, turnIndex, pre_row, pre_col, newRow, newCol);
          return destination;
        } 
        else{
          return destination;
        }      
      }

     // let possibleDestination: BoardDelta = {row: row, col: col};
      

      if(isTrap({row, col})){
        //if it's opponent trap
        if(isOppentTrap(turnIndex, {row, col})){
          //if it is a trap and no animal in it.
          if(board[row][col].substring(1) === 'T'){
            destination.row = row;
            destination.col = col;
            return destination;
          }
          else{
            destination = canEat(board, turnIndex, pre_row, pre_col, row, col);
            return destination;
          }
        }
          //
        if(isOwnTrap(turnIndex, {row,col})){
          //if it is a trap and no animal in it.
          if(board[row][col].substring(1) === 'T'){
            destination.row = row;
            destination.col = col;
            return destination;
          }
          //has animal in the trap
          else{
           let curColor = getTurn(turnIndex);
           //if the animal of the same color
           if(board[row][col].substring(0,1) === curColor){
            return destination;
           }
           else{
             //if any opponent's animal in it, can eat
             destination.row = row;
             destination.col = col;
             return destination;
           }
          }
         }

      }

      if(isHome({row,col})){
        let curColor = getTurn(turnIndex);
       //if it's own home
        if(board[row][col].substring(0,1) === curColor){
          return destination;
        }
        // if it's opponent's home
        else{
          destination.row = row;
          destination.col = col;
          return destination;
        }
      }


      //land with animal on it
      if(board[row][col] !== 'G'){
        return canEat(board, turnIndex, pre_row, pre_col, row, col);
      }
      //land with no animal on it
      else{
        destination.row = row;
        destination.col = col;
        return destination;
      }
}

  /**
  * get turn index, 0 is blue animals' turn and 1 is read animals' turn.
  */
  export function getTurn(turn: number): string {
    return (turn === 0 ? 'B' : 'R');
  }
  
  /* can eat opponent' lower or same rank animals. */
  function canEat(board: Board, turnIndex: number, pre_row: number, pre_col: number, pos_row: number, pos_col: number): BoardDelta{
    let destination: BoardDelta = {row: -1, col: -1};
    let currentPosition: BoardDelta = {row: pre_row, col: pre_col};

    let curColor = getTurn(turnIndex);
    let curAnimal = board[pre_row][pre_col];
    
    // if two animals are on the different kinds of place, they can't eat the other.  
    if( isWater(destination) !== isWater(currentPosition) ){
      return destination;
    }
    
     // 1. if it is an animal of same color, can't move
     if(board[pos_row][pos_col].substring(0,1) === curColor){
       return destination;
     }
   
     // 2. if it is an animal of different color 
     if(board[pos_row][pos_col].substring(0,1) !== curColor){
       let facedAnimal = board[pos_row][pos_col];
       //if it has lower or same rank, or curAnimal is mouse while oppenent's animal is elephant, can eat
       if( (( getRank(curAnimal.substring(1)) >= getRank(facedAnimal.substring(1)) ) && (!(curAnimal.substring(1) === 'elephant' && facedAnimal.substring(1) === 'mouse') ))  ||
            (curAnimal.substring(1) === 'mouse' && facedAnimal.substring(1) === 'elephant') ){
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

  function isWater(coordinate: BoardDelta): boolean {
    for (let pos of Water) {
      if (angular.equals(pos, coordinate)) {
        return true;
      }
    }
    return false;
  }


  function isOppentHome(turn: number, coordinate: BoardDelta): boolean {
    //blue animals' turn
    if (turn === 0 && angular.equals(coordinate, Rhome)) {
      return true;
    }
    //read animals' turn
    if (turn === 1 && angular.equals(coordinate, Bhome)) {
      return true;
    }
    return false;
  }

  function isOppentTrap(turn: number, coordinate: BoardDelta): boolean {
    //blue animals' turn
    if (turn === 0) {
      for (let pos of RedTrap) {
        if (angular.equals(coordinate, pos)) {
          return true;
        }
      }
    }
    if (turn === 1) {
      for (let pos of BlueTrap) {
        if (angular.equals(coordinate, pos)) {
          return true;
        }
      }
    }
    return false;
  }

  function isBlueTrap(coordinate: BoardDelta): boolean {
    for (let pos of BlueTrap) {
      if (angular.equals(pos, coordinate)) {
        return true;
      }
    }
    return false;
  }

  function isRedTrap(coordinate: BoardDelta): boolean {
    for (let pos of RedTrap) {
      if (angular.equals(pos, coordinate)) {
        return true;
      }
    }
    return false;
  }


  export function checkAnimal(stateBeforeMove: IState, row: number, col: number) : string {
     if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
     }
    let board: Board = stateBeforeMove.board;
    let cell: string = board[row][col];
    switch (cell) {
      case "Relephant": return 'img/Relephant.png';
      case "Rlion": return 'img/Rlion.png';
      case "Rtiger": return 'img/Rtiger.png';
      case "Rcheetah": return 'img/Rcheetah.png';
      case "Rwolf": return 'img/Rwolf.png';
      case "Rdog": return 'img/Rdog.png';
      case "Rcat": return 'img/Rcat.png';
      case "Rmouse": return 'img/Rmouse.png';
      case "Belephant": return 'img/Belephant.png';
      case "Blion": return 'img/Blion.png';
      case "Btiger": return 'img/Btiger.png';
      case "Bcheetah": return 'img/Bcheetah.png';
      case "Bwolf": return 'img/Bwolf.png';
      case "Bdog": return 'img/Bdog.png';
      case "Bcat": return 'img/Bcat.png';
      case "Bmouse": return 'img/Bmouse.png';
      default: return null;
    }
  }
  
}