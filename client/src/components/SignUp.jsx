import React from "react";
import { Button, FormGroup, FormControl, Form, Card} from "react-bootstrap";

class SignUp extends React.Component {
  render() {
    return (
      <Card className="mt-4">
        <Card.Body>
          <div className="SignUp">
            <p>Sign up for your Academoo account here. </p>
            <form>
              <FormGroup controlId="firstName" bsSize="large">
                <Form.Label>First Name</Form.Label>
                <FormControl
                  autoFocus
                  type="text"
                //value={email}
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
              <Button variant="primary" block bsSize="large" type="submit">
                Register
          </Button>
            </form>
          </div>
        </Card.Body>
      </Card>
    );
  }
}

export default SignUp;
