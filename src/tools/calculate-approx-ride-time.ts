const moment = require('moment');

const calcApproxRideTime = (data) => {
  const { coordTimes } = data.features[0].properties;
  const startTime = moment(coordTimes[0]);
  const endTime = moment(coordTimes[coordTimes.length - 1]);
  const totalTimeHours = endTime.diff(startTime, 'minutes') / 60;
  return {
    lowerBound: Math.floor(totalTimeHours),
    upperBound: Math.ceil(totalTimeHours) + 1,
  };
};

module.exports = calcApproxRideTime;
