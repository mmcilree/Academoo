import React from "react";
import { Button, FormGroup, FormControl, Form, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

class SignUp extends React.Component {
  render() {
    return (
      <Card className="mt-4">
        <Card.Body className="mx-auto">
          <div>
            <p>Sign up for your Academoo account here. </p>
            <Form>
              <FormGroup controlId="firstName" bsSize="large">
                <Form.Label>First Name</Form.Label>
                <FormControl
                  autoFocus
                  type="text"
                  value={this.state.firstName}
                />
              </FormGroup>
              <FormGroup controlId="secondName" bsSize="large">
                <Form.Label>Second Name</Form.Label>
                <FormControl
                  autoFocus
                  type="text"
                //value={email}
                />
              </FormGroup>
              <FormGroup controlId="email" bsSize="large">
                <Form.Label>Email</Form.Label>
                <FormControl
                  autoFocus
                  type="email"
                //value={email}
                />
              </FormGroup>
              <FormGroup controlId="password" bsSize="large">
                <Form.Label>Password</Form.Label>
                <FormControl
                  //value={password}
                  type="password"
                />
              </FormGroup>
              <FormGroup controlId="confirmPassword" bsSize="large">
                <Form.Label>Confirm Password</Form.Label>
                <FormControl
                  //value={password}
                  type="password"
                />
              </FormGroup>
              <Link to="/moosfeed" className="btn btn-secondary">
                Register now
          </Link>
            </Form>
          </div>
        </Card.Body>
      </Card>
    );
  }
}

export default SignUp;
