import React, { Component } from "react";
import { ListGroup, Card, ListGroupItem } from "react-bootstrap";
import { Link } from "react-router-dom";
import CommunityList from "./CommunityList";
import { authFetch } from '../auth';
import CommunitySubscribeButton from "./CommunitySubscribeButton";

class Sidebar extends Component {
    state = {
        subscribedCommunities: [],
        isLoading: true,
    }

    componentDidMount() {
        this.fetchUserDetails();
    }

    fetchUserDetails() {
        authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    subscribedCommunities: data.subscriptions,
                    isLoading: false
                })
            )
    }

    updateSubscriptions() {
        this.setState({isLoading: true});
        this.fetchUserDetails();
    }

    render() {
        const { subscribedCommunities, isLoading } = this.state;

        return (
            <Card className="mt-4">
                <Card.Header className="pt-4">
                    <h3>Folloowing:</h3>
                </Card.Header>

                <Card.Body className="px-0 py-1">
                    <ListGroup variant="flush">


                        {!isLoading ?
                            subscribedCommunities.length == 0 ?
                                <ListGroupItem>
                                    You haven't subscribed to any communities!
                                </ListGroupItem>
                                :
                                subscribedCommunities.map((community) =>
                                    community !== "" &&

                                    <ListGroup.Item key={community} className="d-flex justify-content-between">
                                        <Link to={
                                            "communities/" + community}>
                                            {community}
                                        </Link>
                                        <CommunitySubscribeButton community={community} updateParent={this.updateSubscriptions.bind(this)}/>
                                    </ListGroup.Item>)

                            : <p>Loading...</p>}

                        <ListGroupItem>
                            <Link to="/explore" className="btn btn-secondary">
                                Explore Communities
                            </Link>
                        </ListGroupItem>
                    </ListGroup>

                </Card.Body>
            </Card>
        );
    }
}

export default Sidebar;
