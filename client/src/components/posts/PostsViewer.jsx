import React, { Component } from "react";
import Post from "./Post";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ChatSquare } from "react-bootstrap-icons";

class PostsViewer extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    return this.props.posts && (
      this.props.posts.map(data => {
        const { id } = data;
        return (
            <Card key={id} className="mt-4">
              <Card.Body className="pb-2">
                <Post postData={data} postType="preview" displayCommunityName={this.props.displayCommunityName} />
                <Link
                  to={data.host ? '/comments/' + data.host + `/${id}` : `/comments/${id}`}
                  className="text-muted stretched-link"
                  size="xs"
                >
                  <small><ChatSquare /> Comments ({data.children.length})
                  </small> </Link>
              </Card.Body>
            </Card>
          )
      })
    )
  }
}

export default PostsViewer;

