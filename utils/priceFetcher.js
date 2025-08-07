import axios from 'axios';

export async function fetchCurrentPrice(ticker) {
    try {
        const response = await axios.get(
            `https://c4rm9elh30.execute-api.us-east-1.amazonaws.com/default/cachedPriceData?ticker=${ticker}`
        );
        console.log(`Full API response for ${ticker}:`, response.data);
        const priceData = response.data?.price_data;
        const closePrices = Array.isArray(priceData?.close) ? priceData.close : [];
        console.log(`Close prices for ${ticker}:`, closePrices);
        
        const validPrice = closePrices.slice().reverse().find(price => typeof price === 'number' && !isNaN(price));
        
        if (validPrice === undefined) {
            console.warn(`No valid price data for ${ticker}, returning fallback price`);
            return 100; // Fallback for testing; replace with null in production
        }
        
        console.log(`Selected price for ${ticker}: ${validPrice}`);
        return validPrice;
    } catch (err) {
        console.error(`Failed to fetch price for ${ticker}:`, err.message);
        return 100; // Fallback for testing; replace with null in production
    }
}