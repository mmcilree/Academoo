import React from 'react';
import Create from './components/create';
import Header from './components/header';
import Welcome from './components/welcome';

class App extends React.Component {
  render() {
    return (
      <div>
        <header>
          <Header />
        </header>
        <div class="container">
          <Welcome />
        </div>
      </div>
    );
  }
}

export default App;
