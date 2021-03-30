import React from "react";
import {Card, Alert, Spinner} from "react-bootstrap";
import CommunityList from "./CommunityList";
import logo from "../../images/logo.svg";

/**
 * Component which shows all of the communities avaliable
 */
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

  //fetch all instances from other groups
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

  /**
   * render all of the instances and their communities to the community explorer page
   */
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