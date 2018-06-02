import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Switch, Route, Redirect } from 'react-router';
import Book from '../Book';
import Order from '../Order';
import ClientLogin from '../ClientLogin';

@inject('user')
@observer
class Client extends Component {
  render() {
    if (!this.props.user.name && this.props.location.pathname !== '/login') {
      return <Redirect to="/login" />;
    }

    return (
      <Switch>
        <Route exact path="/" component={Book} />
        <Route exact path="/order" component={Order} />
        <Route exact path="/login" component={ClientLogin} />
      </Switch>
    );
  }
}

export default Client;
