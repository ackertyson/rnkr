import * as React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Consumer from './Consumer';
import Producer from './Producer';

function App() {
  return (
    <div className="App">
      <Router>
        <header className="App-header">
          <ul>
            <li>
              <Link to="/consumer">Consumer</Link>
            </li>
            <li>
              <Link to="/producer">Producer</Link>
            </li>
          </ul>
        </header>
        <Route exact path="/" component={Producer}/>
        <Route path="/consumer" component={Consumer}/>
        <Route path="/producer" component={Producer}/>
      </Router>
    </div>
  );
}

export default App;
