describe("In Jungle", function () {

  let B_TURN = 0;
  let R_TURN = 1;
  let NO_ONE_TURN = -1;
  let NO_ONE_WINS: number[] = null;
  let B_WIN_SCORES = [1, 0];
  let R_WIN_SCORES = [0, 1];
  let TIE_SCORES = [0, 0];


  function expectException(
    turnIndexBeforeMove: number,
    boardBeforeMove: Board,
    deltaFrom: BoardDelta,
    deltaTo: BoardDelta): void {
    let stateBeforeMove: IState = boardBeforeMove ? { board: boardBeforeMove, fromDelta:null, toDelta: null } : null;
    // We expect an exception to be thrown :)
    let didThrowException = false;
    try {
      gameLogic.createMove(stateBeforeMove, deltaTo.row, deltaTo.col, deltaFrom.row, deltaFrom.col, turnIndexBeforeMove);
    } catch (e) {
      didThrowException = true;
    }
    if (!didThrowException) {
      throw new Error("We expect an illegal move, but createMove didn't throw any exception!")
    }
  }

  function expectMove(
    turnIndexBeforeMove: number,
    boardBeforeMove: Board,

    deltaFrom: BoardDelta,
    deltaTo: BoardDelta,

    boardAfterMove: Board,
    turnIndexAfterMove: number,
    endMatchScores: number[]): void {

    let expectedMove: IMove = {
      turnIndex: turnIndexAfterMove,
      endMatchScores: endMatchScores,
      state: { board: boardAfterMove, fromDelta: null, toDelta: { row: deltaTo.row, col: deltaTo.col } }
    };
    let stateBeforeMove: IState = boardBeforeMove ? { board: boardBeforeMove, fromDelta: null, toDelta: null } : null;
    let move: IMove = gameLogic.createMove(stateBeforeMove, deltaTo.row, deltaTo.col, deltaFrom.row, deltaFrom.col, turnIndexBeforeMove);
    expect(angular.equals(move, expectedMove)).toBe(true);
  }


  //1. test initial move.
  it("Initial move", function () {
    let move: IMove = gameLogic.createInitialMove();
    let expectedMove: IMove = {
      turnIndex: B_TURN,
      endMatchScores: NO_ONE_WINS,
      state: {
        board:
        [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
        ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
        ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
        ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
        ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
        ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
        ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
        ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
        ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], fromDelta: null, toDelta: null
      }
    };
    expect(angular.equals(move, expectedMove)).toBe(true);
  });



  /* test move behavior! */

  //2. test blue animal move on the land
  it("2. move Bmouse from[6,6] to [5,6] (move upward)", function () {
    expectMove(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 6, col: 6 }, { row: 5, col: 6 },
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'Bmouse'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], R_TURN, NO_ONE_WINS);
  });

  //3. test red land animal move on the land
  it("3. move Rdog from[1,1] to [2,1] (move downward)", function () {
    expectMove(R_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 1, col: 1 }, { row: 2, col: 1 },
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'G', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'Rdog', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], B_TURN, NO_ONE_WINS);
  });


  //4. test mouse could get into the water
  it("4. move Bmouse from[5,6] to [5,5] (move left into the water)", function () {
    expectMove(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'Bmouse'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 5, col: 6 }, { row: 5, col: 5 },

      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Bmouse', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], R_TURN, NO_ONE_WINS);
  });


  //5. test expected exception when land animal move into the water. 
  it("5. try to move Bcheetah from[5,6] to [5,5] left into the water, invalid move", function () {
    expectException(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'Bcheetah'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 5, col: 6 }, { row: 5, col: 5 });
  });

  //6. test tiger could jump across the water and land on the grass
  it("6. move Btiger from[6,1] to [2,1] (jump across the water and land on the grass)", function () {
    expectMove(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 6, col: 1 }, { row: 2, col: 1 },

      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'Btiger', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], R_TURN, NO_ONE_WINS);
  });

  //7. test lion could jump across the water and land on the grass
  it("7. move Blion from[6,5] to [2,5] (jump across the water and land on the grass)", function () {
    expectMove(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Blion', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 6, col: 5 }, { row: 2, col: 5 },

      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'Blion', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], R_TURN, NO_ONE_WINS);
  });

  /* test eat behavior! */
  //8. test both animals on grass, higher rank animal could eat lower rank animal.
  it("8. move Blion from[6,5] to [6,6] to eat the Rmouse", function () {
    expectMove(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Blion', 'Rmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 6, col: 5 }, { row: 6, col: 6 },

      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'G', 'Blion'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], R_TURN, NO_ONE_WINS);
  });

  //9. test both animals on grass, animal could eat same rank animal.
  it("9. move Blion from[6,5] to [6,6] to eat the Rlion", function () {
    expectMove(B_TURN,
      [['G', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Blion', 'Rlion'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 6, col: 5 }, { row: 6, col: 6 },

      [['G', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'G', 'Blion'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], R_TURN, NO_ONE_WINS);
  });


  //10. test both animals on grass, lower rank can't eat higher rank animals, excepted exception. 
  it("10. try to move Rmouse from[6,6] to [6,5] to eat Blion, invalid move", function () {
    expectException(R_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'Bcheetah'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'Blion', 'Rmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 6, col: 6 }, { row: 6, col: 5 });
  });

  //11. test both animals on grass, mouse could eat elephant.
  it("11. move Rmouse from [6,6] to [6,5] to eat the Belephant", function () {
    expectMove(R_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'Rmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 6, col: 6 }, { row: 6, col: 5 },

      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Rmouse', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], B_TURN, NO_ONE_WINS);
  });


  //12. test both animals on grass, elephant can't eat mouse.
  it("12. try to move Relephant from[2,6] to [2,5] to eat Bmouse, invalid move", function () {
    expectException(R_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'Bmouse', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'Bcheetah'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'Blion', 'Rmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 2, col: 6 }, { row: 2, col: 5 });
  });


  //13. test both animals in the water, mouse could eat mouse.
  it("13. move Rmouse from [5,5] to [5,4] to eat the Bmouse", function () {
    expectMove(R_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'Bmouse', 'Rmouse', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 5, col: 5 }, { row: 5, col: 4 },

      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'Rmouse', 'W', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], B_TURN, NO_ONE_WINS);
  });

  //14. test mouse is in the water, elephant is on the grass, mouse can't eat elephant. 
  it("14. try to move Bmouse from [4,5] to [4,6] to eat the Relephant, invalid move", function () {
    expectException(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Bmouse', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'Rmouse', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 4, col: 5 }, { row: 4, col: 6 });
  });

  //15. test Bmouse is in the water, Rmouse is on the grass, Bmouse can't eat Rmouse.
  it("15. try to move Bmouse from [4,5] to [4,6] to eat the Rmouse, invalid move", function () {
    expectException(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Bmouse', 'Rmouse'],
      ['G', 'W', 'W', 'G', 'W', 'w', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 4, col: 5 }, { row: 4, col: 6 }, );
  });


  //16. test mouse is in the water, cheetah is on the grass, cheetah can't eat mouse.
  it("16. try to move Bcheetah from[5,6] to [5,5] to eat Rmouse, invalid move", function () {
    expectException(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'Bmouse', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Rmouse', 'Bcheetah'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'Blion', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 5, col: 6 }, { row: 5, col: 5 });
  });

  //17. test mouse is in the water, cheetah is on the grass, mouse can't eat cheetah.
  it("17. try to move Rmouse from[5,5] to [5,6] to eat Bcheetah, invalid move", function () {
    expectException(R_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'Bmouse', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Rmouse', 'Bcheetah'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'Blion', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 5, col: 5 }, { row: 5, col: 6 });
  });

  //18. test tiger could jump and eat the lower or same rank animal with no mouse in-between
  it("18. move Btiger from [6,1] to [2,1] to eat the Rdog", function () {
    expectMove(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'G', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'Rdog', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Bmouse', 'Rmouse'],
      ['G', 'W', 'W', 'G', 'W', 'w', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 6, col: 1 }, { row: 2, col: 1 },

      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'G', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'Btiger', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Bmouse', 'Rmouse'],
      ['G', 'W', 'W', 'G', 'W', 'w', 'G'],
      ['G', 'G', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], R_TURN, NO_ONE_WINS);
  });

  //19. test lion could jump and eat the lower or same rank animal with no mouse in-between
  it("19. move Blion from [6,1] to [2,1] to eat the Rdog", function () {
    expectMove(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'G', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'Rdog', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Bmouse', 'Rmouse'],
      ['G', 'W', 'W', 'G', 'W', 'w', 'G'],
      ['G', 'Blion', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 6, col: 1 }, { row: 2, col: 1 },

      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'G', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'Blion', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Bmouse', 'Rmouse'],
      ['G', 'W', 'W', 'G', 'W', 'w', 'G'],
      ['G', 'G', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], R_TURN, NO_ONE_WINS);
  });

  //20. test rat in the middle, tiger can't jump and eat.
  it("20. try to move Btiger from [6,1] to [2,1] to eat the Rdog while Bmouse in the middle water, invalid move", function () {
    expectException(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'G', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'Rdog', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'Rmouse'],
      ['G', 'Bmouse', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 6, col: 1 }, { row: 2, col: 1 }, );
  });

  //21. test opponent's rat in the middle, tiger can't jump and eat.
  it("21. try to move Btiger from [6,1] to [2,1] to eat the Rdog while Rmouse in the middle water, invalid move", function () {
    expectException(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'G', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'Rdog', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'Rmouse', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'G', 'Bcat', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 6, col: 1 }, { row: 2, col: 1 }, );
  });



  //22. test opponent's rat in the middle, lion can't jump and eat.
  it("22. try to move Blion from [6,1] to [2,1] to eat the Rdog while Rmouse in the middle water, invalid move", function () {
    expectException(B_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'G', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'Rdog', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Bmouse', 'G'],
      ['G', 'Rmouse', 'W', 'G', 'W', 'w', 'G'],
      ['G', 'Blion', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 6, col: 1 }, { row: 2, col: 1 }, );
  });

  /* trap function test. */
  //23. test blue animal is in blue trap, the lower rank red animal can't eat that animal
  it("23. try to move Rmouse from [7,4] to [7,3] to eat Bdog in BT, invalid move", function () {
    expectException(R_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'Bdog', 'Rmouse', 'G', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 7, col: 4 }, { row: 7, col: 3 }, );
  });



  //24. test blue animal is in blue trap, higher rank red animal can eat that animal in the blue trap.
  it("24. move Relephant from [7,4] to [7,3] to eat Bdog in BT", function () {
    expectMove(R_TURN,
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Rmouse'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'Bdog', 'Relephant', 'G', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 7, col: 4 }, { row: 7, col: 3 },
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Rmouse'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'Relephant', 'G', 'G', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], B_TURN, NO_ONE_WINS);
  });

  //25. test blue animal is in red trap, lower rank red animal can eat that animal 
  it("25. move Rdog from [0,1] to [0,2] to eat Belephant in RT", function () {
    expectMove(R_TURN,
      [['Rlion', 'Rdog', 'Belephant', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'G', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Rmouse'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'Bdog', 'Relephant', 'G', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 0, col: 1 }, { row: 0, col: 2 },
      [['Rlion', 'G', 'Rdog', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'G', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Rmouse'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'Bdog', 'Relephant', 'G', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], B_TURN, NO_ONE_WINS);
  });


  //26. test blue animal is in red trap, higher rank animal can eat that animal.
  it("26. move Rlion from [0,1] to [0,2] to eat Bdog in RT", function () {
    expectMove(R_TURN,
      [['G', 'Rlion', 'Bdog', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'G', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 0, col: 1 }, { row: 0, col: 2 },
      [['G', 'G', 'Rlion', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'G', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], B_TURN, NO_ONE_WINS);
  });


  //27. animal can't go into its own color home.
  it("27. try to move Rlion from [0,2] to [0,3] to enter RH, invalid move", function () {
    expectException(R_TURN,
      [['G', 'G', 'Rlion', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 0, col: 2 }, { row: 0, col: 3 });
  });


  //28. test only animal could create a move.(trap , home, grass and water can't create a move.)
  it("28. try to move RH from [0,3] to [0,4]  invalid move", function () {
    expectException(R_TURN,
      [['G', 'G', 'Rlion', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 0, col: 3 }, { row: 0, col: 4 });
  });


  //29. test only animal could create a move.(trap, home, grass and water can't create a move.)
  it("29. try to move Grass from [3,0] to [4,0]  invalid move", function () {
    expectException(R_TURN,
      [['G', 'G', 'Rlion', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 3, col: 0 }, { row: 4, col: 0 });
  });

  /* test win condition.*/
  //30. test win condition: when red animal is in blue animal's home.
  it("30. move Rlion from[8,2] to [8,3] to enter BH, red animals win)", function () {
    expectMove(R_TURN,
      [['G', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'Rlion', 'BH', 'BT', 'G', 'Blion']], { row: 8, col: 2 }, { row: 8, col: 3 },
      [['G', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'Rlion', 'BT', 'G', 'Blion']], NO_ONE_TURN, R_WIN_SCORES);
  });


  //31. test win condition: when only red piece on the board, blue animals win.
  it("31. move Relephant from[6,1] to [6,2] to eat Bwolf, red animals win)", function () {
    expectMove(R_TURN,
      [['G', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'Relephant', 'Bwolf', 'G', 'G', 'G', 'G'],
      ['G', 'G', 'G', 'BT', 'G', 'G', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], { row: 6, col: 1 }, { row: 6, col: 2 },

      [['G', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'G', 'Relephant', 'G', 'G', 'G', 'G'],
      ['G', 'G', 'G', 'BT', 'G', 'G', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], NO_ONE_TURN, R_WIN_SCORES);
  });

  //32. test win condition: same as test31 but the different color.
  it("32. move Belephant from[6,0] to [6,1] to eat Rdog, blue animals win)", function () {
    expectMove(B_TURN,
      [['G', 'G', 'RT', 'RH', 'RT', 'G', 'G'],
      ['G', 'G', 'G', 'RT', 'G', 'G', 'G'],
      ['G', 'G', 'G', 'G', 'G', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Rdog', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 6, col: 0 }, { row: 6, col: 1 },

      [['G', 'G', 'RT', 'RH', 'RT', 'G', 'G'],
      ['G', 'G', 'G', 'RT', 'G', 'G', 'G'],
      ['G', 'G', 'G', 'G', 'G', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'Belephant', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], NO_ONE_TURN, B_WIN_SCORES);
  });


  //33. test win condition: if current move makes the next player: opponent can't move, current player wins.
  it("33. move Belephant from[5,3] to [4,3], the only red animal- Rdog left)", function () {
    expectMove(B_TURN,
      [['G', 'G', 'RT', 'RH', 'RT', 'G', 'G'],
      ['G', 'G', 'G', 'RT', 'G', 'G', 'G'],
      ['G', 'G', 'G', 'Bwolf', 'G', 'G', 'G'],
      ['G', 'W', 'W', 'Rdog', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'Belephant', 'W', 'W', 'G'],
      ['G', 'G', 'G', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 5, col: 3 }, { row: 4, col: 3 },

      [['G', 'G', 'RT', 'RH', 'RT', 'G', 'G'],
      ['G', 'G', 'G', 'RT', 'G', 'G', 'G'],
      ['G', 'G', 'G', 'Bwolf', 'G', 'G', 'G'],
      ['G', 'W', 'W', 'Rdog', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'Belephant', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'G', 'G', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], NO_ONE_TURN, B_WIN_SCORES);
  });

  //34. test move animal out of the bound, invalid move.
  it("34. try to move Rtiger from [0,6] to [0,7], invalid move", function () {
    expectException(R_TURN,
      [['G', 'G', 'Rlion', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 0, col: 6 }, { row: 0, col: 7 });
  });


  //35. test can't move after the game is over. (Bcheetah is in RH)
  it("35. when game is over, try to move Rtiger from [0,6] to [0,5], invalid move", function () {
    expectException(NO_ONE_TURN,
      [['G', 'G', 'Rlion', 'Bcheetah', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 0, col: 6 }, { row: 0, col: 5 });
  });

  //36. add test that mouse on land can't eat mouse in water
   it("36.try to move Bmouse from [3,3] to [3,2] to eat Rmouse, invalid move", function () {
    expectException(B_TURN,
      [['G', 'G', 'Rlion', 'Bcheetah', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'Rmouse', 'Bmouse', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'G', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 3, col: 3 }, { row: 3, col: 2 });
  });

   //37. add test that mouse on land can't eat mouse in water
   it("37.try to move Rmouse from [3,2] to [3,3] to eat Bmouse, invalid move", function () {
    expectException(R_TURN,
      [['G', 'G', 'Rlion', 'Bcheetah', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'Rmouse', 'Bmouse', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'G', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], { row: 3, col: 2 }, { row: 3, col: 3 });
  });



  //to-do: tie condition test. 





});
