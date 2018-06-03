import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Modal, message, Divider } from 'antd';

@inject('data')
@observer
class Order extends Component {
  columns = [
    {
      title: '会议室',
      dataIndex: 'name',
      key: 'name'
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
    return (
      <Table
        columns={this.columns}
        dataSource={this.props.data.rooms.slice()}
        rowKey="id"
      />
    );
  }
}

export default Order;
