/*
    bound to a button, that let's people upload their graph file in the
    kiali json-format
*/
function upload_kiali_graph(evt) {
    console.log("upload kiali");
    // TODO: do this with a predefined object that represents the correct format
    // so the file can be rejected if it is not correct
    var file = evt.target.files[0];
    var kiali_graph_string;

    var reader = new FileReader();
    reader.onload = function() {
        kiali_graph_string = reader.result;
        // to prevent graph from disappearing when site is reloaded
        window.localStorage.setItem('graph', kiali_graph_string);
        window.localStorage.setItem('graph_type', 'kiali');
        var kiali_graph_obj = JSON.parse(kiali_graph_string);

        // convert kiali format into the standard format
        graph_obj = convert_kiali_to_standard(kiali_graph_obj);

        // TODO: here the user might be asked to provide links to his documentation
        // because a kiali graph does not contain such information
        draw_graph(graph_obj);

        // TODO: add a button, that makes it possible to download the graph-object
        // as a json-file to add missing connections (the kiali graph is based on 
        // the network traffic in a certain time span, so it might be incomplete)

        // reset the upload button, because if the same file is uploaded again,
        // the button does not fire a change-event if this is not done, this
        // would lead to problems, if a standard-graph is uploaded between the 
        // two uploads of the same kiali-graph
        document.getElementById("graph_file_kiali").value = null;
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
    console.log("upload standard");
    var file = evt.target.files[0];
    var graph_string;

    var reader = new FileReader();
    reader.onload = function() {
        graph_string = reader.result;
        // to prevent graph from disappearing when site is reloaded
        window.localStorage.setItem('graph', graph_string);
        window.localStorage.setItem('graph_type', 'standard');
        var graph_obj = JSON.parse(graph_string);
        draw_graph(graph_obj);
        document.getElementById("graph_file").value = null;
    }
    reader.readAsText(file);
}

/*
    TODO 1: write this function
    draw the graph and display it on the website
    the graph has to be a javascript object
    only works with the standard format, kiali format
    has to be converted before calling this function
*/
function draw_graph(graph_obj) {

    // create the graph
    var g = new dagreD3.graphlib.Graph({compound:true});
    g.setGraph({});
    g.setDefaultEdgeLabel(function() { return {}; });

    var nodes = graph_obj.nodes;
    var clusters = [];
    var nodes_included = [];
    for(var i = 0; i < nodes.length; i++){
        node = nodes[i];
        // The links are not limited to swagger documentation. The user should be able to bind any link to his node using the link attribute in the graph specification.
        // This design choice enables the user to use the website with any documentation form. Each microservice can be documented in it's own way.
        // Setting a link to a documentation is not required
        // If the graph specification was uploaded in kiali format, the links can be set later.
        if(node.link !== undefined){
            g.setNode(node.id, { labelType: "html", label: "<a href=" + node.link + ">" + node.app + "-" + node.version + "</a>",  width: node.app.length*10+10, height: 40, style: "fill: #afa", href: "http://www.google.com"});
        }
        else{
            g.setNode(node.id, { labelType: "html", label: node.app + "-" + node.version,  width: node.app.length*10+10, height: 40, href: "http://www.google.com"});
        }
        // create a cluster if the node is another version of an already existing app
        if(nodes_included.includes(node.app)){
            if(!clusters.includes(node.app)){
                g.setNode(node.app, {label: node.app, clusterLabelPos: ""});
                clusters.push(node.app);
            }
        }
        else{
            nodes_included.push(node.app);
        }
    }

    // add the nodes to their corresponding clusters
    // this is necessary, because the cluster is created after the second occurence
    // of an apps name, so the first version of the app would not be added if
    // everything is done in the first loop
    for(var i = 0; i < nodes.length; i++){
        node = nodes[i];
        if(clusters.includes(node.app)){
            g.setParent(node.id, node.app);
        }
    }

    var edges = graph_obj.edges;
    for(var i = 0; i < edges.length; i++){
        edge = edges[i];
        g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    // draw the graph
    var render = new dagreD3.render();
    //d3.select("svg").remove();
    //var svg = d3.select("#graph").append("svg").attr("width", 800).attr("height", 500);
    var svg = d3.select("svg");
    var svgGroup = svg.append("g");
    render(d3.select("svg g"), g);

    // Center the graph
    // von: https://dagrejs.github.io/project/dagre-d3/latest/demo/sentence-tokenization.html
    var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
    svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
    svg.attr("height", g.graph().height + 40);
}


/*
    convert the kiali json format into the easier format used to draw the graph
*/
// TODO: How can the user add links to his documentation after uploading a kiali graph?
// option 1: Make nodes clickable to add a link
// option 2: store the standard format of the kiali graph
//           and make it downloadable, to add the missing links
// option 3: after drawing the graph, make a form pop up where the user
//           is asked for a link for each node
function convert_kiali_to_standard(kiali_graph_obj){
    var graph_obj = {
        nodes: [],
        edges: []
    };

    var nodes = kiali_graph_obj.elements.nodes;
    for(var i = 0; i < nodes.length; i++){
        node = nodes[i];
        graph_obj.nodes.push({
            id : node.data.id,
            app : node.data.app,
            version : node.data.version
        });
    }

    var edges = kiali_graph_obj.elements.edges;
    for(var i = 0; i < edges.length; i++){
        edge = edges[i];
        graph_obj.edges.push({
            source : edge.data.source,
            target : edge.data.target
        });
    }

    return graph_obj;
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


// to prevent graph from disappering when the site is reloaded
window.onload = function(e){
    var graph_stored = window.localStorage.getItem('graph');
    var graph_type = window.localStorage.getItem('graph_type');
    if(graph_stored === null){
        return;
    }
    var graph_obj = JSON.parse(graph_stored);
    if(graph_type == 'kiali'){
        convert_kiali_to_standard(graph_obj);
    }
    draw_graph(graph_obj);
}