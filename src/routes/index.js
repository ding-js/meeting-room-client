import App from '../containers/App';
import Client from '../containers/Client';
import Admin from '../containers/Admin';

export default [
  {
    component: App,
    routes: [
      {
        path: '/admin',
        component: Admin
      },
      {
        path: '/',
        component: Client
      }
    ]
  }
];
