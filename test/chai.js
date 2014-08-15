var chai = require("chai"),
    Immutable = require("immutable");
module.exports = chai;

chai.config.includeStack = true;

chai.use(function(_, utils) {
  var flag = utils.flag;

  /**
   * Checks if the given objects are from the Immutable package and if so uses
   * Immutable.is. Otherwise invokes default equals function.
   */
  var assertImmutableEqual = function(obj, msg) {
    if (msg) flag(this, "message", msg);
    var cond = Immutable.is(obj, this._obj) ||
               (this._obj.equals && this._obj.equals(obj)) ||
               utils.eql(obj, this._obj);
    this.assert(
      cond,
      "expected #{this} to deeply equal #{exp}",
      "expected #{this} to not deeply equal #{exp}",
      obj,
      this._obj,
      true
    );
  };
  chai.Assertion.addMethod("eql", assertImmutableEqual);
  chai.Assertion.addMethod("eqls", assertImmutableEqual);

  chai.Assertion.overwriteProperty("empty", function(_super) {
    return function assertEmpty() {
      var obj = this._obj;
      if (obj && obj instanceof Immutable.Sequence) {
        new chai.Assertion(obj.length).to.equal(0);
      } else {
        _super.call(this);
      }
    };
  });
});
