export default function PropsCard({ name, symbol, decimals, totalSupply }) {
  return (
    <div className="card">
      <header className="card-header">
        <p className="card-header-title">Token Properties (via props)</p>
      </header>
      <div className="card-content">
        <div className="content">
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Symbol:</strong> {symbol}</p>
          <p><strong>Decimals:</strong> {decimals}</p>
          <p><strong>Total Supply:</strong> {totalSupply}</p>
        </div>
      </div>
    </div>
  );
}
