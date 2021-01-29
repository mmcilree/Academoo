import React, { Component } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { authFetch } from '../auth';

class UserSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldPassword: "",
      newPassword: "",
      errors: [],
      changed: false,
    }
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
        [name]: value
    });
  }

  validateForm() {
    const errors = [];
    if (this.state.oldPassword.length === 0 || this.state.newPassword.length === 0) {
        errors.push("Required fields have been left blank.")
    }

    if (!this.state.newPassword.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
      errors.push(
        <p>Password should have:
          <ul> 
            <li> Minimum eight characters</li> 
            <li> At least one number</li>
          </ul>
        </p>);
    }

    return errors;
  }

  handleSubmit(event) {
    event.preventDefault();

    const errors = this.validateForm();
    if (errors.length > 0) {
        this.setState({ errors });
        return;
    }

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
            old_password: this.state.oldPassword,
            new_password: this.state.newPassword,
        }
    };
    requestOptions.body = JSON.stringify(requestOptions.body);

    authFetch('/api/change-password', requestOptions).then(r => r.status).then(statusCode => {
      if (statusCode != 200) { 
        this.setState( { changed: false, errors: ["Incorrect Password!"] } )
      } else {
        this.setState( { changed: true, errors: [] });
      }
    });
    this.setState(
        { oldPassword: "", newPassword: "" }
    );
    this.props.history.push('/user-settings');
  }

  render() {
    const { errors, changed } = this.state;
    return (
      <Card className="mt-4">
        <Card.Body>
          <h3>Settings</h3>
          {errors.map(error => (
              <Alert variant='warning' key={error}>{error}</Alert>
          ))}
          { changed && <Alert variant='success'>Password changed successfully!</Alert>}

          <Form onSubmit={this.handleSubmit.bind(this)}>
            <Form.Group>
              <Form.Label>Current Password</Form.Label>
              <Form.Control type="password" name="oldPassword" onChange={this.handleChange.bind(this)} value={this.state.oldPassword} />
              <Form.Label>New Password</Form.Label>
              <Form.Control type="password" name="newPassword" onChange={this.handleChange.bind(this)} value={this.state.newPassword} />
            </Form.Group>

            <Button type="submit">
              Change Password
            </Button>
          </Form>
        </Card.Body>
      </Card>
    );
  }
}

export default UserSettings;
