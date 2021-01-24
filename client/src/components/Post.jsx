import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import timeSince from "../util/timeSince";

class Post extends Component {
  render() {
    if (!this.props.postData.id) return <div />;
    return (
      <React.Fragment>
        <Card.Subtitle className="text-muted mb-2" style={{ fontSize: 12 }}>
          <b>{this.props.postData.author.id}</b> from{" "}
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

  const renderText = body.split(" ").map(part =>
    URL_REGEX.test(part) ? <a class="text-primary" href={part}>{part} </a> : part + " ");

  console.log(renderText);
  switch (contentType) {
    case "text":
      return postType == "preview" ?
        <Card.Text style={{
          whiteSpace: "nowrap",
          maxHeight: "10vh", overflow: "hidden", textOverflow: "ellipsis"
        }}>{renderText}
        </Card.Text>
        :
        <Card.Text >{renderText}</Card.Text>
    default:
      return <Card.Text>{renderText}</Card.Text>
  }
};
