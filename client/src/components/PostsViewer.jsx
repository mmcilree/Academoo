import React, { Component } from "react";
import Post from "./Post";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";


class PostsViewer extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    return this.props.posts && (
      this.props.posts.map(data => {
        const { community, parentPost, id } = data;
        return (
          (parentPost === null) ? (
            <Card key={id} className="mt-4">
              <Card.Body >
                <Post postData={data} postType="preview" />
                <Link
                  to={data.host ? '/comments/' + data.host + `/${id}` : `/comments/${id}`}
                  className="btn btn-primary stretched-link"
                >
                  View Comments ({data.children.length})
                          </Link>
              </Card.Body>
            </Card>
          ) : null);
      })
    )
  }
}

export default PostsViewer;
