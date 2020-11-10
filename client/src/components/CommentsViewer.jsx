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
      isLoading: true,
      error: null,
      showCommentEditor: false
    }
  }

  handleOpenCommentEditor() {
    this.setState({ showCommentEditor: true });
  }

  handleCloseCommentEditor() {
    this.setState({ showCommentEditor: false });
  }


  async fetchParentPost() {
    await fetch('/api/posts/' + this.state.parentPostId)
      .then(response => response.json())
      .then(data =>
        this.setState({
          parentPost: data,
        })
      );
    console.log(this.state.parentPost);

    this.state.parentPost.children.length != 0 ?
      this.fetchChildren() : this.setState({ isLoading: false });
  }

  fetchChildren() {
    const parentPost = this.state.parentPost;
    console.log(parentPost.id);
    parentPost.children.map((childId) => {
      fetch('/api/posts/' + childId)
        .then(response => response.json())
        .then(data =>
          this.setState({
            children: [...this.state.children, data],
            isLoading: false
          })
        )
        .catch(error => this.setState({ error, isLoading: false }));
    });
  }

  componentDidMount() {
    this.fetchParentPost();
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
                  <Modal show={this.state.showCommentEditor} onHide={this.handleCloseCommentEditor.bind(this)}>
                    <CommentCreator />
                  </Modal>
                  
                </Card.Body>
              </Card>
              {this.state.children.map((child) =>
                child ? (
                  <Card key={child.id} className="mt-4 ml-4 comment">
                    <Card.Body>
                      <Post postData={child} />
                    </Card.Body>
                  </Card>
                ) : null
              )}

            </Card.Body>) :
            <Card.Body><h3>Loading Post...</h3></Card.Body>}
        </Card>
      </div>
    );
  }
}
export default CommentsViewer;
