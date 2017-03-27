describe("In Jungle", function() {

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
      deltaFrom : BoardDelta,
      deltaTo: BoardDelta  ): void {
    let stateBeforeMove: IState = boardBeforeMove ? {board: boardBeforeMove, delta: null} : null;
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
     
      deltaFrom : BoardDelta,
      deltaTo: BoardDelta,

      boardAfterMove: Board,
      turnIndexAfterMove: number,
      endMatchScores: number[]): void {

    let expectedMove:IMove = {
        turnIndex: turnIndexAfterMove,
        endMatchScores: endMatchScores,
        state: {board: boardAfterMove, delta: {row: deltaTo.row, col: deltaTo.col}}
      };
    let stateBeforeMove: IState = boardBeforeMove ? {board: boardBeforeMove, delta: null} : null;
    let move: IMove = gameLogic.createMove(stateBeforeMove, deltaTo.row, deltaTo.col, deltaFrom.row, deltaFrom.col, turnIndexBeforeMove);
    expect(angular.equals(move, expectedMove)).toBe(true);
  }


  //1. test initial move.
  it("Initial move", function() {
    let move: IMove = gameLogic.createInitialMove();
    let expectedMove:IMove = {
        turnIndex: B_TURN,
        endMatchScores: NO_ONE_WINS,
        state: {board: 
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], delta: null}
    };
    expect(angular.equals(move, expectedMove)).toBe(true);
  });


  
  /* test move behavior! */

  //2. test blue animal move on the land
  it("2. move Bmouse from[6,6] to [5,6] (move upward)", function() {
    expectMove(B_TURN, 
     [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], {row: 6, col:6},{row: 5, col: 6}, 
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
  it("3. move Rdog from[1,1] to [2,1] (move downward)", function() {
    expectMove(R_TURN, 
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], {row: 1,col: 1}, {row: 2, col: 1}, 
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
    it("4. move Bmouse from[5,6] to [5,5] (move left into the water)", function() {
    expectMove(B_TURN, 
      [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'Bmouse'],
      ['Belephant', 'G', 'Bwolf', 'G', 'Bcheetah', 'G', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], {row: 5,col: 6}, {row: 5, col: 5}, 
    
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
  it("5. try to move Bcheetah from[5,6] to [5,5] left into the water", function() {
    expectException(B_TURN, 
     [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'Bcheetah'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], {row: 5, col:6},{row: 5, col: 5});
  });

  //6. test tiger could jump accous the water and land on the grass
    it("6. move Btiger from[6,4] to [2,4] (move left into the water)", function() {
    expectMove(B_TURN, 
    [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'G', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'Blion']], {row: 6,col: 1}, {row: 2, col: 1}, 
    
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
   it("7. move Blion from[6,5] to [2,5] (move left into the water)", function() {
    expectMove(B_TURN, 
    [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['Rmouse', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Blion', 'Bmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], {row: 6,col: 5}, {row: 2, col: 5}, 
    
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
 it("8. move Blion from[6,5] to [6,6] to eat the Rmouse", function() {
    expectMove(B_TURN, 
    [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Blion', 'Rmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], {row: 6,col: 5}, {row: 6, col: 6}, 
    
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
   it("9. move Blion from[6,5] to [6,6] to eat the Rlion", function() {
    expectMove(B_TURN, 
    [['G', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['Belephant', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Blion', 'Rlion'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], {row: 6,col: 5}, {row: 6, col: 6}, 
    
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
    it("10. try to move Rmouse from[6,6] to [6,5] to eat Blion, invalid move", function() {
    expectException(R_TURN, 
     [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'Bcheetah'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'Blion', 'Rmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'G']], {row: 6, col: 6},{row: 6, col: 5});
  });

  //11. test both animals on grass, mouse could eat elephant.
   it("11. move Rmouse from [6,6] to [6,5] to eat the Belephant", function() {
    expectMove(R_TURN, 
    [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'Rmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], {row: 6,col: 6}, {row: 6, col: 5}, 
    
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
  it("12. try to move Relephant from[2,7] to [2,6] to eat Bmouse, invalid move", function() {
    expectException(R_TURN, 
     [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'Bmouse', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'Bcheetah'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'Blion', 'Rmouse'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'G']], {row: 2, col: 7},{row: 2, col: 6});
  });


  //13. test both animals in the water, mouse could eat mouse.
   it("13. move Rmouse from [5,5] to [5,4] to eat the Bmouse", function() {
    expectMove(R_TURN, 
    [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'Bmouse', 'Rmouse', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], {row: 5,col: 5}, {row: 5, col: 4}, 
    
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

  //14. test mouse is in the water, elephant is on the grass, mouse could eat elephant. 
  it("14. move Bmouse from [4,5] to [4,6] to eat the Relephant", function() {
    expectMove(B_TURN, 
    [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Bmouse', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'Rmouse', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], {row: 4,col: 5}, {row: 4, col: 6}, 
    
     [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'Bmouse'],
      ['G', 'W', 'W', 'G', 'W', 'Rmouse', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], R_TURN, NO_ONE_WINS);
  });

  //15. test Bmouse is in the water, Rmouse is on the grass, Bmouse could eat Rmouse.
  it("15. move Bmouse from [4,5] to [4,6] to eat the Rmouse", function() {
    expectMove(B_TURN, 
    [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Bmouse', 'Rmouse'],
      ['G', 'W', 'W', 'G', 'W', 'w', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], {row: 4,col: 5}, {row: 4, col: 6}, 
    
     [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'Bmouse'],
      ['G', 'W', 'W', 'G', 'W', 'w', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], R_TURN, NO_ONE_WINS);
  });


  //16. test mouse is in the water, cheetah is on the grass, cheetah can't eat mouse.
    it("16. try to move Bcheetah from[5,6] to [5,5] to eat Rmouse, invalid move", function() {
    expectException(B_TURN, 
     [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'Bmouse', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Rmouse', 'Bcheetah'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'Blion', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'G']], {row: 5, col: 6},{row: 5, col: 5});
  });

  //17. test mouse is in the water, cheetah is on the grass, mouse can't eat cheetah.
  it("16. try to move Rmouse from[5,5] to [5,6] to eat Bcheetah, invalid move", function() {
    expectException(R_TURN, 
     [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'Rdog', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'G', 'Rcheetah', 'G', 'Rwolf', 'Bmouse', 'Relephant'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Rmouse', 'Bcheetah'],
      ['Belephant', 'G', 'Bwolf', 'G', 'G', 'Blion', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['Btiger', 'G', 'BT', 'BH', 'BT', 'G', 'G']], {row: 5, col: 5},{row: 5, col: 6});
  });

  //18. test tiger could jump and eat the lower or same rank animal
   it("15. move Btiger from [6,1] to [2,1] to eat the Rdog", function() {
    expectMove(B_TURN, 
    [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'G', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'Rdog', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Bmouse', 'Rmouse'],
      ['G', 'W', 'W', 'G', 'W', 'w', 'G'],
      ['G', 'Btiger', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], {row: 6,col: 1}, {row: 2, col: 1}, 
    
     [['Rlion', 'G', 'RT', 'RH', 'RT', 'G', 'Rtiger'],
      ['G', 'G', 'G', 'RT', 'G', 'Rcat', 'G'],
      ['G', 'Btiger', 'Rcheetah', 'G', 'Rwolf', 'G', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'W', 'G'],
      ['G', 'W', 'W', 'G', 'W', 'Bmouse', 'Rmouse'],
      ['G', 'W', 'W', 'G', 'W', 'w', 'G'],
      ['G', 'Gr', 'Bwolf', 'G', 'Bcheetah', 'Belephant', 'G'],
      ['G', 'Bcat', 'G', 'BT', 'G', 'Bdog', 'G'],
      ['G', 'G', 'BT', 'BH', 'BT', 'G', 'G']], R_TURN, NO_ONE_WINS);
  });







  //19. test lion could jump and eat the lower or same rank animal








 















  















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
 
