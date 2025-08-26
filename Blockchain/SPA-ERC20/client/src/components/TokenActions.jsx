import { useState } from "react";

export default function TokenActions({ onTransfer, onMintOwner, onBurn }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="box">
      <h2 className="title is-5">Actions</h2>

      <div className="field">
        <label className="label">Transfer</label>
        <div className="field has-addons">
          <p className="control is-expanded">
            <input className="input" value={to} onChange={e=>setTo(e.target.value)} placeholder="Recipient address"/>
          </p>
          <p className="control">
            <input className="input" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount"/>
          </p>
          <p className="control">
            <button className="button is-primary" onClick={() => onTransfer(to, amount)}>Send</button>
          </p>
        </div>
      </div>

      <div className="buttons">
        <button className="button is-warning" onClick={() => onMintOwner(prompt("Mint to address?"), prompt("Amount?"))}>
          Owner: Mint To…
        </button>
        <button className="button is-danger" onClick={() => onBurn(prompt("Burn amount?"))}>
          Burn
        </button>
      </div>
    </div>
  );
}
