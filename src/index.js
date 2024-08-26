import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Get the target container
const rootElement = document.getElementById('root');
console.log(rootElement)

if (rootElement) {
  // Render the app
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    rootElement
  );
} else {
  console.error('Target container is not a DOM element.');
}
