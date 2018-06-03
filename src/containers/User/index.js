import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Table, Modal, message, Divider, Form, Input, TimePicker } from 'antd';
import * as _ from 'lodash';

@inject('user')
@observer
class User extends Component {
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
    const { getFieldDecorator } = this.props.form;
    const pwdRules = [
      {
        required: true,
        whitespace: true
      },
      {
        min: 6,
        message: '密码最少需要 6 个字符'
      },
      {
        max: 32,
        message: '密码最多不能超多 32 个字符'
      },
      {
        validator: (rule, value, callback) => {
          const { password, re_password } = this.props.form.getFieldsValue([
            'password',
            're_password'
          ]);
          if (!re_password || password === re_password) {
            callback();
          } else {
            callback('两次密码输入不一致');
          }
        }
      }
    ];

    return (
      <div>
        <Table
          columns={this.columns}
          dataSource={users.slice()}
          loading={fetching}
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
            <Form.Item label="用户名">
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    whitespace: true
                  },
                  {
                    pattern: /[_\-\w\n]+/,
                    message: '用户名只支持下划线、数字和英文'
                  }
                ]
              })(<Input autoComplete="off" />)}
            </Form.Item>
            <Form.Item label="密码">
              {getFieldDecorator('password', {
                rules: [...pwdRules]
              })(<Input autoComplete="off" type="password" />)}
            </Form.Item>
            <Form.Item label="重复密码">
              {getFieldDecorator('re_password', {
                rules: [...pwdRules]
              })(<Input autoComplete="off" type="password" />)}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  componentDidMount() {
    if (!this.props.user.users.length) {
      this.props.user.fetchUsers();
    }
    this.props.updateCreateHandler(this.create);
  }

  componentWillUnmount() {
    this.props.updateCreateHandler(null);
  }

  updateActive(id) {
    if (id) {
      const user = this.props.user.users.find(user => user.id === id);
      this.setState({
        active: { ...user }
      });
      this.props.form.setFieldsValue({
        username: user.username
      });
    } else {
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
      title: '确认删除选中用户吗？',
      content: '删除后他的预订仍然存在哦~',
      onOk: async () => {
        const res = await this.props.user.deleteUser(id);

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

      const { username, password } = values;

      const data = {
        username,
        password
      };

      (this.state.active
        ? this.props.user.updateUser(this.state.active.id, data)
        : this.props.user.createUser(data)
      ).then(res => {
        if (res.status === 200) {
          this.closeModal();
        }
      });
    });
  };
}

export default Form.create()(User);
