export const displayMap = (locations) => {

    maptilersdk.config.apiKey = 'Od2QR2OUlIHGow9sjmzC';
    const map = new maptilersdk.Map({
        container: 'map', // container's id or the HTML element to render the map
        style: "backdrop",
        scrollZoom: false
    });

    const bounds = new maptilersdk.LngLatBounds();

    locations.forEach(loc => {
        new maptilersdk.Marker({
            color: '#75d272'
        }).setLngLat(loc.coordinates).addTo(map);

        new maptilersdk.Popup({ offset: 30 })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .setMaxWidth("300px")
            .addTo(map);

        bounds.extend(loc.coordinates);
    });

    map.on('load', () => {
        map.fitBounds(bounds, {
            padding: {
                top: 200,
                left: 200,
                right: 100,
                bottom: 150,
            }
        });
    });

    window.scrollTo(0, 0);
}
