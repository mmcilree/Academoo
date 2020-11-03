import React from 'react';
import { shallow, mount } from "enzyme";
import PostCreator from './PostCreator';

it("renders without crashing", () => {
  shallow(<PostCreator />);
});