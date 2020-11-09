import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

class CommunityCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = { id: "", title: "", description: "", admins: "" };
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                {
                    id: this.state.id,
                    title: this.state.title,
                    description: this.state.description,
                    admins: this.state.admins,
                }
            )
        };

        fetch('/api/create-community', requestOptions);
    }

    render() {
        return (
            <Card className="mt-4">
                <Card.Header>
                    <Card.Title>Create a community!</Card.Title>
                </Card.Header>

                <Card.Body>
                    <Form onSubmit={this.handleSubmit.bind(this)}>
                        <Form.Group controlId="createCommunityId">
                            <Form.Label>Community Identifier</Form.Label>
                            <Form.Control type="input"
                                placeholder="Community ID (e.g. 'cows')"
                                name="id" 
                                onChange={this.handleChange.bind(this)}
                                value={this.state.id} />
                        </Form.Group>

                        <Form.Group controlId="createCommunityTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="input" 
                                placeholder="Title (e.g. 'Funny Cow Memes')"
                                name="title" 
                                onChange={this.handleChange.bind(this)}
                                value={this.state.title} />
                        </Form.Group>

                        <Form.Group controlId="createCommunityDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" 
                                placeholder="Description" 
                                name="description"
                                onChange={this.handleChange.bind(this)}
                                value={this.state.description} />
                        </Form.Group>

                        <Form.Group controlId="createCommunityAdministrators">
                            <Form.Label>Administrators</Form.Label>
                            <Form.Control as="textarea" 
                                placeholder="Administrators (comma-separated emails)" 
                                name="administrators"
                                onChange={this.handleChange.bind(this)}
                                value={this.state.admins} />
                        </Form.Group>


                        <Button variant="primary" type="submit">
                            Create Community
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        )
    }
}

export default CommunityCreator;