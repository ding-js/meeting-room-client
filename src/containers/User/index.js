import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Modal, message, Divider } from 'antd';
import request from '../../utils/request';

@inject('user')
@observer
class Order extends Component {
  state = {
    users: [],
    fetching: false
  };
  columns = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'action',
      width: 110,
      render: id => {
        return (
          <span>
            <a href="javascript:;" onClick={() => this.edit(id)}>
              编辑
            </a>
            <Divider type="vertical" />
            <a href="javascript:;" onClick={() => this.delete(id)}>
              删除
            </a>
          </span>
        );
      }
    }
  ];

  render() {
    const { users, fetching } = this.props.user;
    return (
      <Table
        columns={this.columns}
        dataSource={users.slice()}
        loading={fetching}
        rowKey="id"
      />
    );
  }

  componentDidMount() {
    if (!this.props.user.users.length) {
      this.props.user.fetchUsers();
    }
  }
}

export default Order;
