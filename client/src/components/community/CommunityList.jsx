import React from "react";
import Accordion from "react-bootstrap/Accordion";
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
        }
    }

    componentDidMount() {
        this.fetchCommunities();
    }

    fetchCommunities() {
        fetch('/api/communities' + (this.props.instance !== "local" ? "?external=" + this.props.instance : ""))
            .then(response => response.json())
            .then(data =>
                this.setState({
                    communities: data,
                    isLoading: false,
                })
            )
    }

    render() {
        const { communities, isLoading } = this.state;
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
                                {!isLoading ?
                                    communities.map((community) =>
                                        community !== "" &&
                                        
                                            <ListGroup.Item key={community} className="d-flex justify-content-between">
                                                <Link to={this.props.instance === "local" ? 
                                                "communities/" + community : "communities/" + this.props.instance + "/" + community} >
                                                {community}
                                                </Link>
                                                <CommunitySubscribeButton community={community}/>
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