import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Modal, message, Divider, Form, Input, Select } from 'antd';
import * as _ from 'lodash';

@inject('data')
@observer
class Room extends Component {
  state = {
    visible: false,
    active: null
  };

  columns = [
    {
      title: '会议室',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      render: id => this.props.data.locations.find(loc => loc.id === id).name
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

    return (
      <div>
        <Table
          columns={this.columns}
          dataSource={this.props.data.rooms.slice()}
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
            <Form.Item label="会议室名称">
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    whitespace: true
                  }
                ]
              })(<Input autoComplete="off" />)}
            </Form.Item>
            <Form.Item label="地点">
              {getFieldDecorator('location', {
                rules: [
                  {
                    required: true
                  }
                ]
              })(
                <Select>
                  {this.props.data.locations.map(loc => (
                    <Select.Option key={loc.id} value={loc.id}>
                      {loc.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
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
      const room = this.props.data.rooms.find(room => room.id === id);
      this.setState({
        active: { ...room }
      });
      this.props.form.setFieldsValue({
        name: room.name
      });
    } else {
      this.props.form.setFieldsValue({
        location: this.props.data.locations[0].id
      });

      this.setState({
        active: null
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
      title: '确认删除选中会议室吗？',
      content: '删除会议室的同时会删除该会议室所有的预订',
      onOk: async () => {
        const res = await this.props.data.deleteRoom(id);

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

      const { name, location } = values;

      const data = {
        name,
        location
      };

      (this.state.active
        ? this.props.data.updateRoom(this.state.active.id, data)
        : this.props.data.createRoom(data)
      ).then(res => {
        if (res.status === 200) {
          this.closeModal();
        }
      });
    });
  };
}

export default Form.create()(Room);
