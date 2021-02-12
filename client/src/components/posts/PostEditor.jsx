import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import { withRouter } from 'react-router-dom';

class PostEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isComment: false }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.setState({
            isComment: this.props.title ? true : false
        })
    }

    handleChange(event) {
        this.props.handleChange(event);
    }

    handleSubmit(event) {
        this.props.handleSubmit(event);
        event.preventDefault();
    }


    render() {
        const title = this.props.title;
        const body = this.props.body;
        const errors = this.props.errors;
        const isComment = this.state.isComment;

        return (
            <React.Fragment>
                <Modal.Header className="pt-4" closeButton>
                    <Modal.Title>Edit a post!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.handleSubmit}>

                        {isComment && <Form.Group controlId="createPostTitle">
                            <Form.Label>Post Title:</Form.Label>
                            <Form.Control type="input"
                                placeholder="Moo"
                                name="title"
                                onChange={this.handleChange}
                                value={title} />
                        </Form.Group>}

                        <Form.Group controlId="createPostText">
                            <Form.Label>Post Content:</Form.Label>
                            <Form.Control as="textarea"
                                placeholder="Moooo"
                                name="body"
                                onChange={this.handleChange}
                                value={body} />
                        </Form.Group>

                        {errors.map(error => (
                            <Alert variant='warning' key={error}>{error}</Alert>
                        ))}

                        <Button variant="primary" type="submit" className="mr-2 mb-2">
                            Save Changes
                        </Button>
                    </Form>

                </Modal.Body>
            </React.Fragment>
        )
    }
}

export default withRouter(PostEditor);