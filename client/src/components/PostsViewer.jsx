import React, { Component } from "react";
import Post from "./Post";
import CommentsViewer from "./CommentsViewer";
import Sidebar from "./Sidebar";
import { Card, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

class PostsViewer extends Component {
  state = {
    isLoading: true,
    posts: [],
    currentCommunity: "cows",
    error: null
  }

  componentDidMount() {
    this.fetchPosts();
  }

  fetchPosts() {
    fetch('/api/posts')
      .then(response => response.json())
      .then(data =>
        this.setState({ 
          posts: data,
          isLoading: false 
        })
      )
      .catch(error => this.setState({ error, isLoading: false }));
  }

  render() {
    console.log(this.state.posts);
    const { isLoading, posts, error, currentCommunity } = this.state;

    return (
      <Container>
        <Row>
          <Col xs={8}>
            <Card className="mt-4">
              <Card.Body>
                {error ? <p>{error.message}</p> : null}
                {!isLoading ? (
                  posts.map(data => {
                    const {parent, id} = data;
                    return (
                      parent === currentCommunity ? (
                        <Card key={id} className="mt-4">
                          <Card.Body>
                          <Post postData={data} />
                          <Link
                              to={`/moosfeed/comments/${id}`}
                              className="btn btn-primary stretched-link"
                          >
                              View Comments
                          </Link>
                          </Card.Body>
                        </Card>
                      ) : null);
                    })
                  ) : (
                    <h3>Loading Posts...</h3>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Sidebar currentCommunity={ currentCommunity } changeCommunity={(community) => this.setState({currentCommunity: community})} />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default PostsViewer;
