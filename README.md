sudoku.js
=========

Simple Sudoku solver in JavaScript for node.js or browsers.

Bored in a train, I realized that what the world needed most was another JavaScript sudoku solver...

Usage
-----

* node.js: `node parse_grid.js grids/grid1.txt` in /test
* browser: just open demo.html

How it works
------------

First, a data structure to store a Sudoku cell:

* A set of possible values.
* When this set is reduced to a single value, the cell is solved.
* Cells are immutable.

The rules of Sudoku are applied recursively to reduce the number of possible values. There
is a custom iterator to scan the cells in conflict.

Finally, brute force is used to find solutions. Immutable cells make this part easier.

