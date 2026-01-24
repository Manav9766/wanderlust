// utils/geocode.js
const axios = require("axios");

const MAP_TOKEN = process.env.MAP_TOKEN;

async function geocodePlace(placeText) {
  if (!MAP_TOKEN) return null;
  if (!placeText || !placeText.trim()) return null;

  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(placeText)}.json`;

  const res = await axios.get(url, {
    params: {
      key: MAP_TOKEN,
      limit: 1,
    },
    timeout: 10000,
  });

  const feature = res.data?.features?.[0];
  if (!feature) return null;

  // MapTiler returns center as [lng, lat]
  const center = feature.center;
  if (!Array.isArray(center) || center.length !== 2) return null;

  return {
    type: "Point",
    coordinates: [Number(center[0]), Number(center[1])],
  };
}

module.exports = { geocodePlace };
