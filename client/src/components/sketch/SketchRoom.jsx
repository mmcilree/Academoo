import React from 'react';
import Whiteboard from './Whiteboard';
import { authFetch } from '../../auth';
import logo from "../../images/logo.svg";
import {Card, Spinner} from "react-bootstrap";

import io from "socket.io-client";

let socket = io.connect();



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