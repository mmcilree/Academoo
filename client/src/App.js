import React from "react";
import PostCreator from "./components/PostCreator";
import HeaderBar from "./components/HeaderBar";
import Welcome from "./components/Welcome";
import PostsViewer from "./components/PostsViewer";
import CommentsViewer from "./components/CommentsViewer";
import UserSettings from "./components/UserSettings";
import UserProfile from "./components/UserProfile";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { useAuth } from "./auth"

const PrivateRoute = ({ component: Component, ...rest }) => {
  const [logged] = useAuth();

  return <Route {...rest} render={(props) => (
    logged
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
}
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
              <Route path="/user-settings" component={UserSettings} />
              <Route path="/user-profile" component={UserProfile} />
              <Route path="/login" component={Login} />
              <Route path="/sign-up" component={SignUp} />
              <PrivateRoute path="/gucci-gang" component={Welcome} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
