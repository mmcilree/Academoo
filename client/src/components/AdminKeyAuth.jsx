import React, { Component } from "react";
import { Card, Button, Form, Alert } from "react-bootstrap"
import { authFetch } from '../auth';

class AdminKeyAuth extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: "",
            user: "",
            isLoading: true,
            changed: false,
            errors: [],
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.fetchUserDetails();
    }

    async fetchUserDetails() {
        await authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    user: data.id,
                    isLoading: false
                })
            )
            .catch(error => this.setState({ errors: error, isLoading: false }));
    }

    handleChange(event) {
        event.preventDefault();
        const target = event.target;
        const value = target.value;
        const name = target.name
        this.setState({
            [name]: value,
            errors: []
        });
    }

    validateInput() {
        const errors = [];
        if (this.state.key.length === 0) {
            errors.push("You must enter a key");
        } else if (this.state.key.length !== 20) {
            errors.push("The key entered is not the expected length");
        }
        return errors;
    }

    handleSubmit(event) {
        event.preventDefault();

        const errors = this.validateInput();
        if (errors.length > 0) {
            this.setState({ errors });
            return;
        }

        const requestOptions = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                admin: "",
                username: this.state.user,
                key: this.state.key,
                role: "site-admin"
            }

        }
        requestOptions.body = JSON.stringify(requestOptions.body);

        authFetch('/api/add-site-role/', requestOptions)
            .then(r => r.status).then(statusCode => {
                if (statusCode != 200) {
                    this.setState({ changed: false, errors: ["Invalid key - could not register user as admin."] })
                } else {
                    this.setState({ changed: true, errors: [], key: "" });
                }
            });
    }

    render() {
        return (
            <Card className="mt-4">
                <Card.Body>
                    <Card.Title>Admin Key Registration</Card.Title>
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Group>
                            <Form.Label>Please enter the secret key provided to you to request admin privileges for Academoo.</Form.Label>
                            <Form.Control name="key" onChange={this.handleChange} placeholder="Secret Key: e.g kd523nDJFL57ams7sv1m" />
                        </Form.Group>
                        {!this.state.isLoading && <Button type="submit" variant="outline-secondary">Register Key</Button>}
                    </Form>
                    <br />
                    {this.state.errors.map(error => (
                        <Alert variant='warning' key={error}>{error}</Alert>
                    ))}
                    {this.state.changed && <Alert variant='success'>{this.state.user} has been added as a site-wide Admin!</Alert>}

                </Card.Body>
            </Card>
        )
    }
}
export default AdminKeyAuth;