import * as React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Consumer from './Consumer';
import Producer from './Producer';

function App() {
  return (
    <div className="App">
      <h1 className="page-header">Rnkr</h1>
      <Router>
        {/* <header className="App-header">
          <ul>
            <li>
              <Link to="/producer">Moderator</Link>
            </li>
            <li>
              <Link to="/consumer">Voter</Link>
            </li>
          </ul>
        </header> */}
        <div className="main">
          <Route exact path="/" component={Consumer}/>
          <Route path="/voter" component={Consumer}/>
          <Route path="/moderator" component={Producer}/>
        </div>
      </Router>
    </div>
  );
}

export default App;
