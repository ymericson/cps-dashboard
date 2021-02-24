import {myExampleUtil} from './utils';
import {select} from 'd3-selection';
import * as d3 from 'd3';
import cps from '../data/cps.json';
import './main.css';

console.log(cps)

var margin = {top: 100, bottom: 50, side: 50};
var width = 900;
var height = 800;

var projection = d3.geoMercator();
// var path = d3.geoPath().projection(projection);

// set boundaries
var svg = d3.select(".container-fluid")
    .append("svg")
        .attr("width", width + (2 * margin.side))
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.side + "," + margin.top + ")");

//Load in GeoJSON data
d3.json("./data/chicago_map.geojson").then(function(data) {
  // filter out O'Hare
  data.features = data.features.filter( function(d){return d.properties.community!="OHARE"} )

  console.log(data)

  projection.fitSize([width,height],data); 
  // map background
  svg.append("g")
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
      .attr("fill", "#b8b8b8")
      .attr("d", d3.geoPath().projection(projection))
    .style("stroke", "black")
    .style("opacity", .3)
  // cps dots
  svg
  .selectAll("myCircles")
  .data(cps)
  .enter()
  .append("circle")
    .attr("cx", function(d){ return projection([d.longitude, d.latitude])[0] })
    .attr("cy", function(d){ return projection([d.longitude, d.latitude])[1] })
    .attr("r", 10)
    .style("fill", "69b3a2")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 1)
    .attr("fill-opacity", .4)
    
})


// // this is just one example of how to import data. there are lots of ways to do it!
// fetch('./data/example.json')
//   .then(response => response.json())
//   .then(data => myVis(data))
//   .catch(e => {
//     console.log(e);
//   });

// function myVis(data) {
//   const width = 5000;
//   const height = (36 / 24) * width;
//   console.log(data, height);
//   console.log('Hi!');
//   // EXAMPLE FIRST FUNCTION
//   select('#app')
//     .append('h1')
//     .text('hi!');
// }
