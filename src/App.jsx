// todo: changing shade across the page background
// can't change the wave message text after initiated. make clear by locking the input box
// if no wallet connected when wave at me clicked : prompt to connect wallet
// when wallet disconnected app doesn't know or reflect the change unless refreshed/reloaded
// bug : since adding code to getAllWaves and event listener in useEffect to pick up the new wave event, a new wave shows up twice after the wave txn 
// a fixed gas price could be a problem when it's wildly expensive on the test net? can the contact pay the gas for sending the prize? can it be deferred till gas price cheap
// emit win event that the front end listens to and toast message
// move connected wallet address shown on page?
// get number of waves per user and display
// show toast when prize won
// show prizes won total and to whom
// check if still in cooldown period before trying to send wave
// 



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
	const contractAddress = '0x9ce5708623Ad08363E320714D72624E093927eF5';

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
/*
my old code which worked pretty good
        let wavesCleaned = [];
				waves.slice().reverse().forEach(wave => {
					wavesCleaned.push({
						address: wave.waver,
						timestamp: new Date(wave.timestamp * 1000),
						message: wave.message
					});
				});
*/
        /* new version of the above */
        const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });
        //prefer newest messages at the top
        const wavesCleanedReverse = wavesCleaned.slice().reverse();
				/*
         * Store our data in React State
         */
				//setAllWaves(wavesCleaned);
        setAllWaves(wavesCleanedReverse);
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
        
        console.log("calling isInCooldown")
        //if(await wavePortalContract.isInCooldown()){
        const cooldownTimeLeft = await wavePortalContract.getCooldownTimeLeft();
        if(cooldownTimeLeft > 0){
          console.log(`still ${cooldownTimeLeft} seconds cooldown time`);
          toast.warning(`cooldown: you'll have to wait ${cooldownTimeLeft} seconds to wave again`);
          return;
        } else { console.log("wasn't in cooldown");}

        
				let count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());

				/*
        * Execute the actual wave from your smart contract
        */
				//var waveMessage = document.getElementById('waveMessage').value;
        var msgTextbox = document.getElementById('waveMessage');
        msgTextbox.disabled = true;
        var waveMessage = msgTextbox.value;
        console.log("got text value from input: " + waveMessage);
				//const waveTxn = await wavePortalContract.wave(waveMessage);
        const waveTxn = await wavePortalContract.wave(waveMessage, { gasLimit: 3000000 });
        console.log('Mining...', waveTxn.hash);
        toast.info('Mining...', waveTxn.hash);
				await waveTxn.wait();
				console.log('Mined -- ', waveTxn.hash);
        toast.success('Mined -- ', waveTxn.hash);

				count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());
//        await getAllWaves();  // don't need this enymore since add event listener for new wave? new wave added twice with both in
        document.getElementById('waveMessage').value = '';
        
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
      var tmpMsg = requireMessage(error.message);
      if(tmpMsg) {
        console.log(tmpMsg);
        toast.error(tmpMsg);
      } else {
        console.log(error);
        toast.error(error.message);
      }
		}
    msgTextbox.disabled = false;
    setShowSpinner(false);
	};

const requireMessage = msg => {
    // contact require messages with have both start and end sigs
    // if it doesn't have both as expected, return an empty string
    
    var startSig = `message":`;
    var endSig = `",`
    
    var startPos = msg.indexOf(startSig);
    if(startPos < 0) {return null};
    startPos = startPos + startSig.length + 1;  //remove startSig and before text
    msg = msg.substring(startPos);

    var endPos = msg.indexOf(endSig);
    if(endPos < 0){ 
        return null;
    } else {
        msg = msg.substring(0, endPos) //rest of message text upto endSig
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


// runTest
  
  const runTest = async() => {
    console.log("running test");
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

        // looks like new blocks only minted every 15 or 30 seconds on rinkeby
        const result = await wavePortalContract.randomBool();
        //await wavePortalContract.setCooldownPeriod(120);
        toast.info("cooldown period seconds: " + await wavePortalContract.getCooldownPeriod());
        wavePortalContract.randomBoolExternSeed(Math.floor(Math.random() * 10000));
        toast.info("random bool is " + result);
      }
    }
    catch(err) {
        console.log(err.message);
    }
    setShowSpinner(false);
  };

  
  {/* end function playground */}


  
	useEffect(() => {
    // useEffect is called on page render

    console.log("useEffect run");
    
    checkIfWalletIsConnected();

 /**
 * Listen in for emitter events!
 */
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      toast.info("new wave from : " + from);
      setAllWaves(prevState => [
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },...prevState,
      ]);
    };


    const onPrizeWon = (from, timestamp, message) => {
      console.log("Prize Won!", from, timestamp, message);
      toast.info("Prize Won! : " + from);
    };

    // const onError = (err) => {
    //   console.log('error event : ' + err);
    //   toast.error('error : ' + err);
    // }
      
    
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      // subscribe to contract event : contract.on( event , listener ) 
      wavePortalContract.on("NewWave", onNewWave);
      wavePortalContract.on("PrizeWon", onPrizeWon);
//      wavePortalContract.on('error', onError);
      
    }

    // unsubscribe to contract event : contract.off( event , listener ) 
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
        wavePortalContract.off("PrizeWon", onPrizeWon);
//        wavePortalContract.off('error', onError);
      }
    };
  
	}, []);

//#region content
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

        <button className="waveButton" onClick={runTest}>
					runTest
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

//#endregion

export default App;
