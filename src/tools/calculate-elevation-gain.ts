const sma = (arr, range, precision) => {
  if (!Array.isArray(arr)) {
    throw TypeError('expected first argument to be an array');
  }

  precision = precision || 2;
  var num = range || arr.length;
  var res = [];
  var len = arr.length + 1;
  var idx = num - 1;
  while (++idx < len) {
    const value = avg(arr, idx, num);
    res.push(round(value, precision));
  }
  return res;
};

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

/**
 * Create an average for the specified range.
 *
 * @param  {Array} `arr` Array to pull the range from.
 * @param  {Number} `idx` Index of element being calculated
 * @param  {Number} `range` Size of range to calculate.
 * @return {Number} Average of range.
 */

function avg(arr, idx, range) {
  return sum(arr.slice(idx - range, idx)) / range;
}

/**
 * Calculate the sum of an array.
 * @param  {Array} `arr` Array
 * @return {Number} Sum
 */

function sum(arr) {
  var len = arr.length;
  var num = 0;
  while (len--) num += Number(arr[len]);
  return num;
}

const computeElevationGain = (accumulator, currentValue, index, array) => {
  const previousValue = array[index - 1];
  const delta = currentValue - previousValue;
  // Take only positive value
  if (delta > 0) {
    accumulator += delta;
  }
  return accumulator;
};

const getElevationGain = (geojson, numberOfPoints) => {
  const coords = geojson.features[0].geometry.coordinates;

  const elevations = coords.map((x) => x[2]);
  const smaElevations = sma(elevations, numberOfPoints, 2);
  return Math.round(smaElevations.reduce(computeElevationGain, 0));
};

module.exports = {
  getElevationGain,
};
