import React, { Component } from 'react';
import Web3 from 'web3';
import logo from '../logo.png';
import './App.css';
import Marketplace from '../abis/Marketplace.json';

class App extends Component {

  async componentDidMount() {
    // initialize connection to meta-mask with web3
    await this.initializeWeb3();
    await this.loadBlockchainData();
  }

  async initializeWeb3() {
    // modern dapp browsers
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);

      try {
        // request account access if needed
        await window.ethereum.enable();
      } catch (e) {
        window.alert('User denied account access');
      }
    }
    // legacy dapp browsers
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    // non-dapp browsers
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    // load wallet accounts
    const accounts = await web3.eth.getAccounts();

    // get active account from accounts and save state
    this.setState({ account: accounts[0] });

    // dynamically get network-id
    const networkId = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkId];

    // initialize marketplace contract
    if (networkData) {
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address);
      console.log(marketplace);
    } else {
      window.alert('Marketplace contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true,
    };
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dapp University's Blockchain Marketplace
          </a>
          <ul className='navbar-nav px-3'>
            <li className='nav-item text-nowrap d-none d-sm-none d-sm-block'>
              <small className='text-white'><span id='account'>{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={logo} className="App-logo" alt="logo" />
                </a>
                <h1>Dapp University Starter Kit</h1>
                <p>
                  Edit <code>src/components/App.js</code> and save to reload.
                </p>
                <a
                  className="App-link"
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LEARN BLOCKCHAIN <u><b>NOW! </b></u>
                </a>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
