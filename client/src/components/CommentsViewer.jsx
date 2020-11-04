import React from "react";
import Post from "./Post";
import Card from "react-bootstrap/Card";

function CommentsViewer(props) {
  const parentPost = props.parentPost;
  console.log(parentPost);
  const allPosts = props.allPosts;

  return (
    <div className="comments_view">
      <Card>
        <Post postData={parentPost} />
      </Card>

      {parentPost.children.map((childId) =>
        allPosts.map((data) =>
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
export default CommentsViewer;
