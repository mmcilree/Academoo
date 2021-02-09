import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { authFetch } from '../auth';
import { HostContext } from "./HostContext";

class CommentCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            email: "",
            userHost: "",
            body: "",
            parentPost: this.props.parentPost
        };
    }

    static contextType = HostContext;

    fetchUserDetails() {
        authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    user_id: data.id,
                    email: data.email,
                    userHost: data.host
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
            headers: {
                'Content-Type': 'application/json',
                'User-ID': this.state.user_id,
                'Client-Host': window.location.protocol + "//" + window.location.hostname
            },
            body: {
                community: this.state.parentPost.community,
                parentPost: this.state.parentPost.id,
                title: this.state.title,
                content: [
                    {
                        text: {
                            text: this.state.body
                        }
                    }
                ],
                author: {
                    id: this.state.user_id,
                    host: this.state.userHost
                }
            }
        };


        if (this.props.host !== "local") {
            requestOptions.body.external = this.props.host
        }

        requestOptions.body = JSON.stringify(requestOptions.body);

        await fetch('/api/posts', requestOptions);
        this.setState(
            { email: "", host: "", title: "", body: "" }
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