import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { authFetch } from '../auth';
import { Route } from 'react-router-dom';
import { Menu, MenuItem, Typeahead } from 'react-bootstrap-typeahead';

class PostCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            selectedHost: 
                this.props.location && this.props.location.state ?
                this.props.location.state.host : null,
            title: "",
            body: 
                this.props.location && this.props.location.state ?
                this.props.location.state.body : "",
            selectedCommunity: 
                this.props.location && this.props.location.state ?
                this.props.location.state.community : null,
            instances: [],
            communities: []
        };
        
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
                    host: "Academoo"
                }
            }
        };

        if (this.selectedHost !== "local") {
            requestOptions.body.external = this.selectedHost
        }

        requestOptions.body = JSON.stringify(requestOptions.body);

        fetch('/api/posts', requestOptions);
        this.setState(
            { email: "", selectedHost: "", title: "", body: "" }
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
                                
                                defaultInputValue= {this.state.selectedCommunity ? this.state.selectedCommunity : undefined}

                                onChange={(selected) => {
                                    console.log(selected);
                                    if (selected.length !== 0) {
                                        this.setState(
                                            {
                                                selectedCommunity: selected[0].community,
                                                selectedHost: selected[0].host
                                            });
                                    } else {
                                        this.setState(
                                            {
                                                selectedCommunity: null,
                                                selectedHost: "local"
                                            });
                                    }
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