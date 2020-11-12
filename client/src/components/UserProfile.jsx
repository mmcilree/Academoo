import React, { Component } from "react";
import { Card, Media } from "react-bootstrap";
import defaultProfile from "../images/default_profile.png";
import { authFetch } from '../auth';

class UserProfile extends Component {
  constructor(props) {
      super(props);
      this.state = { 
        user_id: "",
        email: "", 
        host: "", 
        isLoading: true};
  } 

  fetchUserDetails() {
    authFetch("/api/get-user").then(response => response.json())
      .then(data =>
        this.setState({
          user_id: data.id,
          email: data.email,
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
            </Media.Body> ) : <h3>Loading Profile...</h3> }
          </Media>
        </Card.Body>
      </Card>
    );
  }
}

export default UserProfile;
