import React from "react";
import { Accordion, Alert, Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";
import ListGroup from "react-bootstrap/ListGroup";
import { Link } from "react-router-dom";
import CommunitySubscribeButton from "./CommunitySubscribeButton";
import { PlusCircle } from "react-bootstrap-icons"
import { authFetch } from '../../auth';

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
        authFetch('/api/communities' + (this.props.instance !== "local" ? "?external=" + this.props.instance : ""),
            {
                headers: {
                    'Client-Host': window.location.protocol + "//" + window.location.hostname
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json()
            }
            )
            .then(data => {

                this.setState({
                    communities: [...this.state.communities, ...data],
                    isLoading: false
                })

            }
            ).catch((err) => {
                this.setState({ errors: [...this.state.errors, err.message], isLoading: false });
            });

    }

    render() {
        const { communities, isLoading, errors } = this.state;

        return (
            <Accordion defaultActiveKey="0">
                <Card className="mt-4">

                    {this.props.instance === "local" ?
                        <Accordion.Toggle as={Card.Header} eventKey="0" className="d-flex justify-content-between pt-4">
                            <h5>Hosted locally</h5>
                            <Link to="/create-community">
                                <Button variant="secondary">
                                    <PlusCircle className="mb-1" />
                                    <span> New Commoonity</span>
                                </Button>
                            </Link>
                        </Accordion.Toggle>
                        :
                        <Accordion.Toggle as={Card.Header} eventKey="0" className="pt-4">
                            <h5>Hosted {this.props.instance === "local" ? "locally:" : "on '" + this.props.instance + "':"}
                            </h5>
                        </Accordion.Toggle>
                    }
                    <Accordion.Collapse eventKey="0">
                        <Card.Body className="px-0 py-1">
                            <ListGroup variant="flush">

                                {errors.map(error => (
                                    <ListGroup.Item key={error}>
                                        <Alert variant='warning' key={error}>{"Error: " + error}</Alert>
                                    </ListGroup.Item>

                                ))}

                                {!isLoading ?
                                    communities.map((community) =>
                                        community !== "" &&

                                        <ListGroup.Item key={"" + this.props.instance + community} className="d-flex justify-content-between">
                                            <Link to={this.props.instance === "local" ?
                                                "communities/" + community : "communities/" + this.props.instance + "/" + community} >
                                                {community}
                                            </Link>
                                            <CommunitySubscribeButton community={community} />
                                        </ListGroup.Item>)
                                    : <ListGroup.Item key={this.props.instance}>Loading Communities...</ListGroup.Item>
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