import React from "react";
import Card from "react-bootstrap/Card";
import CommunityList from "./CommunityList";
import { Link } from "react-router-dom";

class CommunityExplorer extends React.Component {
  render() {
    return (
      <Card className="mt-4">
        <Card.Body>
          <h1>Explore Commoonities</h1>
          <p>See what communities are available on the federated network!</p>
          <CommunityList />
          <CommunityList />
          <CommunityList />
        </Card.Body>
      </Card>
    );
  }
}

export default CommunityExplorer;