var expect = require("./chai").expect;

var Digraph = require("../lib/digraph");

describe("Digraph", function() {
  var empty;

  beforeEach(function() {
    empty = new Digraph();
  });

  describe("new Digraph()", function() {
    it("is empty", function() {
      expect(empty.isEmpty()).to.be.true;
    });

    it("has numNodes() = 0", function() {
      expect(empty.numNodes()).to.equal(0);
    });

    it("has nodeIds() = []", function() {
      expect(empty.nodeIds()).to.be.empty;
    });

    it("has numEdges() = 0", function() {
      expect(empty.numEdges()).to.equal(0);
    });

    it("has edges() = []", function() {
      expect(empty.edges()).to.be.empty;
    });

    it("has get('arbitrary') = undefined", function() {
      expect(empty.get("arbitrary")).to.be.undefined;
    });

    it("has has('arbitrary') = false", function() {
      expect(empty.has("arbitrary")).to.be.false;
    });

    it("has hasEdge('a1', 'a2') = false", function() {
      expect(empty.hasEdge("a1", "a2")).to.be.false;
    });
  });

  describe("set('n1', 'label')", function() {
    var g;

    beforeEach(function() {
      g = empty.set("n1", "label");
    });

    it("increments numNodes()", function() {
      expect(g.numNodes()).to.equal(1);
    });

    it("adds 'n1' to the output of nodeIds()", function() {
      expect(g.nodeIds()).to.eql(["n1"]);
    });

    it("sets get('n1') = 'label'", function() {
      expect(g.get("n1")).to.equal("label");
    });

    it("sets has('n1') = true", function() {
      expect(g.has("n1")).to.be.true;
    });

    it("replaces the existing value for 'n1' if it was already in the graph", function() {
      var g = empty.set("n1", "old-value").set("n1", "label");
      expect(g.get("n1")).to.equal("label");
    });

    it("does not change the original graph", function() {
      expect(empty.numNodes()).to.equal(0);
      expect(empty.nodeIds()).to.be.empty;
    });
  });

  describe("set('n1')", function() {
    it("sets get('n1') = undefined", function() {
      expect(empty.set("n1", "foo").set("n1").get("n1")).to.be.undefined;
    });

    it("sets has('n1') = true", function() {
      expect(empty.set("n1").has("n1")).to.be.true;
    });
  });

  describe("update('n1', function(prev) { return prev + '-new'; })", function() {
    var updater = function(prev) { return prev + "-new"; };

    it("adds the node n1 if not in the graph", function() {
      expect(empty.update("n1", updater).get("n1")).to.equal(undefined + "-new");
    });

    it("updates the node n1 if it is in the graph", function() {
      var g = empty.set("n1", "label");
      expect(g.update("n1", updater).get("n1")).to.equal("label-new");
    });

    it("does not change the original graph", function() {
      empty.update("n1", updater);
      expect(empty.has("n1")).to.be.false;
    });
  });

  describe("delete('n1')", function() {
    var g1, g2;

    beforeEach(function() {
      g1 = empty.set("n1");
      g2 = g1.delete("n1");
    });

    it("decrements the value of numNodes()", function() {
      expect(g2.numNodes()).to.equal(0);
    });

    it("removes the node from the output of nodes()", function() {
      expect(g2.nodeIds()).to.be.empty;
    });

    it("sets has('n1') = false", function() {
      expect(g2.has("n1")).to.be.false;
    });

    it("deletes edges incident on the node", function() {
      var g = empty
                .set("n1")
                .setEdge("n1","n2")
                .setEdge("n2", "n1")
                .delete("n1");
      expect(g.edges()).to.eql([]);
      expect(g.numEdges()).to.equal(0);
    });

    it("does nothing if 'n1' is not in the graph", function() {
      var g = empty.delete("n1");
      expect(g).to.eql(empty);
    });

    it("does not change the original graph", function() {
      expect(g1.numNodes()).to.equal(1);
      expect(g1.nodeIds()).to.eql(["n1"]);
    });
  });

  describe("setEdge('n1', 'n2', 'label')", function() {
    var g;

    beforeEach(function() {
      g = empty
            .set("n1")
            .set("n2")
            .setEdge("n1", "n2", "label");
    });

    it("increments numEdges()", function() {
      expect(g.numEdges()).to.equal(1);
    });

    it("sets getEdge('n1', 'n2') = 'label'", function() {
      expect(g.getEdge("n1", "n2")).to.equal("label");
    });

    it("adds the edge to edges()", function() {
      expect(g.edges()).to.eql([{ v: "n1", w: "n2", lab: "label" }]);
    });

    it("adds the nodes to the graph if they are not already members", function() {
      g = empty.setEdge("n1", "n2", "label");
      expect(g.has("n1")).to.be.true;
      expect(g.get("n1")).to.be.undefined;
      expect(g.has("n2")).to.be.true;
      expect(g.get("n2")).to.be.undefined;
    });

    it("changes the label for an edge that already exists", function() {
      var g1 = empty
            .set("n1")
            .set("n2")
            .setEdge("n1", "n2", "old-label");
      var g2 = g1.setEdge("n1", "n2", "new-label");
      expect(g2.getEdge("n1", "n2")).to.equal("new-label");
    });

    it("does not change the original graph", function() {
      expect(empty.numEdges()).to.equal(0);
      expect(empty.edges()).to.be.empty;
    });
  });

  describe("setEdge('n1', 'n2')", function() {
    it("sets getEdge('n1', 'n2') = undefined", function() {
      var g = empty.setEdge("n1", "n2", "foo")
                   .setEdge("n1", "n2");
      expect(g.getEdge("n1", "n2")).to.be.undefined;
    });

    it("sets hasEdge('n1', 'n2') = true", function() {
      expect(empty.setEdge("n1", "n2").hasEdge("n1", "n2")).to.be.true;
    });

    it("does not change the original graph", function() {
      empty.setEdge("n1", "n2");
      expect(empty.numEdges()).to.equal(0);
      expect(empty.edges()).to.be.empty;
    });
  });

  describe("update('n1', 'n2', function(prev) { return prev + '-new'; })", function() {
    var updater = function(prev) { return prev + "-new"; };

    it("adds the edge if not in the graph", function() {
      var g = empty.updateEdge("n1", "n2", updater);
      expect(g.getEdge("n1", "n2")).to.equal(undefined + "-new");
    });

    it("updates the edge (n1, n2) if it is in the graph", function() {
      var g = empty.setEdge("n1", "n2", "label");
      expect(g.updateEdge("n1", "n2", updater).getEdge("n1", "n2")).to.equal("label-new");
    });

    it("does not change the original graph", function() {
      empty.updateEdge("n1", "n2", updater);
      expect(empty.numEdges()).to.equal(0);
      expect(empty.edges()).to.be.empty;
    });
  });

  describe("deleteEdge('n1', 'n2')", function() {
    var g1, g2;

    beforeEach(function() {
      g1 = empty.setEdge("n1", "n2");
      g2 = g1.deleteEdge("n1", "n2");
    });

    it("decrements the value of numEdges()", function() {
      expect(g2.numEdges()).to.equal(0);
    });

    it("removes the node from the output of edges()", function() {
      expect(g2.edges()).to.be.empty;
    });

    it("sets hasedge('n1', 'n2') = false", function() {
      expect(g2.hasEdge("n1", "n2")).to.be.false;
    });

    it("does nothing if edge (n1, n2) is not in the graph", function() {
      var g = empty.deleteEdge("n1", "n2");
      expect(g).to.eql(empty.set("n1").set("n2"));
    });

    it("does not change the original graph", function() {
      expect(g1.numEdges()).to.equal(1);
      expect(g1.hasEdge("n1", "n2")).to.be.true;
    });
  });
});
