import React from "react";
import PostCreator from "./components/PostCreator";
import HeaderBar from "./components/HeaderBar";
import Welcome from "./components/Welcome";
import PostsViewer from "./components/PostsViewer";
import CommentsViewer from "./components/CommentsViewer";
import CommunityExplorer from "./components/CommunityExplorer";
import UserSettings from "./components/UserSettings";
import UserProfile from "./components/UserProfile";
import PageNotFound from "./components/PageNotFound";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import { LoggedOutRoute } from "./components/LoggedOutRoute";
import CommunityCreator from "./components/CommunityCreator";
import { HostContext } from "./components/HostContext";

class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      host: null,
      setHost: (value) => this.setState({ host: value })
    };
  }

  render() {
    return (
      <HostContext.Provider value={this.state}>
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
                <PrivateRoute path="/explore" component={CommunityExplorer} />
                <PrivateRoute path="/create-community" component={CommunityCreator} />
                <LoggedOutRoute path="/login" component={Login} />
                <LoggedOutRoute path="/sign-up" component={SignUp} />
                <Route component={PageNotFound} />
              </Switch>
            </div>
          </div>
        </Router>
      </HostContext.Provider>
    );
  }
}

export default App;