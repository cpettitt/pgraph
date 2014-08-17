#!/usr/bin/env node

var Benchmark = require("benchmark"),
    Suite = Benchmark.Suite,
    sprintf = require("sprintf").sprintf;

var suite = new Suite("benchmarks");
suite.on("cycle", function(bench) {
  var target = bench.target,
      hz = target.hz,
      stats = target.stats,
      rme = stats.rme,
      samples = stats.sample.length,
      msg = sprintf("    %20s: %13s ops/sec \xb1 %s%% (%3d run(s) sampled)",
                    target.name,
                    Benchmark.formatNumber(hz.toFixed(2)),
                    rme.toFixed(2),
                    samples);
  console.log(msg);
});
suite.on("error", function(event) {
  console.error("    " + event.target.error);
});

var Digraph = require("..").Digraph;

var NODE_SIZES = [10, 100, 1000],
    EDGE_DENSITY = 0.2,
    KEY_SIZE = 10;

function keys(count) {
  var ks = [],
      k;
  for (var i = 0; i < count; ++i) {
    k = "";
    for (var j = 0; j < KEY_SIZE; ++j) {
      k += String.fromCharCode(97 + Math.floor(Math.random() * 26));
    }
    ks.push(k);
  }
  return ks;
}

function buildGraph(numNodes, edgeDensity) {
  var g = Digraph.empty(),
      numEdges = numNodes * numNodes * edgeDensity,
      ks = keys(numNodes);
  ks.forEach(function(k) {
    g = g.set(k);
  });

  for (var i = 0; i < numEdges; ++i) {
    var v, w;
    do {
      v = ks[Math.floor(Math.random() * ks.length)];
      w = ks[Math.floor(Math.random() * ks.length)];
    } while (g.hasEdge(v, w));
    g = g.setEdge(v, w);
  }
  return g;
}

suite.add("constructor", function() {
  new Digraph();
});

NODE_SIZES.forEach(function(size) {
  var g = buildGraph(size, EDGE_DENSITY),
      nodeIds = g.nodeIds(),
      node = nodeIds[Math.floor(Math.random() * nodeIds.length)],
      edges = g.edges(),
      edge = edges[Math.floor(Math.random() * edges.length)];

  suite.add("set(" + size + "," + EDGE_DENSITY + ")", function() {
    g.set("mykey", "label");
  });

  suite.add("get(" + size + "," + EDGE_DENSITY + ")", function() {
    g.get(node);
  });

  suite.add("delete(" + size + "," + EDGE_DENSITY + ")", function() {
    g.delete(node);
  });

  suite.add("setEdge(" + size + "," + EDGE_DENSITY + ")", function() {
    g.setEdge("from", "to", "label");
  });

  suite.add("getEdge(" + size + "," + EDGE_DENSITY + ")", function() {
    g.getEdge(edge.v, edge.w);
  });

  suite.add("deleteEdge(" + size + "," + EDGE_DENSITY + ")", function() {
    g.deleteEdge(edge.v, edge.w);
  });
});

suite.run();
