import React, { Component } from "react";
import { posts } from "./post";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

class RenderPosts extends Component {
  state = {
    view: "posts",
    currentParent: null,
  };

  showComments(parentPost) {
    this.setState({
      view: "comments",
      currentParent: { parentPost },
    });
  }

  showPosts() {
    this.setState({
      view: "posts",
      currentParent: null,
    });
  }

  render() {
    if (this.state.view === "posts") {
      return (
        <div className="card_container">
          {posts.map((data) =>
            data.parent === "" ? (
              <Card key={data.id}>
                <Post postData={data} />
                <Button onClick={() => this.showComments(data)}>
                  Click to see comments
                </Button>
              </Card>
            ) : null
          )}
        </div>
      );
    }
    if (this.state.view === "comments") {
      const parent = this.state.currentParent;

      return (
        <div className="comments_view">
          <Card>
            <Post postData={parent.parentPost} />
          </Card>

          {parent.parentPost.children.map((childId) =>
            posts.map((data) =>
              childId === data.id ? (
                <Card key={data.id} className="comment">
                  <Post postData={data} />
                </Card>
              ) : null
            )
          )}
        </div>
      );
    }
  }
}

export default RenderPosts;

const Post = ({ postData }) => {
  if (!postData.id) return <div />;

  return (
    <React.Fragment>
      <Card.Title>{postData.title}</Card.Title>
      <Card.Subtitle>
        Written by {postData.author.id} from {postData.author.host}
      </Card.Subtitle>
      <ContentTypeComponent
        contentType={postData.contentType}
        body={postData.body}
      />
    </React.Fragment>
  );
};

const ContentTypeComponent = ({ contentType, body }) => {
  switch (contentType) {
    case "text":
      return <Card.Body>{body}</Card.Body>;
    // case 'img':
    //   return <Card.Img></Card.Img>
    default:
      return <Card.Body>{body}</Card.Body>;
  }
};
