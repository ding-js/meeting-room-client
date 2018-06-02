import { observable, computed } from 'mobx';
import request from '../utils/request';
import { getAvailableTimeRange } from '../utils/time';
import dayjs from 'dayjs';
import { uniq } from 'lodash';

const shouldFilterStorageKey = 'patsnap_should_filter';

let defaultShouldFilter = false;
try {
  defaultShouldFilter = !!JSON.stringify(
    localStorage.getItem(shouldFilterStorageKey)
  );
} catch (err) {
  defaultShouldFilter = false;
}

class Data {
  @observable locations = [];
  @observable rooms = [];
  @observable orders = [];
  @observable activeLocation = null;
  @observable fetching = false;
  @observable selectedTime = [];
  @observable shouldFilter = defaultShouldFilter;

  constructor() {
    this.fetchData();
  }

  @computed
  get availableRange() {
    const loc = this.locations.find(v => v.id === this.activeLocation);

    return loc ? [loc.start_time, loc.end_time] : [0, 0];
  }

  @computed
  get availableRooms() {
    if (!this.shouldFilter) {
      return this.rooms;
    }

    const [start, end] = this.selectedTime;

    const availableRange = this.availableRange.slice();

    return this.rooms.filter(room => {
      const availableTimes = getAvailableTimeRange(
        availableRange,
        this.orders
          .filter(order => order.room === room.id)
          .map(order => [order.start_time, order.end_time])
      );

      return availableTimes.some(time => {
        return start >= time[0] && end <= time[1];
      });
    });
  }

  @computed
  get marks() {
    const [min, max] = this.availableRange;
    const times = [min];

    for (let i = Math.ceil(min / 30) * 30; i < max; i += 30) {
      times.push(i);
    }

    times.push(max);

    return uniq(times).reduce((marks, time) => {
      marks[time] = time % 60 === 0 ? time / 60 : '';

      return marks;
    }, {});
  }

  async fetchData() {
    this.fetching = true;
    const [locations, rooms, orders] = await Promise.all([
      request.get('/api/locations'),
      request.get('/api/rooms'),
      request.get(`/api/orders?scheduledDate=${dayjs().format('YYYY-MM-DD')}`)
    ]).then(res => res.map(v => v.data));

    const defaultLoc = locations[0];

    Object.assign(this, {
      locations,
      rooms,
      orders,
      activeLocation: defaultLoc.id
    });

    this.setDefaultSelectedTime(defaultLoc.start_time, defaultLoc.end_time);

    this.fetching = false;
  }

  updateSelectedTime = values => {
    const [start, end] = values;
    const [min, max] = this.availableRange;

    this.selectedTime = [start, end].map(v => {
      if (v < min) {
        return min;
      }

      if (v > max) {
        return max;
      }

      return v;
    });
  };

  setDefaultSelectedTime = () => {
    const now = dayjs();
    // 当前时间向后的第一个半点/准点
    const start = Math.ceil((now.hour() * 60 + now.minute()) / 30) * 30;
    const end = start + 30;

    this.updateSelectedTime([start, end]);
  };

  updateShouldFilter = () => {
    this.shouldFilter = !this.shouldFilter;
    localStorage.setItem(shouldFilterStorageKey, this.shouldFilter);
  };
}

export default Data;
