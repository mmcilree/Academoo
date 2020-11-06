import React, { Component } from "react";
import Post from "./Post";
import CommentsViewer from "./CommentsViewer";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

class PostsViewer extends Component {
  state = {
    isLoading: true,
    posts: [],
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
    const { isLoading, posts, error } = this.state;

    return (
      <div className="container-md">
        <Card className="mt-4">
          <Card.Body>
            {error ? <p>{error.message}</p> : null}
            {!isLoading ? (
              posts.slice(0).reverse().map(data => {
                const {parent, id} = data;
                return (
                  parent === 'dafca76d-5883-4eff-959a-d32bc9f72e1a' ? (
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
      </div>
    );
  }
}

export default PostsViewer;
