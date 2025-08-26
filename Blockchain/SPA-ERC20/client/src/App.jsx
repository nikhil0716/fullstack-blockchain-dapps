import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CHAIN_ID } from "./config";
import abiJson from "./abi/MyToken.json";
import PropsCard from "./components/PropsCard.jsx";
import WalletInfo from "./components/WalletInfo.jsx";
import TokenActions from "./components/TokenActions.jsx";
import EventsFeed from "./components/EventsFeed.jsx";

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [address, setAddress] = useState("");
  const [ethBalance, setEthBalance] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(18);
  const [totalSupply, setTotalSupply] = useState("");

  const [events, setEvents] = useState([]);
  const [lastTxReport, setLastTxReport] = useState(null);

  useEffect(() => {
    if (!window.ethereum) return;
    const _provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(_provider);
  }, []);

  async function connect() {
    if (!provider) return;
    await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== CHAIN_ID) {
      alert(`Please switch MetaMask to Hardhat localhost (chainId ${CHAIN_ID})`);
      return;
    }
    const _signer = await provider.getSigner();
    setSigner(_signer);
    const addr = await _signer.getAddress();
    setAddress(addr);

    const _contract = new ethers.Contract(CONTRACT_ADDRESS, abiJson.abi, _signer);
    setContract(_contract);

    await loadTokenProps(_contract);
    await refreshBalances(addr, _contract);
  }

  async function refreshBalances(addr, _contract) {
    const eth = await provider.getBalance(addr);
    const dec = await _contract.decimals();
    const bal = await _contract.balanceOf(addr);
    setEthBalance(ethers.formatEther(eth));
    setTokenBalance(ethers.formatUnits(bal, dec));
  }

  async function loadTokenProps(_contract) {
    const [n, s, d, ts] = await Promise.all([
      _contract.name(),
      _contract.symbol(),
      _contract.decimals(),
      _contract.totalSupply()
    ]);
    setName(n); setSymbol(s); setDecimals(Number(d));
    setTotalSupply(ethers.formatUnits(ts, d));
  }

  useEffect(() => {
    if (!signer || !contract || !provider) return;
    const onTransfer = async (from, to, value) => {
      const d = await contract.decimals();
      const valStr = ethers.formatUnits(value, d);
      setEvents(prev => [`Transfer: ${from} → ${to} (${valStr})`, ...prev].slice(0, 50));

      const me = address || (await signer.getAddress());
      if (from.toLowerCase() === me.toLowerCase() || to.toLowerCase() === me.toLowerCase()) {
        await refreshBalances(me, contract);
      }
    };
    contract.on("Transfer", onTransfer);
    return () => contract.off("Transfer", onTransfer);
  }, [signer, contract, provider]);

  async function doTransfer(to, amt) {
    if (!to || !amt) return;
    const me = await signer.getAddress();
    const dec = await contract.decimals();
    const before = await contract.balanceOf(me);
    const tx = await contract.transfer(to, ethers.parseUnits(amt, dec));
    await tx.wait();
    const after = await contract.balanceOf(me);
    setLastTxReport({ type: "transfer", pre: ethers.formatUnits(before, dec), post: ethers.formatUnits(after, dec) });
  }

  async function doMintOwner(to, amt) {
    if (!to || !amt) return;
    const dec = await contract.decimals();
    const tx = await contract.mintTo(to, ethers.parseUnits(amt, dec));
    await tx.wait();
  }

  async function doBurn(amt) {
    if (!amt) return;
    const dec = await contract.decimals();
    const me = await signer.getAddress();
    const before = await contract.balanceOf(me);
    const tx = await contract.burn(ethers.parseUnits(amt, dec));
    await tx.wait();
    const after = await contract.balanceOf(me);
    setLastTxReport({ type: "burn", pre: ethers.formatUnits(before, dec), post: ethers.formatUnits(after, dec) });
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">ERC-20 SPA (CST4125)</h1>
        <p className="subtitle">React + Bulma + Ethers + OpenZeppelin</p>

        <div className="buttons">
          <button className="button is-link" onClick={connect}>Connect MetaMask</button>
        </div>

        <div className="columns">
          <div className="column is-half">
            <WalletInfo address={address} ethBalance={ethBalance} tokenBalance={tokenBalance} />
            <TokenActions onTransfer={doTransfer} onMintOwner={doMintOwner} onBurn={doBurn} />
            {lastTxReport && (
              <article className="message is-info">
                <div className="message-header">
                  <p>Pre/Post Balance (Last {lastTxReport.type})</p>
                </div>
                <div className="message-body">
                  <span className="tag is-light m-1">Pre: {lastTxReport.pre}</span>
                  <span className="tag is-light m-1">Post: {lastTxReport.post}</span>
                </div>
              </article>
            )}
          </div>

          <div className="column is-half">
            <PropsCard name={name} symbol={symbol} decimals={decimals} totalSupply={totalSupply} />
            <EventsFeed events={events} />
          </div>
        </div>

        <div className="notification is-warning is-light">
          <strong>Lifecycle demo:</strong> Mint (owner) → Transfer → Burn. Watch <em>Transfer</em> events and pre/post balances update live.
        </div>
      </div>
    </section>
  );
}
