import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    connect() {
        this._boundOnConnect = this._onConnect.bind(this);
        this._boundOnDbReady = this._onDbReady.bind(this);

        this.element.addEventListener('ux:map:pre-connect', this._onPreConnect);
        this.element.addEventListener('ux:map:connect', this._boundOnConnect);
        this.element.addEventListener('ux:map:marker:before-create', this._onMarkerBeforeCreate);
        this.element.addEventListener('ux:map:marker:after-create', this._onMarkerAfterCreate);
        this.element.addEventListener('ux:map:info-window:before-create', this._onInfoWindowBeforeCreate);
        this.element.addEventListener('ux:map:info-window:after-create', this._onInfoWindowAfterCreate);
        this.element.addEventListener('ux:map:polygon:before-create', this._onPolygonBeforeCreate);
        this.element.addEventListener('ux:map:polygon:after-create', this._onPolygonAfterCreate);
        this.element.addEventListener('ux:map:polyline:before-create', this._onPolylineBeforeCreate);
        this.element.addEventListener('ux:map:polyline:after-create', this._onPolylineAfterCreate);

        this.mapReady = new Promise(resolve => {
            this._resolveMapReady = resolve;
        });
        this.dbReady = new Promise(resolve => {
            this._resolveDbReady = resolve;
        });
        Promise.all([this.mapReady, this.dbReady]).then(() => {
            this._addMarkersFromDb();
        });

        document.addEventListener('dbready', this._boundOnDbReady);

        this._icons = {
            mapPinNotCheckedIn: '/images/map-pin-chijal.svg',
            mapPinCheckedIn: '/images/map-pin-chijal-checked-in.svg'
        };

        document.addEventListener('page:afterin', this._addMarkersFromDb);
    }

    disconnect() {
        this.element.removeEventListener('ux:map:pre-connect', this._onPreConnect);
        this.element.removeEventListener('ux:map:connect', this._boundOnConnect);
        this.element.removeEventListener('ux:map:marker:before-create', this._onMarkerBeforeCreate);
        this.element.removeEventListener('ux:map:marker:after-create', this._onMarkerAfterCreate);
        this.element.removeEventListener('ux:map:info-window:before-create', this._onInfoWindowBeforeCreate);
        this.element.removeEventListener('ux:map:info-window:after-create', this._onInfoWindowAfterCreate);
        this.element.removeEventListener('ux:map:polygon:before-create', this._onPolygonBeforeCreate);
        this.element.removeEventListener('ux:map:polygon:after-create', this._onPolygonAfterCreate);
        this.element.removeEventListener('ux:map:polyline:before-create', this._onPolylineBeforeCreate);
        this.element.removeEventListener('ux:map:polyline:after-create', this._onPolylineAfterCreate);

        document.removeEventListener('dbready', this._boundOnDbReady);

        document.removeEventListener('page:afterin', this._addMarkersFromDb);
    }

    _onDbReady(event) {
        console.log("Dexie DB ready");
        this._resolveDbReady();
    }

    _addMarkersFromDb = async () => {
        console.log("Both map and DB are ready, adding markers...");
        let bounds = [];

        const locations = await window.db.locations.toArray();

        for (const location of locations) {
            if (location.lat && location.lng && location.lat !== 0 && location.lng !== 0) {
                bounds.push([location.lat, location.lng]);

                let hasCheckedIn = await window.db.checkins
                    .where('locationCode')
                    .equals(location.code)
                    .first();

                let customMarkerIcon = this.L.icon({
                    iconUrl: hasCheckedIn ? this._icons.mapPinCheckedIn : this._icons.mapPinNotCheckedIn,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });

                let content = `
                    <div>
                        <div class="font-serif font-weight-900" style="font-size: 18px;">${location.label}</div>
                        <div class="margin-top-half">${location.address || ''}</div>
                        <div class="margin-top-half" style="font-size: 12px; opacity: 0.5;">${hasCheckedIn ? `You have visited here on ${new Date(hasCheckedIn.timestamp).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}` : ''}</div>
                        <a href="/pages/location/${location.code}" class="button button-fill button-round margin-top-half color-primary text-color-white">View Details</a>
                    </div>
                `;

                this.L.marker([location.lat, location.lng], {
                    icon: customMarkerIcon
                }).addTo(this.map).bindPopup(content);
            }
        }

        if (bounds.length > 0) {
            this.map.fitBounds(bounds);
        }
    }

    /**
     * This event is triggered when the map is not created yet
     * You can use this event to configure the map before it is created
     */
    _onPreConnect(event) {
        console.log(event.detail);
    }

    /**
     * This event is triggered when the map and all its elements (markers, info windows, ...) are created.
     * The instances depend on the renderer you are using.
     */
    _onConnect(event) {
        this.map = event.detail.map; // Leaflet Map Instance
        this.L = event.detail.L; // Leaflet Library

        this._resolveMapReady();

        // console.log(event.detail.map);
        // console.log(event.detail.markers);
        // console.log(event.detail.infoWindows);
        // console.log(event.detail.polygons);
        // console.log(event.detail.polylines);
    }

    /**
     * This event is triggered before creating a marker.
     * You can use this event to fine-tune it before its creation.
     */
    _onMarkerBeforeCreate(event) {
        //console.log(event.detail.definition);
        // { title: 'Paris', position: { lat: 48.8566, lng: 2.3522 }, ... }

        // Example: uppercase the marker title
        //event.detail.definition.title = event.detail.definition.title.toUpperCase();

        /*
        console.log('_onMarkerBeforeCreate');

        const { definition, L } = event.detail;

        // Use a custom icon for the marker
        const redIcon = L.icon({
          // Note: instead of using a hardcoded URL, you can use the `extra` parameter from `new Marker()` (PHP) and access it here with `definition.extra`.
          iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png',
          shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
          iconSize: [38, 95], // size of the icon
          shadowSize: [50, 64], // size of the shadow
          iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
          shadowAnchor: [4, 62],  // the same for the shadow
          popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
        })

        definition.bridgeOptions = {
          icon: redIcon,
        }
        */
    }

    /**
     * This event is triggered after creating a marker.
     * You can access the created marker instance, which depends on the renderer you are using.
     */
    _onMarkerAfterCreate(event) {
        // The marker instance
        //console.log(event.detail.marker);
        //alert('Marker created!');
        //console.log(event.detail.marker);
        event.detail.marker.on('click', function () {
            alert('Marker clicked!');
        });
    }

    /**
     * This event is triggered before creating an info window.
     * You can use this event to fine-tune the info window before its creation.
     */
    _onInfoWindowBeforeCreate(event) {
        console.log(event.detail.definition);
        // { headerContent: 'Paris', content: 'The capital of France', ... }
    }

    /**
     * This event is triggered after creating an info window.
     * You can access the created info window instance, which depends on the renderer you are using.
     */
    _onInfoWindowAfterCreate(event) {
        // The info window instance
        console.log(event.detail.infoWindow);

        // The associated element instance is also available, e.g. a marker...
        console.log(event.detail.marker);
        // ... or a polygon
        console.log(event.detail.polygon);
        // ... or a polyline
        console.log(event.detail.polyline);
    }

    /**
     * This event is triggered before creating a polygon.
     * You can use this event to fine-tune it before its creation.
     */
    _onPolygonBeforeCreate(event) {
        console.log(event.detail.definition);
        // { title: 'My polygon', points: [ { lat: 48.8566, lng: 2.3522 }, { lat: 45.7640, lng: 4.8357 }, { lat: 43.2965, lng: 5.3698 }, ... ], ... }
    }

    /**
     * This event is triggered after creating a polygon.
     * You can access the created polygon instance, which depends on the renderer you are using.
     */
    _onPolygonAfterCreate(event) {
        // The polygon instance
        console.log(event.detail.polygon);
    }

    /**
     * This event is triggered before creating a polyline.
     * You can use this event to fine-tune it before its creation.
     */
    _onPolylineBeforeCreate(event) {
        console.log(event.detail.definition);
        // { title: 'My polyline', points: [ { lat: 48.8566, lng: 2.3522 }, { lat: 45.7640, lng: 4.8357 }, { lat: 43.2965, lng: 5.3698 }, ... ], ... }
    }

    /**
     * This event is triggered after creating a polyline.
     * You can access the created polyline instance, which depends on the renderer you are using.
     */
    _onPolylineAfterCreate(event) {
        // The polyline instance
        console.log(event.detail.polyline);
    }


}
