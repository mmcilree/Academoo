import React, { Component } from "react";
import { posts } from "./test_post_json";
import Post from "./post";
import CommentsViewer from "./comments_viewer";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import {
  //   BrowserRouter as Router,
  //   Switch,
  //   Route,
  Link,
  //   useRouteMatch,
  //   useParams,
} from "react-router-dom";

class PostsViewer extends Component {
  render() {
    return (
      <div className="card_container">
        {posts.map((data) =>
          data.parent === "" ? (
            <Card key={data.id} className="mt-4">
              <Post postData={data} />
              <Link to={`/moosfeed/comments/${data.id}`}>
                <Button variant="primary">Click to see comments</Button>
              </Link>
            </Card>
          ) : null
        )}
      </div>
    );
  }
}

export default PostsViewer;
