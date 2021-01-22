import React from 'react';
import Form from 'react-bootstrap/Form';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { authFetch } from '../auth';
import { Redirect } from "react-router-dom";
import { Typeahead } from 'react-bootstrap-typeahead';
import { InputGroup, Col } from 'react-bootstrap';
import { PlusCircle } from "react-bootstrap-icons";

class CommunityManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdmin: null,
            currentCommunity: this.props.match.params.id,
            users: [],
            selected: [{
                host: null,
                user: ""
            }],
        };
    }

    componentDidMount() {
        this.fetchUserDetails();
    }

    fetchUserDetails() {
        authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    isAdmin: data.adminOf.includes(this.state.currentCommunity),
                })
            )
    }

    render() {
        console.log(this.state)
        return (
            this.state.isAdmin == null ? <h3> Loading... </h3> :
                !this.state.isAdmin ? <Redirect to='/forbidden' /> :
                    <Card className="mt-4">
                        <Card.Header className="pt-4">
                            <Card.Title>Manage your community</Card.Title>
                        </Card.Header>

                        <Card.Body>
                            <Form>
                                <Form.Label>Assign User Role</Form.Label>
                                <Form.Row>
                                    <Form.Group as={Col} xs={12} sm={12} md={6} lg={6}>
                                        <InputGroup>
                                            <DropdownButton
                                                variant="outline-secondary"
                                                title="Select Server"
                                                as={InputGroup.Prepend}>

                                            </DropdownButton>
                                            <Typeahead
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                    <Form.Group as={Col} xs={12} sm={4} md={4} lg={4}>
                                        <DropdownButton
                                            variant="outline-secondary"
                                            title="Select Role">
                                        </DropdownButton>
                                    </Form.Group>
                                    <Form.Group as={Col} xs={2} sm={2} md={2} lg={2}>
                                        <Button><PlusCircle className="mb-1" /> Assign</Button>
                                    </Form.Group>
                                </Form.Row>
                            </Form>
                        </Card.Body>
                    </Card>
        )
    }
}

export default CommunityManager;