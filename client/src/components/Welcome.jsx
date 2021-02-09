import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { authFetch } from "../auth";

class Welcome extends React.Component {
  render() {
    return (
      <Card className="mt-4">
        <Card.Body>
          <h1>Hello,</h1>
          <h1>Welcome to Academoo!</h1>
          <p>We are part of a new federated social media platform for universities... </p>
          <p>There is lots of things you can do on our website, if you need any help operating our social media site, visit our help page!</p>
          <Link to="/moosfeed" className="btn btn-secondary">
            Go to Moosfeed
          </Link>
        </Card.Body>
      </Card>
    );
  }
}

export default Welcome;
