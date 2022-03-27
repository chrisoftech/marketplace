import React, { Component } from 'react';
import './App.css';

class Loader extends Component {
    render() {
        return (
            <div id='loader' className='text-center'>
                <p className='text-center'>Loading...</p>
            </div>
        );
    }
}

export default Loader;
