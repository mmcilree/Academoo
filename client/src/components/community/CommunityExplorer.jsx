import React from "react";
import {Card, Alert, Spinner} from "react-bootstrap";
import CommunityList from "./CommunityList";
import { Link } from "react-router-dom";
import logo from "../../images/logo.svg";

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
              return <CommunityList key={name} instance={name}> </CommunityList>
            })
        : <h3 className="mt-4">Loading External Instances... <Spinner animation="border" role="status" variant="light"><img src={logo} width="40"
        height="40"></img></Spinner> </h3>}
        </Card.Body>
      </Card>
    );
  }
}

export default CommunityExplorer;