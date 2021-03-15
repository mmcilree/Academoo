import React, { Component } from "react";
import Post from "./Post";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ChatSquare, ArrowUpSquare, ArrowDownSquare } from "react-bootstrap-icons";

class PostsViewer extends Component {
  constructor(props) {
    super(props);
    this.state {
      upvoted
    }
  }

  voteOnPost(post, value) {
    fetch('/api/post-vote/' + post + "?vote=" + value);
  }


  render() {

    return this.props.posts && (
      this.props.posts.map(data => {
        const { id } = data;
        return (
          <Card key={id} className="mt-4">
            <Card.Body className="pb-2">
              <Post postData={data} postType="preview" displayCommunityName={this.props.displayCommunityName} />
              <div className="d-flex justify-content-between">
                <Link
                  to={data.host ? '/comments/' + data.host + `/${id}` : `/comments/${id}`}
                  className="text-muted stretched-link"
                  size="xs"
                >
                  <small><ChatSquare /> Comments ({data.children.length})
                  </small> </Link>
                <div>
                  <Link className="text-muted ml-4"
                    size="xs"
                    style={{ zIndex: 2, position: "relative", textAlign: "right" }}
                    onClick={() => this.voteOnPost(data.id, "upvote")}>
                    <small><ArrowUpSquare className="mb-1" /> Upmoo ({data.upvotes})</small>
                  </Link>

                  <Link className="ml-4 text-muted"
                    size="xs"
                    style={{ zIndex: 2, position: "relative" }}
                    onClick={() => this.voteOnPost(data.id, "upvote")}>
                    <small><ArrowDownSquare className="mb-1" /> Downmoo ({data.downvotes})</small>
                    
                  </Link>
                </div>

              </div>




            </Card.Body>
          </Card>
        )
      })
    )
  }
}

export default PostsViewer;

