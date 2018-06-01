import { observable } from 'mobx';

const nameStorageKey = 'patsnap_name';

class User {
  @observable name = localStorage.getItem(nameStorageKey) || null;

  updateName(name) {
    this.name = name;

    if (!name) {
      localStorage.removeItem(nameStorageKey);
    } else {
      localStorage.setItem(nameStorageKey, name);
    }
  }
}

export default User;
