var hamt = require("hamt");

module.exports = Digraph;

function Digraph() {
  this._nodes = hamt.empty;
}

var EMPTY;

Digraph.empty = function() {
  return EMPTY || (EMPTY = new Digraph());
};

Digraph.prototype.isEmpty = function() { return true; };

Digraph.prototype.inspect = Digraph.prototype.toString = function() {
  return "Digraph { " + this._nodes.toString() + " }";
};

Digraph.prototype.numNodes = function() { return hamt.count(this._nodes); };

Digraph.prototype.nodeIds = function() { return hamt.keys(this._nodes); };

Digraph.prototype.set = function(v, lab) {
  return makeDigraph(updateNodeCtx(this._nodes, v, setLabel(lab)));
};

Digraph.prototype.update = function(v, updater) {
  return this.set(v, updater(this.get(v)));
};

Digraph.prototype.delete = function(v) {
  var nodes = this._nodes,
      ctx = hamt.get(v, nodes);
  if (ctx) {
    nodes = hamt.remove(v, nodes);
    hamt.keys(hamt.get("in", ctx)).forEach(function(u) {
      nodes = updateNodeCtx(nodes, u, delAdj("out", v));
    });

    hamt.keys(hamt.get("out", ctx)).forEach(function(w) {
      nodes = updateNodeCtx(nodes, w, delAdj("in", v));
    });

    return makeDigraph(nodes);
  }
  return this;
};

Digraph.prototype.get = function(v) {
  var ctx = getNodeCtx(this, v);
  if (ctx) {
    return hamt.get("lab", ctx);
  }
};

Digraph.prototype.has = function(v) {
  return hamt.has(v, this._nodes);
};

// TODO: this is O(|V|)
Digraph.prototype.numEdges = function() {
  return hamt.fold(function(acc, entry) {
    var out = hamt.get("out", entry.value);
    return acc + hamt.count(out);
  }, 0, this._nodes);
};

Digraph.prototype.edges = function() {
  return hamt.fold(function(acc, entry) {
    var out = hamt.get("out", entry.value);
    return acc.concat(hamt.values(out).map(deconstructHamt));
  }, [], this._nodes);
};

Digraph.prototype.setEdge = function(v, w, lab) {
  var nodes = this._nodes;
  var edge = createHamt({ v: v, w: w, lab: lab });
  nodes = updateNodeCtx(nodes, v, addAdj("out", w, edge));
  nodes = updateNodeCtx(nodes, w, addAdj("in", v, edge));
  return makeDigraph(nodes);
};

Digraph.prototype.updateEdge = function(v, w, updater) {
  return this.setEdge(v, w, updater(this.getEdge(v, w)));
};

Digraph.prototype.deleteEdge = function(v, w) {
  var nodes  = this._nodes;
  nodes = updateNodeCtx(nodes, v, delAdj("out", w));
  nodes = updateNodeCtx(nodes, w, delAdj("in", v));
  return makeDigraph(nodes);
};

Digraph.prototype.getEdge = function(v, w) {
  var ctx = getEdgeCtx(this, v, w);
  if (ctx) {
    return hamt.get("lab", ctx);
  }
};

Digraph.prototype.hasEdge = function(v, w) {
  var ctx = getEdgeCtx(this, v, w);
  return !!ctx;
};

function makeDigraph(nodes) {
  var g = new Digraph();
  g._nodes = nodes;
  return g;
}

function getNodeCtx(g, v) {
  return hamt.get(v, g._nodes);
}

function getEdgeCtx(g, v, w) {
  var nodeCtx = getNodeCtx(g, v);
  if (nodeCtx) {
    return hamt.get(w, hamt.get("out", nodeCtx));
  }
}

function updateNodeCtx(nodes, v, updater) {
  var ctx = hamt.get(v, nodes);
  if (!ctx) {
    ctx = createHamt({ in: hamt.empty, v: v, lab: undefined, out: hamt.empty });
  }
  return hamt.set(v, updater(ctx), nodes);
}

function setLabel(label) {
  return function(ctx) {
    return hamt.set("lab", label, ctx);
  };
}

function addAdj(type, v, edge) {
  return function(ctx) {
    return modifyHamt(type, function(adjs) {
      return hamt.set(v, edge, adjs);
    }, ctx);
  };
}

function delAdj(type, v) {
  return function(ctx) {
    return modifyHamt(type, function(adjs) {
      return hamt.remove(v, adjs);
    }, ctx);
  };
}

function createHamt(obj) {
  var h = hamt.empty;
  Object.keys(obj).forEach(function(k) {
    h = hamt.set(k, obj[k], h);
  });
  return h;
}

function deconstructHamt(h) {
  var obj = {};
  hamt.keys(h).forEach(function(k) {
    obj[k] = hamt.get(k, h);
  });
  return obj;
}

function modifyHamt(k, updater, h) {
  return hamt.set(k, updater(hamt.get(k, h)), h);
}
