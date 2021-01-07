import React from "react";
import App from "../App.js";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { MemoryRouter as Router } from 'react-router-dom';
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";

import PostCreator from '../components/PostCreator';

function loginTestUser() {
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            username: "academoo",
            password: "academoo3test",
          }
        )
      });
}

it("Mounts PostCreator", () => {
    loginTestUser();
    const wrapper = shallow(
        <Router>
            <PostCreator />
        </Router>
    );
    console.log(wrapper.html());
    //wrapper.find('[name="title"]').simulate('change', { target: { value: 'Hello' } })
});