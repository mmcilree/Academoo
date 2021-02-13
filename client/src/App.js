import React from "react";
import AccessForbidden from "./components/AccessForbidden";
import PostCreator from "./components/PostCreator";
import HeaderBar from "./components/HeaderBar";
import Welcome from "./components/Welcome";
import CommunityFeed from "./components/CommunityFeed";
import PostsViewer from "./components/PostsViewer";
import CommentsViewer from "./components/CommentsViewer";
import CommunityExplorer from "./components/CommunityExplorer";
import CommunityManager from "./components/CommunityManager";
import UserSettings from "./components/UserSettings";
import UserProfile from "./components/UserProfile";
import PageNotFound from "./components/PageNotFound";
import Help from "./components/Help";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import { LoggedOutRoute } from "./components/LoggedOutRoute";
import CommunityCreator from "./components/CommunityCreator";
import { HostContext } from "./components/HostContext";
import SubscribedFeed from "./components/SubscribedFeed";
import AdminKeyAuth from "./components/AdminKeyAuth";

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
            <Route component={HeaderBar} />
            <div className="container-md">
              <Switch>
                <PrivateRoute exact path="/" component={Welcome} />
                <PrivateRoute path="/home" component={Welcome} />
                <PrivateRoute exact path="/moosfeed" component={SubscribedFeed} />
                <PrivateRoute exact path="/communities/:id" component={CommunityFeed} />
                <PrivateRoute exact path="/communities/:id/manage" component={CommunityManager} />
                <PrivateRoute path="/communities/:instance/:id" component={CommunityFeed} />
                <PrivateRoute path="/create-post" component={PostCreator} />
                <PrivateRoute exact path="/comments/:id" component={CommentsViewer} />
                <PrivateRoute path="/comments/:instance/:id" component={CommentsViewer} />
                <PrivateRoute path="/user-settings" component={UserSettings} />
                <PrivateRoute path="/help" component={Help} />
                <PrivateRoute exact path="/user-profile/:id" component={UserProfile} />
                <PrivateRoute path="/user-profile/:instance/:id" component={UserProfile} />
                {/* <PrivateRoute exact path="/user-profile" component={UserProfile} /> */}
                <PrivateRoute path="/explore" component={CommunityExplorer} />
                <PrivateRoute path="/create-community" component={CommunityCreator} />
                <PrivateRoute path="/admin-key" component={AdminKeyAuth} />
                <PrivateRoute path="/forbidden" component={AccessForbidden} />
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