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
                <Card.Body className="m-0 d-flex justify-content-center">
                    <Link to="/create-community" className="btn btn-secondary">
                        <PlusCircle className="m-1" /> New Community
                    </Link>
                    {/* <ListGroup variant="flush">
                        <ListGroupItem>
                            <Link to="/communities" className="btn btn-secondary">
                                Explore Communities
                            </Link>

                        </ListGroupItem>
                    </ListGroup> */}

                </Card.Body>
            </Card>
        );
    }
}

export default Sidebar;

