import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { authFetch } from '../auth';
import { HostContext } from "./HostContext";

class PostCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            email: "", 
            host: "", 
            title: "", 
            body: "", 
            selectedCommunity: null,
            communities: null };
    }

    static contextType = HostContext;

    componentDidMount() {
        this.fetchCommunities();
        this.fetchUserDetails();
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

    fetchCommunities() {
        fetch('/api/communities' + (this.context.host !== null ? "?external=" + this.context.host : "")).then(response => response.json())
            .then(data =>
                this.setState({ 
                    communities: data,
                    selectedCommunity: (data.length > 0 ? data[0] : null)
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

    handleSubmit(event) {
        event.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
                    parent: this.state.selectedCommunity,
                    title: this.state.title,
                    contentType: 'text',
                    body: this.state.body,
                    author: {
                        id: this.state.user_id,
                        host: this.state.host
                    }
                }
        };

        if (this.context.host !== null) {
            requestOptions.body.external = this.context.host
        }

        requestOptions.body = JSON.stringify(requestOptions.body);

        fetch('/api/posts', requestOptions);
        this.setState(
            { email: "", host: "", title: "", body: ""}
        );
    }

    render() {
        return this.state.communities && (
            <Card className="mt-4">
                <Card.Body>
                    <Form onSubmit={this.handleSubmit.bind(this)}>
                        <Form.Group controlId="createPostTitle">
                            <Form.Label>Create a new post</Form.Label>
                            <Form.Control type="input" 
                                placeholder="Title (e.g. 'Moo')"
                                name="title" 
                                onChange={this.handleChange.bind(this)}
                                value={this.state.title} />
                        </Form.Group>

                        <Form.Group controlId="createPostText">
                            <Form.Control as="textarea" 
                                placeholder="Text (e.g. 'Moooo')" 
                                name="body"
                                onChange={this.handleChange.bind(this)}
                                value={this.state.body} />
                        </Form.Group>

                        <Form.Group controlId="createPostCommunity">
                            <Form.Label>Select a community</Form.Label>
                            <Form.Control as="select" name="selectedCommunity" onChange={this.handleChange.bind(this)}>
                                {this.state.communities.map(function(name, index) {
                                    return <option key={ index }>{ name }</option>
                                })}
                            </Form.Control>    
                        </Form.Group> 

                        <Button variant="primary" type="submit">
                            Post
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        )
    }
}

export default PostCreator;