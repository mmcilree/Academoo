import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";
import App from "../App";
import { Router, Route, Switch } from "react-router-dom";
import { createMemoryHistory } from 'history';
import SignUp from "../components/authentication/SignUp";
import Login from "../components/authentication/Login";
import each from 'jest-each';
import { authFetchMock } from "./fetchMocks";

let wrapper;
let usernameField;
let passwordField;
let submitButton;
let loginForm;

/*Tests to check that the login component works*/

const history = createMemoryHistory();
jest.mock('../auth', () => {
    const { authFetchMock } = require('./fetchMocks');
    return ({
        useAuth: () => [false],
        authFetch: authFetchMock
    })
}
);

function setFormDataAndSubmit(username, password) {
    usernameField.simulate('change', { target: { name: "username", value: username } })
    passwordField.simulate('change', { target: { name: "password", value: password } })
    submitButton.simulate('submit');
}

beforeEach(() => {
    global.fetch =
        jest.fn().mockImplementation(() => {
            return Promise.resolve({
                ok: true,
            });
        });

    history.push('/login')
    wrapper = mount(
        <Router history={history}>
            <Login />
        </Router>
    );

    usernameField = wrapper.find('[name="username"]').hostNodes();
    passwordField = wrapper.find('[name="password"]').hostNodes();
    submitButton = wrapper.find('[type="submit"]').hostNodes();
    loginForm = wrapper.find(Login);
});

describe('Login form is valid', () => {
    it.each`
    username        |  password
    ${"banana"}     |  ${"Test!123"}
    ${"userMcUser"} |  ${"aaaaaA1$"}
    ${"cheese"}     |  ${"2BAAAAAa£"}
    ${"aaa"}          |  ${"12345sS&"}
  `('for input [$username, $password]', ({ username, password }) => {
        setFormDataAndSubmit(username, password);
        expect(loginForm.state().isIncorrect).toEqual(false)
    });
});
