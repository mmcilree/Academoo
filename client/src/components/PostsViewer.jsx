import React, { Component, useContext } from "react";
import Post from "./Post";
import Sidebar from "./Sidebar";
import { Card, Container, Row, Col, Form, FormControl, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { HostContext } from "./HostContext";
import { PlusCircle } from "react-bootstrap-icons";

class PostsViewer extends Component {
  state = {
    isLoading: true,
    posts: [],
    currentCommunity: null,
    error: null,
    host: null,
    newPostText: ""
  }

  static contextType = HostContext;

  componentDidMount() {
    this.fetchCommunity();
  }

  componentDidUpdate() {
    if (this.context.host !== this.state.host) {
      this.fetchCommunity();
    } else if (this.state.isLoading) {
      this.fetchPosts();
    }
  }

  async fetchCommunity() {
    await fetch('/api/communities' + (this.context.host !== null ? "?external=" + this.context.host : ""))
      .then(response => response.json())
      .then(data =>
        this.setState({
          currentCommunity: data.length > 0 ? data[0] : "?"
        })
      )

    this.fetchPosts();
  }

  fetchPosts() {
    fetch('/api/posts?community=' + this.state.currentCommunity + (this.context.host !== null ? "&external=" + this.context.host : ""))
      .then(response => response.json())
      .then(data =>
        this.setState({
          posts: data,
          isLoading: false,
          host: this.context.host
        })
      )
      .catch(error => this.setState({ error, isLoading: false }));
  }

  handleChange() {
    const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
  }

  render() {
    const { isLoading, posts, error, currentCommunity, newPostText } = this.state;

    return currentCommunity && (
      <Container>
        <Row>
          <Col xs={8}>
            <Card className="mt-4">
              <Card.Body>
                <Form >
                  <Form.Row>
                    <Form.Group as={Col} className="d-none d-sm-flex" sm={6} md={7} lg={9}>
                      <FormControl 
                        type="text" 
                        placeholder="Create your own post: " 
                        name="newPostText" 
                        className="mr-2" 
                        onChange={this.handleChange.bind(this)} />

                    </Form.Group>
                    <Form.Group as={Col} xs={12} sm={6} md={5} lg={3}>
                      <Link to={
                        {
                          pathname: "/create-post",
                          state: {
                            body: newPostText,
                            community: currentCommunity
                          }
                        }
                      }>
                        <Button variant="outline-secondary" className="w-100" > <PlusCircle className="mb-1" /> New Moo</Button>
                      </Link>
                    </Form.Group>
                  </Form.Row>
                </Form>
                {error ? <p>{error.message}</p> : null}
                {!isLoading ? (
                  posts.map(data => {
                    const { parent, id } = data;
                    return (
                      parent === currentCommunity ? (
                        <Card key={id} className="mt-4">
                          <Card.Body>
                            <Post postData={data} />
                            <Link
                              to={`/moosfeed/comments/${id}`}
                              className="btn btn-primary stretched-link"
                            >
                              View Comments ({data.children.length})
                          </Link>
                          </Card.Body>
                        </Card>
                      ) : null);
                  })
                ) : (
                    <h3>Loading Posts...</h3>
                  )}
                {!isLoading && posts.length == 0 ? <h4>There's no posts yet :-(</h4> : null}
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Sidebar currentCommunity={currentCommunity}
              changeCommunity={(community) => this.setState({
                currentCommunity: community,
                isLoading: true
              })} />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default PostsViewer;
