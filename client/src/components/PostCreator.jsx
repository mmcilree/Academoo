import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import { authFetch } from '../auth';
import { Route } from 'react-router-dom';
import { Menu, MenuItem, Typeahead } from 'react-bootstrap-typeahead';

class PostCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            title: "",
            body:
                this.props.location && this.props.location.state ?
                    this.props.location.state.body : "",
            instances: [],
            communities: [],
            errors: [],
            selected: [{
                host: this.props.location && this.props.location.state ?
                    this.props.location.state.host : null,
                community: this.props.location && this.props.location.state && this.props.location.state.community ?
                    this.props.location.state.community : "",
            }]
        };

    }

    validateForm() {
        const errors = [];
        if (this.state.title.length === 0) {
            errors.push("Title field cannot be empty")
        }
        if (this.state.selected.length === 0) {
            errors.push(<p>You haven't selected a pre-existing community. You can create new community <a href='./create-community'>here</a></p>)
        }
        if (this.state.title === "Moo" && this.state.body === "Moooo") {
            errors.push("...really?")
        }

        return errors;
    }
    componentDidMount() {
        this.fetchInstances();
        this.fetchUserDetails();
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
        this.state.instances.map(host => (this.fetchCommunities(host)));
    }

    async fetchCommunities(host) {
        await fetch('/api/communities' + (host !== "local" ? "?external=" + host : "")).then(response => response.json())
            .then(data =>
                this.setState({
                    communities: [...this.state.communities, ...data.map(community => ({ host: host, community: community }))],
                }))
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
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-ID': this.state.user_id
            },
            body: {
                community: this.state.selected[0].community,
                title: this.state.title,
                contentType: 'text',
                parentPost: null,
                content: [
                    {
                        text: {
                            text: this.state.body
                        }
                    }
                ],
                author: {
                    id: this.state.user_id,
                    host: "Academoo"
                }
            }
        };
        if (this.state.selected[0].host !== "local") {
            requestOptions.body.external = this.state.selected[0].host;
        }
        requestOptions.body = JSON.stringify(requestOptions.body);

        fetch('/api/posts', requestOptions);
        const community = this.state.selected[0].community;
        const host = this.state.selected[0].host;

        this.setState(
            { email: "", selected: [{ community: null, host: null }], title: "", body: "" }
        );
        this.props.history.push('/communities' + (host !== "local" ? ("/" + host) : "") + "/" + community);
    }

    render() {
        const { errors } = this.state;
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
                            <Form.Label>Select a community:</Form.Label>
                            <Typeahead
                                labelKey={option => `${option.community}`}
                                id="community-choice"
                                placeholder="Cows"
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

                                defaultInputValue={this.state.selected.community ? this.state.selected.community : undefined}

                                onChange={(selected) => {
                                    this.setState({ selected: selected })
                                }}

                                options={this.state.communities}
                                selected={this.state.selected}


                            />
                        </Form.Group>
                        {errors.map(error => (
                            <Alert variant='warning' key={error}>{error}</Alert>
                        ))}
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