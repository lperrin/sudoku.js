/*
 * Simple test script to parse a grid from a text file and immediately solve it.
 * Usage: node parse_grid.js grids/grid1.txt
 */

var fs = require('fs'),
    Sudoku = require('../sudoku.js');

var SIZE = 9;
var BLOC_SIZE = Math.sqrt(SIZE);

/**
 * Parse a text file containing a grid.
 * The file must contain exactly 9 lines.
 * Each line must be made of exactly 9 characters.
 * Acceptable characters are [1-9] or '*' for unknown values.
 *
 * The grid immediately applies the Sudoku rules to reduce
 * the number of possible values. This usually solves easy grids.
 */
Sudoku.prototype.parse = function(fileName) {
  var self = this;
  var data = fs.readFileSync(fileName);
  var lines = data.toString().split('\n');

  if(lines.length < SIZE) {
    console.trace('bad number of lines: ' + lines.length);
    process.exit(1);
  }

  var y = 0;
  lines.forEach(function(line) {
    y++;

    line.split('').forEach(function(char, i) {
      if(char === '*')
        return;

      var val = parseInt(char),
          x = i + 1;

      if(isNaN(val) || val < 1 || val > SIZE) {
        console.trace('bad value in grid: ' + char);
        process.exit(1);
      }

      self.forceCellValue(x, y, parseInt(char));
    });
  });
};

var sudoku = new Sudoku(),
    nbSolutions = 0;

sudoku.parse(process.argv[2]);

sudoku.solve(true, function(solution) {
  console.log(solution.toString());

  nbSolutions++;
  if(nbSolutions > 10) {
    console.log('Too many solutions.');
    process.exit();
  }
});
