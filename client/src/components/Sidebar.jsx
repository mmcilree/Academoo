import React, { Component } from "react";
import { ListGroup, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import CommunityList from "./CommunityList";

class Sidebar extends Component {
    state = {
        subscribedCommunities: []
    }

    render() {
        const { subscribedCommunities } = this.state;

        return (
            <Card className="mt-4">
                <Card.Header className="pt-4">
                    <h3>Folloowing:</h3>
                </Card.Header>

                <Card.Body>
                    {subscribedCommunities.length == 0 ?
                        <div>
                            <p>You haven't yet subscribed to any communities!</p>
                            <Link to="/explore" className="btn btn-secondary">
                                Explore Communities
                            </Link>
                        </div>
                        : <ListGroup variant="flush">
                        </ListGroup>}

                </Card.Body>
            </Card>
        );
    }
}

export default Sidebar;
