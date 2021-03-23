import React, { Component } from "react";
import Post from "./Post";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ChatSquare, ArrowUpSquare, ArrowUpSquareFill, ArrowDownSquare, ArrowDownSquareFill } from "react-bootstrap-icons";
import { authFetch } from '../../auth';

class PostsViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      voteStatus: {},
      postData: this.props.posts,
      user_id: null
    }
  }

  async voteOnPost(post, value) {
    if (this.state.voteStatus[post] === value)
      this.setState({ voteStatus: { ...this.state.voteStatus, [post]: "none" } })
    else
      this.setState({ voteStatus: { ...this.state.voteStatus, [post]: value } })
    await authFetch('/api/post-vote/' + post + "?vote=" + value);
    this.props.refreshPost(post)
  }

  componentDidMount() {
    this.fetchUserDetails();
    this.state.postData.map((data) => this.fetchVotes(data.id))
  }

  fetchUserDetails() {
    authFetch("/api/get-user").then(response => response.json())
      .then(data =>
        this.setState({
          userID: data.userID,
        }))
  }

  componentDidUpdate(prevProps) {
    if(prevProps.posts !== this.props.posts) {
        this.setState({postData: this.props.posts});
    }
  }


  fetchVotes(postId) {
    authFetch('/api/get-vote/' + postId)
      .then(response => {
        if (!response.ok || response.status != 200) {
          throw new Error();
        }
        return response.json()
      }
      ).then(data =>
        this.setState({ voteStatus: { ...this.state.voteStatus, [postId]: data.vote } })
      ).catch((err) => {
      });
  }

  render() {
    console.log(this.state)
    return this.state.postData && (
      this.state.postData.map(data => {
        const { id } = data;
        console.log(this.state);
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
                  {this.state.voteStatus[id] && (
                    <React.Fragment>
                      <Link className="text-muted ml-4"
                        to="#"
                        size="xs"
                        style={{ zIndex: 2, position: "relative", textAlign: "right" }}
                        onClick={() => this.voteOnPost(data.id, "upvote")}>
                        <small>
                          {this.state.voteStatus[id] === "upvote" ?
                            <strong><ArrowUpSquareFill className="mb-1 mr-1" /> Upmooed! ({data.upvotes})</strong> :
                            <span><ArrowUpSquare className="mb-1 mr-1" /> Upmoo ({data.upvotes}) &nbsp;&nbsp; &nbsp;&nbsp; </span>}
                        </small>
                      </Link>

                      <Link className="ml-4 text-muted"
                        to="#"
                        size="xs"
                        style={{ zIndex: 2, position: "relative" }}
                        onClick={() => this.voteOnPost(data.id, "downvote")}>
                        <small>
                          {this.state.voteStatus[id] === "downvote" ?
                            <strong><ArrowDownSquareFill className="mb-1 mr-1" /> Downmooed ({data.downvotes})</strong> :
                            <span><ArrowDownSquare className="mb-1 mr-1" /> Downmoo ({data.downvotes}) &nbsp;&nbsp;&nbsp; </span>}
                        </small>

                      </Link>
                    </React.Fragment>
                  )}
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

