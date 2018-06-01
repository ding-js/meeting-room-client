import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Switch, Route, Redirect } from 'react-router';
import Book from '../Book';
import ClientLogin from '../ClientLogin';

@inject('user')
@observer
class Client extends Component {
  render() {
    if (!this.props.user.name && this.props.location.pathname === '/') {
      return <Redirect to="/login" />;
    }

    return (
      <Switch>
        <Route exact path="/" component={Book} />
        <Route exact path="/login" component={ClientLogin} />
      </Switch>
    );
  }
}

export default Client;
