import React, { Component } from "react";
import { Card, Media } from "react-bootstrap";
import defaultProfile from "../images/default_profile.png";
import { authFetch } from '../auth';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id: "",
      email: "",
      bio: "",
      new_bio: "",
      host: "",
      isLoading: true
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

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        bio: this.state.new_bio
      }
    }
      requestOptions.body = JSON.stringify(requestOptions.body);

      
      await authFetch('/api/update-bio', requestOptions);
      this.setState({new_bio: ""})

      this.fetchUserDetails();
  }

  fetchUserDetails() {
    authFetch("/api/get-user").then(response => response.json())
      .then(data =>
        this.setState({
          user_id: data.id,
          email: data.email,
          bio: data.bio,
          host: data.host,
          isLoading: false
        })
      )

  }

  componentDidMount() {
    this.fetchUserDetails();
  }

  render() {
    return (
      <Card className="mt-4">
        <Card.Body>

          <Media>
            <img
              width={150}
              height={150}
              className="mr-3 rounded-circle border border-primary"
              src={defaultProfile}
              alt="Profile image placeholder"
            />
            {!this.state.isLoading ? (
              <Media.Body className="mr-3">
                <h3>Username: {this.state.user_id}</h3>
                <h4 className="text-muted"> Email: {this.state.email} </h4>
                <p>Bio: {this.state.bio ? this.state.bio : "You have not yet set a bio!"} </p>
              </Media.Body>) : <h3>Loading Profile...</h3>}
          </Media>

          <Form onSubmit={this.handleSubmit.bind(this)}>
            <Form.Group controlId="profileBio">
              <Form.Label>Update your bio:</Form.Label>
              <Form.Control type="input"
                placeholder="Tell us more about yourself"
                name="new_bio"
                onChange={this.handleChange.bind(this)}
                value={this.state.new_bio} />
            </Form.Group>
            <Button variant="primary" type="submit" className>
              Update Bio
            </Button>
          </Form>

        </Card.Body>
      </Card>
    );
  }
}

export default UserProfile;
