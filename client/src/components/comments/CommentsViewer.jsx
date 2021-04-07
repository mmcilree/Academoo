import React from "../../../node_modules/react";
import Post from "../posts/Post";
import Card from "../../../node_modules/react-bootstrap/Card";
import Button from "../../../node_modules/react-bootstrap/Button";
import { ArrowReturnLeft, ChatRight } from "../../../node_modules/react-bootstrap-icons";
import { Link } from "../../../node_modules/react-router-dom";
import Modal from "../../../node_modules/react-bootstrap/Modal";
import CommentCreator from "./CommentCreator";
import Accordion from 'react-bootstrap/Accordion';
import VoteDisplay from "../posts/VoteDisplay";
import { authFetch } from '../../auth';
import { Alert } from "react-bootstrap";

import {
  ReplyFill,
  ChatSquare,
} from "react-bootstrap-icons";


class CommentsViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      parentPost: null,
      parentPostId: this.props.match.params.id,
      host: this.props.match.params.instance ? this.props.match.params.instance : "local",
      children: [],
      grandchildren: {},
      fetchedChildren: new Set(),
      voteStatus: {},
      isLoading: true,
      needsUpdate: false,
      userID: null,
      error: null,
      showCommentEditor: false,
      currentChild: null,
    }

    this.parentCallback = this.parentCallback.bind(this);
  }

  parentCallback(post) {
    this.setState({
      children: this.state.children.filter(child => child.id !== post.id && child.id !== post.parentPost),
      fetchedChildren: new Set([...this.state.fetchedChildren].filter(childId => childId !== post.id && childId !== post.parentPost)),
      needsUpdate: true,
    });

    if(this.state.grandchildren[post.parentPost]) {
      this.state.grandchildren[post.parentPost] = this.state.grandchildren[post.parentPost].filter(child => child.id !== post.id);
    }
  }

  fetchUserDetails() {
    authFetch("/api/get-user").then(response => response.json())
      .then(data => {
        this.setState({
          userID: data.id,
        })
        this.fetchParentPost();
      })
  }

  handleOpenCommentEditor() {
    this.setState({ showCommentEditor: true });
  }

  handleCloseCommentEditor() {
    this.setState({ showCommentEditor: false, needsUpdate: true });
  }

  handleOpenReplyEditor(child) {
    this.setState({ showReplyEditor: true, currentChild: child });
  }

  handleCloseReplyEditor(child) {
    this.parentCallback(child);
    this.fetchChildren(child.children, true, child.id);

    console.log(this.state.currentChild);
    this.setState({ showReplyEditor: false, needsUpdate: true });
  }


  async fetchParentPost() {
    await authFetch('/api/posts/' + this.state.parentPostId + (this.state.host !== "local" ? "?external=" + this.state.host : ""),
      {
        headers: {
          'User-ID': this.state.userID,
          'Client-Host': window.location.protocol + "//" + window.location.hostname
        }
      })
      .then(response => {
        if (!response.ok) {
          if (!response.ok) {
            return response.json().then((error) => {
              let err = error.title + ": " + error.message
              throw new Error(err);
            })
          }
        } else {
          return response.json()
        }
      })
      .then(data => {
        this.setState({
          parentPost: data,
          needsUpdate: false
        });
        this.fetchChildren(data.children, false, data.id)
        // Promise.resolve(this.fetchChildren(data.children, false, data.id)).then(children => {console.log("here");children.map(child => this.fetchChildren(child.children, true, child.id))});
        //console.log((await Promise.all( this.fetchChildren(data.children, false, data.id))))/*.map(child => this.fetchChildren(child.children, true, child.id))*/;
      })
      .catch(error => this.setState({ error: error.message, isLoading: false }));

  }

  async fetchChildren(childIds, isChild, parentId) {

    // if (this.state.grandchildren[parentId]) return

    const { fetchedChildren, children, grandchildren } = this.state;

    var new_children = await Promise.all(childIds.filter(childId => !fetchedChildren.has(childId)).map(
      async (childId) => {
        fetchedChildren.add(childId);
        return authFetch('/api/posts/' + childId + (this.state.host !== "local" ? "?external=" + this.state.host : ""),
          {
            headers: {
              'User-ID': this.state.userID,
              'Client-Host': window.location.protocol + "//" + window.location.hostname
            }
          })
          .then(response => {
            if (!response.ok && response.status !== 404) {
              return response.json().then((error) => {
                let err = error.title + ": " + error.message
                throw new Error(err);
              })
            } else {
              return response.json();
            }
          })
          .then(data => data)
          .catch(error => this.setState({ error: error.message, isLoading: false }));
      }));

      if(this.state.grandchildren[parentId]) {
        new_children = [...this.state.grandchildren[parentId], ...new_children];
      }

      !isChild ? this.setState({ isLoading: false, children: [...children, ...new_children] })
        : this.setState({ grandchildren: { ...grandchildren, [parentId]: new_children } })

  }

  componentDidMount() {
    this.fetchUserDetails();
  }

  componentDidUpdate() {
    if (this.state.needsUpdate) {
      this.fetchParentPost();
    }
  }

  render() {
    const { isLoading, error } = this.state;
    console.log(this.state.currentChild);
    return (
      <div className="container-md comments_view">
        <Card className="mt-4">
          {!isLoading && !error ? (
            <Card.Body>
              <Button variant="secondary" onClick={() => {
                this.props.history.push("/communities/" + (this.state.host !== "local" ? this.state.host + "/" : "") + this.state.parentPost.community);
              }}>All Community Posts <ArrowReturnLeft /></Button>
              <Card className="mt-4">
                <Card.Body>
                  <Post postData={this.state.parentPost} displayCommunityName parentCallback={this.parentCallback}/>
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

                  <Modal show={this.state.showReplyEditor} onHide={() => this.setState({ showReplyEditor: false })}>
                    <Modal.Header closeButton>
                      <Modal.Title>Add a Reply to a Comment!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <CommentCreator parentPost={this.state.currentChild} host={this.state.host} onSubmit={this.handleCloseReplyEditor.bind(this, this.state.currentChild)} />
                    </Modal.Body>
                  </Modal>


                </Card.Body>
              </Card>
              {this.state.children.sort(comment => comment.created).reverse().map((child) =>
                child && child.children ? (
                  <Card key={child.id} className="mt-4 ml-4 comment">

                    <Card.Body className="pb-1">
                      <Post postData={child} parentCallback={this.parentCallback} parentId={this.state.parentPostId}/>
                      <Accordion defaultActiveKey={this.state.currentChild && (this.state.currentChild.id === child.id) && !this.state.showReplyEditor ? "0" : "1"}>
                        <div className="d-flex justify-content-between">
                          <div>                            
                            <Accordion.Toggle as={Button} variant="link" eventKey="0" onClick={() => this.fetchChildren(child.children, true, child.id)}>
                              <small><ChatSquare className="mb-1 mr-1" /> Replies ({child.children.length})</small>
                            </Accordion.Toggle>
                            <Link onClick={this.handleOpenReplyEditor.bind(this, child)}> <small><ReplyFill className="mb-1 mr-1" />Reply to comment</small></Link>

                          </div>

                          <VoteDisplay upvotes={child.upvotes} downvotes={child.downvotes} postId={child.id} />
                        </div>
                        
                        <Accordion.Collapse eventKey="0" className="p-0">
                          <Card.Body className="pt-0 pl-0">
                            {child.children.length === 0 ?
                              <p>No replies to show.</p> :
                              this.state.grandchildren[child.id] ? this.state.grandchildren[child.id].map((newchild) =>
                                newchild ? (
                                  <Card key={newchild.id} className="mt-4 ml-4 comment">
                                    <Card.Body>
                                      <Post postData={newchild} parentCallback={this.parentCallback} parentId={this.state.parentPostId}/>
                                      <div className="d-flex justify-content-between">
                                        <div>
                                        </div>

                                        <VoteDisplay upvotes={newchild.upvotes} downvotes={newchild.downvotes} postId={newchild.id} />
                                      </div>
                                    </Card.Body>
                                  </Card>
                                ) : null
                              ) : <p>Loading Replies...</p>
                            }
                          </Card.Body>
                        </Accordion.Collapse>
                      </Accordion>

                    </Card.Body>

                  </Card>

                ) : null
              )}
              {this.state.children.length === 0 ?
                <p className="mt-4 ml-4 comment">No comments to show.</p> : null}
            </Card.Body>) :
            <Card.Body>{error ? <Alert variant="warning">Error fetching posts: {error}</Alert> : <h3>Loading Post...</h3>}</Card.Body>}
        </Card>
      </div>
    );
  }
}

export default CommentsViewer;