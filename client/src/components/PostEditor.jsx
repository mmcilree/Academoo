import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import { authFetch } from '../auth';
import { Route } from 'react-router-dom';
import { Menu, MenuItem, Typeahead } from 'react-bootstrap-typeahead';

class PostEditor extends React.Component {
    state = {
        id: this.props.id,
        title: this.props.title,
        body: this.props.body,
        errors: [],
    };



    validateForm() {
        const errors = [];
        if (this.state.title.length === 0) {
            errors.push("Title field cannot be empty")
        }
        if (this.state.title === "Moo" && this.state.body === "Moooo") {
            errors.push("...really?")
        }

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

    handleSubmit(event) {
        event.preventDefault();

        const errors = this.validateForm();
        if (errors.length > 0) {
            this.setState({ errors });
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                title: this.state.title,
                content: [
                    {
                        text: {
                            text: this.state.body
                        }
                    }
                ],
            }
        };
        requestOptions.body = JSON.stringify(requestOptions.body);

        fetch('/api/posts/' + this.state.id, requestOptions);

        this.props.handleClose();
        this.props.history.push("comments/" + this.state.id);
    }

    render() {
        const { errors } = this.state;
        return (
            <React.Fragment>
                {/* <Card className="mt-4"> */}
                <Modal.Header className="pt-4" closeButton>
                    <Modal.Title>Edit a post!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.handleSubmit.bind(this)}>

                        <Form.Group controlId="createPostTitle">
                            <Form.Label>Post Title:</Form.Label>
                            <Form.Control type="input"
                                placeholder="Moo"
                                name="title"
                                onChange={this.handleChange.bind(this)}
                                value={this.state.title} />
                        </Form.Group>

                        <Form.Group controlId="createPostText">
                            <Form.Label>Post Content:</Form.Label>
                            <Form.Control as="textarea"
                                placeholder="Moooo"
                                name="body"
                                onChange={this.handleChange.bind(this)}
                                value={this.state.body} />
                        </Form.Group>

                        {errors.map(error => (
                            <Alert variant='warning' key={error}>{error}</Alert>
                        ))}

                        <Button variant="primary" type="submit" className="mr-2 mb-2">
                            Save Changes
                        </Button>
                    </Form>

                </Modal.Body>
                {/* </Card > */}
            </React.Fragment>
        )
    }
}

export default PostEditor;