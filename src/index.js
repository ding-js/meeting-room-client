import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { Router } from 'react-router';
import { renderRoutes } from 'react-router-config';
import routes from './routes';
import history from './routes/history';
import store from './store';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Provider {...store}>
    <Router history={history}>{renderRoutes(routes)}</Router>
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
