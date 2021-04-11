import React from "react";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import { authFetch } from "../../auth";

class Welcome extends React.Component {
  /* 
  Component which is used to display the welcome page to users when they use Academoo
  */
  fetchCurrentUser() {
    authFetch("/api/admin-protected").then(response => response.json())
      .then(data => {
        return (<p>{data}</p>)
      }
      ).catch(() => { })
  }

  render() {
    return (
      <Card className="mt-4">
        <Card.Body className="d-flex flex-column align-items-center">
          {/* <h1>Hello,</h1> */}
          <div className="text-center">
            <h1 className="text-secondary" style={{ "font-size": 80 }}> Welcome to Academoo!</h1>
            <p>We are part of a new federated social media platform for universities. We connect with similar sites to allow communciation between sites and to allow people from all over to connect and discuss things they enjoy! </p>
          </div>
          <Card className="mb-1 border-primary">
            <Card.Body>
              <p>There is lots of things you can do on Academoo: </p>
              <ul>
                <li>Create your own commoonity</li>
                <li>Post on communities on our server, and others</li>
                <li>Upvote and downvote members posts</li>
                <li>Personalise your profile</li>
                <li>Much, much more...</li>
              </ul>
            </Card.Body>
          </Card>
          <div className="m-2 text-center">
            <p>If you need any help operating our social media site, visit our <Link to="/help">help page</Link> for guidance.</p>
            <p>To get started, scroll through our list of communities and follow ones you are interested in!</p>
          </div>
          <Link to="/communities" className="btn btn-secondary">
            Explore Commoonities
          </Link>
        </Card.Body>
      </Card>

    );
  }
}

export default Welcome;
