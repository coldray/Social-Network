import React from 'react';
import Navibar from '../Navbar/Navbar';
import Tabbar from '../TabBar/Tabbar';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <div>
        <Navibar/>
          <Tabbar/>
      </div>
    );
  }
}

export default App;
