import { observable } from 'mobx';
import request from '../utils/request';

const nameStorageKey = 'patsnap_name';

class User {
  @observable name = localStorage.getItem(nameStorageKey) || null;
  @observable id = null;
  @observable users = [];
  @observable fetching = false;

  updateName(name) {
    this.name = name;

    if (!name) {
      localStorage.removeItem(nameStorageKey);
    } else {
      localStorage.setItem(nameStorageKey, name);
    }
  }

  updateId(id) {
    this.id = id;
  }

  async fetchUsers() {
    this.fetching = true;
    const res = await request.get('/api/users');

    if (res.status === 200) {
      this.users = res.data;
    }

    this.fetching = false;
  }
}

export default User;
