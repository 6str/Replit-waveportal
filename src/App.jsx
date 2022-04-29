// todo: clear message box after successful wave

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";



const cardStyle = {
    backgroundColor: "#fff"
}

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [progress, setProgress] = useState(0)
  
  /*
   * All state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0xB49b43fBfC96192C3a2dC81Eb7545304454DdF38";


  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
       

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });


        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  
  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  //const contractAddress = "0xB49b43fBfC96192C3a2dC81Eb7545304454DdF38";
    /**
   * Create a variable here that references the abi content!
   */
  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      document.body.style.cursor = 'wait'
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      getAllWaves();
    } catch (error) {
      console.log(error)
    }
    document.body.style.cursor = 'default'
  }

const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        var userMessage = document.getElementById('userMessage').value;
        const waveTxn = await wavePortalContract.wave(userMessage);
        console.log("Mining...", waveTxn.hash);
        document.body.style.cursor = 'wait'
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
    document.body.style.cursor = 'default'
  }

  const myTestVar = "test var text";
  const testInput = () => {
    console.log('button was clicked');
    const userMessage = document.getElementById('userMessage').value;

        setTitle(waves.length);
        console.log(`waves count asdf: ${waves.length}`);
        console.log(`allWaves count: ${allWaves.length}`);
        document.getElementById('waveCount2').innerHTML = 'innerHTML' + waves.length;
    
        // window.prompt("add message");
        alert(userMessage);
  }

  const setTitle = (inputValue) => {
    console.log('setTitle ' + inputValue);
    //alert('setTitle ' + inputValue);

    const lblCount = document.getElementById('waveCount1');
    lblCount.value = "3 by object";
  }
  
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          I am following this tutorial to learn about blockchain, developing smart contracts, and web3
        </div>


        <input type="text" id="userMessage" className="user-message" placeholder="type your message here ..."/>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
       
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}


        {currentAccount && (
          <div className="waveCount">
            <label id="waveCount3">{`Wave Count: ${allWaves.length}`}</label>
          </div>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px", 
                                     border: "2px solid lightgray", borderRadius: "10px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
        

        
        <div className="info">
          <div className="contractAddress">
              {`Contract Address: ${contractAddress} `}
          </div>
  
          {/*
          * If there is a currentAccount show the current connect wallet address
          */}
          {currentAccount ? (
              <div className="contractAddress">
                {`Connected Account: ${currentAccount}`} 
              </div>
          ) : ( 
              <div className="contractAddress">
                {'Connect your wallet to see messages'} 
              </div>
          )}
        </div> 
      </div>
    </div>
  );
}

export default App