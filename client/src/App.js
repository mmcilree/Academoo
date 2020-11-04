import React from 'react';
import PostCreator from './components/PostCreator';
import HeaderBar from './components/HeaderBar';
import Welcome from './components/Welcome';

class App extends React.Component {
  render() {
    return (
      <div>
        <header>
        </header>
        <div class="container" >
          <Welcome />
        </div>
      </div>
    );
  }
}

export default App;
