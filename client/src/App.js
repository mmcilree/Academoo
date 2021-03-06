import React from "react";
import AccessForbidden from "./components/static/AccessForbidden";
import PostCreator from "./components/posts/PostCreator";
import HeaderBar from "./components/layout/HeaderBar";
import Welcome from "./components/static/Welcome";
import CommunityFeed from "./components/community/CommunityFeed";
import PostsViewer from "./components/posts/PostsViewer";
import CommentsViewer from "./components/comments/CommentsViewer";
import CommunityExplorer from "./components/community/CommunityExplorer";
import CommunityManager from "./components/community/CommunityManager";
import SketchRoom from "./components/sketch/SketchRoom";
import UserSettings from "./components/user/UserSettings";
import UserProfile from "./components/user/UserProfile";
import PageNotFound from "./components/static/PageNotFound";
import Help from "./components/static/Help";
import Login from "./components/authentication/Login";
import SignUp from "./components/authentication/SignUp";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { PrivateRoute } from "./components/authentication/PrivateRoute";
import { LoggedOutRoute } from "./components/authentication/LoggedOutRoute";
import CommunityCreator from "./components/community/CommunityCreator";
import SubscribedFeed from "./components/user/SubscribedFeed";
import AdminKeyAuth from "./components/authentication/AdminKeyAuth";
import ControlPanel from "./components/authentication/ControlPanel";
import SketchMenu from "./components/sketch/SketchMenu";
import SearchFeed from "./components/search/SearchFeed";

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
      <Router>
        <div className="App h-100" style={{ "background-color": "#e3e8e8" }}>
          <Route component={HeaderBar} />
          <div className="container-md">
            <Switch>
              <PrivateRoute exact path="/" component={Welcome} />
              <PrivateRoute path="/home" component={Welcome} />
              <PrivateRoute exact path="/moosfeed" component={SubscribedFeed} />
              <PrivateRoute exact path="/communities" component={CommunityExplorer} />
              <PrivateRoute exact path="/communities/:id" component={CommunityFeed} />
              <PrivateRoute exact path="/communities/:id/manage" component={CommunityManager} />
              <PrivateRoute path="/communities/:instance/:id" component={CommunityFeed} />
              <PrivateRoute path="/create-post" component={PostCreator} />
              <PrivateRoute exact path="/sketchamoo" component={SketchMenu} />
              <PrivateRoute exact path="/sketchamoo/:id" component={SketchRoom} />
              <PrivateRoute exact path="/comments/:id" component={CommentsViewer} />
              <PrivateRoute path="/comments/:instance/:id" component={CommentsViewer} />
              <PrivateRoute path="/user-settings" component={UserSettings} />
              <PrivateRoute path="/help" component={Help} />
              <PrivateRoute exact path="/user-profile/:id" component={UserProfile} />
              <PrivateRoute path="/user-profile/:instance/:id" component={UserProfile} />
              <PrivateRoute path="/create-community" component={CommunityCreator} />
              <PrivateRoute path="/control-panel" component={ControlPanel} />
              <PrivateRoute path="/admin-key" component={AdminKeyAuth} />
              <PrivateRoute path="/forbidden" component={AccessForbidden} />
              <PrivateRoute path="/search/:query" component={SearchFeed} />
              <LoggedOutRoute path="/login" component={Login} />
              <LoggedOutRoute path="/sign-up" component={SignUp} />
              <Route path="/404" component={PageNotFound} />
              <Route component={PageNotFound} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;