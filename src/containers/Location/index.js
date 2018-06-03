import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Modal, message, Divider, Form, Input, TimePicker } from 'antd';
import * as _ from 'lodash';
import { formatTimeRange, minutes2Moment } from '../../utils/time';

const defaultStart = minutes2Moment(9 * 60);
const defaultEnd = minutes2Moment(18 * 60);

@inject('data')
@observer
class Location extends Component {
  state = {
    visible: false,
    active: null
  };

  columns = [
    {
      title: '地点',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '可预订时间',
      key: 'time',
      render(text, loc) {
        return formatTimeRange([loc.start_time, loc.end_time]);
      }
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
    const { getFieldDecorator } = this.props.form;
    const timeProps = {
      allowEmpty: false,
      format: 'HH:mm',
      minuteStep: 10,
      inputReadOnly: true
    };
    return (
      <div>
        <Table
          columns={this.columns}
          dataSource={this.props.data.locations.slice()}
          rowKey="id"
        />
        <Modal
          visible={this.state.visible}
          onCancel={this.closeModal}
          onOk={() => {
            this.submitForm();
          }}
          afterClose={this.clearForm}
          title={`${this.state.active ? '编辑' : '新建'}地点`}
        >
          <Form onSubmit={this.submitForm}>
            <Form.Item label="地点名称">
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    whitespace: true
                  }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item label="开始时间">
              {getFieldDecorator('startTime', {
                rules: [{ required: true }]
              })(<TimePicker {...timeProps} />)}
            </Form.Item>
            <Form.Item label="结束时间">
              {getFieldDecorator('endTime', {
                rules: [{ required: true }]
              })(<TimePicker {...timeProps} />)}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  componentDidMount() {
    this.props.updateCreateHandler(this.create);
  }

  componentWillUnmount() {
    this.props.updateCreateHandler(null);
  }

  updateActive(id) {
    if (id) {
      const loc = this.props.data.locations.find(loc => loc.id === id);
      this.setState({
        active: { ...loc }
      });
      this.props.form.setFieldsValue({
        name: loc.name,
        startTime: minutes2Moment(loc.start_time),
        endTime: minutes2Moment(loc.end_time)
      });
    } else {
      this.setState({
        active: null
      });
      this.props.form.setFieldsValue({
        startTime: defaultStart,
        endTime: defaultEnd
      });
    }
  }

  create = () => {
    this.updateActive();
    this.openModal();
  };

  edit(id) {
    this.updateActive(id);
    this.openModal();
  }

  delete(id) {
    Modal.confirm({
      title: '确认删除选中地点吗？',
      onOk: async () => {
        const res = await this.props.data.deleteLocation(id);

        if (res.status === 200) {
          message.success('删除成功');
        }
      }
    });
  }

  openModal = () => {
    this.setState({
      visible: true
    });
  };

  closeModal = () => {
    this.setState({
      visible: false
    });
  };

  clearForm = () => {
    this.props.form.resetFields();
  };

  submitForm = e => {
    if (e) {
      e.preventDefault();
    }

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      const { name, startTime, endTime } = values;

      if (!startTime.isBefore(endTime)) {
        message.error('开始时间不能大于结束时间');
        return;
      }

      const [startMin, endMin] = [startTime, endTime].map(
        time => time.hour() * 60 + time.minute()
      );

      const data = {
        name,
        startTime: startMin,
        endTime: endMin
      };

      (this.state.active
        ? this.props.data.updateLocation(this.state.active.id, data)
        : this.props.data.createLocation(data)
      ).then(res => {
        if (res.status === 200) {
          this.closeModal();
        }
      });
    });
  };
}

export default Form.create()(Location);
