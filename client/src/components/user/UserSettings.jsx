import React, { Component } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { authFetch, logout } from '../../auth';
import { withRouter } from 'react-router-dom';

/*
Component which renders and contains method for the user settings page
*/
class UserSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldPassword: "",
      newPassword: "",
      password:"",
      errors: [],
      changed: false,
      username: "",
      email: "",
      bio: "",
      host: "",
      privateAccount: true,
      privUpdated: false,
      isLoading: false,
      confirmUsername: "",
      confirmPassword: "",

    }
  }

  componentDidMount() {
    this.fetchUserDetails();
  }

  /*
  Method to get all of the information for the given user
  */
  fetchUserDetails() {
    authFetch("/api/get-user").then(response => response.json())
      .then(data =>
        this.setState({
          username: data.id,
          email: data.email,
          bio: data.bio,
          privateAccount: data.private,
          checked: data.private,
          host: data.host,
          isLoading: false
        })
      ).catch(() => {})

  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleCheckboxChange(event) {
    this.setState({ checked: event.target.checked, privUpdated: false });
  }

  /*
  Method to check that the passwords entered into the password change are correct and conform
  */
  validateForm() {
    const errors = [];
    if (this.state.oldPassword.length === 0 || this.state.newPassword.length === 0) {
      errors.push("Required fields have been left blank.")
    }

    if (!this.state.newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\-£])(?=.{8,})/)) {
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

  /*
  Method to handle the submit of the password change
  */
  handleSubmitPass(event) {
    event.preventDefault();

    const errors = this.validateForm();
    if (errors.length > 0) {
      this.setState({ errors });
      return;
    }

    //store the values
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        old_password: this.state.oldPassword,
        new_password: this.state.newPassword,
      }
    };
    requestOptions.body = JSON.stringify(requestOptions.body);

    //fetch from the backend to call the backend function 
    authFetch('/api/change-password', requestOptions).then(r => r.status).then(statusCode => {
      if (statusCode !== 200) {
        this.setState({ changed: false, errors: ["Incorrect Password!"] })
      } else {
        this.setState({ changed: true, errors: [] });
      }
    }).catch(() => {});
    this.setState(
      { oldPassword: "", newPassword: "" }
    );
    this.props.history.push('/user-settings/');
  }

  /*
  Method to handle the change of bio when the user submits the change of their bio
  */
  async handleSubmitBio(event) {
    event.preventDefault();

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        bio: this.state.new_bio
      }
    }
    requestOptions.body = JSON.stringify(requestOptions.body);


    await authFetch('/api/update-bio', requestOptions);
    this.setState({ new_bio: "" })
    this.fetchUserDetails();
    this.props.history.push("/user-profile/" + this.state.username);
  }

  /*
  Method to handle the change to the privacy settings someone chooses
  */
  async handleSubmitPrivacy(event) {
    event.preventDefault();

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        private: (this.state.checked ? "private" : "public")
      }
    }
    requestOptions.body = JSON.stringify(requestOptions.body);

    //call the backend to update the DB with the new information
    await authFetch('/api/update-privacy', requestOptions)
      .then(response => {
        this.setState({ privUpdated: true });
        this.fetchUserDetails();
      }).catch(() => {});

  }

/*
  Method to handle the delete of account
  */
  async handleDeleteAccount(event) {
    //check the user wants to delete their account
    var deleteConfirm = window.confirm("Are you sure you want to delete your Academoo account?");
    if(deleteConfirm){
      event.preventDefault();

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          password: this.state.confirmPassword,
        }
      };
      requestOptions.body = JSON.stringify(requestOptions.body);

      if((this.state.username === this.state.confirmUsername)) {
        //connect to the backend
        await authFetch('/api/delete-account', requestOptions)
         .then(r => r.status).then(statusCode => {
           if(statusCode === 200) {
             logout();
           }
         }).catch(() => {});
       }
    }
    
  }

  /*
  Method to render all of this information to the settings page
  */
  render() {
    const { errors, changed } = this.state;
    return (
      <Card className="mt-4">
        <Card.Body>
          <h3>Settings</h3>
          <Card className="mt-4">
            <Card.Body>

              {errors.map(error => (
                <Alert variant='warning' key={error}>{error}</Alert>
              ))}
              {changed && <Alert variant='success'>Password changed successfully!</Alert>}

              <Form onSubmit={this.handleSubmitPass.bind(this)}>
                <Form.Group>
                  <Form.Label>Change your password:</Form.Label>
                  <Form.Text>Current Password</Form.Text>
                  <Form.Control type="password" name="oldPassword" onChange={this.handleChange.bind(this)} value={this.state.oldPassword} />
                  <Form.Text>New Password</Form.Text>
                  <Form.Control type="password" name="newPassword" onChange={this.handleChange.bind(this)} value={this.state.newPassword} />
                </Form.Group>
                <Button type="submit" variant="secondary">Change Password</Button>
              </Form>
            </Card.Body>
          </Card>
          <Card className="mt-4">
            <Card.Body>
              <Form onSubmit={this.handleSubmitBio.bind(this)}>
                <Form.Group controlId="profileBio">
                  <Form.Label>Update Your Bio:</Form.Label>
                  <Form.Control type="input"
                    placeholder="Tell us more about yourself"
                    name="new_bio"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.new_bio} />
                </Form.Group>
                <Button variant="secondary" type="submit">
                  Update Bio
                  </Button>
              </Form>
            </Card.Body>
          </Card>
          <Card className="mt-4">
            <Card.Body>
              <Form onSubmit={this.handleSubmitPrivacy.bind(this)}>
                <Form.Group controlId="privacy">
                  <Form.Label>Privacy Settings</Form.Label>
                  {this.state.privUpdated && <Alert variant="primary">Privacy Settings Updated</Alert>}
                  <Form.Text>With a private account, other users can see your username but cannot see any of your details.</Form.Text>
                  <Form.Text>Your account is currently <b>{this.state.privateAccount ? "private." : "public"}</b></Form.Text>
                  <br />
                  <Form.Check
                    type="switch"
                    id="custom-switch"
                    label="Private account"
                    checked={this.state.checked}
                    onChange={this.handleCheckboxChange.bind(this)}
                  />
                </Form.Group>
                <Button variant="secondary" type="submit">Save</Button>
              </Form>
            </Card.Body>
          </Card>
          <Card className="mt-4">
            <Card.Body>
              <Form onSubmit={this.handleDeleteAccount.bind(this)}>
                <Form.Group controlId="deleteAccount">
                  <Form.Label>Delete Account</Form.Label>
                  <Form.Text>If you would like to delete your Academoo account, pleaser enter your username to confirm you would like to delete.</Form.Text>
                  <p></p>
                  <Form.Text> <b>Please note: This action is irreversible</b></Form.Text>
                  <p></p>
                  <Form.Text>Enter your username to confirm: </Form.Text>
                  <Form.Control type="input" name="confirmUsername" onChange={this.handleChange.bind(this)} value={this.state.confirmUsername}></Form.Control>
                  <Form.Text>Enter your password to confirm: </Form.Text>
                  <Form.Control type="password" name="confirmPassword" onChange={this.handleChange.bind(this)} value={this.state.confirmPassword}></Form.Control>
                  </Form.Group>
                <Button variant="secondary" type="submit" disabled={(this.state.username !== this.state.confirmUsername)}>Delete Account</Button>
              </Form>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card >
    );
  }
}

export default withRouter(UserSettings);
