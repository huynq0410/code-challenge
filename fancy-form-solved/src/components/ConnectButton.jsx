const ConnectButton = ({
  connectWallet,
  wallet,
  isWalletConnecting,
  defaultText = "Connect Wallet",
  isHeader,
  isSwapping
}) => {
  return (
    <div className="connect-wallet-button" onClick={connectWallet}>
      {wallet.address
        ? isHeader
          ? wallet.address.slice(0, 10) + '...'
          : isSwapping ? "Swapping..." : "Swap"
        : isWalletConnecting
          ? "Connecting..."
          : defaultText
      }
    </div>
  )
}

export default ConnectButton