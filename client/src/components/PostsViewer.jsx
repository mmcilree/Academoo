import React, { Component } from "react";
import Post from "./Post";
import { Card, Col, Form, FormControl, Button, Alert, OverlayTrigger, Popover } from "react-bootstrap";
import { Link } from "react-router-dom";
import { PlusCircle } from "react-bootstrap-icons";

class PostsViewer extends Component {
  state = {
    isLoading: true,
    posts: [],
    currentCommunity: this.props.match.params.id,
    error: null,
    host: this.props.match.params.instance ? this.props.match.params.instance : "local",
    newPostText: "",
    communityData: null
  }

  componentDidMount() {
    this.fetchPosts();

  }

  async fetchPosts() {
    await fetch('/api/posts?community=' + this.state.currentCommunity + (this.state.host !== "local" ? "&external=" + this.state.host : ""))
      .then(response => response.json())
      .then(data =>
        this.setState({
          posts: data,
          host: this.state.host
        })
      )
      .catch(error => this.setState({ error, isLoading: false }));
    this.fetchCommunityDetails();
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  fetchCommunityDetails() {
    fetch('/api/communities/' + this.state.currentCommunity + (this.state.host !== "local" ? "?external=" + this.state.host : ""))
      .then(response => response.json())
      .then(data =>
        this.setState({
          communityData: data,
          isLoading: false,
        })
      )
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    const { isLoading, posts, error, currentCommunity, newPostText, host, communityData } = this.state;
    const popover = (
      <Popover id="popover-basic">
        <Popover.Title as="h3">Community description</Popover.Title>
        <Popover.Content>
          {!isLoading && communityData.description}
        </Popover.Content>
      </Popover>
    );

    return currentCommunity && (
      <Card className="mt-4 mb-10">
        <Card.Header className="pt-4">
          {!isLoading ?
            <Card.Title className="d-flex justify-content-right">
              <OverlayTrigger trigger="click" placement="right" overlay={popover}>
                <Card.Link>{communityData.title}
                </Card.Link></OverlayTrigger>
            </Card.Title>
            : <h2> Loading... </h2>}
          <Card.Subtitle className="text-muted"><h6>{host + "/" + currentCommunity}</h6></Card.Subtitle>
        </Card.Header>
        <Card.Body>
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
                      community: currentCommunity,
                      host: host
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
                    <Card.Body >
                      <Post postData={data} postType="preview" />
                      <Link
                        to={this.state.host == "local" ? `/comments/${id}` : '/comments/' + this.state.host + `/${id}`}
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
