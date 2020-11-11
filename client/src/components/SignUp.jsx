import React from "react";
import { Button, FormGroup, FormControl, Form, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Route } from 'react-router-dom';

class SignUp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      username: "",
      password: "",
      passwordConfirm: "",
      isNonMatching: false,
      isNonUnique: false,
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

  async handleSubmit(event) {
    event.preventDefault();
    if (this.state.password !== this.state.passwordConfirm) {
      this.setState({ isNonMatching: true });
    } else {
      const opt = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            email: this.state.email,
            username: this.state.username,
            password: this.state.password
          }
        )
      };
      await fetch('/api/register', opt).then(response => response.json())
      .then(data => data)
      .catch(error => this.setState({ isNonUnique: true}));
      
      
      !this.state.isNonUnique && this.props.history.push('/login');
    }
  }

  render() {
    return (
      <Card className="mt-4">
        <Card.Body className="mx-auto" onSubmit={this.handleSubmit.bind(this)}>
          <div>
            <p>Sign up for your Academoo account here. </p>
            <Form>

              <FormGroup controlId="email" bssize="large">
                <Form.Label>Email</Form.Label>
                <FormControl
                  autoFocus
                  onChange={this.handleChange.bind(this)}
                  type="email"
                  value={this.state.email}
                  name="email"
                />
              </FormGroup>
              <FormGroup controlId="username" bssize="large">
                <Form.Label>Create a username</Form.Label>
                <FormControl
                  onChange={this.handleChange.bind(this)}
                  type="text"
                  value={this.state.username}
                  name="username"
                />
              </FormGroup>
              {this.state.isNonUnique ? (<Alert variant='warning'> Username or email already registered.</Alert>) : null}
              <FormGroup controlId="password" bssize="large">
                <Form.Label>Password</Form.Label>
                <FormControl
                  onChange={this.handleChange.bind(this)}
                  value={this.state.password}
                  name="password"
                  type="password"
                />
              </FormGroup>

              {this.state.isNonMatching ? (<Alert variant='warning'> Passwords do not match.</Alert>) : null}
              
              <FormGroup controlId="confirmPassword" bssize="large">
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
