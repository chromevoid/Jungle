var aiService;
(function (aiService) {
    /** Returns the move that the computer player should do for the given state in move. */
    function findComputerMove(move) {
        return createComputerMove(move, 
        // at most 1 second for the AI to choose a move (but might be much quicker)
        { millisecondsLimit: 2000 });
    }
    aiService.findComputerMove = findComputerMove;
    /**
     * Returns all the possible moves for the given state and turnIndexBeforeMove.
     * Returns an empty array if the game is over.
     */
    //change the ai service to choose one possible move from one of the possible moves. 
    function getPossibleMoves(state, turnIndexBeforeMove) {
        var possibleMoves = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                try {
                    var pair = { row: i, col: j };
                    var currentColor = turnIndexBeforeMove == 0 ? 'B' : 'R';
                    if (state.board[i][j].substring(0, 1) == currentColor && state.board[i][j].substring(1) !== 'H' && state.board[i][j].substring(1) !== 'T') {
                        var possibleNext = gameLogic.possibleMove(state.board, i, j, turnIndexBeforeMove);
                        for (var _i = 0, possibleNext_1 = possibleNext; _i < possibleNext_1.length; _i++) {
                            var eachMove = possibleNext_1[_i];
                            possibleMoves.push(gameLogic.createMove(state, eachMove.row, eachMove.col, i, j, turnIndexBeforeMove));
                        }
                    }
                }
                catch (e) {
                    // The cell in that position was full.
                }
            }
        }
        return possibleMoves;
    }
    aiService.getPossibleMoves = getPossibleMoves;
    /**
     * Returns the move that the computer player should do for the given state.
     * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
     * and it has either a millisecondsLimit or maxDepth field:
     * millisecondsLimit is a time limit, and maxDepth is a depth limit.
     */
    function createComputerMove(move, alphaBetaLimits) {
        // We use alpha-beta search, where the search states are TicTacToe moves.
        return alphaBetaService.alphaBetaDecision(move, move.turnIndex, getNextStates, getStateScoreForIndex0, null, alphaBetaLimits);
    }
    aiService.createComputerMove = createComputerMove;
    //gibberish: playIndex is machine's turn
    function getStateScoreForIndex0(move, playerIndex) {
        var endMatchScores = move.endMatchScores; //gibberish: endMatchScore is after machine's move,
        //if one is going to win.
        if (endMatchScores) {
            return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
                : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
                    : 0;
        }
        var valueSum = 0;
        //first calculate current state.
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                var state = move.state;
                var board = state.board;
                var currentColor = gameLogic.getTurn(playerIndex);
                if (board[i][j].substring(0, 1) === currentColor && board[i][j].substring(1) !== 'H' && board[i][j].substring(1) !== 'T') {
                    valueSum = calculateScoreSum(board, i, j, playerIndex) + valueSum;
                }
            }
        }
        return valueSum;
    }
    function calculateScoreSum(board, row, col, playIndex) {
        var sum = closeToOpponentHome(board, row, col, playIndex) +
            closeToOpponentAnimal(board, row, col, playIndex) + waterAnimalCloseToWater(board, row, col, playIndex) +
            landAnimalCloseToGrassOrHome(board, row, col, playIndex);
        return sum;
    }
    var dx = [0, 0, 1, -1];
    var dy = [1, -1, 0, 0];
    function isOutOfBound(row, col) {
        if (row < 0 || row >= gameLogic.ROWS || col < 0 || col >= gameLogic.COLS) {
            return true;
        }
        return false;
    }
    //give 200 points to get close to opponent's home.
    function closeToOpponentHome(board, row, col, playerIndex) {
        var sum = 0;
        var opponentColor = gameLogic.getTurn(1 - playerIndex);
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                var x = row + dx[i];
                var y = col + dy[j];
                if (!isOutOfBound(x, y)) {
                    if (board[x][y] === opponentColor + 'H') {
                        sum = sum + 200;
                    }
                }
            }
        }
        return sum;
    }
    //give this 10 points to get close to opponent's trap
    function closeToOpponentTrap(board, row, col, playerIndex) {
        var sum = 0;
        var opponentColor = gameLogic.getTurn(1 - playerIndex);
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                var x = row + dx[i];
                var y = col + dy[j];
                if (!isOutOfBound(x, y)) {
                    if (board[x][y] === opponentColor + 'T') {
                        sum = sum + 5 + Math.floor(Math.random() * 5);
                    }
                }
            }
        }
        return sum;
    }
    //give this 100 points (might eat animal) and 5 points (might be eaten)
    function closeToOpponentAnimal(board, row, col, playerIndex) {
        var sum = 0;
        var opponentColor = gameLogic.getTurn(1 - playerIndex);
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                var x = row + dx[i];
                var y = col + dy[j];
                if (!isOutOfBound(x, y)) {
                    if (board[x][y] === opponentColor && board[x][y].substring(1) !== 'H' && board[x][y].substring(1) !== 'T') {
                        if (gameLogic.getRank(board[row][col].substring(1)) > gameLogic.getRank(board[x][y].substring(1)) || (board[row][col].substring(1) === 'mouse' && board[x][y].substring(1) === 'elephant')) {
                            sum = sum + Math.floor(Math.random() * 10) + 40; //can eat.
                        }
                        if (gameLogic.getRank(board[row][col].substring(1)) <= gameLogic.getRank(board[x][y].substring(1)) || (board[row][col].substring(1) === 'elephat' && board[x][y].substring(1) === 'mouse')) {
                            sum = sum + 5; //might be eaten.
                        }
                    }
                }
            }
        }
        return sum;
    }
    //give this 5 points
    function landAnimalCloseToWater(board, row, col, playerIndex) {
        var currentAnimalType = board[row][col].substring(1);
        var sum = 0;
        if (currentAnimalType !== 'mouse' && currentAnimalType !== 'tiger' && currentAnimalType !== 'lion') {
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    var x = row + dx[i];
                    var y = col + dy[j];
                    if (!isOutOfBound(x, y)) {
                        if (board[x][y] === 'W') {
                            sum = sum + Math.floor(Math.random() * 5) + 1;
                        }
                    }
                }
            }
        }
        return sum;
    }
    //give this 40 points who could get into Water or jump across the water
    function waterAnimalCloseToWater(board, row, col, playerIndex) {
        var currentAnimalType = board[row][col].substring(1);
        var sum = 0;
        if (currentAnimalType === 'mouse' || currentAnimalType === 'tiger' || currentAnimalType === 'lion') {
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    var x = row + dx[i];
                    var y = col + dy[j];
                    if (!isOutOfBound(x, y)) {
                        if (board[x][y] === 'W') {
                            sum = sum + Math.floor(Math.random() * 10) + 30;
                        }
                    }
                }
            }
        }
        return sum;
    }
    //give this 5 points (close to home and could protect home), give 30 points to normal grass
    function landAnimalCloseToGrassOrHome(board, row, col, playerIndex) {
        var sum = 0;
        var currentColor = gameLogic.getTurn(playerIndex);
        var opponentColor = gameLogic.getTurn(1 - playerIndex);
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                var x = row + dx[i];
                var y = col + dy[j];
                if (!isOutOfBound(x, y)) {
                    if (board[x][y] === currentColor + 'H') {
                        sum = sum + Math.floor(Math.random() * 5) + 1; //probably could protect own home.
                    }
                    if (board[x][y] === 'G') {
                        sum = sum + Math.floor(Math.random() * 5) + 20; //normal move
                    }
                }
            }
        }
        return sum;
    }
    function getNextStates(move, playerIndex) {
        return getPossibleMoves(move.state, playerIndex);
    }
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map