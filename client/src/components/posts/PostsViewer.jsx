import React, { Component } from "react";
import Post from "./Post";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ChatSquare } from "react-bootstrap-icons";
import VoteDisplay from "./VoteDisplay";

/* Posts Viewer Component displays all the posts passed to it via props
 - each post is rendered using the Post component */
class PostsViewer extends Component {
  render() {
    return (
      this.props.posts.map(data => {
        const { id } = data;
        return (
          <Card key={id} className="mt-4">
            <Card.Body className="pb-2">
              <Post postData={data} postType="preview" displayCommunityName={this.props.displayCommunityName} parentCallback={this.props.parentCallback} />
              <div className="d-flex justify-content-between">
                <Link
                  to={data.host ? '/comments/' + data.host + `/${id}` : `/comments/${id}`}
                  className="text-muted stretched-link"
                  size="xs"
                >
                  <small><ChatSquare /> Comments ({data.children.length})
                  </small> </Link>

                <VoteDisplay upvotes={data.upvotes} downvotes={data.downvotes} postId={id} />
              </div>
            </Card.Body>
          </Card>
        )
      })
    )
  }
}

export default PostsViewer;

