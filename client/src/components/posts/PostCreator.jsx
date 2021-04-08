import React from 'react';
import MarkdownPreviewer from '../layout/MarkdownPreviewer';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import { authFetch } from '../../auth';
import { Route } from 'react-router-dom';
import { Menu, MenuItem, Typeahead } from 'react-bootstrap-typeahead';
import Poll from 'react-polls';

const contentTypeArr = ["Text", "Markdown", "Poll"];
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
                host: this.props.location && this.props.location.state && this.props.location.state.host ?
                    this.props.location.state.host : null,
                community: this.props.location && this.props.location.state && this.props.location.state.community ?
                    this.props.location.state.community : "",
            }],
            // markdown: this.props.location && this.props.location.state && this.props.location.state.markdown ? true : false,
            contentIdx: 0,
            contentType: contentTypeArr[0],
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleContentSwitch = this.handleContentSwitch.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    validateForm() {
        const errors = [];
        if (this.state.title.length === 0) {
            errors.push("Title field cannot be empty")
        }

        if (this.state.selected.length === 0 ||
            !this.state.communities.some(o =>
                o.community === this.state.selected[0].community && o.host === this.state.selected[0].host)) {
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
            ).catch(() => { })
    }

    async fetchInstances() {
        await authFetch("/api/get-instances")
            .then(response => response.json())
            .then(data =>
                this.setState({
                    instances: ["local", ...data],
                })
            ).catch(() => { })
        this.state.instances.map(host => (this.fetchCommunities(host)));
    }

    async fetchCommunities(host) {
        await authFetch('/api/communities' + (host !== "local" ? "?external=" + host : ""),
            {
                headers: {
                    'Client-Host': window.location.hostname
                }
            }).then(response => response.json())
            .then(data =>
                this.setState({
                    communities: [...this.state.communities, ...data.map(community => ({ host: host, community: community }))],
                })).catch(() => { })
    }

    handleContentSwitch(event) {
        const idx = (this.state.contentIdx + 1) % contentTypeArr.length;

        this.setState({
            contentType: contentTypeArr[idx],
            contentIdx: idx,
        })
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value,
            errors: []
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
                'User-ID': this.state.user_id,
                'Client-Host': window.location.hostname
            },
            body: {
                community: this.state.selected[0].community,
                title: this.state.title,
                parentPost: null,
                content: [],
                author: {
                    id: this.state.user_id,
                    host: "Academoo"
                }
            }
        };
        if (this.state.selected[0].host !== "local") {
            requestOptions.body.external = this.state.selected[0].host;
        }

        switch(this.state.contentIdx) {
            case 0: {
                requestOptions.body.content.push({
                    text: {
                        text: this.state.body
                    }
                });
                break;
            }
            case 1: {
                requestOptions.body.content.push({
                    markdown: {
                        text: this.state.body
                    }
                });
                break;
            }
            case 2: {
                let options = this.state.body.split("\n");
                if (options.length > 6) {
                    let errors = this.state.errors;                
                    errors.push("Poll max size exceeded. There can be at most 6 options.");
                    this.setState({ errors });
                    return;
                }
                
                // Check for non-unique entries
                if (options.length !== new Set(options).size) {
                    let errors = this.state.errors;                
                    errors.push("There are duplicate possible options.");
                    this.setState({ errors });
                    return;
                }

                requestOptions.body.content.push({
                    poll: {
                        question: this.state.title,
                        possibleAnswers: 
                            options.map((item, idx) => ({
                                "number": idx,
                                "answer": item,
                            })),
                        results: 
                            options.map((item, idx) => ({
                                "answerNumber": idx,
                                "answers": [],
                            }))
                    }
                });
                break;
            }
        }

        requestOptions.body = JSON.stringify(requestOptions.body);
        authFetch('/api/posts', requestOptions)
            .then(response => {
                if (!response.ok) {
                    return response.json().then((error) => {
                        let err = error.title + ": " + error.message
                        throw new Error(err);
                    })
                } else {
                    return response;
                }
            })
            .then(response => {
                const community = this.state.selected[0].community;
                const host = this.state.selected[0].host;

                this.setState(
                    { email: "", selected: [{ community: null, host: null }], title: "", body: "" }
                );
                this.props.history.push('/communities' + (host !== "local" ? ("/" + host) : "") + "/" + community);
            })
            .catch(error => {
                let errors = this.state.errors;
                errors.push(error.message)
                this.setState({ errors })
            })
    }

    render() {
        const { contentType, contentIdx, errors } = this.state;
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
                            <Form.Label className="d-flex justify-content-between">
                                Post Content: {contentType}
                                <Button size="sm" variant="outline-secondary" onClick={this.handleContentSwitch}>Switch To {contentTypeArr[(contentIdx + 1) % 3]} Editor</Button>
                            </Form.Label>
                            <Form.Control as="textarea"
                                rows={4}
                                placeholder={contentIdx === 2 ? "Moooo 1\nMoooo 2\nMoooo 3" : "Moooo"}
                                name="body"
                                onChange={this.handleChange.bind(this)}
                                value={this.state.body} />

                            {contentIdx === 1 && <MarkdownPreviewer body={this.state.body} handleChange={this.handleChange} />}
                            {contentIdx === 2 && <Poll customStyles={{theme: "cyan"}} noStorage onVote={() => {}} answers={this.state.body.split("\n").map(item => ({
                                "option": item,
                                "votes": 0,
                            }))} />}

                        </Form.Group>

                        <Form.Group controlId="createPostCommunity">
                            <Form.Label>Select a community:</Form.Label>
                            <Typeahead
                                labelKey={option => `${option.community}`}
                                id="community-choice"
                                className="community-choice"
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
