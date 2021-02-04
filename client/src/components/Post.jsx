import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import timeSince from "../util/timeSince";
import { Link } from "react-router-dom";

class Post extends Component {
  render() {
    if (!this.props.postData.id) return <div />;
    return (
      <React.Fragment>
        <Card.Subtitle className="text-muted mb-2" style={{fontSize: 12}}>
          <b><Link to= {"/user-profile/" + this.props.postData.author.id}>{this.props.postData.author.id}</Link></b> from{" "}
          {this.props.postData.author.host}
          {" · "} {timeSince(this.props.postData.created)} ago
        </Card.Subtitle>
        <Card.Title>{this.props.postData.title}</Card.Title>
        
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
