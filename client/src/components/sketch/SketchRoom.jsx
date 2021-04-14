import React from 'react';
import Whiteboard from './Whiteboard';
import { authFetch } from '../../auth';
import logo from "../../images/logo.svg";
import { Card, Spinner } from "react-bootstrap";

import io from "socket.io-client";

const socket = io();

/* Sketch Room handles the client-side communication with the Socket.io server
    - A room is created for a whiteboard and users can join with a 4 digit room code */
class SketchRoom extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            code: this.props.match.params.id,
            user: "",
            messages: [],
            whiteboardJSON: {},
            receivedJson: false,
            joinMsg: "",
            ready: this.props.location && this.props.location.state ?
                this.props.location.state.ready : false,
        }
        console.log("ready: " + this.state.ready);
    }

    //Sends a message to server requesting to join a room with the given code
    async fetchUserDetails() {
        await authFetch("/api/get-user").then(response => response.json())
            .then(data => {
                this.setState({
                    user: data.id,
                })
                socket.emit("join", { user: this.state.user, room: this.state.code });
            }
            ).catch(() => { })
    }

    //sends an updated Json board state to other users in the room
    sendUpdate(jsonValue) {

        if (this.state.ready) {
            console.log("new json whiteboard sent")
            socket.emit("message", { message: jsonValue, room: this.state.code });
        }
    }

    onSketchChange(jsonValue) {
        this.setState({
            whiteboardJSON: jsonValue,
            receivedJson: true
        })
        this.sendUpdate(jsonValue);
    }

    //sets the json board state with updates received from room
    setReceivedJson() {
        this.setState({
            receivedJson: false,
        })
    }

    componentDidMount() {
        this.fetchUserDetails();
        socket.on("message", msg => {
            this.handleMessage(msg);
        });
    }

    //Handles receiving a join message or whiteboard update message
    handleMessage(msg) {
        if (typeof msg === 'object') {
            console.log("Whiteboard object received")
            this.setState({
                whiteboardJSON: msg,
                receivedJson: true,
                ready: true,
            })
        } else {
            this.setState({
                joinMsg: msg,
            })
        }
    }

    //Removes user from a room 
    componentWillUnmount() {
        socket.emit("leave", { user: this.state.user, room: this.state.code });
    }

    render() {
        return this.state.ready ?
            <Whiteboard history={this.props.history} code={this.state.code} onSketchChange={this.onSketchChange.bind(this)} receivedJson={this.state.receivedJson} setReceivedJson={this.setReceivedJson.bind(this)} jsonValue={this.state.whiteboardJSON} joinMsg={this.state.joinMsg} />
            : <Card className="mt-3">
                <Card.Body>
                    <h1 className="mt-3">
                        <Spinner animation="border" role="status" variant="light">
                            <img src={logo} width="40" height="40"></img></Spinner> Waiting to join Sketchamoo Room...</h1>
                </Card.Body>
            </Card>
    }
}

export default SketchRoom;