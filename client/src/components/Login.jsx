import React from "react";
import { Button, FormGroup, FormControl, Form, Card,Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { login } from "../auth";
import { Route } from 'react-router-dom';

class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      email: "", 
      password: "",
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

  handleSubmit(event){
    event.preventDefault();
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          email: this.state.email,
          password: this.state.password,
        }
      )
    }).then(r => r.json())
      .then(token => {
        if (token.access_token){
          this.setState({isIncorrect:false})
          login(token)
          console.log(token) 
          this.props.history.push('/');
        }
        else {
          this.setState({
            email: "", 
            password: "",
            isIncorrect: true
          });
        }
    })
  }

  render() {
    return (
      <Card className="mt-4">
        <Card.Body>
          <div>
            <Form className="mx-auto" width='800' onSubmit={this.handleSubmit.bind(this)}>
              <FormGroup controlId="email" bssize="large">
                <Form.Label>Email</Form.Label>
                <FormControl
                  autoFocus
                  onChange={this.handleChange.bind(this)}
                  type="text"
                  value={this.state.email}
                  name="email"
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

              {this.state.isIncorrect ? ( <Alert variant='warning'> Username or password not recognised.</Alert>):null}
              <Route render={({ history }) => (
                <Button
                  type='submit'
                  onClick={this.handleSubmit.bind(this)}
                >
                  Login
                </Button>
              )} />
              <br></br>
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
