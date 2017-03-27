describe("In TicTacToe", function () {
    var B_TURN = 0;
    var R_TURN = 1;
    var NO_ONE_TURN = -1;
    var NO_ONE_WINS = null;
    var B_WIN_SCORES = [1, 0];
    var R_WIN_SCORES = [0, 1];
    var TIE_SCORES = [0, 0];
    function expectException(turnIndexBeforeMove, boardBeforeMove, row, col, pre_row, pre_col) {
        var stateBeforeMove = boardBeforeMove ? { board: boardBeforeMove, delta: null } : null;
        // We expect an exception to be thrown :)
        var didThrowException = false;
        try {
            gameLogic.createMove(stateBeforeMove, row, col, pre_row, pre_col, turnIndexBeforeMove);
        }
        catch (e) {
            didThrowException = true;
        }
        if (!didThrowException) {
            throw new Error("We expect an illegal move, but createMove didn't throw any exception!");
        }
    }
    function expectMove(turnIndexBeforeMove, boardBeforeMove, deltaFrom, deltaTo, boardAfterMove, turnIndexAfterMove, endMatchScores) {
        var expectedMove = {
            turnIndex: turnIndexAfterMove,
            endMatchScores: endMatchScores,
            state: { board: boardAfterMove, delta: { row: deltaTo.row, col: deltaTo.col } }
        };
        var stateBeforeMove = boardBeforeMove ? { board: boardBeforeMove, delta: null } : null;
        var move = gameLogic.createMove(stateBeforeMove, deltaTo.row, deltaTo.col, deltaFrom.row, deltaFrom.col, turnIndexBeforeMove);
        expect(angular.equals(move, expectedMove)).toBe(true);
    }
    it("Initial move", function () {
        var move = gameLogic.createInitialMove();
        var expectedMove = {
            turnIndex: B_TURN,
            endMatchScores: NO_ONE_WINS,
            state: { board: [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
                    ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
                    ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
                    ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
                    ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
                    ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
                    ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
                    ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
                    ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], delta: null }
        };
        expect(angular.equals(move, expectedMove)).toBe(true);
    });
    it("move Bmouse from[6,6] to [5,6] (move upward)", function () {
        expectMove(B_TURN, [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
            ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
            ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
            ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
            ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 6, col: 6 }, { row: 5, col: 6 }, [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
            ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
            ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'Bmouse'],
            ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'G'],
            ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
            ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], R_TURN, NO_ONE_WINS);
    });
    it("move Rlion from[0,0] to [1,0] (move downward)", function () {
        expectMove(R_TURN, [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
            ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
            ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
            ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
            ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 0, col: 0 }, { row: 1, col: 0 }, [['G', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
            ['Rlion', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
            ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
            ['G', 'W', 'W', 'G', 'W', 'W', 'Bmouse'],
            ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'G'],
            ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
            ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], B_TURN, NO_ONE_WINS);
    });
});
//   it("placing O in 0x1 after X placed X in 0x0", function() {
//     expectMove(O_TURN,
//       [['X', '', ''],
//        ['', '', ''],
//        ['', '', '']], 0, 1,
//       [['X', 'O', ''],
//        ['', '', ''],
//        ['', '', '']], X_TURN, NO_ONE_WINS);
//   });
//   it("placing an O in a non-empty position is illegal", function() {
//     expectException(O_TURN,
//       [['X', '', ''],
//        ['', '', ''],
//        ['', '', '']], 0, 0);
//   });
//   it("cannot move after the game is over", function() {
//     expectException(O_TURN,
//       [['X', 'O', ''],
//        ['X', 'O', ''],
//        ['X', '', '']], 2, 1);
//   });
//   it("placing O in 2x1", function() {
//     expectMove(O_TURN,
//       [['O', 'X', ''],
//        ['X', 'O', ''],
//        ['X', '', '']], 2, 1,
//       [['O', 'X', ''],
//        ['X', 'O', ''],
//        ['X', 'O', '']], X_TURN, NO_ONE_WINS);
//   });
//   it("X wins by placing X in 2x0", function() {
//     expectMove(X_TURN,
//       [['X', 'O', ''],
//        ['X', 'O', ''],
//        ['', '', '']], 2, 0,
//       [['X', 'O', ''],
//        ['X', 'O', ''],
//        ['X', '', '']], NO_ONE_TURN, X_WIN_SCORES);
//   });
//   it("O wins by placing O in 1x1", function() {
//     expectMove(O_TURN,
//       [['X', 'X', 'O'],
//        ['X', '', ''],
//        ['O', '', '']], 1, 1,
//       [['X', 'X', 'O'],
//        ['X', 'O', ''],
//        ['O', '', '']], NO_ONE_TURN, O_WIN_SCORES);
//   });
//   it("the game ties when there are no more empty cells", function() {
//     expectMove(X_TURN,
//       [['X', 'O', 'X'],
//        ['X', 'O', 'O'],
//        ['O', 'X', '']], 2, 2,
//       [['X', 'O', 'X'],
//        ['X', 'O', 'O'],
//        ['O', 'X', 'X']], NO_ONE_TURN, TIE_SCORES);
//   });
//   it("placing X outside the board (in 0x3) is illegal", function() {
//     expectException(X_TURN,
//       [['', '', ''],
//        ['', '', ''],
//        ['', '', '']], 0, 3);
//   });
//# sourceMappingURL=gameLogic_test.js.map