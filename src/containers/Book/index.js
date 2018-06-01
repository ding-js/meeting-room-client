import React, { Component } from 'react';
import { Slider, Form, Checkbox, List, Button } from 'antd';
import * as _ from 'lodash';

const FormItem = Form.Item;

const now = new Date();

const start = 9;
const end = 18;
const min = 0;
const max = 60 * (end - start);

let defaultStart = (now.getHours() - start) * 60 + now.getMinutes();
let defaultEnd = defaultStart + 60;

[defaultStart, defaultEnd] = [defaultStart, defaultEnd].map(v => {
  if (v < min) {
    return min;
  }

  if (v > max) {
    return max;
  }
});

const addZero = num => {
  return num < 10 ? `0${num}` : num.toString();
};

class Book extends Component {
  state = {
    time: [defaultStart, defaultEnd],
    shouldFilter: true
  };
  render() {
    const { time, shouldFilter } = this.state;

    return (
      <div>
        <Form>
          <FormItem>
            <Checkbox onChange={this.updateShouldFilter} value={shouldFilter}>
              使用选中时间筛选可用会议室
            </Checkbox>
          </FormItem>
          <FormItem>
            <Slider
              range
              marks={this.marks}
              value={time}
              min={min}
              max={max}
              tipFormatter={this.formatToTime}
              onChange={this.updateTime}
            />
          </FormItem>
        </Form>
        <List>
          <List.Item actions={[<a>预订</a>]}>
            <List.Item.Meta
              title={<a href="https://ant.design">Hello</a>}
              description="Ant Design, a design language for background applications, is refined by Ant UED Team"
            />
          </List.Item>
        </List>
      </div>
    );
  }

  get marks() {
    const hours = [];
    const marks = {};

    for (let i = start; i < end; i++) {
      hours.push(i);
    }

    hours.push(end);

    _.uniq(hours).forEach(v => {
      const [hour, min] = [Math.floor(v), (v % 1) * 60].map(addZero);

      const key = (v - start) * 60;

      marks[key] = `${hour}:${min}`;
    });

    return marks;
  }

  formatToTime(value) {
    const [hour, min] = [Math.floor(value / 60) + start, value % 60].map(
      addZero
    );

    return `${hour}:${min}`;
  }

  updateTime = time => {
    this.setState({
      time
    });
  };

  updateShouldFilter = val => {
    this.setState({
      shouldFilter: val
    });
  };
}

export default Book;
