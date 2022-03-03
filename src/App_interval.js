// use this method
const DisplayPrice = ({ token, router, factory, conn }) => {
  const tokenAddress = token_address[token];
  const [price, setPrice] = React.useState(0);
  console.log(price);
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log("This will run every 10 second!");
      getFTMReservesPrice(tokenAddress, factory, conn).then((price) => {
        setPrice(price);
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [token, router, factory]);
  return (
    <div>
      {"RESERVE RATIO:"} {price.reserves_ratio} <br />
      {"PRICE (ADJ RESERVED):"} {price.adjusted_reserves_price} <br />
    </div>
  );
};
