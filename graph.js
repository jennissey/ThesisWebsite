/*
    bound to a button, that let's people upload their graph file in the
    kiali json-format
*/
function upload_kiali_graph(evt) {
    // TODO: do this with a predefined object that represents the correct format
    // so the file can be rejected if it is not correct
    var file = evt.target.files[0];
    var kiali_graph_string;

    var reader = new FileReader();
    reader.onload = function() {
        kiali_graph_string = reader.result;
        //document.getElementById("imagetest").innerHTML = kiali_graph_string;
        var kiali_graph_obj = JSON.parse(kiali_graph_string);
        document.getElementById("imagetest").innerHTML = kiali_graph_obj.elements.nodes[0].data.id;
        // convert kiali format into the standard format
        convert_kiali_to_standard(kiali_graph_obj);
        draw_graph(graph_obj);
    }
    reader.readAsText(file);
}

/*
    bound to a button, that let's people upload their manually written graph
    in the standard json-format defined for this website
    TODO: Format formal beschreiben und einen Link zu der Beschreibung setzen
          Die Beschreibung könnte auch auf der Website verlinkt werden, so dass 
          Benutzer erfahren können, welches Format ihr Graph haben sollte
*/
function upload_standard_graph(evt){
    // TODO: do this with a predefined object that represents the correct format
    // so the file can be rejected if it is not correct
    var graph_obj = JSON.parse(evt.target.file);
    draw_graph(graph_obj);
}

/*
    TODO 0: write a graph in the standard format
    TODO 1: write this function
    draw the graph and display it on the website
    the graph has to be a javascript object
    only works with the standard format, kiali format
    has to be converted before calling this function
*/
function draw_graph(graph_obj) {
    // create the graph
    var g = new dagre.graphlib.Graph();
    g.setGraph({});
    g.setDefaultEdgeLabel(function() { return {}; });

    var nodes = graph_obj.nodes;
    for(var i = 0; i < nodes.length; i++){
        node = nodes[i];
        g.setNode(nodes.id,    { label: nodes.app + "-" + nodes.version,  width: 144, height: 100 });
    }

    var edges = graph_obj.edges;
    for(var i = 0; i < edges.length; i++){
        edge = edges[i];
        g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    // draw the graph
    var render = new dagreD3.render();
    var svg = d3.select("svg"),
    svgGroup = svg.append("g");
    render(d3.select("svg g"), g);

}


/*
    TODO 2
    convert the kiali json format into the easier format used to draw the graph
*/
function convert_kiali_to_standard(kiali_graph_obj){

}

/*
    bind the function upload_kiali_graph to the button graph_file_kiali
    call the function every time a new file is uploaded
    wait until the whole document is loaded before binding events
*/
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('graph_file_kiali').addEventListener('change', upload_kiali_graph, false);
  });

/*
    bind the function upload_standard_graph to the button graph_file
    call the function every time a new file is uploaded
    wait until the whole document is loaded before binding events
*/
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('graph_file').addEventListener('change', upload_standard_graph, false);
  });


/* 
Dieses Format wollen wir erreichen:
{
    "nodes": [
        {
          "id": "47efcb6a38cec94b8f02e15c58ce44df",
          "app": "details",
          "version": "v1",
          // erstmal per Hand einfügen
          "link" : "details-v1/docs"
        }
    ],
    "edges": [
      {
        "id": "5d577c549824d1376e9fb8477324240c",
        "source": "11b370489b738638fabddc4f4ce47ebd",
        "target": "b744c74ec7104950b36f9bf0b47a22fd"
      }
    ]
}
*/