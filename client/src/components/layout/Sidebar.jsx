import React, { Component } from "react";
import { ListGroup, Card, ListGroupItem } from "react-bootstrap";
import { Link } from "react-router-dom";
import CommunityList from "../community/CommunityList";
import { authFetch } from '../../auth';
import CommunitySubscribeButton from "../community/CommunitySubscribeButton";
import { PlusCircle } from "react-bootstrap-icons"

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
            ).catch(() => { });
    }

    updateSubscriptions() {
        this.setState({ isLoading: true });
        this.fetchUserDetails();
        this.props.fetchSubscribedCommunities();
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
                            subscribedCommunities && subscribedCommunities.length == 0 ?
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
                                        <CommunitySubscribeButton community={community} updateParent={this.updateSubscriptions.bind(this)} />
                                    </ListGroup.Item>)

                            : <p>Loading...</p>}

                        <ListGroupItem>
                            <Link to="/communities" className="btn btn-secondary">
                                Explore Communities
                            </Link>
                            <Link to="/create-community" className="btn btn-secondary mt-2">
                                <PlusCircle className="mb-1" />
                                <span> New Commoonity</span>
                            </Link>
                        </ListGroupItem>
                    </ListGroup>

                </Card.Body>
            </Card>
        );
    }
}

export default Sidebar;

