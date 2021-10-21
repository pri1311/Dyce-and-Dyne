var goalstate = [1, 2, 3, 4, 5, 6, 7, 8, 0];
var visited = [];
var stack = [];
var maxInt = 111111;

function reshape(list, elementsPerSubArray = 3) {
  var matrix = [],
    i,
    k;

  for (i = 0, k = -1; i < list.length; i++) {
    if (i % elementsPerSubArray === 0) {
      k++;
      matrix[k] = [];
    }

    matrix[k].push(list[i]);
  }

  return matrix;
}

function flatten(state) {
  var state_flat = [];
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      state_flat.push(state[i][j]);
    }
  }

  return state_flat;
}

function copyList(arr) {
  if (arr.length == 9) {
    var ans = [];
    for (var i = 0; i < 9; i++) {
      ans.push(arr[i]);
    }

    return ans;
  } else {
    var ans = [];
    for (var i = 0; i < 3; i++) {
      var temp = [];
      for (var j = 0; j < 3; j++) {
        temp.push(arr[i][j]);
      }
      ans.push(temp);
    }

    return ans;
  }
}

function heuristicValueManhattan(state) {
  var count = 0;
  //   console.log(state);
  //   state = reshape(state);
  var goal = reshape(goalstate);
  //   console.log(goal);
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      for (var x = 0; x < 3; x++) {
        for (var y = 0; y < 3; y++) {
          if (state[i][j] == goal[x][y]) {
            count = count + Math.abs(x - i) + Math.abs(y - j);
          }
        }
      }
    }
  }
  return count;
}

function heuristicValueHamming(state) {
  var count = 0;
  var state_copy = copyList(state);
  state_copy = flatten(state_copy);
  // console.log("in heur", state, state_copy);
  // console.log(goalstate);
  for (var i = 0; i < 9; i++) {
    if (state_copy[i] != goalstate[i]) {
      count += 1;
    }
  }
  // console.log(count);
  return count;
}

function checkBounds(i, j) {
  if (i < 0 || i >= 3 || j < 0 || j >= 3) return false;
  return true;
}

function presentInVisited(puzzle) {
  var state = copyList(puzzle);
  state = flatten(state);

  var c = 0;
  for (var i = 0; i < visited.length; i++) {
    c = 0;
    for (var j = 0; j < 9; j++) {
      if (state[j] != visited[i][j]) {
        c = 1;
        break;
      }
    }

    if (c == 0) break;
  }

  if (c == 1) return true;

  return false;
}

function isEqualToGoalState(state) {
  var c = 0;
  for (var i = 0; i < 9; i++) {
    if (goalstate[i] == state[i]) c++;
  }
  if (c == 9) return true;
  else return false;
}

function nextMove(state, algo) {
  // debugger;
  var arr = reshape(state);
  // console.log("nm 1", arr);
  var copy_arr = copyList(arr);
  // console.log("1st copy", copy_arr);
  var blank_tile_i = -1;
  var blank_tile_j = -1;

  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      if (arr[i][j] == 0) {
        blank_tile_i = i;
        blank_tile_j = j;
        break;
      }
    }
  }

  // console.log(blank_tile_i, blank_tile_j);

  var upScore = maxInt;
  var leftScore = maxInt;
  var downScore = maxInt;
  var rightScore = maxInt;

  var upBool = true;
  var leftBool = true;
  var downBool = true;
  var rightBool = true;

  var arr_1 = [];
  var arr_2 = [];
  var arr_3 = [];
  var arr_4 = [];

  var temp = 9999;
  if (checkBounds(blank_tile_i + 1, blank_tile_j)) {
    // console.log("in down");
    temp = arr[blank_tile_i][blank_tile_j];
    arr[blank_tile_i][blank_tile_j] = arr[blank_tile_i + 1][blank_tile_j];
    arr[blank_tile_i + 1][blank_tile_j] = temp;

    if (presentInVisited(arr)) {
      if (algo == "hamming") {
        downScore = heuristicValueHamming(arr);
      } else {
        downScore = heuristicValueManhattan(arr);
      }
      arr_3 = copyList(arr);
    }
  }

  // console.log("2nd copy", copy_arr);
  arr = copyList(copy_arr);

  if (checkBounds(blank_tile_i, blank_tile_j - 1)) {
    // console.log("in left");
    temp = arr[blank_tile_i][blank_tile_j];
    arr[blank_tile_i][blank_tile_j] = arr[blank_tile_i][blank_tile_j - 1];
    arr[blank_tile_i][blank_tile_j - 1] = temp;
    // console.log(arr, copy_arr);

    if (presentInVisited(arr)) {
      if (algo == "hamming") {
        leftScore = heuristicValueHamming(arr);
      } else {
        leftScore = heuristicValueManhattan(arr);
      }
      arr_2 = copyList(arr);
    }
  }

  // console.log("3rd copy", copy_arr);
  arr = copyList(copy_arr);

  if (checkBounds(blank_tile_i, blank_tile_j + 1)) {
    // console.log("in right");
    temp = arr[blank_tile_i][blank_tile_j];
    arr[blank_tile_i][blank_tile_j] = arr[blank_tile_i][blank_tile_j + 1];
    arr[blank_tile_i][blank_tile_j + 1] = temp;

    if (presentInVisited(arr)) {
      if (algo == "hamming") {
        rightScore = heuristicValueHamming(arr);
      } else {
        rightScore = heuristicValueManhattan(arr);
      }
      arr_4 = copyList(arr);
    }
  }

  // console.log("4th copy", copy_arr);
  arr = copyList(copy_arr);
  // console.log("copy", copy_arr, arr);
  if (checkBounds(blank_tile_i - 1, blank_tile_j)) {
    // console.log("in up");

    temp = arr[blank_tile_i][blank_tile_j];
    arr[blank_tile_i][blank_tile_j] = arr[blank_tile_i - 1][blank_tile_j];
    arr[blank_tile_i - 1][blank_tile_j] = temp;

    if (presentInVisited(arr)) {
      if (algo == "hamming") {
        upScore = heuristicValueHamming(arr);
      } else {
        upScore = heuristicValueManhattan(arr);
      }
      arr_1 = copyList(arr);
    }
  }

  var sorted_arr = [upScore, leftScore, downScore, rightScore];
  sorted_arr.sort(function (a, b) {
    if (a < b) return 1;
    if (a > b) return -1;
    return 0;
  });

  for (var i = 0; i < 4; i++) {
    if (sorted_arr[i] != maxInt) {
      if (sorted_arr[i] == downScore && downBool) {
        downBool = false;
        stack.push(flatten(arr_3));
      } else if (sorted_arr[i] == leftScore && leftBool) {
        leftBool = false;
        stack.push(flatten(arr_2));
      } else if (sorted_arr[i] == rightScore && rightBool) {
        rightBool = false;
        stack.push(flatten(arr_4));
      } else if (sorted_arr[i] == upScore && upBool) {
        upBool = false;
        stack.push(flatten(arr_1));
      }
    }
  }

  var new_puzzle = [[999999]];
  if (stack.length > 0) {
    new_puzzle = stack.pop();
  } else {
    return [-1];
  }

  visited.push(copyList(new_puzzle));
  return new_puzzle;
}

function startSolving(puzzle, algo) {
  var counter = 0;
  var f = 0;
  while (!isEqualToGoalState(puzzle)) {
    // console.log("in start while", puzzle);
    puzzle = nextMove(puzzle, algo);

    for (var i = 0; i < puzzle.length; i++) {
      if (puzzle[i] == -1) {
        f = -1;
        break;
      }
    }
    counter += 1;
  }

  if (f == -1) {
    return -1;
  }

  return counter;
}

function solve8puzzle(puzzle) {
  stack = [];
  visited = [];
  visited.push(copyList(puzzle));
  var minMoves = startSolving(puzzle, "manhattan");

  return minMoves;
}
