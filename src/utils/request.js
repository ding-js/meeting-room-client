import axios from 'axios';
import * as _ from 'lodash';
import { message } from 'antd';

import Cookies from 'js-cookie';

let csrftoken;

export const updateCsrftoken = () => {
  csrftoken = Cookies.get('csrfToken');
};

updateCsrftoken();

const instance = axios.create({
  validateStatus(status) {
    return status >= 200;
  }
});

instance.interceptors.request.use(config => {
  if (csrftoken) {
    config.headers['x-csrf-token'] = csrftoken;
  }

  return config;
});

instance.interceptors.response.use(res => {
  switch (res.status) {
    case 401:
    case 403:
      if (window.location.pathname !== '/login') {
        setTimeout(() => {
          window.location.href = '/login?from=admin';
        }, 300);
      }
      break;
    case 500:
      {
        const reason = _.get(res, 'data.message');

        if (reason) {
          message.error(reason);
        }
      }
      break;
    default:
      break;
  }

  return res;
});

export default instance;
