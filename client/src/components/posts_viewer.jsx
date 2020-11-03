import React, { Component } from "react";
import { posts } from "./test_post_json";
import Post from "./post";
import CommentsViewer from "./comments_viewer";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

class PostsViewer extends Component {
  state = {
    view: "posts",
    currentParent: null,
  };

  showComments(parentPost) {
    this.setState({
      view: "comments",
      currentParent: parentPost,
    });
  }

  showPosts() {
    this.setState({
      view: "posts",
      currentParent: null,
    });
  }

  render() {
    if (this.state.view === "posts") {
      return (
        <div className="card_container">
          {posts.map((data) =>
            data.parent === "" ? (
              <Card key={data.id}>
                <Post postData={data} />
                <Button onClick={() => this.showComments(data)}>
                  Click to see comments
                </Button>
              </Card>
            ) : null
          )}
        </div>
      );
    }
    if (this.state.view === "comments") {
      return (
        <CommentsViewer
          parentPost={this.state.currentParent}
          allPosts={posts}
        />
      );
    }
  }
}

export default PostsViewer;
