import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { authFetch } from '../auth';
import { Route } from 'react-router-dom';
import {Menu, MenuItem, Typeahead } from 'react-bootstrap-typeahead';

class PostCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            host: "",
            title: "",
            body: "",
            selectedCommunity: null,
            instances: [],
            communities: []
        };
    }

    componentDidMount() {
        this.fetchInstances();
        this.fetchUserDetails();

        this.setState({

            body: this.props.location && this.props.location.state ? this.props.location.state.body : "",
        })

    }

    fetchUserDetails() {
        authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    user_id: data.id,
                    email: data.email,
                })
            )
    }

    async fetchInstances() {
        await fetch("/api/get-instances")
            .then(response => response.json())
            .then(data =>
                this.setState({
                    instances: ["local", ...data],
                })
            )
        this.state.instances.map(host => ( this.fetchCommunities(host) ));
    }

    async fetchCommunities(host) {
        await fetch('/api/communities' + (host !== "local" ? "?external=" + host : "")).then(response => response.json())
            .then(data =>
                this.setState({
                    communities: [...this.state.communities, ...data.map(community => ({ host: host, community: community }))],
                    selectedCommunity: this.props.location && this.props.location.state ?
                        this.props.location.state.community :
                        (data.length > 0 ? data[0] : null)
                }))
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
        console.log(this.state);

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
            { email: "", host: "", title: "", body: "" }
        );
        this.props.history.push('/moosfeed');
    }

    render() {
        return this.state.communities && (
            <Card className="mt-4">
                <Card.Header className="pt-4">
                    <Card.Title>Create a post!</Card.Title>
                </Card.Header>
                <Card.Body>
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

                        <Form.Group controlId="createPostCommunity">
                            <Form.Label>Select a community</Form.Label>
                            <Typeahead
                                labelKey={option => `${option.community}`}
                                id="community-choice"
                                renderMenu={(results, menuProps) => (
                                    <Menu {...menuProps} maxHeight="500%">
                                      {results.map((result, index) => (
                                        <MenuItem option={result} position={index} key={index}>
                                          <small className="text-muted">{result.host + ":  "}</small>
                                          {result.community}
                                        
                                        </MenuItem>
                                      ))}
                                    </Menu>
                                  )}
                                onChange={(selected) => {
                                    // Handle selections...
                                }}
                                options={this.state.communities}

                            />
                        </Form.Group>
                        <Route render={({ history }) => (
                            <Button variant="primary" type="submit" className>
                                Post
                            </Button>
                        )} />
                    </Form>
                </Card.Body>
            </Card>
        )
    }
}

export default PostCreator;