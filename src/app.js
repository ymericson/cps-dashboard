import {myExampleUtil} from './utils';
import {select} from 'd3-selection';
import * as d3 from 'd3';
import cps from '../data/cps.json';
import './main.css';

console.log(cps)

var margin = {top: 50, bottom: 30, side: 30};
var width = 500;
var height = 800;

var projection = d3.geoMercator();
// var path = d3.geoPath().projection(projection);

// set boundaries
var svg = d3.select(".container-fluid")
    .append("svg")
        .attr('class', 'map')
        .attr("width", width + (2 * margin.side))
        .attr("height", height + margin.top + margin.bottom)
        
    // .append("g")
    //     .attr("transform",
    //         "translate(" + margin.side + "," + margin.top + ")")
            ;

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

  // tooltip to display school info
  var Tooltip = d3.select(".container-fluid")
    .append("svg")
    .append("foreignObject")
    .attr("class", "tooltip")
  
  var size = d3.scaleLinear()
    .domain([48, 4500])  // What's in the data
    .range([ 5, 30])  // Size in pixel

  // actions for when hovering over a circle
  var mouseover = function(event, d) {
    Tooltip
      .style("opacity", 0.9)
      .html("<h3>" + d.school_name_long + "</h3>" +
            "School Type: " + d.school_type + "<br/>" +
            "Address: " + d.address + "<br/>" +
            "Phone #: " + d.phone 
            )
    d3.select(this)
      .style("stroke", "red")
      .attr("stroke-width", 3)
  }
  // var mousemove = function(event, d) {
  //   Tooltip
  //     .style("opacity", 0.9)
  //     .html("<strong>" + d.school_name_long + "</strong>" + "<br/>" +
  //           "School Type: " + d.school_type + "<br/>" +
  //           "Address: " + d.address + "<br/>" +
  //           "Phone #: " + d.phone 
  //           )
  //     .style("left", (event.clientX + 30) + "px")
  //     .style("top", (event.clientY - 50) + "px")
  // }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0.1)
    d3.select(this)
      .style("stroke", "green")
      .attr("stroke-width", 1)
      .style("opacity", 0.8)
      .transition()		
      .duration(500)
  }


  // cps dots
  svg
  .selectAll("myCircles")
  .data(cps)
  .enter()
  .append("circle")
    .attr("cx", function(d){ return projection([d.longitude, d.latitude])[0] })
    .attr("cy", function(d){ return projection([d.longitude, d.latitude])[1] })
    .attr("r", function(d){ return size(d.enrollment) })
    .style("fill", "69b3a2")
    .attr("stroke", "green")
    .attr("stroke-width", 1)
    .attr("fill-opacity", .4) 
  .on("mouseover", mouseover)
  .on("mouseleave", mouseleave)
  
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
