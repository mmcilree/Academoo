import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount, dive } from "enzyme";
import { Router, Route, Switch } from "react-router-dom";
import { createMemoryHistory } from 'history';
import { Alert } from 'react-bootstrap'
import CommunityCreator from "../components/community/CommunityCreator";
import { fetchMock } from './fetchMocks.js';

let wrapper;
let titleField;
let idField;
let descriptionField;
let submitButton;
let communityCreator;

const history = createMemoryHistory();
jest.mock('../auth', () => {
    const { authFetchMock } = require('./fetchMocks');
    return ({
        useAuth: () => [true],
        authFetch: authFetchMock
    })
}
);

function setFormDataAndSubmit(title, id, description) {
    titleField.simulate('change', { target: { name: "title", value: title } })
    idField.simulate('change', { target: { name: "id", value: id } })
    descriptionField.simulate('change', { target: { name: "description", value: description } })
    submitButton.simulate('submit');
}

beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(fetchMock);
    history.push('/create-community')
    wrapper = mount(
        <Router history={history}>
            <CommunityCreator />
        </Router>
    );


    titleField = wrapper.find('[name="title"]').hostNodes();
    idField = wrapper.find('[name="id"]').hostNodes();
    descriptionField = wrapper.find('[name="description"]').hostNodes();
    submitButton = wrapper.find('[type="submit"]').hostNodes();
    communityCreator = wrapper.find(CommunityCreator);
});

describe('CommunityCreator form is valid', () => {
    it.each`
    title                | id               | description
    ${"cow community"}  | ${"cowcommunity"} | ${"Here is a description!"}
    ${"community1"}     | ${"community1"}   | ${"community 1 is the best"}
    ${"My Community"}   | ${"MyCommunity"}  | ${"Community desc \n hello world"}
    ${"aaa"}            | ${"bbb"}          | ${""}
  `('for input [$title, $id, $description]', ({ title, id, description }) => {
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

describe('CommunityCreator form is invalid (blank title & id fields)', () => {
    it.each`
    title                | id               | description
    ${""}               | ${"cowcommunity"} | ${"Here is a description!"}
    ${"community1"}     | ${""}             | ${"community 1 is the best"}
    ${""}               | ${""}             | ${"Community desc \n hello world"}
  `('for input [$title, $id, $description]', ({ title, id, description }) => {
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

describe('CommunityCreator form is invalid (duplicate community id)', () => {
    it.each`
    title               | id              | description
    ${"cow community"}  | ${"community1"} | ${"Here is a description!"}
    ${"community2"}     | ${"community2"} | ${"community 1 is the best"}
  `('for input [$title, $id, $description]', ({ title, id, description }) => {
        setTimeout(() => {
            try {
                wrapper.update();
                setFormDataAndSubmit(instance, username, role);
                let alert = wrapper.find(Alert)
                expect(alert).toHaveLength(1);
                expect(alert.containsMatchingElement(<div>A community already exists with that ID. Please modify it.</div>)).toEqual(true);
                done();
            } catch (error) {
                done(error);
            }
        }, 1000);
    });
});