const { readdirSync, statSync, writeFileSync, readFileSync } = require('fs');
const { join, resolve } = require('path');
const toGeoJson = require('togeojson');
DOMParser = require('xmldom').DOMParser;

const calculateElevationGain = require('./calculate-elevation-gain.ts');
const getBounds = require('./get-bounds.ts');
const turfLength = require('@turf/length').default;
const calculateApproxRideTime = require('./calculate-approx-ride-time.ts');

const pathToRides = resolve(__dirname, '../../content/rides');

const KILOMETERS_TO_MILES = 0.621371;
const METERS_TO_FEET = 3.2808;
// This was tuned to match the Strava elevation gain output
const SMOOTHING_COEFFICIENT = 14;

const dirs = (p) =>
  readdirSync(p).filter((f) => statSync(join(p, f)).isDirectory());

const computeMetrics = () => {
  const rideDirs = dirs(pathToRides);

  rideDirs.forEach((dir) => {
    const fullDirPath = resolve(pathToRides, dir);
    const files = readdirSync(fullDirPath).filter((f) =>
      statSync(join(fullDirPath, f)).isFile(),
    );

    // const foundRide = files.find((f) => f.includes('ride.json'));
    const foundRide = files.find((f) => f.includes('ride.gpx'));

    if (foundRide) {
      const fullRidePath = resolve(fullDirPath, foundRide);
      console.log('foundRide: ', fullRidePath);

      const gpx = new DOMParser().parseFromString(
        readFileSync(fullRidePath, 'utf8'),
      );

      const geojson = toGeoJson.gpx(gpx);

      // const geojson = require(resolve(fullDirPath, foundRide));
      // write geojson file for leaflet map rendering
      writeFileSync(
        resolve(fullDirPath, 'ride.json'),
        JSON.stringify(geojson, null, 2),
      );

      const elevationGain = calculateElevationGain.getElevationGain(
        geojson,
        SMOOTHING_COEFFICIENT,
      );
      const elevationFt = Math.floor(elevationGain * METERS_TO_FEET);
      console.log(`Total elevation gain: ${elevationFt} ft`);

      const bounds = getBounds(geojson);
      console.log(`Bounds: ${bounds}`);

      const tripLength = Number(
        (KILOMETERS_TO_MILES * turfLength(geojson)).toFixed(2),
      );
      console.log(`Trip length: ${tripLength} miles`);

      const { upperBound, lowerBound } = calculateApproxRideTime(geojson);
      console.log(`Approximate ride time ${lowerBound}-${upperBound} hours`);

      const data = {
        elevationGain: elevationFt,
        bounds,
        tripLength,
        rideTimeHours: {
          lowerBound,
          upperBound,
        },
      };

      writeFileSync(
        resolve(fullDirPath, 'metrics.json'),
        JSON.stringify(data, null, 2),
      );
    }
  });
};

computeMetrics();
