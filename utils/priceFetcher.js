import axios from 'axios';

export async function fetchCurrentPrice(ticker) {
  try {
    const response = await axios.get(
      `https://c4rm9elh30.execute-api.us-east-1.amazonaws.com/default/cachedPriceData?ticker=${ticker}`
    );
    const priceData = response.data?.price_data;
    const closePrices = Array.isArray(priceData?.close) ? priceData.close : [];
    console.log(`Close prices for ${ticker}:`, closePrices);
    
    // Find the most recent non-NaN, non-null price (iterate from end)
    const validPrice = closePrices.slice().reverse().find(price => typeof price === 'number' && !isNaN(price));
    
    if (validPrice === undefined) {
      console.warn(`No valid price data for ${ticker}, returning null`);
      return null;
    }
    
    console.log(`Selected price for ${ticker}: ${validPrice}`);
    return validPrice;
  } catch (err) {
    console.error(`Failed to fetch price for ${ticker}:`, err.message);
    return null;
  }
}