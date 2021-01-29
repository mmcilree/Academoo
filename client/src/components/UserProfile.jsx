import React, { Component } from "react";
import { Card, Media } from "react-bootstrap";
import defaultProfile from "../images/default_profile.png";
import { authFetch } from '../auth';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
var md5 = require("md5");

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
    const emailHash = !this.state.isLoading && md5(this.state.email)
    return (
      <Card className="mt-4">
        <Card.Body>

          <Media>
            <img
              width={150}
              height={150}
              className="mr-5 mb-3 rounded-circle border border-primary"
              src={"https://en.gravatar.com/avatar/" + emailHash}
              alt="Profile image placeholder"
            />
            {!this.state.isLoading ? (
              <Media.Body className="mr-3">
                <h3>Username: {this.state.user_id}</h3>
                <h4 className="text-muted"> Email: {this.state.email} </h4>
                <p>Bio: {this.state.bio ? this.state.bio : "You have not yet set a bio!"} </p>
              </Media.Body>) : <h3>Loading Profile...</h3>}
          </Media>
        </Card.Body>
      </Card>
    );
  }
}

export default UserProfile;
