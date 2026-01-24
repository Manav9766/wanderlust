maptilersdk.config.apiKey = mapToken;

// Initialize the map
const map = new maptilersdk.Map({
    container: "map",
    style: maptilersdk.MapStyle.STREETS,
    center: listing.geometry.coordinates,    
    zoom: 12
});

// Add a marker
const marker = new maptilersdk.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 }).setHTML(`
            <h4>${listing.title}</h4>
            <p>Exact location provided after booking.</p>
        `)
    )
    .addTo(map);
