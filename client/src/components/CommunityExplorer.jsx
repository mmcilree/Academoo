import React from "react";
import {Card, Alert} from "react-bootstrap";
import CommunityList from "./CommunityList";
import { Link } from "react-router-dom";

class CommunityExplorer extends React.Component {
  state = {
    isLoading: true,
    instances: [],
    currentCommunity: null,
    error: null,
  }

  componentDidMount() {
    this.fetchInstances();
  }

  fetchInstances() {
    fetch("/api/get-instances")
      .then(response => response.json())
      .then(data =>
        this.setState({
          instances: data,
          isLoading: false,
        })
      )
      .catch(error => this.setState({ error, isLoading: false }));
  }

  render() {
    const { isLoading, instances, error } = this.state;
    return (
      <Card className="mt-4">
        <Card.Body>
          <h1>Explore Commoonities</h1>
          <p>See what communities are available on the federated network!</p>
          {error ? <Alert variant="danger">Error fetching instances: {error.message}</Alert> : null}
          <CommunityList instance="local"/>
          {!isLoading ?
            instances.map(name => {
              return <CommunityList instance={name}> </CommunityList>
            })
        : <h3>Loading External Instances...</h3>}
        </Card.Body>
      </Card>
    );
  }
}

export default CommunityExplorer;