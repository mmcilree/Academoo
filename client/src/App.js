import React from "react";
import PostCreator from "./components/PostCreator";
import HeaderBar from "./components/HeaderBar";
import Welcome from "./components/Welcome";
import PostsViewer from "./components/PostsViewer";
import CommentsViewer from "./components/CommentsViewer";
import UserSettings from "./components/UserSettings";
import UserProfile from "./components/UserProfile";
import PageNotFound from "./components/PageNotFound";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import CommunityCreator from "./components/CommunityCreator";


class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Route component={HeaderBar}/>
          <div className="container-md">
            <Switch>
              <PrivateRoute exact path="/" component={Welcome} />
              <PrivateRoute path="/home" component={Welcome} />
              <PrivateRoute exact path="/moosfeed" component={PostsViewer} />
              <PrivateRoute path="/create-post" component={PostCreator} />
              <PrivateRoute path="/moosfeed/comments/:id" component={CommentsViewer} />
              <PrivateRoute path="/user-settings" component={UserSettings} />
              <PrivateRoute path="/user-profile" component={UserProfile} />
              <Route path="/login" component={Login} />
              <Route path="/sign-up" component={SignUp} />
              <Route component={PageNotFound} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
