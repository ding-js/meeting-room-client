import React, { Component } from 'react';
import { Form, Icon, Input, Button } from 'antd';
import { inject, observer } from 'mobx-react';
import { parse } from 'qs';
import request, { updateCsrftoken } from '../../utils/request';
import './style.less';
const FormItem = Form.Item;

@inject('user')
@observer
class Login extends Component {
  render() {
    const { getFieldDecorator } = this.props.form;
    const query = parse(this.props.location.search, {
      ignoreQueryPrefix: true
    });

    const isFromAdmin = query.from === 'admin';
    const nameField = isFromAdmin ? '用户名' : '真实姓名';

    return (
      <Form
        className="client-login"
        onSubmit={e => this.handleSubmit(e, isFromAdmin)}
      >
        <FormItem>
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: `请输入你的${nameField}`
              },
              { max: 30, message: '名字忒长了，放不下了' }
            ]
          })(
            <Input
              autoComplete="off"
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder={nameField}
            />
          )}
        </FormItem>
        {isFromAdmin ? (
          <FormItem>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: `请输入密码`
                }
              ]
            })(
              <Input
                autoComplete="off"
                type="password"
                prefix={
                  <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                placeholder="密码"
              />
            )}
          </FormItem>
        ) : null}
        <FormItem>
          <Button type="primary" htmlType="submit">
            {isFromAdmin ? '登录' : '保存'}
          </Button>
        </FormItem>
      </Form>
    );
  }

  handleSubmit = (e, isFromAdmin) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { name, password } = values;

        if (!isFromAdmin) {
          this.props.user.updateName(name);

          this.props.history.push('/');
        } else {
          request
            .post('/api/login', {
              username: name,
              password
            })
            .then(res => {
              if (res.status === 200) {
                const { id, username } = res.data;
                updateCsrftoken();
                this.props.user.updateName(username);
                this.props.user.updateId(id);
                this.props.history.push('/admin');
              }
            });
        }
      }
    });
  };
}

export default Form.create()(Login);
