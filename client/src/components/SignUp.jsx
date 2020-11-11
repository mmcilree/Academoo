import React from "react";
import { Button, FormGroup, FormControl, Form, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Route } from 'react-router-dom';

class SignUp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      passwordConfirm: "",
      isIncorrect: false
    };
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.password != this.state.passwordConfirm) {
      this.setState({ isIncorrect: true });
    } else {
      const opt = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            username: this.state.username,
            password: this.state.password
          }
        )
      };
      fetch('/api/register', opt);
      this.props.history.push('/login');
    }
  }

  render() {
    return (
      <Card className="mt-4">
        <Card.Body className="mx-auto" onSubmit={this.handleSubmit.bind(this)}>
          <div>
            <p>Sign up for your Academoo account here. </p>
            <Form>
              
              <FormGroup controlId="username" bsSize="large">
                <Form.Label>Username</Form.Label>
                <FormControl
                  autoFocus
                  onChange={this.handleChange.bind(this)}
                  type="text"
                  value={this.state.username}
                  name="username"
                />
              </FormGroup>
              <FormGroup controlId="password" bsSize="large">
                <Form.Label>Password</Form.Label>
                <FormControl
                  onChange={this.handleChange.bind(this)}
                  value={this.state.password}
                  name="password"
                  type="password"
                />
              </FormGroup>
              {this.state.isIncorrect ? (<Alert variant='warning'> Passwords do not match.</Alert>) : null}
              <FormGroup controlId="confirmPassword" bsSize="large">
                <Form.Label>Confirm Password</Form.Label>
                <FormControl
                  onChange={this.handleChange.bind(this)}
                  value={this.state.passwordConfirm}
                  name="passwordConfirm"
                  type="password"
                />
              </FormGroup>
              <Route render={({ history }) => (
                <Button
                  type='submit'
                  onClick={this.handleSubmit.bind(this)}
                >
                  Register now
                </Button>
              )} />
              <Link to="/login" className="btn btn-link">
                Already signed up?
              </Link>

            </Form>
          </div>
        </Card.Body>
      </Card>
    );
  }
}

export default SignUp;
