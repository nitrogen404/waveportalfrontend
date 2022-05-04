import React, { useEffect, useState } from 'react';
import './App.css';
import abi from './utils/waveportal.json';
import { ethers } from 'ethers';

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');
	const [allWaves, setAllWaves] = useState([]);
	const contractAddress = '0x675fb831C38002bdA66560D10Bc78a1f80FCda32'; // redeployed contract with updated address and abi file
	const contractABI = abi.abi;

	const ifEthWalletConnected = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) {
				console.log('Make sure you have metamask!');
				return;
			} else {
				console.log('We have the ethereum object', ethereum);
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' });
			console.log("Accounts: ", accounts);
			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
				setCurrentAccount(account);
                getAllWaves();
				
			} else {
				console.log('No authorized account found');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}
			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});
			console.log(accounts);
			console.log('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const wave = async () => {
		try {
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
				const waveTxn = await wavePortalContract.wave("Heyy!!");
				console.log('Mining...', waveTxn.hash);

				await waveTxn.wait();
				console.log('Mined....', waveTxn.hash);

				count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getAllWaves = async () => {
        try {
          const { ethereum } = window;
          if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    
            const waves = await wavePortalContract.getAllWaves();
            let wavesCleaned = [];
            waves.forEach(wave => {
              wavesCleaned.push({
                address: wave.waver,
                timestamp: new Date(wave.timestamp * 1000),
                message: wave.message
              });
            });
            setAllWaves(wavesCleaned);
          } else {
                console.log("Ethereum object doesn't exist!")
          }
        } catch (error) {
              console.log(error);
        }
    }

	useEffect(() => {
		ifEthWalletConnected();
	}, []);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">👋 Hey there!</div>
				<div className="bio">
					I'm Chan, CompSci Student. Currently I'm exploring the world of
					blockchain. Enjoying it :D
				</div>
				<button className="waveButton" onClick={wave}>
					Wave At ME!!
				</button>
				{!currentAccount && (
					<button className="waveButton" onClick={connectWallet}>
						Connect Wallet
					</button>
				)}
				{allWaves.map((wave, index) => {
					return (
						<div
							key={index}
							style={{
								backgroundColor: 'OldLace',
								marginTop: '16px',
								padding: '12px'
							}}
						>
							<div>Address: {wave.address}</div>
							<div>Time: {wave.timestamp.toString()}</div>
							<div>Message: {wave.message}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default App;
