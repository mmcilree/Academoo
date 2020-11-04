import React from 'react';
import PostCreator from './components/PostCreator';
import HeaderBar from './components/HeaderBar';
import Welcome from './components/Welcome';
import { Route, Switch } from "react-router-dom";
import PostsViewer from "./components/posts_viewer";

class App extends React.Component {
  render() {
    return (
      <div>
        <header>
        </header>
        <div class="container" >
          <Welcome />
        </div>     
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
