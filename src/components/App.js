import React, { Component } from 'react';
import Web3 from 'web3';
import logo from '../logo.png';
import './App.css';
import Marketplace from '../abis/Marketplace.json';
import Navbar from './Navbar';
import Main from './Main';
import Loader from './Loader';

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
      this.setState({ marketplace: marketplace });

      // we'll get productCount here and use it to sequentially fetch each product from the blockchain
      const productCount = await marketplace.methods.productCount().call(); // `call` here reads an object from contract
      this.setState({ productCount: productCount });

      // get each product
      for (var i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call();
        this.setState({
          products: [...this.state.products, product]
        });
      }

      // update loading state after initializing marketplace
      this.setState({ loading: false });
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

    // bind createProduct method to react component
    this.createProduct = this.createProduct.bind(this);
  }

  createProduct(name, price) {
    // set loading state
    this.setState({ loading: true });

    // get instance of market from state
    this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account }).once('receipt', (receipt) => {
      console.log(receipt);
      this.setState({ loading: false });
    });
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className='container-fluid mt-5'>
          <div className='row'>
            <main role='main' className='col-lg-12 d-flex'>
              {
                this.state.loading
                  ? <Loader />
                  : <Main
                    products={this.state.products}
                    createProduct={this.createProduct} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
