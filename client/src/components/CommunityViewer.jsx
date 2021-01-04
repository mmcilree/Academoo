import React from "react";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

class PageNotFound extends React.Component {
  render() {
    return (
      <Card className="mt-4">
        <Card.Body>
          <h1>Explore Commoonities</h1>
          <p>See what communities are available on the federated network!</p>
          <Link to="/moosfeed" className="btn btn-secondary">
            Go to Moosfeed
          </Link>
        </Card.Body>
      </Card>
    );
  }
}

export default PageNotFound;