import {createAuthProvider} from 'react-token-auth';

export const [useAuth, authFetch, login, logout] =
    createAuthProvider({
        accessTokenKey: 'access_token',
        onUpdateToken: (token) => fetch('/api/refresh', {
            method: 'POST',
            body: token.access_token
        })
        .then(r => r.json())
    });

// NOTE: We won't need get user anymore when we convert to authenticated endpoints. The backend should retrieve user information.

/*
import {login, useAuth, logout} from "./auth"

# To Login
fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(
    {
      email: 'email@email.com',
      password: 'password'
    }
  )
}).then(r => r.json())
  .then(token => {
    if (token.access_token){
      login(token)
      console.log(token)          
    }
    else {
      console.log("Please type in correct username/password")
    }
})

# To Register
const opt = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
        {
          email: 'email@email.com',
          password: 'password'
        }
    )
};
fetch('/api/register', opt);


# To check if they are already logged in
const [logged] = useAuth();
*/