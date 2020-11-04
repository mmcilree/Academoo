import React from "react";
import Card from "react-bootstrap/Card";
export default function Welcome() {
  return (
    <Card className="mt-4">
      <Card.Body>
        <div className="container-md">
          <h1>Welcome to Academoo!</h1>
          <p>There's not much here yet...</p>
        </div>
      </Card.Body>
    </Card>
  );
}
