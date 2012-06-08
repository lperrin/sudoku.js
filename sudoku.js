var SIZE = 9,
    BLOC_SIZE = Math.sqrt(SIZE);

/**
 * An immutable cell containing the values that are still possible.
 * Initially, it contains 1-9. After being solved, it contains a single value
 */
function Cell(x, y, values) {
  this.x = x;
  this.y = y;
  this.solved = false;
  this.value = null;

  if(typeof values === 'undefined') {
    this.values = [];
    for(var i = 1; i <= SIZE; i++)
      this.values.push(i);
  } else {
    this.values = values;

    if(values.length === 1) {
      this.solved = true;
      this.value = values[0];
    }
  }
}

/**
 * Returns a cell with a single possible value or null if the
 * cell was already solved for a different value.
 * The cell retains the same coordinates. The original cell is unchanged.
 */
Cell.prototype.solve = function(value) {
  if(this.values.indexOf(value) < 0)
    return null;

  if(this.solved)
    return this;

  return new Cell(this.x, this.y, [value]);
};

/**
 * Return a cell where the given value is removed or null if not possible.
 * The original cell is unchanged.
 */
Cell.prototype.removeValue = function(val, cb) {
  var idx = this.values.indexOf(val);

  if(idx < 0)
    return this;

  var newValues = this.values.filter(function(i) {
    return i !== val;
  });

  if(newValues.length === 0)
    return null;

  return new Cell(this.x, this.y, newValues);
};

/**
 * A Sudoku grid which has initally no fixed values.
 * It can optionally initialize with a previous set of cells.
 * The existing cells will not be modified.
 */
function Sudoku(cells) {
  function gridIterator(fun) {
    for(var y = 1; y <= SIZE; y++) {
      for(var x = 1; x <= SIZE; x++) {
        fun(x, y);
      }
    }
  }

  var self = this;

  this.cellsToSolve = 0;

  if(typeof cells === 'undefined') {
    this.cells = [];
    gridIterator(function(x, y) {
      var cell = new Cell(x, y);
      self.cells.push(cell);
    });
  } else
    this.cells = Array.prototype.slice.call(cells);

  this.cells.forEach(function(cell) {
    if(!cell.solved)
      self.cellsToSolve++;
  });
}

if(typeof module !== 'undefined')
  module.exports = Sudoku;
else
  window.Sudoku = Sudoku;

function getCellIndex(x, y) {
  if(x < 1 || x > SIZE || y < 1 || y > SIZE) {
    console.trace('coord out of bounds: ' + x + ', ' + y);
    throw 'out of bounds: '  + x + ', ' + y;
  }

  return (y - 1)*SIZE + (x - 1);
}

Sudoku.prototype.getCell = function(x, y) {
  return this.cells[getCellIndex(x, y)];
};

Sudoku.prototype.setCell = function(x, y, cell) {
  this.cells[getCellIndex(x, y)] = cell;
};

/**
 * Assign a single value to a cell, effectively "solving" it.
 */
Sudoku.prototype.forceCellValue = function(x, y, value) {
  var cell = this.getCell(x, y),
      solvedCell = cell.solve(value);

  if(!solvedCell)
    return false;

  if(!cell.solved)
    this.cellsToSolve--;

  this.setCell(x, y, solvedCell);

  return this.applyRules(solvedCell);
};

/**
 * Apply the Sudoku rules to set depending of the given cell.
 * The set is: the horizontal line, the vertical line and the surrounding bloc.
 */
Sudoku.prototype.applyRules = function(cell) {
  function lineIterator(coord, isHorizontal, fun) {
    for(var i = 1; i <= SIZE; i++) {
      var x = isHorizontal ? i : coord,
          y = isHorizontal ? coord : i;

      fun(x, y);
    }
  }

  function horizontalIterator(y, fun) {
    lineIterator(y, true, fun);
  }

  function verticalIterator(x, fun) {
    lineIterator(x, false, fun);
  }

  function blocIterator(x, y, fun) {
    var bx = Math.floor((x - 1)/BLOC_SIZE),
        by = Math.floor((y - 1)/BLOC_SIZE);

    for(var j = by*BLOC_SIZE + 1; j <= (by + 1)*BLOC_SIZE; j++) {
      for(var i = bx*BLOC_SIZE + 1; i <= (bx + 1)*BLOC_SIZE; i++) {
        fun(i, j);
      }
    }
  }

  function rulesIterator(xs, ys, fun) {
    horizontalIterator(ys, function(x, y) {
      if(xs !== x)
        fun(x, y);
    });

    verticalIterator(xs, function(x, y) {
      if(ys !== y)
        fun(x, y);
    });

    blocIterator(xs, ys, function(x, y) {
      if(x !== xs || y !== ys)
        fun(x, y);
    });
  }

  var self = this,
      noconflicts = true;

  rulesIterator(cell.x, cell.y, function(xIt, yIt) {
    var cellIt = self.getCell(xIt, yIt),
        newCellIt = cellIt.removeValue(cell.value);

    if(newCellIt === null) {
      noconflicts = false;
      return;
    }

    self.setCell(xIt, yIt, newCellIt);

    if(!cellIt.solved && newCellIt.solved) {
      self.cellsToSolve--;
      noconflicts &= self.applyRules(newCellIt);
    }
  });

  return noconflicts;
};

/**
 * The callback is called each time a solution is found.
 * Simple backtracking algorithm.
 */
Sudoku.prototype.solve = function(findAllSolutions, cb) {
  var self = this;

  if(this.cellsToSolve === 0) {
    cb(this);

    return true;
  }

  function getNextUnsolvedCell(cells) {
    for(var i = 0, l = cells.length; i < l; i++) {
      var cell = cells[i];
      if(!cell.solved)
        return cell;
    }

    return null;
  }

  var cell = getNextUnsolvedCell(this.cells);

  // Array#some rather than forEach to stop iterating
  // as soon as we find a solution.
  return cell.values.some(function(value) {
    var newSudoku = new Sudoku(self.cells);

    // if this value creates a conflict, give up
    if(!newSudoku.forceCellValue(cell.x, cell.y, value))
      return false;

    return newSudoku.solve(findAllSolutions, cb) && !findAllSolutions;
  });
};

Sudoku.prototype.toString = function() {
  var s = '';

  for(var y = 1; y <= SIZE; y++) {
    for(var x = 1; x <= SIZE; x++) {
      var cell = this.getCell(x, y);
      s+= cell.solved ? cell.value : '*';
    }
    s += '\n';
  }

  return s;
};
