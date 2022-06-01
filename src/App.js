import './App.css';
import HomePage from './pages/homepage/new_homepage';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js';

function App() {
  //return statement
  return (
    <>
      <div className="App">
        <div>
            <HomePage/>
        </div>
      </div>
    </>
  );
}


export default App;
