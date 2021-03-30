import React from "react";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

class PageNotFound extends React.Component {
  /* 
  Component which is used to display a page not found error if the user requests a page which does not exist
  */
  render() {
    return (
      <Card className="mt-4">
        <Card.Body>
          <h1>What the Moo?</h1>
          <p>404: Couldn't find that, sorry. </p>
          <Link to="/moosfeed" className="btn btn-secondary">
            Go to Moosfeed
          </Link>
        </Card.Body>
      </Card>
    );
  }
}

export default PageNotFound;
