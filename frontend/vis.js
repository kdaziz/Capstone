if (d3 === null) return;

var request = new XMLHttpRequest();
request.open("POST", get, true);
request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
request.onreadystatechange = function() {
  if (request.readyState == 4 && request.status == 200) {
      cb(JSON.parse(request.response));
    }
};
request.send();
var cb = function(response) {
  graph = response.results.data[0]; || {};
  drawGraph(graph);
}

var width = 960,
    height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .linkDistance(10)
    .linkStrength(2)
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//graph is {nodes:[],links:[]}
var drawGraph = function(graph) {
  var nodes = graph.nodes.slice(),
      links = [],
      bilinks = [];

  graph.links.forEach(function(link) {
    var s = nodes[link.source],
        t = nodes[link.target],
        i = {}; // intermediate node
    nodes.push(i);
    links.push({source: s, target: i}, {source: i, target: t});
    bilinks.push([s, i, t]);
  });

  force
      .nodes(nodes)
      .links(links)
      .start();

  var link = svg.selectAll(".link")
      .data(bilinks)
    .enter().append("path")
      .attr("class", "link");

  var node = svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
      .call(force.drag);

  node.append("title")
      .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("d", function(d) {
      return "M" + d[0].x + "," + d[0].y
          + "S" + d[1].x + "," + d[1].y
          + " " + d[2].x + "," + d[2].y;
    });
    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  });
});