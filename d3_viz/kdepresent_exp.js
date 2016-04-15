
var data, estimators;

function Compare(Match, part) {
	return function(element) {
		return element[part] == Match;
	}
}

function interpolateNumber(a, b) {
  return function(t) {
    return a + t * (b - a);
  };
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

//var width = 775,
//   height = 600,
var    padding = 30;

var ww = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0];
//    width = ww.innerWidth - margin.left - margin.right || e.clientWidth - margin.left - margin.right || g.clientWidth - margin.left - margin.right,
//    height = ww.innerHeight - margin.top - margin.bottom|| e.clientHeight - margin.top - margin.bottom || g.clientHeight - margin.top - margin.bottom;



var wid = ww.innerWidth || e.clientWidth || g.clientWidth,
    heig = ww.innerHeight || e.clientHeight || g.clientHeight;

var height = heig * 0.8 - padding
var width = wid * 0.7 - 2 * padding


var h1 = 400, w1 = 700, bins1, kde1, line1;
var max1;


var corux = 0.2, coruy = 0.2, is = 0.3;
var currcorux, currcoruy, curris;
var values_corux, values_coruy, values_is;
var data_filter, truth = 1;

var xdomain = [0, 2]
var ydomain = [0, 10]

var legenddomx = [0,1.5]
var legenddomy = [0,7]

var w = width, h = height;
var vis = d3.select("div#kde").append("svg")
	.attr("width", w + 2 * padding)
	.attr("height", h + 2 * padding);



var scalex = d3.scale.linear()
                          .domain(xdomain)
                          .range([3*padding, width-3*padding]);

var scaley = d3.scale.linear()
                          .domain(ydomain)
                          .range([height-1.5*padding, 2*padding]);

var unscalex = d3.scale.linear()
                          .range(xdomain)
                          .domain([3*padding, width-3*padding]);

var unscaley = d3.scale.linear()
                          .range(ydomain)
                          .domain([height-2*padding, 2*padding]);

var xAxis = d3.svg.axis()
                          .scale(scalex)
                          .orient("bottom")
			  .ticks(5);

var yAxis = d3.svg.axis()
                          .scale(scaley)
                          .orient("left")
                          .ticks(10);


vis.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + (height-padding) + ")")
  .call(xAxis)
	.append("text")
	.attr("y", 55)
        .attr("x", 335)
	.attr("dx", ".71em")

  .style("text-anchor", "center")
  .text("Beta Estimate");

vis.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + 3*padding + ",0)")
        .call(yAxis)
            .append("text")
      .attr("y", 5)
      .attr("x", 21)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("density");

var legend = vis.append("g")
	  .attr("class", "legend")
	  .attr("height", 100)
	  .attr("width", 100)
    	  .attr('transform', 'translate(-150,30)')

var betaTruth = vis.selectAll('path.median.x')
    .data([[[truth,ydomain[0]], [truth,ydomain[1]]]])
    .enter()
    .append('svg:path')
    .attr('class', 'median x')
    .attr("d", d3.svg.line()
    .x(function(d,i) {
        return scalex(d[0]);
    })
    .y(function(d,i) {
        return scaley(d[1]);
    })
);

var myDensityLines = [];

d3.csv("d3_viz/data/sim_exp_500_9_16_15_for_d3.csv", function(input) {

  estimators = d3.set(input.map(function(x) {return x.estimator})).values();
  values_corux = d3.set(input.map(function(x) {return x.EFFUX})).values();
  values_coruy = d3.set(input.map(function(x) {return x.EFFUY})).values();
  values_is = d3.set(input.map(function(x) {return x.IS})).values();
  corux = d3.min(values_corux);
  coruy = d3.min(values_coruy);
  is = d3.min(values_is);
  is = 0.5;

  data_filtered = input.filter(Compare(corux, 'EFFUX')).filter(Compare(corux, 'EFFUY')).filter(Compare(is, 'IS'));
  var real_corux = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[1], 4);
  d3.select("#sliderCORUXtext").text(real_corux);
  var real_coruy = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[2], 4);
  d3.select("#sliderCORUYtext").text(real_coruy);
  var real_coris = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[3], 4);
  d3.select("#sliderCORIStext").text(real_coris);
  var kdes = [];
  var colours = ["#E60000", "#6C91FF", "#D1E0E0", "#00CC00"];

  var line = d3.svg.line()
      .x(function(d) { return scalex(d[0]); })
      .y(function(d) { return scaley(d[1]); });

   legend.selectAll('rect')
      .data(estimators)
      .enter()
      .append("rect")
	  .attr("x", w - 65)
      .attr("y", function(d, i){ return i *  30;})
	  .attr("width", 15)
	  .attr("height", 15)
	  .style("fill", function(d) {
        	var color = colours[estimators.indexOf(d)];
        	return color;
      	  })

   legend.selectAll('text')
      .data(estimators)
      .enter()
      .append("text")
	  .attr("x", w - 45)
      .attr("y", function(d, i){ return i *  30 + 12;})
	  .text(function(d) {
        	var text = d;
        	return text;
      	   }).attr("class", "legend");


  for(var g = 0; g < estimators.length; g++)
  {
      myDensityLines[g] = document.createElement('input');

      data = _.toArray(data_filtered.filter(Compare(estimators[g], 'estimator'))[0]).slice(7,507).map(Number);

      var x = d3.scale.linear().domain(xdomain).range([0, w]);
          y = d3.scale.linear().domain(ydomain).range([0, h]),

      bins1 = d3.layout.histogram().frequency(false).bins(x.ticks(60))(data);
      max1 = d3.max(bins1, function(d) { return d.y; })
      kde1 = science.stats.kde().sample(data);
      kdes.push(kde1);


      myDensityLines[g] = vis.append("path")
	      .data(d3.values(science.stats.bandwidth))
	      .attr("class", "line")
	      .attr("d", function(h) {
		return line(kdes[g].bandwidth(h)(d3.range(xdomain[0], xdomain[1], .01)));
	      })
	      .attr("id", estimators[g])
	      .attr("colorid", colours[g])
	      .attr("mean", d3.round(d3.mean(data), 3))
	      .style("stroke", colours[g])
	      .on("mouseover", function(d) {
                        d3.select(this).style("stroke", "yellow");
                                        var mousepoz = d3.mouse(this);

                                        d3.select("#tooltip")
                                          .style("left", mousepoz[0] + 65 + "px")
                                         .style("top", mousepoz[1] + 35 + "px")
                                         .select("#value")
                                         .text(d3.select(this).attr("id") + " estimator. Mean: " + d3.select(this).attr("mean"));

                                        //Show the tooltip
                                        d3.select("#tooltip").classed("hidden", false);


                })
              .on("mouseout", function() {
		d3.select(this).style("stroke", d3.select(this).attr("colorid"));
                d3.select("#tooltip").classed("hidden", true);

                });



  }


  d3.select("#sliderEFFUXtext").text(d3.min(values_corux));
  d3.select('#sliderCORUX')
        .call( d3.slider()
                        //.axis(true)
                        .min(d3.min(values_corux))
                        .max(d3.max(values_corux))
                        //.orientation("vertical")
                        .step(0.25)
                        .value(d3.min(values_corux))
                        .on("slide", function(evt, value) {
      				d3.select('#sliderEFFUXtext').text(Math.floor(100*value)/100);
				corux = Math.floor(100*value)/100;

  currcorux = corux;
  data_filtered = input.filter(Compare(corux, 'EFFUX')).filter(Compare(coruy, 'EFFUY')).filter(Compare(is, 'IS'));
  var real_corux = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[1], 4);
  d3.select("#sliderCORUXtext").text(real_corux);
  var real_coruy = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[2], 4);
  d3.select("#sliderCORUYtext").text(real_coruy);
  var real_coris = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[3], 4);
  d3.select("#sliderCORIStext").text(real_coris);
  var kdes = [];


  for (var i=0; i<estimators.length; i++) {

	  data = _.toArray(data_filtered.filter(Compare(estimators[i], 'estimator'))[0]).slice(7,507).map(Number);

	  var x = d3.scale.linear().domain(xdomain).range([0, w]);
	      y = d3.scale.linear().domain(ydomain).range([0, h]),

	  bins1 = d3.layout.histogram().frequency(false).bins(x.ticks(60))(data);
	  max1 = d3.max(bins1, function(d) { return d.y; })
	  kde1 = science.stats.kde().sample(data);
	  kdes.push(kde1);

	  myDensityLines[i]
	      .data(d3.values(science.stats.bandwidth))
	      .attr("class", "line")
	      .attr("mean", d3.round(d3.mean(data), 3))
	      .transition().duration(500).ease("ease")
	      .attr("d", function(h) {
		return line(kdes[i].bandwidth(h)(d3.range(xdomain[0], xdomain[1], .01)));
	      })
	      .attr("stroke", colours[i]);
  }

scaley.domain(ydomain);

unscaley.range(ydomain);
  vis.select(".y.axis")
      .transition()
      .duration(750)
      .call(yAxis);
}))

  d3.select("#sliderEFFUYtext").text(d3.min(values_coruy));
  d3.select('#sliderCORUY')
        .call( d3.slider()
                        //.axis(true)
                        .min(d3.min(values_coruy))
                        .max(d3.max(values_coruy))
                        //.orientation("vertical")
                        .step(0.25)
                        .value(d3.min(values_coruy))
                        .on("slide", function(evt, value) {
      				d3.select('#sliderEFFUYtext').text(Math.floor(100*value)/100);
				coruy = Math.floor(100*value)/100;

  currcoruy = coruy;
  data_filtered = input.filter(Compare(corux, 'EFFUX')).filter(Compare(coruy, 'EFFUY')).filter(Compare(is, 'IS'));
  var real_corux = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[1], 4);
  d3.select("#sliderCORUXtext").text(real_corux);
  var real_coruy = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[2], 4);
  d3.select("#sliderCORUYtext").text(real_coruy);
  var real_coris = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[3], 4);
  d3.select("#sliderCORIStext").text(real_coris);
  var kdes = [];


  for (var i=0; i<estimators.length; i++) {

	  data = _.toArray(data_filtered.filter(Compare(estimators[i], 'estimator'))[0]).slice(7,507).map(Number);

	  var x = d3.scale.linear().domain(xdomain).range([0, w]);
	      y = d3.scale.linear().domain(ydomain).range([0, h]),

	  bins1 = d3.layout.histogram().frequency(false).bins(x.ticks(60))(data);
	  max1 = d3.max(bins1, function(d) { return d.y; })
	  kde1 = science.stats.kde().sample(data);
	  kdes.push(kde1);

	  myDensityLines[i]
	      .data(d3.values(science.stats.bandwidth))
	      .attr("class", "line")
	      .attr("mean", d3.round(d3.mean(data), 3))
	      .transition().duration(500).ease("ease")
	      .attr("d", function(h) {
		return line(kdes[i].bandwidth(h)(d3.range(xdomain[0], xdomain[1], .01)));
	      })
	      .attr("stroke", colours[i]);
  }
scaley.domain(ydomain);

unscaley.range(ydomain);
  vis.select(".y.axis")
      .transition().duration(500)
      .call(yAxis);
}))


  d3.select("#sliderIStext").text(0.5);
  d3.select('#sliderIS')
        .call( d3.slider()
                        //.axis(true)
                        .min(d3.min(values_is))
                        .max(d3.max(values_is))
                        //.orientation("vertical")
                        .step(0.25)
                        .value(0.5)
                        .on("slide", function(evt, value) {
      				d3.select('#sliderIStext').text(d3.round(Math.floor(100*value)/100, 2));
				is = d3.round(Math.floor(100*value)/100, 2);
  curris = is;
  data_filtered = input.filter(Compare(corux, 'EFFUX')).filter(Compare(coruy, 'EFFUY')).filter(Compare(is, 'IS'));
  var real_corux = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[1], 4);
  d3.select("#sliderCORUXtext").text(real_corux);
  var real_coruy = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[2], 4);
  d3.select("#sliderCORUYtext").text(real_coruy);
  var real_coris = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[3], 4);
  d3.select("#sliderCORIStext").text(real_coris);
  var kdes = [];


  for (var i=0; i<estimators.length; i++) {

	  data = _.toArray(data_filtered.filter(Compare(estimators[i], 'estimator'))[0]).slice(7,507).map(Number);

	  var x = d3.scale.linear().domain(xdomain).range([0, w]);
	      y = d3.scale.linear().domain(ydomain).range([0, h]),

	  bins1 = d3.layout.histogram().frequency(false).bins(x.ticks(60))(data);
	  max1 = d3.max(bins1, function(d) { return d.y; })
	  kde1 = science.stats.kde().sample(data);
	  kdes.push(kde1);

	  myDensityLines[i]
	      .data(d3.values(science.stats.bandwidth))
	      .attr("class", "line")
	      .attr("mean", d3.round(d3.mean(data), 3))
	      .transition().duration(500).ease("ease")
	      .attr("d", function(h) {
		return line(kdes[i].bandwidth(h)(d3.range(xdomain[0], xdomain[1], .01)));
	      })
              .transition()
              .duration(500)
	      .attr("stroke", colours[i]);
  }
scaley.domain(ydomain);

unscaley.range(ydomain);
  vis.select(".y.axis")
      .transition()
      .duration(500)
      .call(yAxis);
}))
//}) // end slider call
	// add legend


     d3.select(window).on('resize.two', function() {
       width = ww.innerWidth || e.clientWidth || g.clientWidth;
       height = ww.innerHeight || e.clientHeight || g.clientHeight;
       h = height * 0.8 - padding
       w = width * 0.65 - padding

console.log(w);
console.log(h);
      vis.attr("width", w + 2 * padding).attr("height", h + 2 * padding);

       //updateChartNoTransition(resources);

      scalex.range([3*padding, w-3*padding]);

      scaley.range([h-1.5*padding, 2*padding]);

      unscalex.domain([3*padding, w-3*padding]);

      unscaley.domain([h-2*padding, 2*padding]);

       vis.select('g.x.axis').attr("transform", "translate(0," + (h-padding) + ")")
          .call(xAxis)
          .append("text")
	   .attr("y", 55)
          .attr("x", 335)
	   .attr("dx", ".71em");



       vis.select("g.y.axis").attr("transform", "translate(" + 3*padding + ",0)")
          .call(yAxis)
           .append("text")
          .attr("y", 5)
          .attr("x", 21)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("density");

       vis.selectAll(".line").attr("d", line);

vis.selectAll("path.median.x").remove();

vis.selectAll('.legend').remove();


legend = vis.append("g")
	  .attr("class", "legend")
	  .attr("height", (100 / 775) * h )
	  .attr("width", (100 / 600) * w )
    	  .attr('transform', 'translate(((350 / 775) * w),(350 / 600) * h)')


var betaTruth = vis.selectAll('path.median.x')
    .data([[[truth,ydomain[0]], [truth,ydomain[1]]]])
    .enter()
    .append('svg:path')
    .attr('class', 'median x')
    .attr("d", d3.svg.line()
    .x(function(d,i) {
        return scalex(d[0]);
    })
    .y(function(d,i) {
        return scaley(d[1]);
    })
);




  //data_filtered = input.filter(Compare(corux, 'EFFUX')).filter(Compare(coruy, 'EFFUY')).filter(Compare(is, 'IS'));
  //var real_corux = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[1], 4);

  //d3.select("#sliderCORUXtext").text(real_corux);
  //var real_coruy = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[2], 4);
  //d3.select("#sliderCORUYtext").text(real_coruy);
  //var real_coris = d3.round(_.toArray(data_filtered.filter(Compare(estimators[0], 'estimator'))[0])[3], 4);
  //d3.select("#sliderCORIStext").text(real_coris);
  var kdes = [];
  var colours = ["#00CC00", "#6C91FF", "#D1E0E0", "#E60000"];

  var line = d3.svg.line()
      .x(function(d) { return scalex(d[0]); })
      .y(function(d) { return scaley(d[1]); });

   legend.selectAll('rect')
      .data(estimators)
      .enter()
      .append("rect")
	  .attr("x", scalex(1.5)  )
      .attr("y", function(d, i){ return scaley(-i * 0.75 + 10) - (12 / 600) * h;})
	  .attr("width",  (15/775)*w )
	  .attr("height", (15/775)*w )
	  .style("fill", function(d) {
        	var color = colours[estimators.indexOf(d)];
        	return color;
      	  })

   legend.selectAll('text')
      .data(estimators)
      .enter()
      .append("text")
	  .attr("x",scalex(1.6))
      .attr("y", function(d, i){ return scaley(-i * 0.75 + 10) ;})
	  .text(function(d) {
        	var text = d;
        	return text;
      	   }).attr("class", "legend");


  for(var g = 0; g < estimators.length; g++)
  {
      myDensityLines[g] = document.createElement('input');

      data = _.toArray(data_filtered.filter(Compare(estimators[g], 'estimator'))[0]).slice(7,507).map(Number);

      var x = d3.scale.linear().domain(xdomain).range([0, w]);
          y = d3.scale.linear().domain(ydomain).range([0, h]),

      bins1 = d3.layout.histogram().frequency(false).bins(x.ticks(60))(data);
      max1 = d3.max(bins1, function(d) { return d.y; })
      kde1 = science.stats.kde().sample(data);
      kdes.push(kde1);


      myDensityLines[g] = vis.append("path")
	      .data(d3.values(science.stats.bandwidth))
	      .attr("class", "line")
	      .attr("d", function(h) {
		return line(kdes[g].bandwidth(h)(d3.range(xdomain[0], xdomain[1], .01)));
	      })
	      .attr("id", estimators[g])
	      .attr("colorid", colours[g])
	      .attr("mean", d3.round(d3.mean(data), 3))
	      .style("stroke", colours[g])
	      .on("mouseover", function(d) {
                        d3.select(this).style("stroke", "yellow");
                                        var mousepoz = d3.mouse(this);

                                        d3.select("#tooltip")
                                          .style("left", mousepoz[0] + 65 + "px")
                                         .style("top", mousepoz[1] + 35 + "px")
                                         .select("#value")
                                         .text(d3.select(this).attr("id") + " estimator. Mean: " + d3.select(this).attr("mean"));

                                        //Show the tooltip
                                        d3.select("#tooltip").classed("hidden", false);


                })
              .on("mouseout", function() {
		d3.select(this).style("stroke", d3.select(this).attr("colorid"));
                d3.select("#tooltip").classed("hidden", true);

                });



  }





    });



});
