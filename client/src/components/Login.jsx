import React from "react";
import { Button, FormGroup, FormControl, Form, Card } from "react-bootstrap";

class Login extends React.Component {
  render() {
    return (
      <Card className="mt-4">
        <Card.Body>
          <div className="mx-auto">
            <form>
              <FormGroup controlId="email" bsSize="large">
                <Form.Label>Email</Form.Label>
                <FormControl
                  autoFocus
                  type="email"
                // value={email}
                />
              </FormGroup>
              <FormGroup controlId="password" bsSize="large">
                <Form.Label>Password</Form.Label>
                <FormControl
                  //value={password}
                  type="password"
                />
              </FormGroup>
              <Button variant="primary" block bsSize="large" type="submit">
                Login
          </Button>
            </form>
            <Button variant="secondary" block bsSize="large" type="submit">
              No login? Sign up here!
          </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }
}

export default Login;
