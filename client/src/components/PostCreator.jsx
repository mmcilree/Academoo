import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

class PostCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = { title: "", body: "" };
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
            body: JSON.stringify(
                {
                    parent: 'dafca76d-5883-4eff-959a-d32bc9f72e1a',
                    title: this.state.title,
                    contentType: 'text',
                    body: this.state.body,
                    author: {
                        id: 'coolperson123',
                        host: 'cooldomain.edu'
                    }
                }
            )
        };

        fetch('/posts', requestOptions);
    }

    render() {
        return (
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