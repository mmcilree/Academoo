import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { authFetch } from '../auth';

class CommentCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            title: "",
            email: "", 
            host: "", 
            body: "",
            parentPost: this.props.parentPost
        };
    }

    fetchUserDetails() {
        authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    user_id: data.id,
                    email: data.email,
                    host: data.host
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
    }

    async handleSubmit(event) {
        event.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                {
                    parent: this.state.parentPost.id,
                    title: this.state.title,
                    contentType: 'text',
                    body: this.state.body,
                    author: {
                        id: this.state.user_id,
                        host: this.state.host
                    }
                }
            )
        };

        await fetch('/api/posts', requestOptions);
        this.setState(
            { email: "", host: "", title: "", body: ""}
        );

        this.props.onSubmit();
    }

    componentDidMount() {
        this.fetchUserDetails();
    }

    render() {
        return (
            <React.Fragment >
                <Modal.Body>
                    <Form onSubmit={this.handleSubmit.bind(this)}>

                        <Form.Group controlId="createPostText">
                            <Form.Control as="textarea" 
                                placeholder="Write a comment..." 
                                name="body"
                                onChange={this.handleChange.bind(this)}
                                value={this.state.body} />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Post
                        </Button>
                    </Form>
                </Modal.Body>
            </React.Fragment>
        )
    }
}

export default CommentCreator;