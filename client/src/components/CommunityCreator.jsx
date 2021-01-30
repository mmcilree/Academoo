import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import { Route } from 'react-router-dom';
import { authFetch } from '../auth';

class CommunityCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            title: "",
            description: "",
            admin: "",
            errors: [],
            communities: [],
            currentUser: "",
        };
    }
    componentDidMount() {
        this.fetchCommunities();
        this.fetchUserDetails();
    }
    validateForm() {
        const errors = [];
        if (this.state.title.length === 0 ||
            this.state.id.length === 0) {
            errors.push("Required fields have been left blank.");
            return errors;
        }
        // if (this.state.administrators !== "" && !this.state.administrators.match(/[^,]+/)) {
        //     errors.push("Administrators input is not a comma separated list.");
        //     return errors;
        // }
        if (this.state.communities.includes(this.state.id)) {
            errors.push("A community already exists with that ID. Please modify it.");
            return errors;
        }

        return errors;
    }

    fetchCommunities(host) {
        fetch('/api/communities').then(response => response.json())
            .then(data =>
                this.setState({
                    communities: data,
                }))
    }

    fetchUserDetails() {
        authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    currentUser: data.id,
                })
            )
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });

        if (name === "id") {
            this.setState({
                [name]: value.replace(/\s/g, '').replace(/\W/g, '').replace(/[0-9]/g, '')
            });
        }
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
        
        const errors = this.validateForm();
        if (errors.length > 0) {
            this.setState({ errors });
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                {
                    id: this.state.id,
                    title: this.state.title,
                    description: this.state.description,
                    admin: this.state.currentUser,
                }
            )
        };
        console.log(requestOptions)
        fetch('/api/create-community', requestOptions);
        this.setState(
            { id: "", title: "", description: "", admin: "" }
        );
        this.props.history.push('/explore');
    }

    render() {
        const { errors } = this.state;
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

                        {/* <Form.Group controlId="createCommunityAdministrators">
                            <Form.Label>Administrators:</Form.Label>
                            <Form.Control as="textarea"
                                placeholder="Comma-separated usernames"
                                name="administrators"
                                onChange={this.handleChange.bind(this)}
                                value={this.state.administrators} />
                            <small className="form-text text-muted">Who else should be in charge of this community?</small>
                        </Form.Group> */}
                        {errors.map(error => (
                            <Alert variant='warning' key={error}>{error}</Alert>
                        ))}

                        <Route render={({ history }) => (
                            <Button variant="primary" type="submit">
                                Create Community
                            </Button>)} />
                    </Form>
                </Card.Body>
            </Card>
        )
    }
}

export default CommunityCreator;