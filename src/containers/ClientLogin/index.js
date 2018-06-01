import React, { Component } from 'react';
import { Form, Icon, Input, Button } from 'antd';
import { inject, observer } from 'mobx-react';
import './style.less';
const FormItem = Form.Item;

@inject('user')
@observer
class ClientLogin extends Component {
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form className="client-login" onSubmit={this.handleSubmit}>
        <FormItem>
          {getFieldDecorator('name', {
            rules: [
              { required: true, whitespace: true, message: '请输入你的真实姓名' },
              { max: 30, message: '名字忒长了，放不下了' }
            ]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="真实姓名"
            />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </FormItem>
      </Form>
    );
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { name } = values;

        this.props.user.updateName(name);

        this.props.history.push('/');
      }
    });
  };
}

export default Form.create()(ClientLogin);
