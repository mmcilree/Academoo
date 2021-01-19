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
          <h1>Welcome to Academoo!</h1>
          <p>Part of a new federated social media platform for universities... </p>
          <Link to="/moosfeed" className="btn btn-secondary">
            Go to Moosfeed
          </Link>

          <Button onClick={this.handleClick.bind(this)}>ADMIN ONLY!!!</Button>
        </Card.Body>
      </Card>
    );
  }

  handleClick(){
    authFetch("/api/secret").then(response => response.json())
    .then(data =>
      console.log(data)
    );

  }
}

export default Welcome;
