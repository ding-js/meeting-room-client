import { observable, computed } from 'mobx';
import request from '../utils/request';
import { getAvailableTimeRange } from '../utils/time';
import moment from 'moment';
import * as _ from 'lodash';

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
    const activeLocation = this.activeLocation;
    const rooms = this.rooms.filter(room => room.location === activeLocation);

    if (!this.shouldFilter) {
      return rooms;
    }

    const [start, end] = this.selectedTime;

    const availableRange = this.availableRange.slice();

    return rooms.filter(room => {
      if (room.location !== activeLocation) {
        return false;
      }

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

    return _.uniq(times).reduce((marks, time) => {
      marks[time] = time % 60 === 0 ? time / 60 : '';

      return marks;
    }, {});
  }

  async fetchData() {
    this.fetching = true;
    const [locations, rooms, orders] = await Promise.all([
      request.get('/api/locations'),
      request.get('/api/rooms'),
      request.get(`/api/orders?scheduledDate=${moment().format('YYYY-MM-DD')}`)
    ]).then(res => res.map(v => v.data));

    const defaultLoc = locations[0];

    Object.assign(this, {
      locations,
      rooms,
      orders
    });

    this.updateActiveLocation(defaultLoc.id);

    this.setDefaultSelectedTime(defaultLoc.start_time, defaultLoc.end_time);

    this.fetching = false;
  }

  async createOrder(data) {
    const res = await request.post('/api/orders', data);

    this.orders.push(res.data);

    return res;
  }

  async deleteOrder(id) {
    const res = await request.delete(`/api/orders/${id}`);

    if (res.status === 200) {
      this.doDeleteOrder(id);
    }

    return res;
  }

  doDeleteOrder(id) {
    const index = this.orders.findIndex(order => order.id === id);

    if (index > -1) {
      this.orders.splice(index, 1);
    }
  }

  async createLocation(data) {
    const res = await request.post('/api/locations', data);

    if (res.status === 200) {
      this.locations.push(res.data);
    }

    return res;
  }

  async updateLocation(id, data) {
    const res = await request.patch(`/api/locations/${id}`, data);

    if (res.status === 200) {
      const index = this.locations.findIndex(loc => loc.id === id);

      if (index > -1) {
        this.locations.splice(index, 1, res.data);
      }
    }

    return res;
  }

  async deleteLocation(id) {
    const res = await request.delete(`/api/locations/${id}`);

    if (res.status === 200) {
      this.doDeleteLocation(id);
    }

    return res;
  }

  doDeleteLocation(id) {
    const index = this.locations.findIndex(loc => loc.id === id);
    if (index > -1) {
      this.locations.splice(index, 1);
    }

    this.rooms
      .filter(room => room.location === id)
      .forEach(room => this.doDeleteRoom(room.id));
  }

  async createRoom(data) {
    const res = await request.post('/api/rooms', data);

    if (res.status === 200) {
      this.rooms.push(res.data);
    }

    return res;
  }

  async updateRoom(id, data) {
    const res = await request.patch(`/api/rooms/${id}`, data);

    if (res.status === 200) {
      const index = this.rooms.findIndex(room => room.id === id);

      if (index > -1) {
        this.rooms.splice(index, 1, res.data);
      }
    }

    return res;
  }

  async deleteRoom(id) {
    const res = await request.delete(`/api/rooms/${id}`);

    if (res.status === 200) {
      this.doDeleteRoom(id);
    }

    return res;
  }

  doDeleteRoom(id) {
    const index = this.rooms.findIndex(room => room.id === id);
    if (index > -1) {
      this.rooms.splice(index, 1);
    }

    this.orders
      .filter(order => order.room === id)
      .forEach(order => this.doDeleteOrder(order.id));
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
    const now = moment();
    // 当前时间向后的第一个半点/准点
    const start = Math.ceil((now.hour() * 60 + now.minute()) / 30) * 30;
    const end = start + 30;

    this.updateSelectedTime([start, end]);
  };

  updateShouldFilter = () => {
    this.shouldFilter = !this.shouldFilter;
    localStorage.setItem(shouldFilterStorageKey, this.shouldFilter);
  };

  updateActiveLocation = id => {
    if (!_.isNil(id)) {
      this.activeLocation = id;
    }
  };
}

export default Data;
