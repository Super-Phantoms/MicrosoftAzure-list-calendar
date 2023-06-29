import React from 'react';
import App, { Definition, ProxyPayload } from './App';
import { generateClass } from 'wp-webcomponent';
import './index.css';

const ThemeProvider = ({children}) => {
  return <React.Fragment>
    {children}
  </React.Fragment>
}

const context = generateClass(ThemeProvider, App, Definition, ProxyPayload)

customElements.define('wp-calender-list', context.instance);
