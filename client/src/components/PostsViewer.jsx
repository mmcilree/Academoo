import React, { Component } from "react";
import Post from "./Post";
import { Card, Col, Form, FormControl, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { PlusCircle } from "react-bootstrap-icons";
import { authFetch } from '../auth';

class PostsViewer extends Component {
  state = {
    isLoading: true,
    posts: [],
    currentCommunity: this.props.match.params.id,
    error: null,
    host: this.props.match.params.instance ? this.props.match.params.instance : "local",
    newPostText: "",
    isAdmin: false
  }

  componentDidMount() {
    this.fetchPosts();
    this.fetchUserDetails();
  }

  fetchUserDetails() {
    authFetch("/api/get-user").then(response => response.json())
      .then(data =>
        this.setState({
          isAdmin: data.adminOf.includes(this.state.currentCommunity)
        })
      )
  }

  fetchPosts() {

    fetch('/api/posts?community=' + this.state.currentCommunity + (this.state.host !== "local" ? "&external=" + this.state.host : ""))
      .then(response => response.json())
      .then(data =>
        this.setState({
          posts: data,
          isLoading: false,
        })
      )
      .catch(error => this.setState({ error, isLoading: false }));
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
  }

  render() {
    const { isLoading, posts, error, currentCommunity, newPostText, isAdmin, host } = this.state;
    console.log(host);
    return currentCommunity && (
      <Card className="mt-4">
        <Card.Header className="pt-4 d-flex justify-content-between">
          <h2>{currentCommunity}</h2>

          {this.state.host === "local" && isAdmin && <Link to={"/communities/" + currentCommunity + "/manage"}>
            <Button variant="primary">Manage Community</Button>
          </Link>}
        </Card.Header>
        <Card.Body>
          {this.state.isAdmin && <Alert variant="primary">You are an admin!</Alert>}
          <Form onSubmit={this.handleSubmit.bind(this)}>
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
          {error ? <Alert variant="danger">Error fetching posts: {error.message}</Alert> : null}
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
          {!isLoading && posts.length === 0 ? <h4>There's no posts yet :-(</h4> : null}
        </Card.Body>
      </Card>
    );
  }
}

export default PostsViewer;
