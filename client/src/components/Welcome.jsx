import React from 'react';
import Card from 'react-bootstrap/Card';

class Welcome extends React.Component {
    render() {
        return (
            <Card>
                <div className="container">
                    <h1>Welcome to Academoo!</h1>
                    <p>There's not much here yet... </p>
                </div>
            </Card>
        );
    }
}

export default Welcome;