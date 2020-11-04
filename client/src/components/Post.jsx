import React, { Component } from "react";
import Card from "react-bootstrap/Card";

class Post extends Component {
  render() {
    if (!this.props.postData.id) return <div />;
    return (
      <React.Fragment>
        <Card.Title>{this.props.postData.title}</Card.Title>
        <Card.Subtitle>
          Written by {this.props.postData.author.id} from{" "}
          {this.props.postData.author.host}
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
      return <Card.Body>{body}</Card.Body>;
    default:
      return <Card.Body>{body}</Card.Body>;
  }
};
