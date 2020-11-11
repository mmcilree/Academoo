import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import timeSince from "../util/timeSince";

class Post extends Component {
  render() {
    if (!this.props.postData.id) return <div />;
    return (
      <React.Fragment>
        <Card.Title>{this.props.postData.title}</Card.Title>
        <Card.Subtitle className="text-muted">
          Written by {this.props.postData.author.id} from{" "}
          {this.props.postData.author.host}
          {" "} {timeSince(this.props.postData.created)} ago
        </Card.Subtitle>
        <ContentTypeComponent
          contentType={this.props.postData.contentType}
          body={this.props.postData.body}
        />
      </React.Fragment>
    );
  }
}

export default Post;

const ContentTypeComponent = ({ contentType, body }) => {
  switch (contentType) {
    case "text":
      return <Card.Text>{body}</Card.Text>;
    default:
      return <Card.Text>{body}</Card.Text>;
  }
};
