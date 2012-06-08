$(document).ready(function() {
  $('#sudoku').sudoku();

  function resetCell() {
    $(this).data('sudoku').value = null;
    $(this).html('');
    $(this).removeClass('fixed');
    $(this).removeClass('solved');
  }

  $('.grid').on('click', '.cell.fixed', resetCell);

  $('#reset').click(function() {
    $('#sudoky > .cell').each(resetCell);
  });

  $('#solve').click(function() {
    $('#sudoku').sudoku('solve');
  });
});

(function($) {
  var methods = {
    init: function() {
      makeGrid(this);

      this.find('.cell').hover(function() {
        if($(this).hasClass('fixed') || $(this).hasClass('solved'))
          return;

        var overlay = $('<div>').addClass('overlay');

        _.each(_.range(9), function(i) {
          overlay.append($('<span>').html(i + 1));
        });

        $(this).append(overlay);
      }, function() {
        $(this).children('.overlay').remove();
      });

      this.on('click', '.overlay > span', function() {
        var cell = $(this).parents('.cell'),
            value = parseInt($(this).html(), 10);

        cell.data('sudoku').value = value;
        cell.children('.overlay').remove();
        cell.addClass('fixed');
        cell.html(value);
      });

      return this;
    },

    solve: function() {
      var sudoku = new Sudoku();

      this.find('.cell.fixed').each(function() {
        var data = $(this).data('sudoku');
        sudoku.forceCellValue(data.x, data.y, data.value);
      });

      // false to get only the first solution
      sudoku.solve(false, function(grid) {
        $('.cell').each(function() {
          if($(this).hasClass('fixed'))
            return;

          var data = $(this).data('sudoku');
          $(this).addClass('solved').html(grid.getCell(data.x, data.y).value);
        });
      });
    }
  };

  $.fn.sudoku = function(method) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    }    
  };

  function makeGrid(grid) {
    function makeBlocLine(y) {
      var row = $('<tr>');

      _.each(_.range(3), function(x) {
        row.append(makeBloc(x, y));
      });

      return row;
    }

    function makeBloc(x, y) {
      var table = $('<table>');

      _.each(_.range(3), function(j) {
        table.append(makeLine(x * 3, y * 3 + j));
      });

      return $('<td>').addClass('bloc').append(table);
    }

    function makeLine(x, y) {
      var row = $('<tr>');

      _.each(_.range(3), function(i) {
        row.append(makeCell(x + i, y));
      });

      return row;
    }

    function makeCell(x, y) {
      return $('<td>')
        .addClass('cell')
        .data('sudoku', { x: x + 1, y: y + 1, value: null });
    }

    var table = $('<table>');

    _.each(_.range(3), function(y) {
      table.append(makeBlocLine(y));
    });

    grid.append(table);
  }
})(jQuery);

