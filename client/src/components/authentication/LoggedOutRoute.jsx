import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../../auth"

/*
Route for if the user is logged out, where to take them
*/
export const LoggedOutRoute = ({ component: Component, ...rest }) => {
  const [logged] = useAuth();

  return <Route {...rest} render={(props) => (
    logged
      ? <Redirect to='/' />
      : <Component {...props} />
  )} />
}