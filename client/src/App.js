import React from 'react';
import Create from './components/create';
import Header from './components/header';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Header />
        </header>
        <Create />
      </div>
    );
  }
}

export default App;
