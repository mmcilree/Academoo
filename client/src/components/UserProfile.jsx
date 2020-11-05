import React, { Component } from "react";
import { Card, Media } from "react-bootstrap";
import defaultProfile from "../images/default_profile.png";

class UserProfile extends Component {
  render() {
    return (
      <Card className="mt-4">
        <Card.Body>
          <Media>
            <img
              width={150}
              height={150}
              className="mr-3 rounded-circle border border-secondary"
              src={defaultProfile}
              alt="Profile image placeholder"
            />
            <Media.Body className="mr-3">
              <h3>Profile page</h3>
              <p>This is the user's profile page! </p>
            </Media.Body>
          </Media>
        </Card.Body>
      </Card>
    );
  }
}

export default UserProfile;
