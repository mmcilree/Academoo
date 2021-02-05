import React, { Component } from "react";
import { Card, Row, Col } from "react-bootstrap";
import timeSince from "../util/timeSince";
import { Link, withRouter } from "react-router-dom";
import { ThreeDots, PencilSquare, Trash } from "react-bootstrap-icons";
import Dropdown from "react-bootstrap/Dropdown";

class Post extends Component {
  handleDeletePost(event) {
    event.preventDefault();
    const requestOptions = {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json' },
    }
    fetch('/api/posts/' + this.props.postData.id, requestOptions);
    this.props.history.push("/communities/" + this.props.postData.community)
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
                  <Dropdown.Item><PencilSquare /> Edit Post</Dropdown.Item>
                  <Dropdown.Item onClick={this.handleDeletePost.bind(this)}><Trash /> Delete Post</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Subtitle>
          </Col>
        </Row>
        <Card.Title>{this.props.postData.title}</Card.Title>

        <ContentTypeComponent
          contentType={this.props.postData.contentType}
          body={this.props.postData.content[0].text.text}
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