import {myExampleUtil} from './utils';
import {select} from 'd3-selection';
import * as d3 from 'd3';
import cps from '../data/cps.json';
import './main.css';

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



//Load in GeoJSON data
d3.json("./data/chicago_map.geojson").then(function(data) {
  // filter out O'Hare
  data.features = data.features.filter(function(d){ 
    return d.properties.community!="OHARE" 
  })
  // add graduation year and rate into metrics group
  for (var i=0, l=cps.length; i<l; i++) {
    for (const [year, perc] of Object.entries(cps[i])) {
      // Get the year as a number
      const yearValue = +year; // See note below
      if (yearValue >= 2008 && yearValue <= 2020) {
          // It's in range, get or create the `metric` array
          const metric = cps[i].metric || (cps[i].metric = []);
          // Add to it
          metric.push({year, perc});
      } 
    }
  }

  projection.fitSize([width,height],data); 

  var steps = 6
  //Discrete sequential scale
  var color_threshold = d3.scaleThreshold()
    .domain(d3.range(50, 100, 10) ) // [50, 60, 70, 80, 90, 100]
    .range(d3.schemeRdYlBu[steps]);

  var size = d3.scaleLinear()
    .domain([40, 4500])
    .range([ 6, 30]) 

  var Tooltip = d3.select(".right-sidebar")
    .append("svg")
    .attr("class", "svg-tooltip")
    .append("foreignObject")
    .attr("class", "tooltip");

  var gradRateTooltip = d3.select('.right-sidebar')
    .append('svg')
    .attr("class", "lower-tooltip")

  var lowerTooltip = d3.select('.right-sidebar')
    .append('svg')
    .attr("class", "lower-tooltip")

  // map background
  svg.append("g")
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
      .attr("class", "base-map")
      .attr("d", d3.geoPath().projection(projection))


  // ---------------- GRADUATION LEGEND ---------------- //
  var colorscale = d3.schemeRdYlBu['6'];
  var color = d3.scaleQuantize()
    .domain([40, 100])
    .range(colorscale);

  svg
    .append("text")
      .attr('x', 10)
      .attr('y', 738)
      .text("Graduation Rate")
      .attr('alignment-baseline', 'middle')

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

    pallete.selectAll("all")
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

  // ---------------- ENROLLMENT LEGEND ---------------- //
  var valuesToShow = [500, 2000, 5000],
      xCircle = 50,
      xLabel = 110,
      yCircle = 700
    
  svg
    .append("text")
      .attr('x', 18)
      .attr('y', 625)
      .text("Enrollment")
      .attr('alignment-baseline', 'middle')

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



  // ---------------- SCHOOL INFO SIDEBAR ---------------- //
  var mouseover = function(event, d) {
    Tooltip
      .style("opacity", 1)
      .html("<h3>" + d.school_name_long + "</h3>" +
            "School Type: " + d.school_type + "<br/>" +
            "Address: " + d.address + "<br/>" +
            "Phone #: " + d.phone  + "<br/>" +
            "Enrollment: " + d.enrollment  + "<br>" +
            "2020 Grad Rate: " + d["2020"]  + "%"
            )
  
    gradRateTooltip.append('text').attr('id', 'tooltipTitle')
      .text(" Graduation Trends")
      .attr('y', 30)
      var width = 270, height = 320;

      var svg = d3.select(".lower-tooltip")
          .append("svg")
          .attr('class', 'grad-graph')
          .attr("width", width)
          .attr("height", height);

      svg.append("g")
        .attr("transform", "translate(30, 50)")
        .call(d3.axisLeft()
        .scale(d3.scaleLinear()
          .domain([0, 100])
          .range([height/2, 0])));

      svg.append("g")
        .attr("transform", "translate(30, " + (height/2 + 50)  +")")
        .call(d3.axisBottom()
          .scale(d3.scaleLinear()
            .domain([2001, 2020])
            .range([0, width - 38]))
          .tickFormat(d3.format("d")))
        .selectAll("text")	
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");


      console.log(d.metric)
      svg
      // .select('.grad-graph')
      .append("path")
      .attr("class", "line")
      .data(d.metric)      
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d.perc) })
        )
      



    // ---------------- ETHNICITY BAR GRAPH ---------------- //
    lowerTooltip.append('text').attr('id', 'tooltipTitle')
      .text(" Ethnicity Breakdown")
      .attr('y', 30)
    var ethnArray = {"hisp_perc": 'Hisp', "black_perc": 'Black',
     "white_perc": 'White', "asian_perc": 'Asian', "other_perc": 'Other'};
    let y = 50
    for (var ethn in ethnArray){
      lowerTooltip
        .append("rect")
        .attr('id', 'ethn-bar')
        .attr("y", y)
        .attr("width", 0)
        .transition()
        .duration(500)
        .attr("width", 2 * parseInt(d[ethn].replace("%","")))
      lowerTooltip
        .append("text")
        .text(ethnArray[ethn] + ": " + d[ethn])
        .attr("x", 10)
        .attr("y", y + 20)
        .transition()
        .duration(500)
        .attr("x", 10 + 2 * parseInt(d[ethn].replace("%","")));  
      y += 40;
    }
    d3.select(this)
      .style("stroke", "grey")
      .attr("stroke-width", 2)
      .style("opacity", 0.8)
  }


  var mouseleave = function(d) {
    Tooltip.style("opacity", 0.1)
    // gradRateTooltip.selectAll('text').remove()
    // gradRateTooltip.selectAll('svg').remove()
    lowerTooltip.selectAll('rect').remove()
    lowerTooltip.selectAll('text').remove()
    d3.select(this)
      .style("stroke", "#5e5e5e")
      .attr("stroke-width", 1)
      .style("opacity", 0.7)
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
    .attr("fill", function(d){ return color_threshold(d["2020"]) })
    .attr("stroke", "#5e5e5e")
    .attr("opacity", 0.7)
  .on("mouseover", mouseover)
  .on("mouseleave", mouseleave)

  
  function update(){
    // For each check box
    d3.selectAll(".checkbox").each(function(d){
      var value = d3.select(this).property('value')
      var checked = d3.select(this).property('checked')

      if(checked){
        svg.selectAll("."+value).transition().duration(500).style("opacity", 0.7)
        .attr("r", function(d){ return size(d.enrollment) })
      }else{
        svg.selectAll("."+value).transition().duration(500).style("opacity", 0)
        .attr("r", 0)
      }
    })
  }

  d3.selectAll(".checkbox").on("change",update);

  update()


})


