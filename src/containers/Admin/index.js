import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { Switch, Route, Redirect } from 'react-router';
import { Spin, Menu, Button } from 'antd';
import * as _ from 'lodash';
import Location from '../Location';
import Room from '../Room';
import Order from '../Order';
import User from '../User';
import request from '../../utils/request';
import './style.less';

const MenuItem = Menu.Item;

@inject('user')
@inject('data')
@observer
class Admin extends Component {
  activeCreateHandler = null;
  constructor(props) {
    super(props);
    this.state = { fetching: true };
  }

  componentDidMount() {
    this.getUserInfo();
  }

  render() {
    const { fetching } = this.state;

    if (fetching || this.props.data.fetching) {
      return (
        <div className="loading">
          <Spin />
        </div>
      );
    }

    if (!this.props.user.id) {
      return <Redirect to="/login?from=admin" />;
    }

    const { pathname } = this.props.location;

    if (pathname === '/admin' || pathname === '/admin/') {
      return <Redirect to="/admin/location" />;
    }

    const routes = [
      { name: 'location', label: '地点', component: Location },
      { name: 'room', label: '会议室', component: Room },
      { name: 'order', label: '预订', component: Order },
      { name: 'user', label: '用户', component: User }
    ];

    const activeRoute = routes.filter(
      route => pathname === `/admin/${route.name}`
    )[0];

    const activeMenus = [activeRoute.name];

    return (
      <div>
        <div className="admin__menu">
          <Menu mode="horizontal" selectedKeys={activeMenus}>
            {routes.map(route => (
              <MenuItem key={route.name}>
                <Link to={`/admin/${route.name}`}>{route.label}</Link>
              </MenuItem>
            ))}
            {pathname !== '/admin/order' ? (
              <MenuItem disabled>
                <Button type="primary" onClick={this.handleCreateClick}>
                  新建{activeRoute.label}
                </Button>
              </MenuItem>
            ) : null}
          </Menu>
        </div>
        <Switch>
          {routes.map(route => (
            <Route
              exact
              key={route.name}
              path={`/admin/${route.name}`}
              render={props => (
                <route.component
                  {...props}
                  updateCreateHandler={this.updateCreateHandler}
                />
              )}
            />
          ))}
        </Switch>
      </div>
    );
  }

  async getUserInfo() {
    if (this.props.user.id) {
      this.setState({
        fetching: false
      });
      return;
    }

    this.setState({
      fetching: true
    });

    const res = await request.get('/api/users/current');
    const name = _.get(res, 'data.username');
    const id = _.get(res, 'data.id');

    if (name && id) {
      this.props.user.updateName(name);
      this.props.user.updateId(id);

      this.setState({
        fetching: false
      });
    } else {
      this.props.user.updateName(null);
    }
  }

  // 获取子组件引用有问题，不得已而为之
  updateCreateHandler = handler => {
    this.activeCreateHandler = handler;
  };

  handleCreateClick = async () => {
    if (this.activeCreateHandler) {
      this.activeCreateHandler();
    }
  };
}

export default Admin;
