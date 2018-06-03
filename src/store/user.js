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

  async createUser(data) {
    const res = await request.post('/api/users', data);

    if (res.status === 200) {
      this.users.push(res.data);
    }

    return res;
  }

  async updateUser(id, data) {
    const res = await request.patch(`/api/users/${id}`, data);

    if (res.status === 200) {
      const index = this.users.findIndex(user => user.id === id);

      if (index > -1) {
        this.users.splice(index, 1, res.data);
      }
    }

    return res;
  }

  async deleteUser(id) {
    const res = await request.delete(`/api/users/${id}`);

    if (res.status === 200) {
      const index = this.users.findIndex(user => user.id === id);
      if (index > -1) {
        this.users.splice(index, 1);
      }
    }

    return res;
  }
}

export default User;
