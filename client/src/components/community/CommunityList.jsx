import React from "react";
import {Accordion, Alert } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";
import ListGroup from "react-bootstrap/ListGroup";
import { Link } from "react-router-dom";
import CommunitySubscribeButton from "./CommunitySubscribeButton";

class CommunityList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            communities: [],
            isLoading: true,
            errors: []
        }
    }

    componentDidMount() {
        this.fetchCommunities();
    }

    fetchCommunities() {
        client/src/components/community/CommunityList.jsx
        fetch('/api/communities' + (this.props.instance !== "local" ? "?external=" + this.props.instance : ""), 
        {
            headers: {
                'Client-Host': window.location.protocol + "//" + window.location.hostname
            }
        })
            .then(response => {
                if(!response.ok) {
                    
                    throw new Error();
                }
                return response.json()
            }
            )
            .then(data => {
        client/src/components/community/CommunityList.jsx
                this.setState({
                    communities: [...this.state.communities, ...data],
                    isLoading: false
                })
                
            }
            ).catch((err) => {
                this.setState({errors: [...this.state.errors, err.message], isLoading: false});
                console.log(err)});

    }

    render() {
        const { communities, isLoading, errors } = this.state;
        console.log(this.props.instance);
        console.log(this.state);
        return (
            <Accordion defaultActiveKey="0">
                <Card className="mt-4">
                    <Accordion.Toggle as={Card.Header} eventKey="0" className="pt-4">
                        <h5>Hosted {this.props.instance === "local" ? "locally:" : "on '" + this.props.instance + "':"}
                        </h5>
                    </Accordion.Toggle>

                    <Accordion.Collapse eventKey="0">
                        <Card.Body className="px-0 py-1">
                            <ListGroup variant="flush"  >

                                {errors.map(error => (
                                    <ListGroup.Item>
                                        <Alert variant='warning' key={error}>{"Error: " + error}</Alert>
                                    </ListGroup.Item>
                                    
                                ))}

                                {!isLoading ?
                                    communities.map((community) =>
                                        community !== "" &&

                                        <ListGroup.Item key={community} className="d-flex justify-content-between">
                                            <Link to={this.props.instance === "local" ?
                                                "communities/" + community : "communities/" + this.props.instance + "/" + community} >
                                                {community}
                                            </Link>
                                            <CommunitySubscribeButton community={community} />
                                        </ListGroup.Item>)
                                    : <ListGroup.Item>Loading Communities...</ListGroup.Item>
                                }
                            </ListGroup>
                        </Card.Body>
                    </Accordion.Collapse>

                </Card>
            </Accordion>
        )
    }
}

export default CommunityList;