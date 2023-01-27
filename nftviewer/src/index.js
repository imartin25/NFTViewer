import ReactDOM from 'react-dom/client';
import React from 'react';
const Web3 = require('web3');

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentWeb3: "",
      input: "",
      NFTS: []
    }
    this.connect = this.connect.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.display = this.display.bind(this)
  }
  // Connects to Ethereum wallet
  async connect(event) {
    let web3 = {}
    try {
      web3 = await getWeb3() // Attempts to get Web3 instance
    } catch (error) {
      console.log(error)
    }
    this.setState({
      currentWeb3: web3 // Sets the state of currentWeb3 to the Web3 instance
    })
    let acc = await web3.eth.getAccounts() // Gets the accounts associated with the wallet
    console.log("Connected succesfully to account : " + acc[0])
  }

  // Handles changes to the input field
  handleChange(event) {
    this.setState({ input: event.target.value }) // Sets the state of input to the value of the text field
  }

  // Displays NFTs
  async display(event) {
    let regex = /^0x[a-fA-F0-9]{40}$/g // Defines the regular expression for the wallet address
    if (regex.test(this.state.input)) { // Tests the input against the regular expression
      let ownedNfts = []
      let contract = await getContract(this.state.currentWeb3) // Gets the contract associated with the Web3 instance
      await contract.methods.walletOfOwner(this.state.input).call().then(result => ownedNfts = [...result]) // Gets the NFTs associated with the wallet address
      let videosArray = await getVideos(ownedNfts) // Gets the videos associated with the NFTs
      this.setState({
        NFTS: videosArray // Sets the state of NFTS to the videos array
      })
    } else {
      alert("Please introduce a valid wallet address.")
    }
  }

  render() {
    const items = this.state.NFTS.map(i => {
      return <li id="NFT" key={i[0]}> NFT id #{i[0]}: <video id="video" autoPlay loop height={300} width={300} src={i[1]} ></video></li>
    })
    return (
      <div id="App">
        <div id="header">
          <h1 id="header-element">GOE Genesis NFT Viewer</h1>
          <button id="header-element" onClick={this.connect}>Connect</button>
        </div>
        <div id="main">
          <label id="main-element">Display NFTs of wallet:</label>
          <input id="main-element" style={{ width: 350 }} type="text" value={this.state.input} onChange={this.handleChange} placeholder="0x586dAE24dd99ac8a240Cc475b052a9F737808073"></input>
          <button id="main-element" onClick={this.display}>Display</button>
        </div>
        <div id="nfts">
          <ul id="nfts-list">{items}</ul>
        </div>
      </div>
    )
  }
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

const getWeb3 = async () => {
  return new Promise(async (resolve, reject) => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum)
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        resolve(web3)
      } catch (error) {
        reject(error)
      }
    }
  })
}

const getContract = async (web3) => {
  const endpoint = new URL("https://api.etherscan.io/api?module=contract&action=getabi&address=0x586dAE24dd99ac8a240Cc475b052a9F737808073&apikey=B72WMU7WX6363CN7R7F3BTCRNPDQ9JM7BH")
  let abi = {}
  await fetch(endpoint).then(res => res.json()).then(res => abi = res.result)
  const contract = new web3.eth.Contract(JSON.parse(abi), "0x586dAE24dd99ac8a240Cc475b052a9F737808073")
  return contract
}

const getVideos = async (NFTS) => {
  let videosArray = []
  for (let i of NFTS) {
    let url = "https://api.aethergames.io/get/metadata/" + i + ".json";
    await fetch(url).then(res => res.json()).then(res => videosArray.push([i, res.video]))
  }
  return videosArray
}