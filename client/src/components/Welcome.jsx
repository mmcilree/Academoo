import React from 'react';
import Card from 'react-bootstrap/Card';
import axios from 'axios';

class Welcome extends React.Component {
    state = {
        message: ""
    }
    componentDidMount() {
        axios.get('https://nnv2.host.cs.st-andrews.ac.uk/fed/')
            .then(res => {
                const message = res.data;
                this.setState({ message: message });
            })
        console.log(this.state.message);
    }

    render() {
        return (
            <Card>
                <div className="container">
                    <h1>Welcome to Academoo!</h1>
                    <p>{this.state.message}</p>
                </div>
            </Card>
        );
    }
}

export default Welcome;