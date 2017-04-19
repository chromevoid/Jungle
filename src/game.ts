interface SupportedLanguages {
  en: string, iw: string,
  pt: string, zh: string,
  el: string, fr: string,
  hi: string, es: string,
};

module game {
  export let $rootScope: angular.IMyScope = null;
  export let $timeout: angular.ITimeoutService = null;

  // Global variables are cleared when getting updateUI.
  // I export all variables to make it easy to debug in the browser by
  // simply typing in the console, e.g.,
  // game.currentUpdateUI
  export let currentUpdateUI: IUpdateUI = null;
  export let didMakeMove: boolean = false; // You can only make one move per updateUI
  export let animationEndedTimeout: ng.IPromise<any> = null;
  export let state: IState = null;
  // for cellClickedOne and cellClickedTwo
  export let pre_row: number = null;
  export let pre_col: number = null;
  export let firstClicked: boolean = false; // if the currnt click is the second one
  // then call createMove, and set this value to false again
  export let cellClickedOneDone = false;
  // for changeSelectCSS
  export let click_row: number = null;
  export let click_col: number = null;
  // for move a piece animation
  export let movePiece: string = "";
  // For community games.
  export let proposals: number[][] = null;
  export let yourPlayerInfo: IPlayerInfo = null;

  //should rotate of it's a multiplayer game.
  export let shouldRotateBoard: boolean = false;

  export function init($rootScope_: angular.IMyScope, $timeout_: angular.ITimeoutService) {
    $rootScope = $rootScope_;
    $timeout = $timeout_;
    registerServiceWorker();
    translate.setTranslations(getTranslations());
    translate.setLanguage('en');
    resizeGameAreaService.setWidthToHeight(7 / 9);
    gameService.setGame({
      updateUI: updateUI,
      getStateForOgImage: null,
    });
  }

  function registerServiceWorker() {
    // I prefer to use appCache over serviceWorker
    // (because iOS doesn't support serviceWorker, so we have to use appCache)
    // I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
    if (!window.applicationCache && 'serviceWorker' in navigator) {
      let n: any = navigator;
      log.log('Calling serviceWorker.register');
      n.serviceWorker.register('service-worker.js').then(function (registration: any) {
        log.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(function (err: any) {
        log.log('ServiceWorker registration failed: ', err);
      });
    }
  }

  function getTranslations(): Translations {
    return {};
  }

  export function isProposal(row: number, col: number) {
    return proposals && proposals[row][col] > 0;
  }

  export function getCellStyle(row: number, col: number): Object {
    if (!isProposal(row, col)) return {};
    // proposals[row][col] is > 0
    let countZeroBased = proposals[row][col] - 1;
    let maxCount = currentUpdateUI.numberOfPlayersRequiredToMove - 2;
    let ratio = maxCount == 0 ? 1 : countZeroBased / maxCount; // a number between 0 and 1 (inclusive).
    // scale will be between 0.6 and 0.8.
    let scale = 0.6 + 0.2 * ratio;
    // opacity between 0.5 and 0.7
    let opacity = 0.5 + 0.2 * ratio;
    return {
      transform: `scale(${scale}, ${scale})`,
      opacity: "" + opacity,
    };
  }

  function getProposalsBoard(playerIdToProposal: IProposals): number[][] {
    let proposals: number[][] = [];
    for (let i = 0; i < gameLogic.ROWS; i++) {
      proposals[i] = [];
      for (let j = 0; j < gameLogic.COLS; j++) {
        proposals[i][j] = 0;
      }
    }
    for (let playerId in playerIdToProposal) {
      let proposal = playerIdToProposal[playerId];
      let delta = proposal.data;
      proposals[delta.row][delta.col]++;
    }
    return proposals;
  }

  export function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    let playerIdToProposal = params.playerIdToProposal;
    // Only one move/proposal per updateUI
    didMakeMove = playerIdToProposal && playerIdToProposal[yourPlayerInfo.playerId] != undefined;
    yourPlayerInfo = params.yourPlayerInfo;
    proposals = playerIdToProposal ? getProposalsBoard(playerIdToProposal) : null;
    if (playerIdToProposal) {
      // If only proposals changed, then return.
      // I don't want to disrupt the player if he's in the middle of a move.
      // I delete playerIdToProposal field from params (and so it's also not in currentUpdateUI),
      // and compare whether the objects are now deep-equal.
      params.playerIdToProposal = null;
      if (currentUpdateUI && angular.equals(currentUpdateUI, params)) return;
    }

    currentUpdateUI = params;
    clearAnimationTimeout();
    state = params.state;

    //Rotate the board 180 degrees, hence in the point of current
    //player's view, the board always face towards him/her;
    shouldRotateBoard = params.playMode === 1;

    if (params.playMode === 'playAgainstTheComputer' || params.playMode === 'onlyAIs') {
      gameLogic.tieRule = 10000000;
    }

    if (isFirstMove()) {
      state = gameLogic.getInitialState();
    }
    // We calculate the AI move only after the animation finishes,
    // because if we call aiService now
    // then the animation will be paused until the javascript finishes.
    animationEndedTimeout = $timeout(animationEndedCallback, 500);
  }

  function animationEndedCallback() {
    log.info("Animation ended");
    maybeSendComputerMove();
  }

  function clearAnimationTimeout() {
    if (animationEndedTimeout) {
      $timeout.cancel(animationEndedTimeout);
      animationEndedTimeout = null;
    }
  }

  function maybeSendComputerMove() {
    if (!isComputerTurn()) return;
    let currentMove: IMove = {
      endMatchScores: currentUpdateUI.endMatchScores,
      state: currentUpdateUI.state,
      turnIndex: currentUpdateUI.turnIndex,
    }
    let move = aiService.findComputerMove(currentMove);
    log.info("Computer move: ", move);
    makeMove(move);
  }

  function makeMove(move: IMove) {
    if (didMakeMove) { // Only one move per updateUI
      return;
    }
    didMakeMove = true;

    if (!proposals) {
      gameService.makeMove(move, null);
    } else {
      let delta = move.state.toDelta;
      let myProposal: IProposal = {
        data: delta,
        chatDescription: '' + (delta.row + 1) + 'x' + (delta.col + 1),
        playerInfo: yourPlayerInfo,
      };
      // Decide whether we make a move or not (if we have <currentCommunityUI.numberOfPlayersRequiredToMove-1> other proposals supporting the same thing).
      if (proposals[delta.row][delta.col] < currentUpdateUI.numberOfPlayersRequiredToMove - 1) {
        move = null;
      }
      gameService.makeMove(move, myProposal);
    }
  }

  function isFirstMove() {
    return !currentUpdateUI.state;
  }

  function yourPlayerIndex() {
    return currentUpdateUI.yourPlayerIndex;
  }

  function isComputer() {
    let playerInfo = currentUpdateUI.playersInfo[currentUpdateUI.yourPlayerIndex];
    // In community games, playersInfo is [].
    return playerInfo && playerInfo.playerId === '';
  }

  function isComputerTurn() {
    return isMyTurn() && isComputer();
  }

  function isHumanTurn() {
    return isMyTurn() && !isComputer();
  }

  function isMyTurn() {
    return !didMakeMove && // you can only make one move per updateUI.
      currentUpdateUI.turnIndex >= 0 && // game is ongoing
      currentUpdateUI.yourPlayerIndex === currentUpdateUI.turnIndex; // it's my turn
  }

  export function cellClickedOne(row: number, col: number): void {
    $rootScope.hideAfterAnimation = true;
    if (shouldRotateBoard) {
      row = gameLogic.ROWS - row - 1;
      col = gameLogic.COLS - col - 1;
    }
    log.info("Clicked on cell (one):", row, col);
    if (shouldRotateBoard) {
      if (!checkAnimal(gameLogic.ROWS - row - 1, gameLogic.COLS - col - 1) || isOpponent(gameLogic.ROWS - row - 1, gameLogic.COLS - col - 1)) return; // the player selects a wrong piece.
    }
    else {
      if (!checkAnimal(row, col) || isOpponent(row, col)) return; // the player selects a wrong piece.
    }
    if (!isHumanTurn()) return;
    // log.info(firstClicked);

    if (!firstClicked) {
      pre_row = row;
      pre_col = col;
      firstClicked = true;
      cellClickedOneDone = true;

      click_row = row;
      click_col = col;
      log.info("cellCilckedOnw info: a new piece is chosen")
    }
    else {
      log.info("cellCilckedOne info: Has already chosen a piece, now should make move or choose another own piece");
    }
  }

  export function cellClickedTwo(row: number, col: number): void {
    if (shouldRotateBoard) {
      var rotate_row: number = gameLogic.ROWS - row - 1;
      var rotate_col = gameLogic.COLS - col - 1;
      log.info("Clicked on cell (two):", rotate_row, rotate_col);
      if (!isHumanTurn()) return;
      // log.info(firstClicked);
      if (cellClickedOneDone) {
        log.info("cellClickedTwo info: cellClickedOne is done in this round, can't execute the Two function");
        cellClickedOneDone = false;
        return;
      }
      if (isOwn(rotate_row, rotate_col)) { // if the player select another own piece
        log.info("cellClickedTwo info: select another own piece");
        firstClicked = false; // clear previous selection
        pre_row = null; // clear previous selection
        pre_col = null; // clear previous selection
        cellClickedOne(row, col); // call the cellClickedOne to choose this piece
        cellClickedOneDone = false; // next click will skip cellClickedOne and execute cellClickedTwo
        return;
      }
      if (firstClicked) {
        let nextMove: IMove = null;
        try {
          nextMove = gameLogic.createMove(
            state, rotate_row, rotate_col, pre_row, pre_col, currentUpdateUI.turnIndex);
        } catch (e) {
          log.info(["cellClickedTwo info: Invalid move:", row, col]);
          cellClickedOneDone = false; // the move is invalid, the player should choose another piece to move
          firstClicked = false; // the move is invalid, the player should choose another piece to move
          pre_row = null; // the move is invalid, the player should choose another piece to move
          pre_col = null; // the move is invalid, the player should choose another piece to move
          return;
        }
        // Move is legal, make it!
        $rootScope.hideAfterAnimation = false;
        makeMove(nextMove);
        firstClicked = false;
        pre_row = null;
        pre_col = null;
        log.info("cellClickedTwo info: success");
      }
      else {
        log.info("cellClickedTwo info: Has not chosen a piece, now should choose a picec first");
      }
    }
    else {
      log.info("Clicked on cell (two):", row, col);
      if (!isHumanTurn()) return;
      // log.info(firstClicked);
      if (cellClickedOneDone) {
        log.info("cellClickedTwo info: cellClickedOne is done in this round, can't execute the Two function");
        cellClickedOneDone = false;
        return;
      }
      if (isOwn(row, col)) { // if the player select another own piece
        log.info("cellClickedTwo info: select another own piece");
        firstClicked = false; // clear previous selection
        pre_row = null; // clear previous selection
        pre_col = null; // clear previous selection
        cellClickedOne(row, col); // call the cellClickedOne to choose this piece
        cellClickedOneDone = false; // next click will skip cellClickedOne and execute cellClickedTwo
        return;
      }
      if (firstClicked) {
        let nextMove: IMove = null;
        try {
          nextMove = gameLogic.createMove(
            state, row, col, pre_row, pre_col, currentUpdateUI.turnIndex);
        } catch (e) {
          log.info(["cellClickedTwo info: Invalid move:", row, col]);
          cellClickedOneDone = false; // the move is invalid, the player should choose another piece to move
          firstClicked = false; // the move is invalid, the player should choose another piece to move
          pre_row = null; // the move is invalid, the player should choose another piece to move
          pre_col = null; // the move is invalid, the player should choose another piece to move
          return;
        }
        // Move is legal, make it!
        $rootScope.hideAfterAnimation = false;
        makeMove(nextMove);
        firstClicked = false;
        pre_row = null;
        pre_col = null;
        log.info("cellClickedTwo info: success");
      }
      else {
        log.info("cellClickedTwo info: Has not chosen a piece, now should choose a picec first");
      }
    }
  }

  export function shouldApplyMovePieceAnimation(row: number, col: number) {
    if (shouldRotateBoard) {
      var row: number = gameLogic.ROWS - row - 1;
      var col = gameLogic.COLS - col - 1;
    }
    if (!(state.toDelta && state.toDelta.row === row && state.toDelta.col === col))
      return "";
    let fromRow = state.fromDelta.row;
    let fromCol = state.fromDelta.col;
    if ((row - fromRow) === 1 && fromCol === col) {
      return shouldRotateBoard ? "move_up" : "move_down";
    }
    else if (fromRow === row && (col - fromCol) === 1) {
      return shouldRotateBoard ? "move_left" : "move_right";
    }
    else if ((fromRow - row) === 1 && fromCol === col) {
      return shouldRotateBoard ? "move_down" : "move_up";
    }
    else if (fromRow === row && (fromCol - col) === 1) {
      return shouldRotateBoard ? "move_right" : "move_left";
    }
    else if ((row - fromRow) === 4 && fromCol === col) {
      return shouldRotateBoard ? "jump_up" : "jump_down";
    }
    else if (fromRow === row && (col - fromCol) === 3) {
      return shouldRotateBoard ? "jump_left" : "jump_right";
    }
    else if ((fromRow - row) === 4 && fromCol === col) {
      return shouldRotateBoard ? "jump_down" : "jump_up";
    }
    else if (fromRow === row && (fromCol - col) === 3) {
      return shouldRotateBoard ? "jump_rgiht" : "jump_left";
    }
  }

  export function getAnimalClasses(row: number, col: number) {
    let classesObj: any = {selected: game.changeSelectCSS(row, col), disabled: game.isOpponent(row, col)};
    let additionalClass = game.shouldApplyMovePieceAnimation(row, col);
    classesObj[additionalClass] = true;
    return classesObj;
  }

  export function changeSelectCSS(row: number, col: number): boolean {
    if (shouldRotateBoard) {
      row = gameLogic.ROWS - row - 1;
      col = gameLogic.COLS - col - 1;
    }

    if (firstClicked && click_row === row && click_col === col && isOwn(row, col)) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isPossibleMove(row: number, col: number): boolean {
    if (shouldRotateBoard) {
      row = gameLogic.ROWS - row - 1;
      col = gameLogic.COLS - col - 1;
    }

    if (firstClicked) {
      let row_dif: number = Math.abs(click_row - row);
      let col_dif: number = Math.abs(click_col - col);
      if ((row_dif === 4 && col_dif === 0) || (row_dif === 0 && col_dif === 4) ||
        (row_dif === 3 && col_dif === 0) || (row_dif === 0 && col_dif === 3) ||
        (row_dif === 1 && col_dif === 0) || (row_dif === 0 && col_dif === 1)) {
        log.info(row, col);
        if (gameLogic.isPossibleMove(state, click_row, click_col, row, col, currentUpdateUI.turnIndex)) {
          return true;
        }
      }
    }
    else {
      return false;
    }
  }

  export function shouldExplode(row: number, col: number) {
    let checkOne: string = checkAnimalBeforeThisMove(row, col);  // the previous animal at (row, col)
    let checkTwo: string = checkAnimal(row, col);  // the current animal at (row, col)
    return checkOne && checkTwo && (checkOne != checkTwo);
  }

  function isPiece(row: number, col: number, turnIndex: number, pieceKind: string): boolean {
    return state.board[row][col] === pieceKind || (isProposal(row, col) && currentUpdateUI.turnIndex == turnIndex);
  }

  //add functions
  export function isGrass(row: number, col: number): boolean {
    return !isWater(row, col);
  }

  export function isWater(row: number, col: number): boolean {
    if ((row >= 3 && row <= 5 && col >= 1 && col <= 2) || (row >= 3 && row <= 5 && col >= 4 && col <= 5)) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isBTrap(row: number, col: number): boolean {
    if (shouldRotateBoard) {
      row = gameLogic.ROWS - row - 1;
      col = gameLogic.COLS - col - 1;
    }
    if ((row === 8 && col === 2) || (row === 7 && col === 3) || (row === 8 && col === 4)) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRTrap(row: number, col: number): boolean {
    if (shouldRotateBoard) {
      row = gameLogic.ROWS - row - 1;
      col = gameLogic.COLS - col - 1;
    }
    if ((row === 0 && col === 2) || (row === 1 && col === 3) || (row === 0 && col === 4)) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isBHome(row: number, col: number): boolean {
    if (shouldRotateBoard) {
      row = gameLogic.ROWS - row - 1;
      col = gameLogic.COLS - col - 1;
    }
    if (row === 8 && col === 3) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRHome(row: number, col: number): boolean {
    if (shouldRotateBoard) {
      row = gameLogic.ROWS - row - 1;
      col = gameLogic.COLS - col - 1;
    }
    if (row === 0 && col === 3) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isOpponent(row: number, col: number): boolean {
    if (shouldRotateBoard) {
      row = gameLogic.ROWS - row - 1;
      col = gameLogic.COLS - col - 1;
    }
    let curColor = gameLogic.getTurn(currentUpdateUI.turnIndex);
    let curAnimal = state.board[row][col];
    if (curAnimal.substring(0, 1) === curColor || curAnimal.substring(1, 2) === 'T' || curAnimal.substring(1, 2) === 'H') {
      return false;
    }
    return true;
  }

  export function isOwn(row: number, col: number): boolean {
    let curColor = gameLogic.getTurn(currentUpdateUI.turnIndex);
    let curAnimal = state.board[row][col];
    if (curAnimal.substring(0, 1) === curColor && curAnimal.substring(1, 2) !== 'T' && curAnimal.substring(1, 2) !== 'H') {
      return true;
    }
    return false;
  }

  export function checkAnimal(row: number, col: number): string {
    if (!state) {
      state = gameLogic.getInitialState();
    }
    if (shouldRotateBoard) {
      row = gameLogic.ROWS - row - 1;
      col = gameLogic.COLS - col - 1;
    }
    return gameLogic.checkAnimal(state.board, row, col);
  }

  export function checkAnimalBeforeThisMove(row: number, col: number): string {
    if (!state) {
      state = gameLogic.getInitialState();
    }
    if (!state.boardBefore) {
      return null;
    }
    if (shouldRotateBoard) {
      row = gameLogic.ROWS - row - 1;
      col = gameLogic.COLS - col - 1;
    }
    return gameLogic.checkAnimal(state.boardBefore, row, col);
  }

}

angular.module('myApp', ['gameServices'])
  .run(['$rootScope', '$timeout',
    function ($rootScope: angular.IMyScope, $timeout: angular.ITimeoutService) {
      $rootScope['game'] = game;
      game.init($rootScope, $timeout);
    }]);
