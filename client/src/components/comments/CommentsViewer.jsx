import React from "../../../node_modules/react";
import Post from "../posts/Post";
import Card from "../../../node_modules/react-bootstrap/Card";
import Button from "../../../node_modules/react-bootstrap/Button";
import { ArrowReturnLeft, ChatRight } from "../../../node_modules/react-bootstrap-icons";
import { Link } from "../../../node_modules/react-router-dom";
import Modal from "../../../node_modules/react-bootstrap/Modal";
import CommentCreator from "./CommentCreator";
import VoteDisplay from "../posts/VoteDisplay";
import { authFetch } from '../../auth';

class CommentsViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      parentPost: null,
      parentPostId: this.props.match.params.id,
      host: this.props.match.params.instance ? this.props.match.params.instance : "local",
      children: [],
      fetchedChildren: new Set(),
      voteStatus: {},
      isLoading: true,
      needsUpdate: false,
      userID: null,
      error: null,
      showCommentEditor: false,

    }
  }

  fetchUserDetails() {
    authFetch("/api/get-user").then(response => response.json())
      .then(data =>
        this.setState({
          userID: data.userID,
        }))
  }

  handleOpenCommentEditor() {
    this.setState({ showCommentEditor: true });
  }

  handleCloseCommentEditor() {
    this.setState({ showCommentEditor: false, needsUpdate: true });
  }


  async fetchParentPost() {
    await authFetch('/api/posts/' + this.state.parentPostId + (this.state.host !== "local" ? "?external=" + this.state.host : ""),
      {
        headers: {
          'User-ID': this.state.user_id,
          'Client-Host': window.location.protocol + "//" + window.location.hostname
        }
      })
      .then(response => response.json())
      .then(data =>
        this.setState({
          parentPost: data,
          needsUpdate: false
        })
      ).catch(() => { });

    this.fetchChildren();
  }

  async fetchChildren() {
    const { parentPost, fetchedChildren, children } = this.state;

    const new_children = await Promise.all(parentPost.children.filter(childId => !fetchedChildren.has(childId)).map(
      async (childId) => {
        fetchedChildren.add(childId);
        return authFetch('/api/posts/' + childId + (this.state.host !== "local" ? "?external=" + this.state.host : ""),
          {
            headers: {
              'User-ID': this.state.user_id,
              'Client-Host': window.location.protocol + "//" + window.location.hostname
            }
          })
          .then(response => response.json())
          .then(data => data)
          .catch(error => this.setState({ error, isLoading: false }));
      }));

    this.setState({ isLoading: false, children: [...children, ...new_children] })
  }

  componentDidMount() {
    this.fetchParentPost();
  }

  componentDidUpdate() {
    if (this.state.needsUpdate) {
      this.fetchParentPost();
    }
  }

  render() {
    const { isLoading } = this.state;

    return (
      <div className="container-md comments_view">
        <Card className="mt-4">
          {!isLoading ? (
            <Card.Body>
              <Button variant="secondary" onClick={() => {
                this.props.history.push("/communities/" + this.state.parentPost.community);
              }}>All Community Posts <ArrowReturnLeft /></Button>
              <Card className="mt-4">
                <Card.Body>
                  <Post postData={this.state.parentPost} displayCommunityName />
                  <div className="d-flex justify-content-between">
                    <Button variant="primary" onClick={this.handleOpenCommentEditor.bind(this)}>
                      Leave a comment
                    {" "} <ChatRight />
                    </Button>
                    <VoteDisplay upvotes={this.state.parentPost.upvotes} downvotes={this.state.parentPost.downvotes} postId={this.state.parentPostId} />
                  </div>

                  <Modal show={this.state.showCommentEditor} onHide={() => this.setState({ showCommentEditor: false })}>
                    <Modal.Header closeButton>
                      <Modal.Title>Add a Comment!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <CommentCreator parentPost={this.state.parentPost} host={this.state.host} onSubmit={this.handleCloseCommentEditor.bind(this)} />
                    </Modal.Body>
                  </Modal>


                </Card.Body>
              </Card>
              {this.state.children.sort(comment => comment.created).reverse().map((child) =>
                child ? (
                  <Card key={child.id} className="mt-4 ml-4 comment">
                    <Card.Body>
                      <Post postData={child} />
                      <div className="d-flex justify-content-between">
                        <span></span>
                        <VoteDisplay upvotes={child.upvotes} downvotes={child.downvotes} postId={child.id} />
                      </div>

                    </Card.Body>
                  </Card>
                ) : null
              )}
              {this.state.children.length === 0 ?
                <p className="mt-4 ml-4 comment">No comments to show.</p> : null}

            </Card.Body>) :
            <Card.Body><h3>Loading Post...</h3></Card.Body>}
        </Card>
      </div>
    );
  }
}
export default CommentsViewer;
