import React from "react";
import { Button, FormGroup, FormControl, Form, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

/**
 * Component which allows the user to sign up to Academoo
 */
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

  /**
   * method which makes sure all of the input data has been validated
   */
  validateForm() {
    const errors = [];

    //length errors
    if(this.state.username.length === 0 || 
      this.state.email.length === 0 || 
      this.state.password.length === 0 ||
      this.state.passwordConfirm.length === 0) {
        errors.push("Required fields have been left blank.");
        return errors;
      }
      //username length errors
    if (this.state.username.length < 3) {
      errors.push("Username must be at least 3 characters.");
    }

    //email validation
    if (this.state.email.split("").filter(x => x === "@").length !== 1) {
      errors.push("Email should contain the @ symbol.");
    }

    //password match validation
    if (this.state.password !== this.state.passwordConfirm) {
      errors.push("Passwords do not match.");
    }
    //validation to make sure the password conforms to the RegEx we have specified
    if (!this.state.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\-£])(?=.{8,})/)) {
      errors.push(
        <div>
        <p>Password should have:</p>
          <ul> 
            <li> Minimum eight characters</li> 
            <li> At least one number.</li>
            <li> At least one special character.</li>
            <li> At least one capital letter.</li>
          </ul></div>);
    }

    return errors;
  }
  handlePasswordChange(event) {
    this.handleChange(event);
  }
  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  }

  /**
   * method to handle when the user presses submit to sign up to academoo
   */
  handleSubmit(event) {
    event.preventDefault();

    const errors = this.validateForm();
    //if there is errors in the data
    if(errors.length > 0) {
      this.setState({errors});
      return;
    }
    //to add the data to the backend
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
      }))
    .then(((response) => {
      this.props.history.push('/login')
      }))
    .catch((error) => {
      this.setState({isNonUnique: true})
      })
  }

  /**
   * method which renders the signup
   */
  render() {
    const {errors} = this.state;
    return (
      <Card className="mt-4 mb-4">
        <Card.Body className="mx-auto" onSubmit={this.handleSubmit.bind(this)}>
          <div>
            <p>Sign up for your Academoo account here. </p>
            <Form autoComplete="off">

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
                  type="password"
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
            
                <Button
                  type='submit'
                  onClick={this.handleSubmit.bind(this)}
                >
                  Register now
                </Button>
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
