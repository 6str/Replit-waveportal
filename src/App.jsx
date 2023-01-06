// things added
// restyled
// spinner
// toast notifications
// cooldown and prize stretch objectives
// disable input textbox once transaction on the go

// todo: changing shade across the page background
// if no wallet connected when wave at me clicked : prompt to connect wallet
// refresh page on metamask account and network changes
// 

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';
import { SpinnerCircular } from 'spinners-react';
import { SpinnerInfinity } from 'spinners-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// const cardStyle = {
// 	backgroundColor: '#fff'
// };

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');
  const [showSpinner, setShowSpinner] = useState(false);
  /*
   * A state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([]);
	
	
	const contractAddress = '0x4CE4338cA6bb036b959f2287d272bc1291445263';
  
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
        const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });
        
        // i prefer newest messages at the top so flipped it
        const wavesCleanedReverse = wavesCleaned.reverse();
				/*
         * Store our data in React State
         */
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
	/**
	 * Create a variable here that references the abi content!
	 */
	const contractABI = abi.abi;

	const checkIfWalletIsConnected = async () => {
		try {
      setShowSpinner(true);
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Make sure you have metamask!');
        setShowSpinner(false);				
        return;
			} else {
				console.log('We have the ethereum object', ethereum);
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
				setCurrentAccount(account);
				await getAllWaves();
			} else {
				console.log('No authorized account found');
        toast.error('No authorized account found');
        setCurrentAccount('');
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
        setShowSpinner(false);
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

      setShowSpinner(true);

      if(!currentAccount){
        toast.error("You'll need to connect your wallet to wave and view messages")
        setShowSpinner(false);
        return;
      };
     
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
        
        const cooldownTimeLeft = await wavePortalContract.getCooldownTimeLeft();
        if(cooldownTimeLeft > 0){
          console.log(`still ${cooldownTimeLeft} seconds cooldown time`);
          toast.warning(`cooldown: you'll have to wait ${cooldownTimeLeft} seconds to wave again`);
          setShowSpinner(false);
          return;
        } else { console.log("wasn't in cooldown");}

        
				let count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());

				/*
        * Execute the actual wave from your smart contract
        */
        var msgTextbox = document.getElementById('waveMessage');
        msgTextbox.disabled = true;
        var waveMessage = msgTextbox.value;
        console.log("msg from input: " + waveMessage);

        const waveTxn = await wavePortalContract.wave(waveMessage, { gasLimit: 3000000 });
        console.log('Mining...', waveTxn.hash);
        toast.info('Mining...', waveTxn.hash);
				await waveTxn.wait();
				console.log('Mined -- ', waveTxn.hash);
        toast.success('Mined -- ', waveTxn.hash);

				count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());

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


  // get the current user's wave count
  const getUserCount = (waves) => {
    return waves.filter(
      wave => currentAccount.toLowerCase() === 
        wave.address.toLowerCase()
    ).length
  }
  
  const requireMessage = msg => {
    // if error message is from a solidity require statement it will have both start and end sigs
    // if found, extract just the require message part, else return empty string
      
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

 
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      // subscribe to contract event : contract.on( event , listener ) 
      wavePortalContract.on("NewWave", onNewWave);
      wavePortalContract.on("PrizeWon", onPrizeWon);
    }

    // unsubscribe to contract event : contract.off( event , listener ) 
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
        wavePortalContract.off("PrizeWon", onPrizeWon);
      }
    };
	}, []);


	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">
          <span className="waveIcon">👋</span> Hey there!
        </div>        

        <ToastContainer /> {/* doesn't show but has to go on the page somewhere */}
				
        <div className="bio">
					Connect your wallet on the mumbai testnet and send a wave message
				</div>

        <div className="box">
          <div>
            <SpinnerInfinity className="spinner" enabled={showSpinner} color="whitesmoke" secondaryColor="darkgreen" thickness="150"  size="100%" />
          </div>
        </div>

				<input type="text" id="waveMessage" className="message-input"
					placeholder="type your message here ..." 
    		/>
        
        <div className="buttonsContainer">
  				<div className="btns-left">
            {/* If no wallet/account show connect button; else address */}
              {!currentAccount ? (
    					<button className="cta-button" onClick={connectWallet}>
    						Connect Wallet
    					</button>
    				) : (
                <div className="walletAddress">Wallet: {currentAccount.slice(0,5) + '..' + currentAccount.slice(-6)}</div>      
            )}
          </div>
          <div className="btns-right">
            <button className="cta-button" onClick={wave}>
    					Send a Wave
    				</button>
          </div>
        </div>


        {currentAccount && (
          <div className="waveCount">
            <label>{`Wave Count: ${allWaves.length}`}</label>
            <label>{`Your Waves: ${getUserCount(allWaves)}`}</label>
          </div>
        )}

        {/* wave messages */}
				{allWaves.map((wave, index) => {
					return (
						<div className="messages"	key={index}>
							<div>Message: {wave.message}</div>
							<div>Time: {wave.timestamp.toString()}</div>
              <div>Address: {wave.address}</div>
						</div>
					);
				})}

        {currentAccount && ( 
          <div className="messages-foot"></div> 
        )}
			
      </div>
		</div>
	);
};

export default App;
