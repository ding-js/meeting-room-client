import axios from 'axios';

const instance = axios.create({
  validateStatus(status) {
    return status >= 200;
  }
});

export default instance;
