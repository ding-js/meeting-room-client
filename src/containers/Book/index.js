import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Slider, Form, Checkbox, List, Spin, Modal, message } from 'antd';
import dayjs from 'dayjs';
import { formatTime, getAvailableTimeRange } from '../../utils/time';
import request from '../../utils/request';
import './style.less';

const FormItem = Form.Item;

@inject('data')
@inject('user')
@observer
class Book extends Component {
  render() {
    const {
      fetching,
      selectedTime,
      availableRange,
      marks,
      updateSelectedTime,
      shouldFilter,
      updateShouldFilter,
      availableRooms
    } = this.props.data;

    if (fetching) {
      return (
        <div className="book__loading">
          <Spin />
        </div>
      );
    }

    return (
      <div>
        <Form>
          <FormItem>
            <Checkbox onChange={updateShouldFilter} checked={shouldFilter}>
              使用选中时间筛选可用会议室
            </Checkbox>
          </FormItem>
          <FormItem>
            <Slider
              range
              marks={marks}
              min={availableRange[0]}
              max={availableRange[1]}
              tipFormatter={formatTime}
              onChange={updateSelectedTime}
              value={selectedTime.slice()}
              step={10}
            />
          </FormItem>
        </Form>
        <p>你的预订时间：{this.formatTimeRange(selectedTime)}</p>
        {availableRooms.length ? (
          <List>
            {availableRooms.map(room => {
              return (
                <List.Item
                  key={room.id}
                  actions={[
                    <a href="javascript:;" onClick={() => this.order(room)}>
                      预订
                    </a>
                  ]}
                >
                  <List.Item.Meta
                    title={<span>会议室：{room.name}</span>}
                    description={this.renderAvailableTime(room)}
                  />
                </List.Item>
              );
            })}
          </List>
        ) : (
          <p style={{ textAlign: 'center' }}>
            一个都没有啦！建议修改一下预订时间~
          </p>
        )}
      </div>
    );
  }

  order = room => {
    const end = this.props.data.selectedTime[1];
    const now = dayjs();
    const nowMin = now.hour() * 60 + now.minute();

    if (end < nowMin) {
      message.warn(
        `检查一下真的没选错时间吗？现在已经 ${now.format('HH:mm')} 啦！`
      );
      return;
    }

    Modal.confirm({
      title: '请确认预订信息',
      content: (
        <table>
          <tbody>
            <tr>
              <th>预订人</th>
              <td>{this.props.user.name}</td>
            </tr>
            <tr>
              <th>会议室</th>
              <td>{room.name}</td>
            </tr>
            <tr>
              <th>预订时间</th>
              <td>
                {this.formatTimeRange(this.props.data.selectedTime.slice())}
              </td>
            </tr>
          </tbody>
        </table>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const [start, end] = this.props.data.selectedTime;
        return this.props.data
          .createOrder({
            room: room.id,
            startTime: start,
            endTime: end,
            orderedBy: this.props.user.name,
            scheduledDate: dayjs().format('YYYY-MM-DD')
          })
          .then(() => {
            message.success('预订成功，你可以点击用户名进入预订管理查看预订');
          });
      }
    });
  };

  renderAvailableTime(room) {
    const { id } = room;
    const orders = this.props.data.orders
      .filter(order => order.room === id)
      .map(order => [order.start_time, order.end_time]);

    const [min, max] = this.props.data.availableRange;
    const availableTimes = [];

    if (!orders.length) {
      availableTimes.push([min, max]);
    } else {
      availableTimes.push(...getAvailableTimeRange([min, max], orders));
    }

    const results = availableTimes.filter(v => v.length === 2 && v[0] !== v[1]);

    return !results.length ? (
      <div>已经被预定完，一秒都不剩啦！</div>
    ) : (
      <div>
        当前可预订时间：
        <ul>
          {results.map(v => (
            <li key={v.join('~')}>{this.formatTimeRange(v)}</li>
          ))}
        </ul>
      </div>
    );
  }

  formatTimeRange([start, end]) {
    return [start, end].map(formatTime).join(' ~ ');
  }
}

export default Book;
