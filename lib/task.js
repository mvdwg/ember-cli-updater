module.exports = {
  fromValue: fromValue,
  lazy: lazy,
  runInSeries: require("p-series"),
};

function fromValue(value) {
  return function() {
    return value;
  };
}

function lazy(fn) {
  return function() {
    return fn();
  };
}
