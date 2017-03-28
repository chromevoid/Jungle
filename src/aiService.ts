module aiService {
  /** Returns the move that the computer player should do for the given state in move. */
  export function findComputerMove(move: IMove): IMove {
    return createComputerMove(move,
        // at most 1 second for the AI to choose a move (but might be much quicker)
        {millisecondsLimit: 2000});
  }

  /**
   * Returns all the possible moves for the given state and turnIndexBeforeMove.
   * Returns an empty array if the game is over.
   */
  //change the ai service to choose one possible move from one of the possible moves. 
  export function getPossibleMoves(state: IState, turnIndexBeforeMove: number): IMove[] {
    let possibleMoves: IMove[] = [];
    for (let i = 0; i < gameLogic.ROWS; i++) {
      for (let j = 0; j < gameLogic.COLS; j++) {
        try {
          let pair : BoardDelta = {row: i, col: j};
          let currentColor = turnIndexBeforeMove== 0 ? 'B' : 'R';
          if(state.board[i][j].substring(0,1) == currentColor &&  state.board[i][j].substring(1) !== 'H' && state.board[i][j].substring(1) !== 'T'){
            let possibleNext : BoardDelta[] = gameLogic.possibleMove(state.board, i, j, turnIndexBeforeMove);
            for(let eachMove of possibleNext){
                possibleMoves.push(gameLogic.createMove(state, eachMove.row, eachMove.col, i, j, turnIndexBeforeMove));
            }
          }
        } catch (e) {
          // The cell in that position was full.
        }
      }
    }
    return possibleMoves;
  }

  /**
   * Returns the move that the computer player should do for the given state.
   * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
   * and it has either a millisecondsLimit or maxDepth field:
   * millisecondsLimit is a time limit, and maxDepth is a depth limit.
   */
  export function createComputerMove(
      move: IMove, alphaBetaLimits: IAlphaBetaLimits): IMove {
    // We use alpha-beta search, where the search states are TicTacToe moves.
    return alphaBetaService.alphaBetaDecision(
        move, move.turnIndex, getNextStates, getStateScoreForIndex0, null, alphaBetaLimits);
  }
//gibberish: playIndex is machine's turn
  function getStateScoreForIndex0(move: IMove, playerIndex: number): number {
    let endMatchScores = move.endMatchScores; //gibberish: endMatchScore is after machine's move,
    //if one is going to win.
    if (endMatchScores) {
      return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
          : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
          : 0;
    }

    let valueSum = 0;
    //first calculate current state.
    for(let i = 0; i < gameLogic.ROWS; i++){
      for(let j = 0; j < gameLogic.COLS; j++){
        let state = move.state;
        let board = state.board;
        let currentColor = gameLogic.getTurn(playerIndex);
        if(board[i][j].substring(0,1) === currentColor && board[i][j].substring(1) !== 'H' && board[i][j].substring(1) !== 'T'){
          valueSum = calculateScoreSum(board, i, j, playerIndex) + valueSum;
        }
      }
    }
    return valueSum;
  }


  function calculateScoreSum(board: Board, row: number, col: number, playIndex: number) : number{
    let sum = closeToOpponentHome(board, row, col, playIndex) +
              closeToOpponentAnimal(board, row, col, playIndex) + waterAnimalCloseToWater(board, row, col, playIndex) + 
              landAnimalCloseToGrassOrHome(board, row, col, playIndex);


    return sum;

  }
  var dx = [0,0,1,-1];
  var dy = [1,-1,0,0];

function isOutOfBound( row: number, col: number) : boolean {
   if (row < 0 || row >= gameLogic.ROWS || col < 0 || col >= gameLogic.COLS) {
      return true;
    }
    return false;

}

//give 200 points to get close to opponent's home.
  function closeToOpponentHome(board: Board, row: number, col: number, playerIndex: number) : number {
    let sum = 0;
    let opponentColor = gameLogic.getTurn(1 - playerIndex);
    for(let i = 0; i < 4; i++){
      for(let j = 0; j < 4; j++){
        let x = row + dx[i];
        let y = col + dy[j];
        if(!isOutOfBound(x,y)){
          if(board[x][y] === opponentColor + 'H'){
            sum = sum + 200;
          }
        }
      }
    }
    return sum;
  }

  //give this 10 points to get close to opponent's trap
  function closeToOpponentTrap(board: Board, row: number, col: number, playerIndex: number): number {
    let sum = 0;
    let opponentColor = gameLogic.getTurn(1 - playerIndex);
    for(let i = 0; i < 4; i++){
      for(let j = 0; j < 4; j++){
        let x = row + dx[i];
        let y = col + dy[j];
        if(!isOutOfBound(x,y)){
          if(board[x][y] === opponentColor + 'T'){
            sum = sum + 10;
          }
        }
      }
    }
    return sum;
  }

  //give this 100 points (might eat animal) and 5 points (might be eaten)
  function closeToOpponentAnimal(board: Board, row: number, col: number, playerIndex: number): number {
    let sum = 0;
    let opponentColor = gameLogic.getTurn(1 - playerIndex);
    for(let i = 0; i < 4; i++){
      for(let j = 0; j < 4; j++){
        let x = row + dx[i];
        let y = col + dy[j];
        if(!isOutOfBound(x,y)){
          if(board[x][y] === opponentColor && board[x][y].substring(1) !== 'H' && board[x][y].substring(1) !== 'T'){
            if(gameLogic.getRank(board[row][col].substring(1)) > gameLogic.getRank(board[x][y].substring(1))){
              sum = sum + 50; //can eat.
            }
            if(gameLogic.getRank(board[row][col].substring(1)) <= gameLogic.getRank(board[x][y].substring(1))){
              sum = sum + 5; //might be eaten.
            }
          }
        }
      }
    }
    return sum;
  }

  //give this 5 points
  function landAnimalCloseToWater(board: Board, row: number, col: number, playerIndex: number): number {
    let currentAnimalType = board[row][col].substring(1);
    let sum = 0;
    if(currentAnimalType !== 'mouse' && currentAnimalType !== 'tiger' && currentAnimalType !== 'lion'){
      for(let i = 0; i < 4; i++){
        for(let j = 0; j < 4; j++){
          let x = row + dx[i];
          let y = col + dy[j];
          if(!isOutOfBound(x,y)){
            if(board[x][y] === 'W'){
              sum = sum + 5;
            }
          }
        }
      }
    }
    return sum;
  }
  
  //give this 30 points who could get into Water or jump across the water
  function waterAnimalCloseToWater(board: Board, row: number, col: number, playerIndex: number): number {
    let currentAnimalType = board[row][col].substring(1);
    let sum = 0;
    if(currentAnimalType === 'mouse' || currentAnimalType === 'tiger' || currentAnimalType === 'lion'){
      for(let i = 0; i < 4; i++){
        for(let j = 0; j < 4; j++){
          let x = row + dx[i];
          let y = col + dy[j];
          if(!isOutOfBound(x,y)){
            if(board[x][y] === 'W'){
              sum = sum + 30;
            }
          }
        }
      }
    }
    return sum;
  }

    
  //give this 5 points (close to home and could protect home), give 30 points to normal grass
  function landAnimalCloseToGrassOrHome(board: Board, row: number, col: number, playerIndex: number): number {
    let sum = 0;
    let currentColor = gameLogic.getTurn(playerIndex);
    let opponentColor = gameLogic.getTurn(1 - playerIndex);
    for(let i = 0; i < 4; i++){
      for(let j = 0; j < 4; j++){
        let x = row + dx[i];
        let y = col + dy[j];
        if(!isOutOfBound(x,y)){
          if(board[x][y] === currentColor + 'H'){
              sum = sum + 5; //probably could protect own home.
          }
          if(board[x][y] === 'G'){
              sum = sum + 30; //normal move
          }
        }
      }
    }
    return sum;
  }
  
  function getNextStates(move: IMove, playerIndex: number): IMove[] {
    return getPossibleMoves(move.state, playerIndex);
  }



}
