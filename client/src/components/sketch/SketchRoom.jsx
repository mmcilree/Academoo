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

    getUpdates() {
        
    }

    componentDidMount() {
        this.fetchUserDetails();
        socket.on("message", msg => console.log(msg));
    }

    componentWillUnmount() {
        socket.emit("leave", {user: this.state.user, room: this.state.code});
    }


    render() {
        return <Whiteboard />
    }
}

export default SketchRoom;