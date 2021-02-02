import React from "react";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

class AccessForbidden extends React.Component {
  render() {
    return (
      <Card className="mt-4">
        <Card.Body>
          <h1>:-( Moooving along...</h1>
          <p>You don't have permission to access this page. </p>
          <Link to="/moosfeed" className="btn btn-secondary">
            Go to Moosfeed
          </Link>
        </Card.Body>
      </Card>
    );
  }
}

export default AccessForbidden;
