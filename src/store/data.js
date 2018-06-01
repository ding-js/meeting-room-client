import { observable } from 'mobx';
import request from '../utils/request';

class Data {
  @observable locations = [];
  @observable rooms = [];
  @observable orders = [];

  constructor() {
    this.fetchData();
  }

  async fetchData() {
    const [locations, rooms] = await Promise.all([
      request.get('/api/locations'),
      request.get('/api/rooms'),
      request.get('/api/orders?scheduledDate=20180601')
    ]).then(res => res.map(v => v.data));

    console.log(locations, rooms);
    // Object.assign(this, data);
  }
}

export default Data;
