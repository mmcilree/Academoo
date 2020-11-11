import React, { useState, useEffect } from "react";
import Post from "./Post";
import Card from "react-bootstrap/Card";
import { posts } from "./test_post_json";
import Button from "react-bootstrap/Button";
import { ArrowReturnLeft } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import CommentCreator from "./CommentCreator";

class CommentsViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      parentPost: null,
      parentPostId: this.props.match.params.id,

      children: [],
      fetchedChildren: new Set(),
      
      isLoading: true,
      needsUpdate: false,

      error: null,
      showCommentEditor: false,
    }
  }

  handleOpenCommentEditor() {
    this.setState({ showCommentEditor: true });
  }

  handleCloseCommentEditor() {
    this.setState({ showCommentEditor: false, needsUpdate: true });
  }


  async fetchParentPost() {
    await fetch('/api/posts/' + this.state.parentPostId)
      .then(response => response.json())
      .then(data =>
        this.setState({
          parentPost: data,
          needsUpdate: false
        })
      );
    
    this.fetchChildren();
  }

  async fetchChildren() {
    const { parentPost, fetchedChildren, children } = this.state;

    const new_children = await Promise.all(parentPost.children.filter(childId => !fetchedChildren.has(childId)).map(
      async (childId) => {
        fetchedChildren.add(childId);
        return fetch('/api/posts/' + childId)
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
    if(this.state.needsUpdate) {
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
              <Link to="/moosfeed" className="btn btn-secondary">
                Back to Moosfeed <ArrowReturnLeft />
              </Link>
              <Card className="mt-4">
                <Card.Body>
                  <Post postData={this.state.parentPost} />
                  <Button variant="primary" onClick={this.handleOpenCommentEditor.bind(this)}>Leave a comment</Button>
                  <Modal show={this.state.showCommentEditor} onHide={() => this.setState({ showCommentEditor: false })}>
                    <Modal.Header closeButton />
                    <Modal.Body>
                      <CommentCreator parentPost={this.state.parentPost} onSubmit={this.handleCloseCommentEditor.bind(this)}/>
                    </Modal.Body>
                  </Modal>

                </Card.Body>
              </Card>
              {this.state.children.sort(comment => comment.created).map((child) =>
                child ? (
                  <Card key={child.id} className="mt-4 ml-4 comment">
                    <Card.Body>
                      <Post postData={child} />
                    </Card.Body>
                  </Card>
                ) : null
              )}
              {this.state.children.length == 0 ? 
                <p className="mt-4 ml-4 comment">No comments to show.</p> : null}

            </Card.Body>) :
            <Card.Body><h3>Loading Post...</h3></Card.Body>}
        </Card>
      </div>
    );
  }
}
export default CommentsViewer;
