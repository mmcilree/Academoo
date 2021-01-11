import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

class CommunityCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            title: "",
            description: "",
            administrators: "",
            errors: [],
            communities: []
        };
    }
    validateForm() {
        const errors = [];

        return errors;
    }
    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleNameChange(event) {
        const target = event.target;
        const value = target.value;
        this.setState({
            id: value.split(' ').join(''),
            title: value
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
                    admins: this.state.administrators,
                }
            )
        };

        fetch('/api/create-community', requestOptions);
        this.setState(
            { id: "", title: "", description: "", administrators: "" }
        );
    }

    render() {
        return (
            <Card className="mt-4">
                <Card.Header className="pt-4">
                    <Card.Title>Create a community!</Card.Title>
                </Card.Header>

                <Card.Body>
                    <Form onSubmit={this.handleSubmit.bind(this)}>
                        <Form.Group controlId="createCommunityTitle">
                            <Form.Label>Community Name:</Form.Label>
                            <Form.Control type="input"
                                placeholder="Funny Cow Memes"
                                name="title"
                                onChange={this.handleNameChange.bind(this)}
                                value={this.state.title} />
                            <small className="form-text text-muted">Give your new community a name.</small>
                        </Form.Group>

                        <Form.Group controlId="createCommunityId">
                            <Form.Label>Community ID:</Form.Label>
                            <Form.Control type="input"
                                placeholder="FunnyCowMemes"
                                name="id"
                                onChange={this.handleChange.bind(this)}
                                value={this.state.id} />
                            <small className="form-text text-muted">Community IDs have to be unique, and can't include spaces or non alphabetic characters.</small>
                        </Form.Group>

                        <Form.Group controlId="createCommunityDescription">
                            <Form.Label>Description:</Form.Label>
                            <Form.Control as="textarea"
                                name="description"
                                placeholder="Moooo"
                                onChange={this.handleChange.bind(this)}
                                value={this.state.description} />
                            <small className="form-text text-muted">Tell everyone what your community is about!</small>
                        </Form.Group>

                        <Form.Group controlId="createCommunityAdministrators">
                            <Form.Label>Administrators:</Form.Label>
                            <Form.Control as="textarea"
                                placeholder="Comma-separated usernames"
                                name="administrators"
                                onChange={this.handleChange.bind(this)}
                                value={this.state.administrators} />
                            <small class="form-text text-muted">Who else should be in charge of this community?</small>
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