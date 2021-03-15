import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { authFetch } from "../../auth";

import {
  BadgeTm,
} from "react-bootstrap-icons";

class Welcome extends React.Component {
  fetchCurrentUser() {
    authFetch("/api/admin-protected").then(response => response.json())
      .then(data => {
        return (<p>{data}</p>)
      }
      )
  }

  render() {
    return (
      <Card className="mt-4">
        <Card.Body>
          <h1>Hello,</h1>
          <h1> Welcome to Academoo!</h1>
          <p>We are part of a new federated social media platform for universities. We connect with similar sites to allow communciation between sites and to allow people from all over to connect and discuss things they enjoy! </p>
          <p>There is lots of things you can do on Academoo: </p>
            <ul>
              <li>Create your own commoonity</li>
              <li>Post on communities on our server, and others</li>
              <li>Upvote and downvote members posts</li>
              <li>Personalise your profile</li>
              <li>Much, much more...</li>
              </ul>
              <p>If you need any help operating our social media site, visit our <Link to="/help">help page</Link> for guidance.</p>
          <p>To get started, scroll through our list of communities and follow ones you are interested in!</p>
          <Link to="/communities" className="btn btn-secondary">
            Explore Commoonities
          </Link>
        </Card.Body>
      </Card>
      
    );
  }
}

export default Welcome;
