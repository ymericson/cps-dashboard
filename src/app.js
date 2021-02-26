import {myExampleUtil} from './utils';
import {select} from 'd3-selection';
import * as d3 from 'd3';
// import {legend} from "@d3/color-legend"
import cps from '../data/cps.json';
import './main.css';

// console.log(cps)

var margin = {top: 50, bottom: 30, side: 30},
    [height, width] = [800, 500];

var projection = d3.geoMercator();
// var path = d3.geoPath().projection(projection);

// set boundaries
var svg = d3.select(".container-fluid")
    .append("svg")
        .attr('class', 'map')
        .attr("width", width + (2 * margin.side))
        .attr("height", height + margin.top + margin.bottom);



// ---------------- LEGEND COLOR BAR ---------------- //
var colorscale = d3.schemeRdYlBu['6'];
var color = d3.scaleQuantize()
  .domain([40, 100])
  .range(colorscale);

drawColorScale();

function drawColorScale() {
  var pallete = svg.append('g')
    .attr('id', 'pallete');

  var swatch = pallete.selectAll('rect').data(colorscale);
  swatch.enter().append('rect')
    .attr('id', 'legend-rect')
    .attr('fill', function(d) { return d; })
    .attr('x', function(d, i) { return i * 40; })
    .attr('y', 750);

  var texts = pallete.selectAll("all")
    .data(color.range())
    .enter()
    .append("text")
    .attr('id', 'legend-text')
    .attr("y", 775)
    .attr('x', function(d, i) { return i * 40 + 20 })
    .text(function(d) { return color.invertExtent(d)[0] })
    .append("tspan").text(" - ").append("tspan")
    .text(function(d) { return color.invertExtent(d)[1] - 1 })

}


//Load in GeoJSON data
d3.json("./data/chicago_map.geojson").then(function(data) {
  // filter out O'Hare
  data.features = data.features.filter( function(d){return d.properties.community!="OHARE"} )
  // console.log(data)
  projection.fitSize([width,height],data); 

  var myColor = d3.scaleSequential().domain([40,100])
    .interpolator(d3.interpolateRdYlBu);

  var size = d3.scaleLinear()
    .domain([48, 4500])
    .range([ 5, 30]) 

  var Tooltip = d3.select(".container-fluid")
    .append("svg")
    .append("foreignObject")
    .attr("class", "tooltip")

  // map background
  svg.append("g")
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
      .attr("class", "base-map")
      .attr("d", d3.geoPath().projection(projection))




  // ---------------- LEGEND CIRCLE ---------------- //
  var valuesToShow = [500, 2000, 5000],
      xCircle = 60,
      xLabel = 110,
      yCircle = 700

  // legend circles
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
      .attr("class", "legend")
      .attr("cx", xCircle)
      .attr("cy", function(d){ return yCircle - size(d) } )
      .attr("r", function(d){ return size(d) })

  // legend line
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
      .attr("class", "legend")
      .attr('x1', function(d){ return xCircle + size(d) } )
      .attr('x2', xLabel)
      .attr('y1', function(d){ return yCircle - size(d) } )
      .attr('y2', function(d){ return yCircle - size(d) } )
      .style('stroke-dasharray', ('2,2'))

  // legend lables
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
      .attr("id", "legend-text")
      .attr('x', xLabel + 13)
      .attr('y', function(d){ return yCircle - size(d) } )
      .text( function(d){ return d } )
      // .style("font-size", 10)
      .attr('alignment-baseline', 'middle')



  // ---------------- MOUSE ACTION ---------------- //
  var mouseover = function(event, d) {
    Tooltip
      .style("opacity", 1)
      .html("<h3>" + d.school_name_long + "</h3>" +
            "School Type: " + d.school_type + "<br/>" +
            "Address: " + d.address + "<br/>" +
            "Phone #: " + d.phone  + "<br/>" +
            "Enrollment: " + d.enrollment  + "<br/>" +
            "2020 Grad Rate: " + d["2020"]
            )
    d3.select(this)
      .style("stroke", "red")
      .attr("stroke-width", 3)
      .style("opacity", 0.8)
  }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0.1)
    d3.select(this)
      .style("stroke", "#5e5e5e")
      .attr("stroke-width", 1)
      .style("opacity", 0.8)
      .transition()		
      .duration(500)
  }

  


  // cps dots
  svg
  .selectAll("circles")
  .data(cps)
  .enter()
  .append("circle")
  // .attr('class', 'datapoint')
  .attr("class" , function(d){ return d.school_type })
    .attr("cx", function(d){ return projection([d.longitude, d.latitude])[0] })
    .attr("cy", function(d){ return projection([d.longitude, d.latitude])[1] })
    .attr("r", function(d){ return size(d.enrollment) })
    .attr("fill", function(d){ return myColor(d["2020"]) })
    .attr("stroke", "#5e5e5e")
    .attr("opacity", 0.8)
  .on("mouseover", mouseover)
  .on("mouseleave", mouseleave)
  



  // This function is gonna change the opacity and size of selected and unselected circles
  function update(){

    // For each check box:
    d3.selectAll(".checkbox").each(function(d){
      var value = d3.select(this).property('value')
      var checked = d3.select(this).property('checked')
      console.log(value)
      console.log(checked)

      // cb = d3.select(this);
      // grp = cb.property("value")

      // If the box is check, I show the group
      if(checked){
        svg.selectAll("."+value).transition().duration(500).style("opacity", 1)
        .attr("r", function(d){ return size(d.enrollment) })

      // Otherwise I hide it
      }else{
        svg.selectAll("."+value).transition().duration(500).style("opacity", 0)
        .attr("r", 0)
      }
    })
  }

  // When a button change, I run the update function
  d3.selectAll(".checkbox").on("change",update);

  // And I initialize it at the beginning
  update()


})


// color scales
// https://github.com/d3/d3-scale-chromatic
// https://www.d3-graph-gallery.com/graph/custom_color.html
// https://observablehq.com/@d3/color-legend

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
