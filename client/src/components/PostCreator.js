import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

class PostCreator extends React.Component {
  render() {
    return (
      <div className="container-md">
        <Card className="mt-4">
          <Card.Body>
            <Form>
              <Form.Group controlId="createPostTitle">
                <Form.Label>Create a new post</Form.Label>
                <Form.Control type="input" placeholder="Title (e.g. 'Moo')" />
              </Form.Group>

              <Form.Group controlId="createPostText">
                <Form.Control as="textarea" placeholder="Text (e.g. 'Moooo')" />
              </Form.Group>
              <Button variant="primary" type="submit">
                Post
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    );
  }
}

export default PostCreator;
