import React, { Component, useContext } from "react";
import Post from "./Post";
import Sidebar from "./Sidebar";
import { Nav, Card, Container, Row, Col, Form, FormControl, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { PlusCircle } from "react-bootstrap-icons";
import MiniPostCreator from "./MiniPostCreator";

class CommunityFeed extends Component {
  state = {
    isLoading: true,
    posts: [],
    currentCommunity: null,
    error: null,
    host: null,
    newPostText: ""
  }

  componentDidMount() {
    this.fetchPosts();
  }

  componentDidUpdate() {
   if (this.state.isLoading) {
      this.fetchPosts();
    }
  }

  fetchPosts() {
    fetch('/api/posts')
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

  render() {
    const { isLoading, posts, error, currentCommunity, newPostText } = this.state;
    console.log(this.state);
    return (
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
                  posts.map(data => {
                    const { parent, id } = data;
                    return (
                      
                        <Card key={id} className="mt-4">
                          <Card.Body>
                            <Post postData={data} />
                            <Link
                              to={this.state.host == "local" ? `/comments/${id}` : '/comments/' + this.state.host + `/${id}`}
                              className="btn btn-primary stretched-link"
                            >
                              View Comments ({data.children.length})
                          </Link>
                          </Card.Body>
                        </Card>
                    )
                  })
                ) : (
                    <h3>Loading Posts...</h3>
                  )}
                {!isLoading && posts.length === 0 ? <h4>There's no posts yet :-(</h4> : null}
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Sidebar c/>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default CommunityFeed;