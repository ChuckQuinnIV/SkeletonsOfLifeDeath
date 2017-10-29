var Board, Change, Unit, funkBind, pixel;

pixel = $("<div />", {
  "class": "pixel"
});

funkBind = function(context, funk) {
  return function() {
    return funk.apply(context, arguments);
  };
};

Change = (function() {
  function Change(unit1) {
    this.unit = unit1;
  }

  Change.prototype.fire = function() {
    return this.unit.toggle();
  };

  return Change;

})();

Board = {
  size: 50,
  locked: false,
  units: [],
  _interval: null,
  overflow: true,
  _intervalFunk: function() {
    return this.step();
  },
  start: function() {
    if (this._interval === null) {
      return this._interval = setInterval(funkBind(this, this._intervalFunk), 100);
    }
  },
  stop: function() {
    if (this._interval === null) {
      return;
    }
    clearInterval(this._interval);
    return this._interval = null;
  },
  _build: function() {
    var i, j, k, ref, results;
    results = [];
    for (i = k = 0, ref = this.size; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      this.units.push([]);
      results.push((function() {
        var l, ref1, results1;
        results1 = [];
        for (j = l = 0, ref1 = this.size; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
          results1.push(this.units[i].push(new Unit(pixel.clone())));
        }
        return results1;
      }).call(this));
    }
    return results;
  },
  draw: function() {
    var k, len, ref, results, row, unit;
    this.boardEl.empty();
    ref = this.units;
    results = [];
    for (k = 0, len = ref.length; k < len; k++) {
      row = ref[k];
      results.push((function() {
        var l, len1, results1;
        results1 = [];
        for (l = 0, len1 = row.length; l < len1; l++) {
          unit = row[l];
          results1.push(this.boardEl.append(unit.el));
        }
        return results1;
      }).call(this));
    }
    return results;
  },
  reset: function() {
    var k, len, ref, results, row, unit;
    this.clearStepCount();
    ref = this.units;
    results = [];
    for (k = 0, len = ref.length; k < len; k++) {
      row = ref[k];
      results.push((function() {
        var l, len1, results1;
        results1 = [];
        for (l = 0, len1 = row.length; l < len1; l++) {
          unit = row[l];
          if (unit.alive) {
            results1.push(unit.toggle());
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      })());
    }
    return results;
  },
  clearStepCount: function() {
    return $(".step-count").text("0");
  },
  incrStepCount: function() {
    var count, countEl;
    countEl = $(".step-count");
    count = parseInt(countEl.text());
    return countEl.text(count + 1);
  },
  randomize: function() {
    var k, len, ref, results, row, unit;
    this.clearStepCount();
    ref = this.units;
    results = [];
    for (k = 0, len = ref.length; k < len; k++) {
      row = ref[k];
      results.push((function() {
        var l, len1, results1;
        results1 = [];
        for (l = 0, len1 = row.length; l < len1; l++) {
          unit = row[l];
          results1.push(unit.toggle(true, Math.random() > .5));
        }
        return results1;
      })());
    }
    return results;
  },
  overflowCoord: function(x) {
    if (x < 0) {
      return this.size + x;
    } else if (x >= this.size) {
      return x - this.size;
    } else {
      return x;
    }
  },
  getNeighborCount: function(r, c) {
    var a, locations;
    locations = [[r - 1, c - 1], [r - 1, c], [r - 1, c + 1], [r, c - 1], [r, c + 1], [r + 1, c - 1], [r + 1, c], [r + 1, c + 1]];
    a = [];
    locations.forEach((function(_this) {
      return function(loc) {
        var row, unit, x, y;
        x = loc[0], y = loc[1];
        if (_this.overflow) {
          x = _this.overflowCoord(x);
          y = _this.overflowCoord(y);
        }
        row = _this.units[x];
        if (!row) {
          return;
        }
        unit = _this.units[x][y];
        if (!unit) {
          return;
        }
        if (unit.alive) {
          return a.push(unit);
        }
      };
    })(this));
    return a.length;
  },
  step: function() {
    var c, changes, k, l, len, len1, neighbors, r, ref, row, unit;
    changes = [];
    ref = this.units;
    for (r = k = 0, len = ref.length; k < len; r = ++k) {
      row = ref[r];
      for (c = l = 0, len1 = row.length; l < len1; c = ++l) {
        unit = row[c];
        neighbors = this.getNeighborCount(r, c);
        if (unit.alive) {
          if (neighbors < 2 || neighbors > 3) {
            changes.push(new Change(unit));
          }
        } else {
          if (neighbors === 3) {
            changes.push(new Change(unit));
          }
        }
      }
    }
    changes.forEach(function(change) {
      return change.fire();
    });
    return this.incrStepCount();
  }
};

Unit = (function() {
  function Unit(el) {
    this.el = el;
    this.alive = false;
    this.el.on({
      click: funkBind(this, this.click)
    });
  }

  Unit.prototype.click = function() {
    return this.toggle();
  };

  Unit.prototype.toggle = function(override, value) {
    if (override == null) {
      override = false;
    }
    if (value == null) {
      value = false;
    }
    if (override) {
      this.alive = value;
    } else {
      this.alive = !this.alive;
    }
    return this.el.toggleClass("alive", this.alive);
  };

  return Unit;

})();

$(function() {
  Board.boardEl = $(".board");
  Board._build();
  Board.draw();
  $(".btn-start").on({
    click: function() {
      Board.start();
      $(".btn-step").attr("disabled", true);
      return $(".btn-stop").attr("disabled", null);
    }
  });
  $(".btn-stop").on({
    click: function() {
      Board.stop();
      $(".btn-step").attr("disabled", null);
      return $(this).attr("disabled", true);
    }
  });
  $(".btn-stop").attr("disabled", true);
  $(".btn-reset").on({
    click: function() {
      Board.reset();
      return $(".btn-stop").click();
    }
  });
  $(".btn-step").on({
    click: funkBind(Board, Board.step)
  });
  return $(".btn-random").on({
    click: funkBind(Board, Board.randomize)
  });
});