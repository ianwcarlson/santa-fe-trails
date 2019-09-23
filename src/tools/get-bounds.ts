const getBounds = (data) => {
  let minLat = 100000000;
  let maxLat = -10000000;
  let minLong = 100000000;
  let maxLong = -10000000;
  data.features[0].geometry.coordinates.forEach((coord) => {
    const lat = coord[0];
    const long = coord[1];
    if (lat > maxLat) maxLat = lat;
    if (lat < minLat) minLat = lat;
    if (long > maxLong) maxLong = long;
    if (long < minLong) minLong = long;
  });
  return [[maxLong, maxLat], [minLong, minLat]];
};

module.exports = getBounds;
