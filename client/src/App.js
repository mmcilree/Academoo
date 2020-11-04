import React from "react";
import PostCreator from "./components/PostCreator";
import HeaderBar from "./components/HeaderBar";
import Welcome from "./components/Welcome";
import PostsViewer from "./components/posts_viewer";
import CommentsViewer from "./components/comments_viewer";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="App">
          <HeaderBar />
          <div className="container-md">
            <Switch>
              <Route exact path="/" component={Welcome} />
              <Route path="/home" component={Welcome} />
              <Route exact path="/moosfeed" component={PostsViewer} />
              <Route path="/create-post" component={PostCreator} />
              <Route path="/moosfeed/comments/:id" component={CommentsViewer} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
