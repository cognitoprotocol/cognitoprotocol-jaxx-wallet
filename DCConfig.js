//- DCConfig.js -------------------------------------------------------------------------------------------------------------------
"use strict";

var DCConfig = {
    apiKeys: {
        "SHAPESHIFT": "180aaede8f5451a52847824f4965cc25f43a5d2bb49f483c1f1ecc8afad661b65e22a01046bfd67257e31189b48f5a1ec35207653bd017f8203f4241c763074a"
    },
    endpoints: {
        "BITCOINFEES_21_RECOMMENDED": "https://bitcoinfees.21.co/api/v1/fees/recommended",
        "DASH_BLOCKCHAIN_INFO": "https://api.jaxx.io/api/dash/blockchainInfo",
        "ETH_BLOCKCHAIN_INFO": "https://api.jax.io/api/eth/latestBlockNumberInserted",
        "SHAPESHIFT_AVAILABLE_COINS": "https://shapeshift.io/getcoins",
        "SHAPESHIFT_MARKET_INFO": "https://shapeshift.io/marketinfo"
    },
    errorSources: {
        "NETWORK": "network",
        "SERVICE": "service"
    }
};
