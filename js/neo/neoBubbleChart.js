angular.module('nasaViewer').directive('bubbleChart', function() {
    return {
      restrict: 'E',
      scope: {
        data: '=',
        radiusSelector: '=',
        colorSelector: "="
      },
      link: function($scope, elem, attrs) {

          $scope.$watch("data", function(n, o) {
            if (n !== o) {
              updateChart();
            }
          });

          //definitions
          var diameter = 800,
          format = d3.format(",d");

  
          var colorInterpolator = d3.interpolateHcl("#750076", "#ffa346");


          //create svg html element for directive and set attributes
          var svg = d3.select(elem[0])
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble")


          //define pack
          var packing = d3.layout.pack()
            .sort(null)
            .size([diameter, diameter])
            .value(function(d) {
              return d.estDiameterKm; // VALUE ACCESSOR -- change this to a variable
            })
            .padding(5);


          function updateChart() {
            
            var radiusSelector = $scope.radiusSelector;
            var colorSelector = $scope.colorSelector;
            var data = $scope.data;

            console.log($scope.radiusSelector)
            console.log($scope.colorSelector)

            //color interpolation max and min
            var max, min;
            data.children.forEach(function(e) {
              max = (e.missDistanceKm*1 < max*1 ? max : e.missDistanceKm*1);
              min = (e.missDistanceKm*1 > min*1 ? min : e.missDistanceKm*1);
            });

            if (data && data.children.length > 0) {
              packing.radius()

              var node = svg.selectAll(".node")
                .data(packing.nodes(data)
                  .filter(function(d) { //commenting this out gives container circle a blue background
                    return !d.children;
                  })
                  );

              node.exit().transition().duration(0).remove();

              node.select("text").remove()

              node.enter().append("g")
                .classed("node", true)
                .attr("transform", function(d) {
                  return "translate(" + d.x + "," + d.y + ")";
                })
                .append("circle")
                .style("fill", function(d) {
                  return colorInterpolator( (d.missDistanceKm - min) / (max - min) );
                })
                .attr('fill-opacity', 0.7)
                .attr('stroke', function(d) {
                  return colorInterpolator( (d.missDistanceKm - min) / (max - min) );
                })
                .attr('stroke-width', 2)

              node.transition()
                .attr("transform", function(d) {
                  return "translate(" + d.x + "," + d.y + ")";
                });

              node.select("circle")
                .transition()
                .attr("r", function(d) {
                  return d.r;
                })

              node.append("text")
                .attr("dy", ".3em")
                .style("text-anchor", "middle")
                .style("pointer-events", "none")
                .text(function(d) {
                  return textHandler(d);
                });
            } //end of if statement
          } //end of update function
          function textHandler(d) {
            if (d.r < 30) {
              return "";
            }
            return d.neoName.substring(0, d.r / 2.5)
          }
        } //end of link
    } //end of return
  }) //end of directive