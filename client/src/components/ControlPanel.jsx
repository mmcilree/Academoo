import React from "react";
import { Component } from "react";
import { Card } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import { authFetch } from "../auth";

class ControlPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: "",
            isAdmin: false,
            isModerator: false,
            isLoading: true,
            errors: []

        }
    }

    componentDidMount() {
        this.fetchUserDetails()
    }

    async fetchUserDetails() {
        await authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    currentUser: data.id,
                    // roles: data.site_roles.split(","),
                    isAdmin: data.site_roles.split(",").includes("site-admin"),
                    isModerator: data.site_roles.split(",").includes("site-moderator"),
                    isLoading: false,
                })
            )
            .catch(error => this.setState({ errors: error, isLoading: false }));
    }

    render() {
        const { currentUser, roles, isLoading, errors, isAdmin, isModerator } = this.state;
        // console.log(this.state.roles);
        // const isAdmin = roles.includes("site-admin") ? true : false;
        // const isModerator = roles.includes("site-moderator") ? true : false;
        return (
            isLoading ? <Card className="mt-4"><Card.Body><Card.Title>Loading ...</Card.Title></Card.Body></Card> :
                !isAdmin ? <Redirect to='/forbidden' /> :
                    <Card className="mt-4">
                        <Card.Body>
                            <Card.Title>{isAdmin ? "Admin " : "Moderator "} Control Panel</Card.Title>
                            {isAdmin && <p>Add other admins and moderators</p>}
                            <p>Block a user</p>
                            <p>Remove or verify communities</p>
                        </Card.Body>
                    </Card>
        );
    }
}
export default ControlPanel