import * as moment from 'moment';

const addZero = num => {
  return num < 10 ? `0${num}` : num.toString();
};

export const minutes2Moment = minutes => {
  return moment()
    .set('hour', Math.floor(minutes / 60))
    .set('minute', minutes % 60)
    .startOf('minute');
};

export const formatTime = time => {
  const [hour, min] = [Math.floor(time / 60), time % 60].map(addZero);

  return `${hour}:${min}`;
};

export const getAvailableTimeRange = (mainRange, filters) => {
  if (!filters.length) {
    return [mainRange];
  }

  const [min, max] = mainRange;
  const sortedFilters = filters.slice().sort((x, y) => x[0] - y[0]);

  const results = [];

  if (sortedFilters.length > 1) {
    for (let i = 0; i < sortedFilters.length - 1; i++) {
      const xEnd = sortedFilters[i][1];
      const yStart = sortedFilters[i + 1][0];

      results.push([xEnd, yStart]);
    }
  }

  if (sortedFilters.length) {
    const firstStart = sortedFilters[0][0];
    const lastEnd = sortedFilters[sortedFilters.length - 1][1];
    results.push([min, firstStart], [lastEnd, max]);
  }

  return results.filter(([s, e]) => s !== e).sort((x, y) => x[0] - y[0]);
};

export const formatTimeRange = ([start, end]) => {
  return [start, end].map(formatTime).join(' ~ ');
};
