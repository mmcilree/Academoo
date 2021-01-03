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
      errors: [],
    };
  }
  validateForm() {
    const errors = [];

    if(this.state.username.length == 0 || 
      this.state.email.length == 0 || 
      this.state.password.length == 0 ||
      this.state.passwordConfirm.length == 0) {
        errors.push("Required fields have been left blank.");
        return errors;
      }
    if (this.state.username.length < 3) {
      errors.push("Username must be at least 3 characters");
    }

    if (this.state.email.split("").filter(x => x === "@").length !== 1) {
      errors.push("Email should contain the @ symbol");
    }

    if (this.state.password !== this.state.passwordConfirm) {
      errors.push("Passwords do not match");
    }
    if (!this.state.password.match("^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$")) {
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
  handlePasswordChange(event) {
    this.handleChange(event);
    console.log("password changed");
  }
  handleChange(event) {
    console.log("changed");
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const errors = this.validateForm();
    if(errors.length > 0) {
      this.setState({errors});
      return;
    }
    const opt = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          email: this.state.email,
          username: this.state.username,
          password: this.state.password
        }
      )}

    // To improve once we have a better way to check unique usernames.
    fetch('/api/register', opt).then( ((response) => {
      if (!response.ok) {
        throw new Error();
      }
      return response;
      }).bind(this))
    .then(((response) => {
      this.props.history.push('/login')
      }).bind(this))
    .catch((error) => {
      this.setState({isNonUnique: true})
      })
  }

  render() {
    const {errors} = this.state;
    return (
      <Card className="mt-4 mb-4">
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
                  autoComplete="new-password"
                  required
                />
              </FormGroup>
              <FormGroup controlId="username" bssize="large">
                <Form.Label>Create a username</Form.Label>
                <FormControl
                  onChange={this.handleChange.bind(this)}
                  type="text"
                  value={this.state.username}
                  name="username"
                  autoComplete="new-password"
                />
              </FormGroup>
              {this.state.isNonUnique ? (<Alert variant='warning'> Username or email already registered.</Alert>) : null}
              <FormGroup controlId="password" bssize="large">
                <Form.Label>Password</Form.Label>
                <FormControl
                  onChange={this.handlePasswordChange.bind(this)}
                  value={this.state.password}
                  name="password"
                  type="text"
                  autoComplete="new-password"
                />
              </FormGroup>

              <FormGroup controlId="confirmPassword" bssize="large">
                <Form.Label>Confirm Password</Form.Label>
                <FormControl
                  onChange={this.handleChange.bind(this)}
                  value={this.state.passwordConfirm}
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                />
              </FormGroup>
              {errors.map(error => (
                <Alert variant='warning' key={error}>{error}</Alert>
              ))}
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
