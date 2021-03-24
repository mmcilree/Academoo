import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { mount } from "enzyme";
import { Alert, Dropdown } from 'react-bootstrap'
import { Router, Route, Switch } from "react-router-dom";
import { fetchMock } from './fetchMocks.js';
import { createMemoryHistory } from 'history';
import ControlPanel from "../components/authentication/ControlPanel";
import AccessForbidden from "../components/static/AccessForbidden";

let wrapper;
let submitButton;

const history = createMemoryHistory();

jest.mock('../auth', () => {
    const { authFetchMock } = require('./fetchMocks');
    return ({
        useAuth: () => [true],
        authFetch: authFetchMock
    })
}
);

function setFormDataAndSubmit(instance, username, role) {
    wrapper.find(ControlPanel).instance().handleHostChange(instance);
    wrapper.find(ControlPanel).instance().setState({ selected: [{ user: username }] })
    wrapper.find(ControlPanel).instance().setState({ role: role })
    submitButton = (wrapper.find('[controlId="user-role-button"]')).find('[type="submit"]').hostNodes();
    submitButton.simulate('submit');
}

beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(fetchMock);
    wrapper = mount(
        <Router history={history}>
            <ControlPanel />
        </Router>
        
    );
});


describe('Control Panel user roles form is valid', () => {
    it.each`
    instance            | username          | role
    ${"local"}          | ${"user1"}        | ${"site-admin"}
    ${"instance2"}      | ${"user2"}        | ${"site-moderator"}
    ${"instance3"}      | ${"user3"}        | ${"Remove-all"}
  `('for input [$instance, $username, $role]', ({ instance, username, role }) => {
        setTimeout(() => {
            try {
                wrapper.update();
                setFormDataAndSubmit(instance, username, role);
                let alert = wrapper.find(Alert)
                expect(alert).toHaveLength(0);
                done();
            } catch (error) {
                done(error);
            }
        }, 1000);
    });
});

describe('Control Panel user roles form is invalid (blank fields)', () => {
    it.each`
    instance            | username     | role
    ${"instance1"}      | ${""}        | ${"site-admin"}
    ${"instance2"}      | ${"user2"}   | ${""}
    ${"instance3"}      | ${""}        | ${""}
  `('for input [$instance, $username, $role]', ({ instance, username, role }) => {
        setTimeout(() => {
            try {
                wrapper.update();
                setFormDataAndSubmit(instance, username, role);
                let alert = wrapper.find(Alert)
                expect(alert).toHaveLength(1);
                expect(alert.containsMatchingElement(<div>Required fields have been left blank.</div>)).toEqual(true);
                done();
            } catch (error) {
                done(error);
            }
        }, 1000);
    });
});

describe('Control Panel user roles form is invalid (user tries to change own role)', () => {
    it.each`
    instance            | username          | role
    ${"instance1"}      | ${"academoo"}     | ${"site-admin"}
  `('for input [$instance, $username, $role]', ({ instance, username, role }) => {
        setTimeout(() => {
            try {
                wrapper.update();
                setFormDataAndSubmit(instance, username, role);
                let alert = wrapper.find(Alert)
                expect(alert).toHaveLength(1);
                expect(alert.containsMatchingElement(<div>You cannot change your own role</div>)).toEqual(true);

                done();
            } catch (error) {
                done(error);
            }
        }, 1000);
    });
});