import React from 'react';
import Whiteboard from './Whiteboard';

class SketchRoom extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            code: this.props.match.params.id
        }
    }
    render() {
        console.log(this.state.code);

        return <Whiteboard />
    }
}

export default SketchRoom;