import React, { Component } from "react";
import {Card, Row, Col} from "react-bootstrap";
import timeSince from "../util/timeSince";

class Post extends Component {
  render() {
    if (!this.props.postData.id) return <div />;
    return (
      <React.Fragment>
        <Card.Subtitle className="text-muted mb-2" style={{ fontSize: 12 }}>
          {this.props.postData.author.id} from{" "}
          {this.props.postData.author.host}
          {" · "} {timeSince(this.props.postData.created)} ago
        </Card.Subtitle>
        <Card.Title>{this.props.postData.title}</Card.Title>

        <ContentTypeComponent
          contentType={this.props.postData.contentType}
          body={this.props.postData.body}
          postType={this.props.postType}
        />
      </React.Fragment>
    );
  }
}

export default Post;

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
