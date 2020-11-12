import React, { Component } from "react";
import Post from "./Post";
import Sidebar from "./Sidebar";
import { Card, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

class PostsViewer extends Component {
  state = {
    isLoading: true,
    posts: [],
    currentCommunity: null,
    error: null
  }

  componentDidMount() {
    this.fetchCommunity();
  }
  
  componentDidUpdate() {
    if(this.state.isLoading) {
      this.fetchPosts();
    }
  }

  async fetchCommunity() {
    await fetch('/api/communities').then(response => response.json())
      .then(data =>
          this.setState({
            currentCommunity: data.length > 0 ? data[0] : "?"
          })
      )
    
    this.fetchPosts();
  }

  fetchPosts() {
    fetch('/api/posts?community=' + this.state.currentCommunity)
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

    return currentCommunity && (
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
            <Sidebar currentCommunity={ currentCommunity } 
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
