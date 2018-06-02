import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Layout } from 'antd';
import { Link } from 'react-router-dom';
import { Row, Col } from 'antd';
import { renderRoutes } from 'react-router-config';
import * as _ from 'lodash';
import './style.less';

const { Header, Content } = Layout;

@inject('user')
@observer
class App extends Component {
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
              你好，<button type="button" onClick={this.logout}>
                {name}
              </button>
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

  logout = () => {
    this.props.user.updateName(null);
  };
}

export default App;
