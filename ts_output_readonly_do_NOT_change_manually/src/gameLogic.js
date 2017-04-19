var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 9;
    gameLogic.COLS = 7;
    //declare global variable to record round
    var round = 0;
    var aliveAnimal = 16;
    gameLogic.tieRule = 15;
    // special cells in the game board
    gameLogic.BlueTrap = [{ row: 8, col: 2 }, { row: 7, col: 3 }, { row: 8, col: 4 }];
    gameLogic.RedTrap = [{ row: 0, col: 2 }, { row: 1, col: 3 }, { row: 0, col: 4 }];
    gameLogic.Water = [{ row: 3, col: 1 }, { row: 3, col: 2 },
        { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 4, col: 1 }, { row: 4, col: 2 },
        { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 5, col: 1 }, { row: 5, col: 2 },
        { row: 5, col: 4 }, { row: 5, col: 5 }];
    gameLogic.Rhome = { row: 0, col: 3 };
    gameLogic.Bhome = { row: 8, col: 3 };
    /** Returns the initial Jungle board, which is a ROWSxCOLS matrix 9*7. */
    function getInitialBoard() {
        var board = [
            ['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
            ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
            ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
            ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
            ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']
        ];
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function getInitialState() {
        return { board: getInitialBoard(), boardBefore: null, fromDelta: null, toDelta: null };
    }
    gameLogic.getInitialState = getInitialState;
    //Returns true if the game ended in a tie. 
    function isTie(turnIndexAfterMove, boardAfterMove) {
        var currentAliveAnimal = 0;
        if (turnIndexAfterMove === 0) {
            for (var i = 0; i < gameLogic.ROWS; i++) {
                for (var j = 0; j < gameLogic.COLS; j++) {
                    if (boardAfterMove[i][j].length >= 2 && boardAfterMove[i][j].substring(1) !== 'H' && boardAfterMove[i][j].substring(1) !== 'T') {
                        currentAliveAnimal++;
                    }
                }
            }
            if (currentAliveAnimal === aliveAnimal) {
                round++;
            }
            else {
                round = 0; //reset the recorded round to 0.
            }
        }
        if (round >= gameLogic.tieRule) {
            console.log("Game round has exceeded " + gameLogic.tieRule + " rounds, so tired ,then tie!");
        }
        return round >= gameLogic.tieRule; //to-do: this to be considered.
    }
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col.
     */
    function createMove(stateBeforeMove, row, col, pre_row, pre_col, turnIndexBeforeMove) {
        // if there is no game status, then create a new game
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        // get the board before the move and copy it as the boardAfterMove
        var board = stateBeforeMove.board;
        var boardAfterMove = angular.copy(board);
        // define the coordinate before and after move
        var coordinate = { row: row, col: col };
        var pre_coordinate = { row: pre_row, col: pre_col };
        // define the winner string, end scores, and turnindex;
        var winner = '';
        var endMatchScores;
        var turnIndex;
        //if game has already ended, can't move.
        if (turnIndexBeforeMove === -1) {
            throw new Error("Game has ended, can't move!");
        }
        // if the move is illegal, then throw an error
        // let pair: BoardDelta = canMove(board, row, col, pre_row, pre_col, turnIndexBeforeMove);
        var fourPairs = possibleMove(board, pre_row, pre_col, turnIndexBeforeMove);
        var foundPossibleMove = false;
        for (var _i = 0, fourPairs_1 = fourPairs; _i < fourPairs_1.length; _i++) {
            var pair = fourPairs_1[_i];
            if (pair.row === row && pair.col === col) {
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
        var pieceCount = 0;
        var oppentColor = turnIndexBeforeMove === 0 ? 'R' : 'B';
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (boardAfterMove[i][j].substring(0, 1) === oppentColor && boardAfterMove[i][j].substring(1) !== 'H' && boardAfterMove[i][j].substring(1) !== 'T') {
                    pieceCount++;
                }
            }
        }
        if (pieceCount === 0) {
            winner = boardAfterMove[row][col].substring(0, 1);
        }
        //if current move makes opponent can't make any move, then the winner is current player.
        var nextTurnIndex = 1 - turnIndexBeforeMove;
        var opponentHasMoveChoice = HasMoveChoice(nextTurnIndex, boardAfterMove);
        if (!opponentHasMoveChoice) {
            winner = boardAfterMove[row][col].substring(0, 1);
        }
        // whether the game ends or not  //|| isTie(nextTurnIndex
        var isTieBoolean = false;
        isTieBoolean = isTie(nextTurnIndex, boardAfterMove);
        if (winner !== '' || isTieBoolean) {
            // Gameover
            console.log("here turnIndex is set to -1"); //used for debug
            turnIndex = -1;
            endMatchScores = winner === 'B' ? [1, 0] : winner === 'R' ? [0, 1] : [0, 0];
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            turnIndex = 1 - turnIndexBeforeMove;
            endMatchScores = null;
        }
        var fromDelta = { row: pre_row, col: pre_col };
        var toDelta = { row: row, col: col };
        var state = { fromDelta: fromDelta, toDelta: toDelta, board: boardAfterMove, boardBefore: board };
        return { endMatchScores: endMatchScores, turnIndex: turnIndex, state: state };
    }
    gameLogic.createMove = createMove;
    function createInitialMove() {
        return {
            endMatchScores: null, turnIndex: 0,
            state: getInitialState()
        };
    }
    gameLogic.createInitialMove = createInitialMove;
    function forSimpleTestHtml() {
        var move = gameLogic.createMove(null, 0, 0, 0, 0, 0);
        log.log("move=", move);
    }
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
    //to see if next player could find move steps.
    function HasMoveChoice(turnIndex, board) {
        var currentColor = getTurn(turnIndex);
        var foundMoveChoice = false;
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (board[i][j].substring(0, 1) === currentColor && board[i][j].substring(1) !== 'H' && board[i][j].substring(1) !== 'T') {
                    var possibleMoves = possibleMove(board, i, j, turnIndex);
                    if (possibleMoves.length > 0) {
                        foundMoveChoice = true;
                        break;
                    }
                }
            }
        }
        return foundMoveChoice;
    }
    //judge of next move is out of the gameboard
    function isOutOfBound(boardDelta) {
        if (boardDelta.row < 0 || boardDelta.row >= gameLogic.ROWS || boardDelta.col < 0 || boardDelta.col >= gameLogic.COLS) {
            return true;
        }
        return false;
    }
    //get the rank of animals
    function getRank(animal) {
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
    gameLogic.getRank = getRank;
    function isTrap(coordinate) {
        return isBlueTrap(coordinate) || isRedTrap(coordinate);
    }
    function isHome(coordinate) {
        if (angular.equals(coordinate, gameLogic.Rhome) || angular.equals(coordinate, gameLogic.Bhome)) {
            return true;
        }
    }
    function possibleMove(board, pre_row, pre_col, turnIndex) {
        var fourMove = [];
        var up = { row: pre_row - 1, col: pre_col };
        var down = { row: pre_row + 1, col: pre_col };
        var left = { row: pre_row, col: pre_col - 1 };
        var right = { row: pre_row, col: pre_col + 1 };
        var pos_up = canMove(board, up.row, up.col, pre_row, pre_col, turnIndex);
        var pos_down = canMove(board, down.row, down.col, pre_row, pre_col, turnIndex);
        var pos_left = canMove(board, left.row, left.col, pre_row, pre_col, turnIndex);
        var pos_right = canMove(board, right.row, right.col, pre_row, pre_col, turnIndex);
        if (pos_up.row !== -1 && pos_up.col !== -1) {
            fourMove.push(pos_up);
        }
        if (pos_down.row !== -1 && pos_down.col !== -1) {
            fourMove.push(pos_down);
        }
        if (pos_left.row !== -1 && pos_left.col !== -1) {
            fourMove.push(pos_left);
        }
        if (pos_right.row !== -1 && pos_right.col !== -1) {
            fourMove.push(pos_right);
        }
        return fourMove;
    }
    gameLogic.possibleMove = possibleMove;
    function isPossibleMove(stateBeforeMove, pre_row, pre_col, row, col, turnIndex) {
        var board = stateBeforeMove.board;
        var fourPairs = possibleMove(board, pre_row, pre_col, turnIndex);
        //  while (fourPairs !== []) {
        //    let pair: BoardDelta = fourPairs.pop();
        //     if (pair.row === row && pair.col === col) {
        //       return true;
        //     }
        //  }
        for (var _i = 0, fourPairs_2 = fourPairs; _i < fourPairs_2.length; _i++) {
            var pair = fourPairs_2[_i];
            if (pair.row === row && pair.col === col) {
                return true;
            }
        }
        return false;
    }
    gameLogic.isPossibleMove = isPossibleMove;
    /* given the coordinate of surrounding coordinate to decide if can move, return the coordinate after move */
    function canMove(board, row, col, pre_row, pre_col, turnIndex) {
        var destination = { row: -1, col: -1 };
        //if currentChosen piece is not the turnIndex's color. 
        var currentColor = getTurn(turnIndex);
        if (board[pre_row][pre_col].substring(0, 1) !== currentColor) {
            return destination;
        }
        //if currentChosen piece is not animal (trap, home, water, grass, invalid)
        if (board[pre_row][pre_col].substring(1) === 'T' || board[pre_row][pre_col].substring(1) === 'H' || board[pre_row][pre_col] === 'G' || board[pre_row][pre_col] === 'W') {
            return destination;
        }
        //if the destination is out of bound
        if (isOutOfBound({ row: row, col: col }))
            return destination;
        //if the destination is river cell
        var possibleMove = { row: row, col: col };
        if (isWater(possibleMove)) {
            // //any other animals except mouse, tiger and lion meet the water, can't move. 
            // if(board[pre_row][pre_col].substring(1) !== 'mouse' && board[pre_row][pre_col].substring(1) !== 'tiger' && board[pre_row][pre_col].substring(1) !== 'lion'){
            //   return destination;
            // }
            //if the animal is mouse, could move one step.
            if (board[pre_row][pre_col].substring(1) === 'mouse') {
                if (board[row][col].substring(1) === 'mouse' && isWater({ row: pre_row, col: pre_col }) || board[row][col] === 'W') {
                    destination.row = row;
                    destination.col = col;
                }
                else {
                    destination.row = -1;
                    destination.col = -1;
                }
                return destination;
            }
            else if (board[pre_row][pre_col].substring(1) === 'tiger' || board[pre_row][pre_col].substring(1) === 'lion') {
                //if there is mouse in the river, can't move (any mouse in the horizental line or vertical line)
                // if move up and there is a mouse in between 
                if (pre_row - row === 1) {
                    if (board[pre_row - 1][col].substring(1) === 'mouse' || board[pre_row - 2][col].substring(1) === 'mouse' || board[pre_row - 3][col].substring(1) === 'mouse') {
                        return destination;
                    }
                }
                //if move down and there is a mouse in between 
                if (row - pre_row === 1) {
                    if (board[pre_row + 1][col].substring(1) === 'mouse' || board[pre_row + 2][col].substring(1) === 'mouse' || board[pre_row + 3][col].substring(1) === 'mouse') {
                        return destination;
                    }
                }
                // if move right and there is a mouse in between 
                if (col - pre_col === 1) {
                    if (board[row][pre_col + 1].substring(1) === 'mouse' || board[row][pre_col + 2].substring(1) === 'mouse') {
                        return destination;
                    }
                }
                // if move left and there is a mouse in between 
                if (pre_col - col === 1) {
                    if (board[row][pre_col - 1].substring(1) === 'mouse' || board[row][pre_col - 2].substring(1) === 'mouse') {
                        return destination;
                    }
                }
                var newRow = -1, newCol = -1;
                //move horizontally
                if (Math.abs(col - pre_col) != 0) {
                    newRow = row;
                    //positive moves right, negative moves left
                    newCol = col + 2 * (col - pre_col);
                }
                //move vertivally
                if (Math.abs(row - pre_row) != 0) {
                    //positive move up, negative moves down.
                    newRow = row - 3 * (pre_row - row);
                    newCol = col;
                }
                //if the land after river is 'G', can move
                if (board[newRow][newCol] === 'G') {
                    destination.row = newRow;
                    destination.col = newCol;
                    return destination;
                }
                //fly over the river to see if can eat animals
                destination = canEat(board, turnIndex, pre_row, pre_col, newRow, newCol);
                return destination;
            }
            else {
                return destination;
            }
        }
        // let possibleDestination: BoardDelta = {row: row, col: col};
        if (isTrap({ row: row, col: col })) {
            //if it's opponent trap
            if (isOppentTrap(turnIndex, { row: row, col: col })) {
                //if it is a trap and no animal in it.
                if (board[row][col].substring(1) === 'T') {
                    destination.row = row;
                    destination.col = col;
                    return destination;
                }
                else {
                    destination = canEat(board, turnIndex, pre_row, pre_col, row, col);
                    return destination;
                }
            }
            //
            if (isOwnTrap(turnIndex, { row: row, col: col })) {
                //if it is a trap and no animal in it.
                if (board[row][col].substring(1) === 'T') {
                    destination.row = row;
                    destination.col = col;
                    return destination;
                }
                else {
                    var curColor = getTurn(turnIndex);
                    //if the animal of the same color
                    if (board[row][col].substring(0, 1) === curColor) {
                        return destination;
                    }
                    else {
                        //if any opponent's animal in it, can eat
                        destination.row = row;
                        destination.col = col;
                        return destination;
                    }
                }
            }
        }
        if (isHome({ row: row, col: col })) {
            var curColor = getTurn(turnIndex);
            //if it's own home
            if (board[row][col].substring(0, 1) === curColor) {
                return destination;
            }
            else {
                destination.row = row;
                destination.col = col;
                return destination;
            }
        }
        //land with animal on it
        if (board[row][col] !== 'G') {
            return canEat(board, turnIndex, pre_row, pre_col, row, col);
        }
        else {
            destination.row = row;
            destination.col = col;
            return destination;
        }
    }
    /**
    * get turn index, 0 is blue animals' turn and 1 is read animals' turn.
    */
    function getTurn(turn) {
        return (turn === 0 ? 'B' : 'R');
    }
    gameLogic.getTurn = getTurn;
    /* can eat opponent' lower or same rank animals. */
    function canEat(board, turnIndex, pre_row, pre_col, pos_row, pos_col) {
        var destination = { row: -1, col: -1 };
        var currentPosition = { row: pre_row, col: pre_col };
        var curColor = getTurn(turnIndex);
        var curAnimal = board[pre_row][pre_col];
        // if two animals are on the different kinds of place, they can't eat the other.  
        if (isWater(destination) !== isWater(currentPosition)) {
            return destination;
        }
        // 1. if it is an animal of same color, can't move
        if (board[pos_row][pos_col].substring(0, 1) === curColor) {
            return destination;
        }
        // 2. if it is an animal of different color 
        if (board[pos_row][pos_col].substring(0, 1) !== curColor) {
            var facedAnimal = board[pos_row][pos_col];
            //if it has lower or same rank, or curAnimal is mouse while oppenent's animal is elephant, can eat
            if (((getRank(curAnimal.substring(1)) >= getRank(facedAnimal.substring(1))) && (!(curAnimal.substring(1) === 'elephant' && facedAnimal.substring(1) === 'mouse'))) ||
                (curAnimal.substring(1) === 'mouse' && facedAnimal.substring(1) === 'elephant')) {
                destination.row = pos_row;
                destination.col = pos_col;
                return destination;
            }
            else {
                return destination;
            }
        }
    }
    function isOwnTrap(turn, coordinate) {
        if (turn === 0) {
            for (var _i = 0, BlueTrap_1 = gameLogic.BlueTrap; _i < BlueTrap_1.length; _i++) {
                var pos = BlueTrap_1[_i];
                if (angular.equals(pos, coordinate)) {
                    return true;
                }
            }
            return false;
        }
        else if (turn === 1) {
            for (var _a = 0, RedTrap_1 = gameLogic.RedTrap; _a < RedTrap_1.length; _a++) {
                var pos = RedTrap_1[_a];
                if (angular.equals(pos, coordinate)) {
                    return true;
                }
            }
            return false;
        }
    }
    function isWater(coordinate) {
        for (var _i = 0, Water_1 = gameLogic.Water; _i < Water_1.length; _i++) {
            var pos = Water_1[_i];
            if (angular.equals(pos, coordinate)) {
                return true;
            }
        }
        return false;
    }
    function isOppentHome(turn, coordinate) {
        //blue animals' turn
        if (turn === 0 && angular.equals(coordinate, gameLogic.Rhome)) {
            return true;
        }
        //read animals' turn
        if (turn === 1 && angular.equals(coordinate, gameLogic.Bhome)) {
            return true;
        }
        return false;
    }
    function isOppentTrap(turn, coordinate) {
        //blue animals' turn
        if (turn === 0) {
            for (var _i = 0, RedTrap_2 = gameLogic.RedTrap; _i < RedTrap_2.length; _i++) {
                var pos = RedTrap_2[_i];
                if (angular.equals(coordinate, pos)) {
                    return true;
                }
            }
        }
        if (turn === 1) {
            for (var _a = 0, BlueTrap_2 = gameLogic.BlueTrap; _a < BlueTrap_2.length; _a++) {
                var pos = BlueTrap_2[_a];
                if (angular.equals(coordinate, pos)) {
                    return true;
                }
            }
        }
        return false;
    }
    function isBlueTrap(coordinate) {
        for (var _i = 0, BlueTrap_3 = gameLogic.BlueTrap; _i < BlueTrap_3.length; _i++) {
            var pos = BlueTrap_3[_i];
            if (angular.equals(pos, coordinate)) {
                return true;
            }
        }
        return false;
    }
    function isRedTrap(coordinate) {
        for (var _i = 0, RedTrap_3 = gameLogic.RedTrap; _i < RedTrap_3.length; _i++) {
            var pos = RedTrap_3[_i];
            if (angular.equals(pos, coordinate)) {
                return true;
            }
        }
        return false;
    }
    function checkAnimal(board, row, col) {
        var cell = board[row][col];
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
    gameLogic.checkAnimal = checkAnimal;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map