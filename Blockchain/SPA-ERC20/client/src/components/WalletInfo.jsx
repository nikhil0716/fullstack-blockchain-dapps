export default function WalletInfo({ address, ethBalance, tokenBalance }) {
  return (
    <div className="notification is-link is-light">
      <p><strong>Connected:</strong> {address || "—"}</p>
      <p><strong>ETH:</strong> {ethBalance ?? "—"}</p>
      <p><strong>Token:</strong> {tokenBalance ?? "—"}</p>
    </div>
  );
}
