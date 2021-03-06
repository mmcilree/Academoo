import React, { Component } from "react";
import { Form, FormControl, Button, InputGroup } from "react-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Image from "react-bootstrap/Image";
import { logout, useAuth, authFetch } from "../../auth";
import logo from "../../images/logo.svg";
// import logo from "../images/logo.png";
import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";


import {
  PlusCircle,
  PersonCircle,
  Gear,
  Tools,
  BoxArrowRight,
  QuestionCircle,
  Pencil,
  Search
} from "react-bootstrap-icons";

import { Link } from "react-router-dom";
var md5 = require("md5"); //hash used by gravatar for email associated with profile picture 

/* HeaderBar component is the main navigation bar that appears on every page. */
function HeaderBar() {

  const [logged] = useAuth();
  const [instances, setInstances] = useState(null);
  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [hasSiteRole, setHasSiteRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState("");
  let history = useHistory();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/get-instances");
      res.json().then(res => setInstances(["local", ...res]));

      logged && authFetch("/api/get-user").then(response => response.json())
        .then(data => {
          if (data.status_code !== 401) {
            setEmail(md5(data.email));
            setUsername(data.id);
            setHasSiteRole(data.site_roles != null ? (data.site_roles.split(",").includes("site-admin") || data.site_roles.split(",").includes("site-moderator")) : false)
            setIsLoading(false)
          } else {
            console.log(data.status_code);
            logout();
          }
        }
        ).catch(() => { })
    }

    fetchData();
  }, []);

  //Returns JSX for a navbar component with links to pages in the site 
  return (
    <Navbar bg="primary" variant="dark" expand="lg" {...(!logged ? { className: 'justify-content-center' } : {})}>
      <Navbar.Brand as={Link} to="/">
        <img
          alt=""
          src={logo}
          width="70"
          height="70"
          className="d-inline-block align-center"
        />{" "}
        Academoo
      </Navbar.Brand>

      {logged && !isLoading && (
        <React.Fragment>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link as={Link} to="/moosfeed">
                Moosfeed
              </Nav.Link>
              <Nav.Link as={Link} to="/communities">
                Commoonities
              </Nav.Link>
              <Nav.Link as={Link} to="/create-post">
                <PlusCircle className="mb-1" />
                <span> New Moo</span>
              </Nav.Link>
              <Nav.Link as={Link} to="/sketchamoo">
                <Pencil className="mb-1" />
                <span> Sketch-A-Moo!</span>
              </Nav.Link>
            </Nav>

            <Nav>

              <Form inline onSubmit={(e) => {
                // e.preventDefault();
                history.push('/search/' + query);
              }} className="mr-sm-2">
                <InputGroup>
                  <FormControl className="border-secondary" type="text" placeholder="Search posts" value={query} onChange={e => setQuery(e.target.value)} />
                  <InputGroup.Append>
                    <Button variant="secondary" type="submit"><Search /></Button>
                  </InputGroup.Append>
                </InputGroup>

              </Form>

              <DropdownButton
                variant="outline-light"
                title={
                  <span>
                    <Image
                      className="mr-3"
                      src={"https://en.gravatar.com/avatar/" + email + "?d=wavatar"}
                      roundedCircle
                      width="25"
                      height="25"
                    ></Image>
                    {username}
                  </span>
                }
                id="collasible-nav-dropdown"
                alignRight
                className="p0"
              >
                <NavDropdown.Item as={Link} to={"/user-profile/" + username}>
                  <PersonCircle /> Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/user-settings">
                  <Gear /> Settings
                </NavDropdown.Item>

                <NavDropdown.Divider />
                {hasSiteRole &&
                  <NavDropdown.Item as={Link} to="/control-panel">
                    <Tools /> Control Panel
                  </NavDropdown.Item>
                }
                <NavDropdown.Item as={Link} to="/help">
                  <QuestionCircle /> Help
                </NavDropdown.Item>
                <NavDropdown.Item onClick={logout}>
                  <BoxArrowRight /> Log Out{" "}
                </NavDropdown.Item>
              </DropdownButton>
            </Nav>
          </Navbar.Collapse>
        </React.Fragment>
      )}

    </Navbar>
  )
}

export default HeaderBar;
