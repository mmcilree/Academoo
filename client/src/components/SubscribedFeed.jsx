import React, { Component, useContext } from "react";
import Post from "./Post";
import Sidebar from "./Sidebar";
import { Nav, Card, Container, Row, Col, Form, FormControl, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { HostContext } from "./HostContext";
import { PlusCircle } from "react-bootstrap-icons";
import MiniPostCreator from "./MiniPostCreator";
import PostsViewer from "./PostsViewer";

class SubscribedFeed extends Component {
  state = {
    isLoading: true,
    posts: [],
    currentCommunity: "",
    error: null,
    host: "local",
    newPostText: ""
  }

  componentDidMount() {
    this.fetchCommunity();
  }

  componentDidUpdate() {
    if (this.state.host !== this.state.host) {
      this.fetchCommunity();
    } else if (this.state.isLoading) {
      this.fetchPosts();
    }
  }

  async fetchCommunity() {
    await fetch('/api/communities' + (this.state.host !== "local" ? "?external=" + this.state.host : ""))
      .then(response => response.json())
      .then(data =>
        this.setState({
          currentCommunity: data.length > 0 ? data[0] : "?"
        })
      )

    this.fetchPosts();
  }

  fetchPosts() {
    fetch('/api/posts?community=' + this.state.currentCommunity + (this.state.host !== "local" ? "&external=" + this.state.host : ""))
      .then(response => response.json())
      .then(data =>
        this.setState({
          posts: data,
          isLoading: false,
          host: this.state.host
        })
      )
      .catch(error => this.setState({ error, isLoading: false }));
  }

  render() {
    
    const { isLoading, posts, error, currentCommunity, newPostText } = this.state;
    console.log(this.state);
    return currentCommunity && (
      <Container>
        <Row>
          <Col xs={12} lg={8}>
            <Card className="mt-4">
              <Card.Header>
                <Nav variant="tabs" defaultActiveKey="#recent">
                  <Nav.Item>
                    <Nav.Link href="#recent"><div className="d-none d-sm-inline">Most</div> Recent</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link href="#commented">Most Commented</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                  <Nav.Link href="#top">
                      Top <div className="d-none d-sm-inline">Posts</div>
                  </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <MiniPostCreator currentCommunity={null} />

                {error ? <Alert variant="danger">Error fetching posts: {error.message}</Alert> : null}
                {!isLoading ? (
                  <PostsViewer posts={posts} displayCommunityName/>
                ) : (
                    <h3>Loading Posts...</h3>
                  )}
                {!isLoading && posts.length === 0 ? <h4>There's no posts yet :-(</h4> : null}
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

export default SubscribedFeed;