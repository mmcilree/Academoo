import React from "react";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

class Welcome extends React.Component {
  render() {
    return (
      <Card className="mt-4">
        <Card.Body>
          <h1>Welcome to Academoo!</h1>
          <p>There's not much here yet... </p>
          <Link to="/moosfeed" className="btn btn-secondary">
            Go to Moosfeed
          </Link>
        </Card.Body>
      </Card>
    );
  }
}

export default Welcome;
