#!/usr/bin/env node

var Suite = require("benchmark").Suite;

var Digraph = require("..").Digraph;

var suite = new Suite("benchmarks");
suite.on("cycle", function(event) {
  console.log("    " + event.target);
});
suite.on("error", function(event) {
  console.error("    " + event.target.error);
});

suite.add("set", function() {
  Digraph.empty().set(0);
});

suite.add("setDelete", function() {
  Digraph.empty().set(0).delete(0);
});

suite.add("setEdge", function() {
  Digraph.empty().setEdge(0, 1);
});

suite.add("setDeleteEdge", function() {
  Digraph.empty().setEdge(0, 1).deleteEdge(0, 1);
});

suite.run();
