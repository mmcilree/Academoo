import React, { Component } from "react";
import { Card, Row, Col, Modal, Button } from "react-bootstrap";
import timeSince from "../util/timeSince";
import { Link, withRouter } from "react-router-dom";
import { ThreeDots, PencilSquare, Trash } from "react-bootstrap-icons";
import Dropdown from "react-bootstrap/Dropdown";
import PostEditor from "./PostEditor"
import { authFetch } from '../auth';

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: "",
      showEdit: false,
      showDelete: false,
      updatedTitle: this.props.postData.title,
      updatedBody: this.props.postData.content[0].text.text,
      title: this.props.postData.title,
      body: this.props.postData.content[0].text.text,
      canEdit: true,
      canDelete: true,
      errors: [],
      error: null,
      isLoading: false,
    }
    this.validateForm = this.validateForm.bind(this);
    this.handleSubmitEdit = this.handleSubmitEdit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.fetchUserDetails();
  }

  async fetchUserDetails() {
    await authFetch("/api/get-user").then(response => response.json())
      .then(data =>
        this.setState({
          currentUser: data.id,
          isLoading: false
        })
      )
      .catch(error => this.setState({ error, isLoading: false }));
    this.checkPermissions();
  }

  checkPermissions() {
    console.log("author " + this.props.postData.author.id);
    console.log("current " + this.state.currentUser);

    if (this.props.postData.author.id === this.state.currentUser) {
      console.log("here")
      this.setState({
        canEdit: false,
        canDelete: false
      })
    } else {
      this.setState({
        canEdit: true,
        canDelete: true
      })
    }
  }

  handleDeletePost(event) {
    event.preventDefault();
    const requestOptions = {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json' },
    }
    fetch('/api/posts/' + this.props.postData.id, requestOptions);
    this.props.history.push("/communities/" + this.props.postData.community)
  }

  handleShowDelete(event) {
    event.preventDefault();
    this.setState({
      showDelete: true
    });
  }

  handleCloseDelete = () => {
    this.setState({
      showDelete: false
    });
  }

  handleShowEdit(event) {
    event.preventDefault();
    this.setState({
      showEdit: true
    });
  }

  handleCloseEdit = () => {
    this.setState({
      showEdit: false
    });
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name
    this.setState({
      [name]: value
    });
  }

  validateForm() {
    const errors = [];
    if (this.state.updatedTitle.length === 0) {
      //post is a comment and has no title
      if (this.state.title.length !== 0) {
        errors.push("The title is invalid for a comment")
      }

    } else if (this.state.title.length === 0) {
      errors.push("Title field cannot be empty")
    }

    if (this.state.title === "Moo" && this.state.body === "Moooo") {
      errors.push("...really?")
    }

    return errors;
  }

  handleSubmitEdit(event) {
    event.preventDefault();

    const errors = this.validateForm();
    if (errors.length > 0) {
      this.setState({ errors });
      return;
    }

    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        title: this.state.title,
        content: [
          {
            text: {
              text: this.state.body
            }
          }
        ],
      }
    };
    requestOptions.body = JSON.stringify(requestOptions.body);

    fetch('/api/posts/' + this.props.postData.id, requestOptions);
    this.setState({
      updatedTitle: this.state.title,
      updatedBody: this.state.body
    })
    this.handleCloseEdit();
  }

  render() {
    if (!this.props.postData.id) return <div />;
    return (
      <React.Fragment>
        <Row>
          <Col>
            <Card.Subtitle className="text-muted" style={{ fontSize: 14 }}>
              <b><Link to={"/user-profile/" + this.props.postData.author.id}>{this.props.postData.author.id}</Link></b> from{" "}
              {this.props.postData.author.host}
              {" · "} {timeSince(this.props.postData.created)} ago
              </Card.Subtitle>
          </Col>
          <Col xs={2} sm={1} className="mb-2">
            <Card.Subtitle>
              <Dropdown drop="left">
                <Dropdown.Toggle as={CustomToggle} />
                <Dropdown.Menu size="sm" title="">
                  <Dropdown.Header>Options</Dropdown.Header>
                  <Dropdown.Item disabled={this.state.canEdit} onClick={this.handleShowEdit.bind(this)}><PencilSquare /> Edit Post</Dropdown.Item>
                  <Dropdown.Item disabled={this.state.canDelete} onClick={this.handleShowDelete.bind(this)}><Trash /> Delete Post</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Subtitle>
          </Col>
        </Row>
        <Card.Title>{this.state.updatedTitle}</Card.Title>
        <Modal
          show={this.state.showEdit}
          onHide={this.handleCloseEdit}
          backdrop="static">
          <PostEditor
            title={this.state.title}
            body={this.state.body}
            handleClose={this.handleCloseEdit}
            handleSubmit={this.handleSubmitEdit}
            handleChange={this.handleChange}
            errors={(this.state.errors)}
          />
        </Modal>
        <Modal
          show={this.state.showDelete}
          onHide={this.handleCloseDelete}
          backdrop="static"
        >
          <Modal.Body>Are you sure you want to delete this post and all its comments?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleDeletePost.bind(this)}>Yes, delete post</Button>
            <Button onClick={this.handleCloseDelete}>No, cancel</Button>
          </Modal.Footer>
        </Modal>
        <ContentTypeComponent
          contentType={this.props.postData.contentType}
          body={this.state.updatedBody}
          postType={this.props.postType}
        />
      </React.Fragment >
    );
  }
}

export default withRouter(Post);

const ContentTypeComponent = ({ contentType, body, postType }) => {
  const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  const IMG_SUFFIX_REGEX = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;
  const imageURLs = body.split(/\s+/).filter(part =>
    URL_REGEX.test(part) && IMG_SUFFIX_REGEX.test(part));

  const renderText = body.split(/\s+/).map(part =>
    URL_REGEX.test(part) ?
      IMG_SUFFIX_REGEX.test(part) ?
        "" :
        <Card.Link className="text-primary" href={part}>{part} </Card.Link>
      : part + " ");

  switch (contentType) {
    case "text":
      return postType == "preview" ?
        <React.Fragment>
          {imageURLs.length > 0 &&
            <Row className="justify-content-center">
              <Card.Img src={imageURLs[0]} style={{ width: "40vh" }} />
            </Row>}
          <Card.Text variant="top" style={{
            whiteSpace: "nowrap",
            maxHeight: "10vh", overflow: "hidden", textOverflow: "ellipsis"
          }}>{renderText}
          </Card.Text>
        </React.Fragment>
        :
        <React.Fragment>
          {imageURLs.length > 0 && <Card.Img src={imageURLs[0]} />}
          <Card.Text >{renderText}</Card.Text>
        </React.Fragment>
    default:
      return <Card.Text>{renderText}</Card.Text>
  }
}

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <a
    href=""
    ref={ref}
    onClick={e => {
      e.preventDefault();
      onClick(e);
    }}
  >

    {children}
    <ThreeDots />

  </a>
));