import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Spin, Modal, message } from 'antd';
import { formatTimeRange } from '../../utils/time';

@inject('user')
@inject('data')
@observer
class Order extends Component {
  columns = [
    {
      title: '会议室',
      dataIndex: 'room',
      key: 'room',
      render: id => {
        return this.props.data.rooms.find(room => room.id === id).name;
      }
    },
    {
      title: '预定时间',
      key: 'time',
      render: (text, order) => {
        return formatTimeRange([order.start_time, order.end_time]);
      }
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'action',
      width: 90,
      render: id => {
        return (
          <a href="javascript:;" onClick={() => this.cancel(id)}>
            取消预订
          </a>
        );
      }
    }
  ];
  render() {
    if (this.props.data.fetching) {
      return (
        <div className="loading">
          <Spin />
        </div>
      );
    }

    const name = this.props.user.name;
    const userOrders = this.props.data.orders.filter(
      v => v.ordered_by === name
    );

    if (!userOrders.length) {
      return <p style={{ textAlign: 'center' }}>还没有预订哦~</p>;
    }

    return <Table columns={this.columns} dataSource={userOrders} rowKey="id" />;
  }

  cancel = id => {
    Modal.confirm({
      title: '确认取消这次预订吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        return this.props.data.deleteOrder(id).then(() => {
          message.success('取消预订成功');
        });
      }
    });
  };
}

export default Order;
