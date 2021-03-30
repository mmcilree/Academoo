import React from "react";
import { Button, FormGroup, FormControl, Form, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { login } from "../../auth";
import { Route } from 'react-router-dom';

/*
component which allows the user to log in
*/
class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      isIncorrect: false,
      errors: []
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

  /*
  Method which checks the username and password with the backend to make sure the users credentials are correct
  */
  handleSubmit(event) {
    event.preventDefault();
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          username: this.state.username,
          password: this.state.password,
        }
      )
    }).then(r => {
      if (!r.ok) {
        return r.json().then((error) => {
          let err = error.title + ": " + error.message
          throw new Error(err);
        })
      } else {
        return r.json()
      }
    })
      .then(token => {
        if (token.access_token) {
          this.setState({ isIncorrect: false })
          login(token)

          this.props.history.push('/');
          window.location.reload(false);
        }
        else {
          this.setState({
            username: "",
            password: "",
            isIncorrect: true
          });
        }
      })
      .catch(error => {
        let errors = this.state.errors;
        errors.push(error.message)
        this.setState({ errors, username: "", password: "" })
      })
  }

  /**
   * Method which will render all of the information to the log-in page
   * the user enters their username and password
   */
  render() {
    return (
      <Card className="mt-4">
        <Card.Body className="mx-auto">
          <div>
            <Form onSubmit={this.handleSubmit.bind(this)}>
              <FormGroup controlId="username" bssize="large">
                <Form.Label>Username</Form.Label>
                <FormControl
                  autoFocus
                  onChange={this.handleChange.bind(this)}
                  type="text"
                  value={this.state.username}
                  name="username"
                />
              </FormGroup>
              <FormGroup controlId="password" bssize="large">
                <Form.Label>Password</Form.Label>
                <FormControl
                  onChange={this.handleChange.bind(this)}
                  value={this.state.password}
                  type="password"
                  name="password"
                />
              </FormGroup>

              {this.state.isIncorrect ? (<Alert variant='warning'> Username or password not recognised.</Alert>) : null}
              {this.state.errors.map(error => (
                <Alert variant='danger' key={error}>{error}</Alert>
              ))}              <Route render={({ history }) => (
                <Button
                  type='submit'
                  onClick={this.handleSubmit.bind(this)}
                >
                  Login
                </Button>
              )} />
              <Link to="/sign-up" className="btn btn-link">
                Sign up for Academoo
              </Link>
            </Form>
          </div>
        </Card.Body>
      </Card>
    );
  }
}

export default Login;
