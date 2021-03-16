import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import Image from "react-bootstrap/Image";
import { logout, useAuth, authFetch } from "../../auth";
import defaultProfile from "../../images/default_profile.png";
import logo from "../../images/logo.svg";
// import logo from "../images/logo.png";
import { useState, useEffect, useContext } from "react";


import {
  PlusCircle,
  PersonCircle,
  Gear,
  Tools,
  BoxArrowRight,
  QuestionCircle,
  Pencil
} from "react-bootstrap-icons";

import { Link } from "react-router-dom";
var md5 = require("md5");

function HeaderBar() {

  const [logged] = useAuth();
  const [instances, setInstances] = useState(null);
  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [hasSiteRole, setHasSiteRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true)


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
        )
    }

    fetchData();
  }, []);


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

              <DropdownButton
                // as={Link}
                // to="/user-profile"
                variant="outline-light"
                title={
                  <span>
                    <Image
                      className="mr-3"
                      src={"https://en.gravatar.com/avatar/" + email}
                      roundedCircle
                      width="25"
                      height="25"
                    ></Image>
                    Yoo
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
