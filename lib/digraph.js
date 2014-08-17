var Immutable = require("immutable"),
    Map = Immutable.Map;

module.exports = Digraph;

function Digraph() {
  this._nodes = Map.empty();
}

var EMPTY;

Digraph.empty = function() {
  return EMPTY || (EMPTY = new Digraph());
};

Digraph.prototype.isEmpty = function() { return true; };

Digraph.prototype.inspect = Digraph.prototype.toString = function() {
  return "Digraph { " + this._nodes.toString() + " }";
};

Digraph.prototype.equals = function(other) {
  if (this === other) {
    return true;
  }
  if (!(other instanceof Digraph)) {
    return false;
  }
  return this._nodes.equals(other._nodes);
};

Digraph.prototype.numNodes = function() { return this._nodes.length; };

Digraph.prototype.nodeIds = function() { return this._nodes.keys().toArray(); };

Digraph.prototype.set = function(v, lab) {
  return makeDigraph(updateNodeCtx(this._nodes, v, setLabel(lab)));
};

Digraph.prototype.update = function(v, updater) {
  return this.set(v, updater(this.get(v)));
};

Digraph.prototype.delete = function(v) {
  return makeDigraph(this._nodes.delete(v));
};

Digraph.prototype.get = function(v) {
  var ctx = getNodeCtx(this, v);
  if (ctx) {
    return ctx.get("lab");
  }
};

Digraph.prototype.has = function(v) {
  return this._nodes.has(v);
};

// TODO: this is O(|V|)
Digraph.prototype.numEdges = function() {
  return this._nodes.reduce(function(acc, v) {
    return acc + v.get("out").length;
  }, 0);
};

Digraph.prototype.edges = function() {
  return this._nodes.reduce(function(acc, node) {
    return acc.concat(node.get("out").values().toArray().map(function(x) { return x.toObject(); }));
  }, []);
};

Digraph.prototype.setEdge = function(v, w, lab) {
  var nodes = this._nodes.withMutations(function(nodes) {
    var edge = new Map({ v: v, w: w, lab: lab });
    updateNodeCtx(nodes, v, addAdj("out", w, edge));
    updateNodeCtx(nodes, w, addAdj("in", v, edge));
  });
  return makeDigraph(nodes);
};

Digraph.prototype.updateEdge = function(v, w, updater) {
  return this.setEdge(v, w, updater(this.getEdge(v, w)));
};

Digraph.prototype.deleteEdge = function(v, w) {
  var nodes  = this._nodes.withMutations(function(nodes) {
    updateNodeCtx(nodes, v, delAdj("out", w));
    updateNodeCtx(nodes, w, delAdj("in", v));
  });
  return makeDigraph(nodes);
};

Digraph.prototype.getEdge = function(v, w) {
  var ctx = getEdgeCtx(this, v, w);
  if (ctx) {
    return ctx.get("lab");
  }
};

Digraph.prototype.hasEdge = function(v, w) {
  var ctx = getEdgeCtx(this, v, w);
  return ctx !== undefined;
};

function makeDigraph(nodes) {
  var g = new Digraph();
  g._nodes = nodes;
  return g;
}

function getNodeCtx(g, v) {
  return g._nodes.get(v);
}

function getEdgeCtx(g, v, w) {
  var nodeCtx = getNodeCtx(g, v);
  if (nodeCtx) {
    return nodeCtx.get("out").get(w);
  }
}

function updateNodeCtx(nodes, v, updater) {
  var ctx = nodes.get(v);
  if (!ctx) {
    ctx = new Map({ in: new Map(), v: v, lab: undefined, out: new Map() });
  }
  return nodes.set(v, updater(ctx));
}

function setLabel(label) {
  return function(ctx) {
    return ctx.set("lab", label);
  };
}

function addAdj(type, v, edge) {
  return function(ctx) {
    return ctx.update(type, function(adjs) {
      return adjs.set(v, edge);
    });
  };
}

function delAdj(type, v) {
  return function(ctx) {
    return ctx.update(type, function(adjs) {
      return adjs.delete(v);
    });
  };
}
