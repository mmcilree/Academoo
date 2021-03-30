import React from 'react';
import Whiteboard from './Whiteboard';
import { authFetch } from '../../auth';

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
        }   
    }

    async fetchUserDetails() {
        await authFetch("/api/get-user").then(response => response.json())
            .then(data => {
                this.setState({
                    user: data.id,
                })
                socket.emit("join", {user: this.state.user, room: this.state.code});
            }
            ).catch(() => {})   
    }

    
    sendUpdate(jsonValue) {
        socket.emit("message", {message: jsonValue, room: this.state.code});
    }

    componentDidMount() {
        this.fetchUserDetails();
        socket.on("message", msg => {
            this.handleMessage(msg);
        });
    }

    handleMessage(msg) {
        if(typeof msg === 'object') {
            this.setState( {
                whiteboardJSON: msg
            })
        } else {
            console.log(msg);
        }
    }
    componentWillUnmount() {
        socket.emit("leave", {user: this.state.user, room: this.state.code});
    }


    render() {
        return <Whiteboard sendUpdate={this.sendUpdate.bind(this)} jsonValue={this.state.whiteboardJSON}/>
    }
}

export default SketchRoom;