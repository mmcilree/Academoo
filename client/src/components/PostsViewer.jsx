import React, { Component } from "react";
import { posts } from "./test_post_json";
import Post from "./Post";
import CommentsViewer from "./CommentsViewer";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

// Will remove this comment later. 

class PostsViewer extends Component {
  render() {
    return (
      <div className="container-md">
        <Card className="mt-4">
          <Card.Body>
            {posts.map((data) =>
              data.parent === "" ? (
                <Card key={data.id} className="mt-4">
                  <Card.Body>
                    <Post postData={data} />
                    <Link
                      to={`/moosfeed/comments/${data.id}`}
                      className="btn btn-primary stretched-link"
                    >
                      View Comments
                    </Link>
                  </Card.Body>
                </Card>
              ) : null
            )}
          </Card.Body>
        </Card>
      </div>
    );
  }
}

export default PostsViewer;
