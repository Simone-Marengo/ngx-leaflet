import { Component, ElementRef, ViewChild } from "@angular/core";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { states } from './model';



@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {

  @ViewChild('leafletMap') leafletMap: ElementRef<HTMLElement>;

  places: any;
  map: any;

  highlightFunction: Function;

  options = {
    layers: [
      L.tileLayer("../assets/images/marker_example.png", {
        maxZoom: 18,
        attribution: "..."
      })
    ],
    zoom: 4,
    center: L.latLng(37.8, -96)
  };

  onMapReady(map) {
    this.map = map;
    // control that shows state info on hover
    let info = (L as any).control();

    // here you want the reference to be info, therefore this = info
    // so do not use es6 to access the class instance with this
    info.onAdd = function (map) {
      this._div = L.DomUtil.create("div", "info");
      this.update();
      return this._div;
    };
    // also here you want the reference to be info, therefore this = info
    // so do not use es6 to access the class instance with this
    info.update = function (props) {
      this._div.innerHTML =
        "<h4>US Population Density</h4>" +
        (props
          ? "<b>" +
          props.name +
          "</b><br />" +
          props.density +
          " people / mi<sup>2</sup>"
          : "Hover over a state");
    };

    info.addTo(map);

    // get color depending on population density value
    const getColor = (d) => {
      return d > 1000
        ? "#800026"
        : d > 500
          ? "#BD0026"
          : d > 200
            ? "#E31A1C"
            : d > 100
              ? "#FC4E2A"
              : d > 50
                ? "#FD8D3C"
                : d > 20
                  ? "#FEB24C"
                  : d > 10
                    ? "#FED976"
                    : "#FFEDA0";
    };

    const style = (feature) => {
      return {
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.density)
      };
    };

    const highlightFeature = (target) => {
      const layer = target;

      layer.setStyle({
        weight: 5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7
      });

      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }

      info.update(layer.feature.properties);
    };

    let geojson;

    const resetHighlight = (e) => {
      geojson.resetStyle(e.target);
      info.update();
    };

    const selectFeature = (e) => {
      // this.selectedPlace = e.target;

      // map.fitBounds(e.target.getBounds());
    };

    const onEachFeature = (feature, layer) => {
      layer.on({
        // mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: highlightFeature
      });
    };

    geojson = L.geoJSON(JSON.parse(JSON.stringify(states)), {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);

    this.places = Object.values({ ...this.map._renderer._layers });

    this.highlightFunction = highlightFeature.bind(this);

  }

  selectTarget() {
    this.highlightFunction(this.places[Math.round(Math.floor(Math.random() * 5))]);
  }

}
