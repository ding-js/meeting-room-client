import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout } from 'antd';
import { Link } from 'react-router-dom';
import { Row, Col, Dropdown, Menu } from 'antd';
import { renderRoutes } from 'react-router-config';
import request from '../../utils/request';
import * as _ from 'lodash';
import './style.less';

const { Header, Content } = Layout;
const MenuItem = Menu.Item;

@inject('user')
@observer
class App extends Component {
  state = {
    visible: false
  };

  menu = (
    <Menu
      onClick={({ key }) => {
        if (key === 'logout') {
          this.logout();
        }
      }}
    >
      <MenuItem key="order">
        <Link to="/order">预订管理</Link>
      </MenuItem>
      <MenuItem key="logout">登出</MenuItem>
    </Menu>
  );

  render() {
    const name = _.get(this.props, 'user.name');

    return (
      <Layout className="app">
        <Header className="app__header">
          <Link to="/" className="app__logo">
            PATSNAP MEETING ROOMS
          </Link>
          {name ? (
            <div className="app__info">
              你好，
              <Dropdown
                overlay={this.menu}
                trigger={['click']}
                placement="bottomCenter"
              >
                <button type="button" onClick={this.showMenu}>
                  {name}
                </button>
              </Dropdown>
            </div>
          ) : null}
        </Header>
        <Content>
          <Row justify="center" type="flex">
            <Col xs={24} sm={18} md={16}>
              <div className="app__content">
                {renderRoutes(this.props.route.routes)}
              </div>
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }

  logout = async () => {
    const isAdmin = this.props.user.id;

    if (isAdmin) {
      this.props.user.updateId(null);

      await request.get('/api/logout');
    }

    this.props.user.updateName(null);
  };

  showMenu = () => {
    this.setState({
      visible: true
    });
  };

  hideMenu = () => {
    this.setState({
      visible: false
    });
  };
}

export default App;
