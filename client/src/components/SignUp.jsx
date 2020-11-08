import React from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./SignUp.css"

class SignUp extends React.Component {
  render() {
    return (
        <div className="SignUp">
            <p>Sign up for your Academoo account here. </p>
        <form>
        <FormGroup controlId="firstName" bsSize="large">
            <ControlLabel>First Name</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              //value={email}
            />
          </FormGroup>
          <FormGroup controlId="secondName" bsSize="large">
            <ControlLabel>Second Name</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              //value={email}
            />
          </FormGroup>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              //value={email}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              //value={password}
              type="password"
            />
          </FormGroup>
          <FormGroup controlId="confirmPassword" bsSize="large">
            <ControlLabel>Confirm Password</ControlLabel>
            <FormControl
              //value={password}
              type="password"
            />
          </FormGroup>
          <Button variant="primary" block bsSize="large"   type="submit">
            Register
          </Button>
        </form>
      </div>
    );
  }
}

export default SignUp;
