import React, { Component } from "react";
import Post from "./Post";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ChatSquare, ArrowUpSquare, ArrowUpSquareFill, ArrowDownSquare, ArrowDownSquareFill } from "react-bootstrap-icons";
import { authFetch } from '../../auth';
import VoteDisplay from "./VoteDisplay";

class PostsViewer extends Component {
  render() {
    return (
      this.props.posts.map(data => {
        const { id } = data;
        return (
          <Card key={id} className="mt-4">
            <Card.Body className="pb-2">
              <Post postData={data} postType="preview" displayCommunityName={this.props.displayCommunityName} subscribeFeed={this.props.subscribeFeed} parentCallback={this.props.parentCallback} />
              
              <div className="d-flex justify-content-between">
                <Link
                  to={data.host ? '/comments/' + data.host + `/${id}` : `/comments/${id}`}
                  className={"poll" in data.content[0] ? "text-muted" : "text-muted stretched-link"}
                  size="xs"
                >
                  <small><ChatSquare /> Comments ({data.children.length})
                  </small> 
                
                </Link>

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

