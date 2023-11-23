import { useEffect, useState } from 'react';
import { ArrowDown, ChevronDown, GearFill, Search, X } from 'react-bootstrap-icons';
import Modal from 'react-bootstrap/Modal';

import cryptoRandomString from 'crypto-random-string';
import ConnectButton from './components/ConnectButton';
import { PRICES_URL } from './constants/urls';

import './App.css';
import SlidePanel from './components/slide-panel/SlidePanel';

const commonTokenNames = ['ETH', 'DAI', 'USDC', 'USDT', 'WBTC', 'WETH']

function App() {
  const [tokens, setTokens] = useState([])
  const [keyword, setKeyword] = useState()
  const [showSelectTokenModal, setShowSelectTokenModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const [swappers, setSwappers] = useState([])
  const [currentSwapSelectIndex, setCurrentSwapSelectIndex] = useState(1)
  const [isShowPanel, setShowPanel] = useState(false)
  const [isWalletConnecting, setWalletConnecting] = useState(false)
  const [wallet, setWallet] = useState({})

  const [isSwapping, setSwapping] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const toggleSelectTokenModal = (state, swapBlockIndex) => {
    setShowSelectTokenModal(state)
    setCurrentSwapSelectIndex(swapBlockIndex)
  }

  const handleSwitch = () => {
    setSwappers(prevState => ([prevState[1], prevState[0]]))
  }

  const handleSelectToken = (token) => {
    if (swappers[currentSwapSelectIndex ? 0 : 1]?.token?.currency === token?.currency) {
      handleSwitch()
      handleCloseModal()
      return
    }

    setSwappers(prevState => prevState.map(
      (swapper, index) => {
        if (index === currentSwapSelectIndex) {
          const anotherSwapper = prevState[currentSwapSelectIndex === 0 ? 1 : 0]
          const equalValue = anotherSwapper.amount * anotherSwapper.token?.price
          const swapEqualAmount = equalValue / token?.price

          return ({
            ...swapper,
            token: token,
            amount: Math.round(swapEqualAmount * 100) / 100
          })
        }
        return swapper
      }
    ))

    setShowSelectTokenModal(false)
  }

  const handleCloseModal = () => {
    setShowSelectTokenModal(false)
    setShowSuccessModal(false)
    setShowErrorModal(false)
    setKeyword('')
  }

  const getPrices = async () => {
    try {
      const response = await fetch(PRICES_URL)
      const tokenObjects = await response.json()

      setTokens(tokenObjects)
      setSwappers([
        {
          token: tokenObjects
            .find(token => token.currency === 'ETH')
        },
        {}
      ])
    } catch (error) {
      console.error(error)
    }
  }

  const handleChangeAmount = (e, swapIndex) => {
    const amount = e.target.value

    if (amount == '' || amount.match(/^([0-9]*\.)?[0-9]*$/)) {
      setSwappers(prevState => prevState.map(
        (swapper, index) => {
          if (index === swapIndex) {
            return ({ ...swapper, amount: amount })
          } else {
            if (swapper.token && swapper.token.price) {
              const swapEqualAmount =
                amount * prevState[index === 0 ? 1 : 0].token?.price / swapper.token?.price

              return ({ ...swapper, amount: Math.round(swapEqualAmount * 100) / 100 })
            }

            return swapper
          }
        }
      ))
    }
  }

  const connectWallet = () => {
    let isSwappersValid = true

    swappers.map(swapper => {
      if (!swapper.token?.price || !swapper.amount) {
        isSwappersValid = false
        setErrorMessage("Please select both tokens and input amount.")
      }
    })

    if (swappers[0].token) {
      const walletBalance = wallet?.tokens
        ?.find(token => token.currency === swappers[0].token.currency)

      if (!walletBalance?.amount || (walletBalance && parseFloat(swappers[0].amount) > parseFloat(walletBalance.amount))) {
        isSwappersValid = false
        setErrorMessage("Balance is not enough for " + swappers[0].token.currency + '.')
      }
    }

    if (wallet.address && !isSwappersValid) {
      setShowErrorModal(true)
      return
    }

    if (wallet.address && isSwappersValid) {
      setSwapping(true)

      setTimeout(() => {
        setSwapping(false)
        setShowSuccessModal(true)
      }, 2000);
    }

    setWalletConnecting(true)
    setTimeout(() => {
      setWalletConnecting(false)
      setWallet({
        address: cryptoRandomString({ length: 20, type: 'base64' }),
        tokens: [
          {
            currency: "ETH",
            amount: cryptoRandomString({ length: 3, type: 'numeric' })
          },
          {
            currency: "USDT",
            amount: cryptoRandomString({ length: 6, type: 'numeric' })
          },
          {
            currency: "AAVE",
            amount: cryptoRandomString({ length: 3, type: 'numeric' })
          },
        ]
      })
    }, 1500)
  }

  const showPrice = (swapper) => {
    if (swapper.token?.price && swapper.amount) {
      const value = Math.round(swapper.token.price * swapper.amount * 100) / 100

      return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    }
    return ''
  }

  useEffect(() => {
    getPrices()
  }, [])

  const filteredTokens = keyword
    ? tokens.filter(token =>
      token.currency.toLowerCase().includes(keyword.toLowerCase())
    )
    : tokens
  const commonTokens = tokens.filter(token => commonTokenNames.includes(token.currency))

  return (
    <div className="App">
      <div className="appHeader">
        <div className="appNav">
          <div className="nav-item active">Swap</div>
          <div className="nav-item">Pool</div>
          <div className="nav-item">Vote</div>
          <div className="nav-item">Charts</div>
        </div>
        <div className="actions">
          <ConnectButton
            wallet={wallet}
            connectWallet={connectWallet}
            isWalletConnecting={isWalletConnecting}
            defaultText="Connect"
            isHeader
            isSwapping={isSwapping}
          />
        </div>
      </div>

      <main className="mainContent">
        <div className="mainSwapper">
          <div className="swapperHeader">
            <div className="functionSwitchers">
              <div>Swap</div>
              <div className="disabled">Buy</div>
            </div>
            <div>
              <GearFill />
            </div>
          </div>
          <div className="swapperContent">
            {/* todo: break component */}
            <div>
              {swappers.map((swapper, index) =>
                <div className="swap-item" key={swapper.token?.currency || index}>
                  {index === 0 && <div
                    className="switch-button"
                    onClick={handleSwitch}
                  >
                    <ArrowDown />
                  </div>}
                  <div className="swap-title">
                    {index === 0 ? "You pay" : "You receive"}
                  </div>
                  <div className="amount-token-input">
                    <div className="amount-number">
                      <input
                        autoComplete="off"
                        autoCorrect="off"
                        type="text"
                        placeholder="0"
                        onChange={(e) => handleChangeAmount(e, index)}
                        value={swapper.amount || ''}
                      />
                    </div>
                    <div className="select-token">
                      {swapper.token
                        ? <div className="commonTokenItem" onClick={() => toggleSelectTokenModal(true, index)}>
                          <img src={`/images/tokens/${swapper.token.currency}.svg`} />
                          {swapper.token.currency} <ChevronDown />
                        </div>
                        : <button
                          className="selectTokenButton"
                          onClick={() => toggleSelectTokenModal(true, index)}
                        >
                          Select token <ChevronDown />
                        </button>
                      }
                    </div>
                    <div className="price-preview">{showPrice(swapper)}</div>
                  </div>
                </div>
              )}
            </div>
            <ConnectButton
              wallet={wallet}
              connectWallet={connectWallet}
              isWalletConnecting={isWalletConnecting}
            />
          </div>
        </div>
      </main>
      <Modal show={showSelectTokenModal} onHide={handleCloseModal}>
        <Modal.Header>
          <Modal.Title>
            Select a token
            <span className="custom-close-btn">
              <X onClick={handleCloseModal} />
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="tokenSearchRow">
            <div className="tokenSearchBox">
              <Search />
              <input placeholder="Search name" onChange={(e) => setKeyword(e.target.value)} />
            </div>
          </div>
          <div className="commonTokens">
            {commonTokens.map(token => <div
              key={token.currency}
              className="commonTokenItem"
              onClick={() => handleSelectToken(token)}
            >
              <img src={`/images/tokens/${token.currency}.svg`} />
              {token.currency}
            </div>)}
          </div>
          <div className="tokenList">
            {filteredTokens.map(token => <div
              key={token.currency}
              className="tokenItem"
              onClick={() => handleSelectToken(token)}
            >
              <div className="imgToken">
                <img src={`/images/tokens/${token.currency}.svg`} />
              </div>
              <div>
                {token.currency}
              </div>
            </div>)}
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showSuccessModal} onHide={handleCloseModal}>
        <Modal.Header>
          <Modal.Title>
            Swap success!
            <span className="custom-close-btn">
              <X onClick={handleCloseModal} />
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Your swap is success.
          </p>
        </Modal.Body>
      </Modal>

      <Modal show={showErrorModal} onHide={handleCloseModal}>
        <Modal.Header>
          <Modal.Title>
            Sorry, there was an error!
            <span className="custom-close-btn">
              <X onClick={handleCloseModal} />
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{errorMessage}</p>
        </Modal.Body>
      </Modal>

      <SlidePanel
        isShow={isShowPanel}
        title="Settings"
      >

      </SlidePanel>
    </div >
  );
}

export default App;
