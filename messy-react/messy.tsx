interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // lack of blockchain property
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

class Datasource {
  // TODO: Implement datasource class
  private api: string;

  constructor(api: string) {
    this.api = api;
  }

  async getPrices() {
    try {
      const response = await fetch(this.api)
      const json = await response.json()

      let prices = {}

      json.forEach(token => {
        prices[token.currency] = token.price
      })

      return prices

    } catch (error: any) {
      console.error(error)
    }
  }
}

// interface BoxProps {
//   children: any
// }

interface Props extends BoxProps {

}

export const PRICE_API = "https://interview.switcheo.com/prices.json"

// interface 
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props; 
  const balances = useWalletBalances();
  // const [prices, setPrices] = useState({});
  const [prices, setPrices] = useState<Prices>();

  useEffect(() => {
    const datasource = new Datasource(PRICE_API); // API string should be constant
    datasource.getPrices().then(prices => {
      setPrices(prices);
    }).catch(error => {
      console.error(error); // changed to `console.error`
    });
  }, []);

  const getPriority = (blockchain: string): number => { // blockchain should not be any, should be string
    switch (blockchain) {
      case 'Osmosis':
        return 100
      case 'Ethereum':
        return 50
      case 'Arbitrum':
        return 30
      case 'Zilliqa':
        return 20
      case 'Neo':
        return 20
      default:
        return -99
    }
  }

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      // if (balancePriority > -99) { // lhsPriority does not exist => should be balancePriority
      //   if (balance.amount <= 0) {
      //     return true;
      //   }
      // }
      // return false
      return balancePriority > -99 && balance.amount <= 0;
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      // if (leftPriority > rightPriority) {
      //   return -1;
      // } else if (rightPriority > leftPriority) {
      //   return 1;
      // }
      return rightPriority - leftPriority;
    });
  // }, [balances, prices]); // prices is redundant
  }, [balances]);

  // formattedBalances is declared but never used => should be removed
  // const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
  //   return {
  //     ...balance,
  //     formatted: balance.amount.toFixed()
  //   }
  // })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount; // prices.BTC * 10
    return (
      <WalletRow
        className={classes.row}
        key={index} // can be optimized to unique identifier instead of index
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  // should be specific instead of ...rest
  // div tag should change to specific component to use Props/BoxProps attribute
  return (
    <div {...rest}> 
      {rows}
    </div>
  )
}