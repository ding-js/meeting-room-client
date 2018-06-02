import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Slider, Form, Checkbox, List, Spin } from 'antd';
import { formatTime, getAvailableTimeRange } from '../../utils/time';
import './style.less';

const FormItem = Form.Item;

@inject('data')
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
      </div>
    );
  }

  order = room => {};

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
