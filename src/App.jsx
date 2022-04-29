// todo: changing shade across the page background
// if no wallet connected when wave at me clicked : prompt to connect wallet
// when wallet disconnected app doesn't know or reflect the change unless refreshed/reloaded

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';
import { SpinnerCircular } from 'spinners-react';
import { SpinnerInfinity } from 'spinners-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cardStyle = {
	backgroundColor: '#fff'
};

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');
  const [showSpinner, setShowSpinner] = useState(false);  // not the second bit is the setter. that's just the way it is

	/*
   * All state property to store all waves
   */
	const [allWaves, setAllWaves] = useState([]);
	const contractAddress = '0xBbE43AeeF858C7b7DB6351bc719B9429BB9D72B1';

	/*
   * Create a method that gets all waves from your contract
   */
	const getAllWaves = async () => {
		try {
			setShowSpinner(true);
      const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				/*
         * Call the getAllWaves method from your Smart Contract
         */
				const waves = await wavePortalContract.getAllWaves();

				/*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
				let wavesCleaned = [];
				waves.slice().reverse().forEach(wave => {
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
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
    setShowSpinner(false);
	};

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
      setShowSpinner(true);
			const { ethereum } = window;

      //toast("checking wallet connected");
			if (!ethereum) {
				console.log('Make sure you have metamask!');
				return;
			} else {
				console.log('We have the ethereum object', ethereum);
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
        //toast.info('Found an authorized account:', account);
				setCurrentAccount(account);
				await getAllWaves();
			} else {
				console.log('No authorized account found');
        setCurrentAccount('');
        //toast.error('No authorized account found');
			}
		} catch (error) {
			console.log(error);
		}
    setShowSpinner(false);
	};

	/**
	 * connectWallet
	 */
	const connectWallet = async () => {
		try {
			setShowSpinner(true);
      const { ethereum } = window;

			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			console.log('Connected', accounts[0]);
      toast.info('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);
			await getAllWaves();
		} catch (error) {
			console.log(error);
		}
    setShowSpinner(false);
	};


  /**
	 * wave
	 */
	const wave = async () => {
    try {

      await checkIfWalletIsConnected();
      if(!currentAccount){
            toast.error("You'll need to connect your wallet to wave")
        return;
      };
      
      setShowSpinner(true);      
      
      const { ethereum } = window;
     
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());

				/*
        * Execute the actual wave from your smart contract
        */
				var waveMessage = document.getElementById('waveMessage').value;
				const waveTxn = await wavePortalContract.wave(waveMessage);
        console.log('Mining...', waveTxn.hash);
        toast.info('Mining...', waveTxn.hash);
				await waveTxn.wait();
				console.log('Mined -- ', waveTxn.hash);
        toast.info('Mined -- ', waveTxn.hash);

				count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());
        await getAllWaves();
        document.getElementById('waveMessage').value = '';
        
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
      
      var tmpMsg = requireMessage(error.message);
      if(tmpMsg) {
        console.log(tmpMsg);
        toast.error(tmpMsg);
      }
		}
    setShowSpinner(false);
	};

const requireMessage = msg => {
    // contact require messages with have both start and end sigs
    // if it doesn't have both as expected, return an empty string
    
    var startSig = `message":`;
    var endSig = `",`
    var startPos = msg.indexOf(startSig);

    startPos = startPos + startSig.length + 1;
    msg = msg.substring(startPos);

    var endPos = msg.indexOf(endSig);
    if(endPos < 0){ 
        return null;
    } else {
        msg = msg.substring(0, endPos)
    }
    return msg;
};

  
  {/* function playground - bit of a mess and don't necessarily work */}
  const notify = () => toast("toastMsg");
  const toastMsg = funcMsg => {
      toast(funcMsg);
  };
  const myTestVar = 'test var text';

  const clearTxt = () => {
    toast("clearTxt function fired");
    document.getElementById('waveMessage').value = 'this was set by a function';    
  };
  
  const testInput = () => {
		console.log('button was clicked');
		const waveMessage = document.getElementById('waveMessage').value;

		setTitle(waves.length);
		console.log(`waves count asdf: ${waves.length}`);
		console.log(`allWaves count: ${allWaves.length}`);
		document.getElementById('waveCount2').innerHTML =
			'innerHTML' + waves.length;
		// window.prompt("add message");
		alert(waveMessage);
  };

	const setTitle = inputValue => {
		console.log('setTitle ' + inputValue);
		//alert('setTitle ' + inputValue);

		const lblCount = document.getElementById('waveCount1');
		lblCount.value = '3 by object';
	};

  {/* end function playground */}


  
	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">👋 Hey there!</div>
        
        <ToastContainer />        {/* has to go somewhere on the page even though it doesn't show */}
				
        <div className="bio">
					I am following this tutorial to learn about blockchain, developing
					smart contracts, and web3 but have spent more time wrestling with my new friend react
				</div>

        <div className="box">
          <div>
            <SpinnerInfinity className="spinner" enabled={showSpinner} thickness="150" size="100%" color="navy" />
            {/* showSpinner */}
          </div>
        </div>

				<input type="text" id="waveMessage" className="wave-message"
					placeholder="type your message here ..."
    		/>
        
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
						<div
							key={index}
							style={{
								backgroundColor: 'OldLace',
								marginTop: '16px',
								padding: '8px',
								border: '2px solid lightgray',
								borderRadius: '10px'
							}}
						>
							<div>Message: {wave.message}</div>
							<div>Time: {wave.timestamp.toString()}</div>
              <div>Address: {wave.address}</div>
						</div>
					);
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
};

export default App;
