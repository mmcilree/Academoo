import React from "react";
import Button from "react-bootstrap/Button";
import { Route, Switch } from "react-router-dom";
import PostsViewer from "./components/posts_viewer";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Welcome to Academoo!</h1>
          <p>There's not much here yet...</p>
        </header>
        <Switch>
          <Route path="/moosfeed">
            <PostsViewer />
          </Route>
        </Switch>
      </div>
    );
  }
}

export default App;
