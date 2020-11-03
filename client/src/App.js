import React from 'react';
import PostCreator from './components/PostCreator';
import HeaderBar from './components/HeaderBar';
import Welcome from './components/Welcome';

class App extends React.Component {
  render() {
    return (
      <div>
        <header>
          <HeaderBar />
        </header>
        <div class="container" >
          <PostCreator />
        </div>
      </div>
    );
  }
}

export default App;
