import React from 'react';
import Graph from 'react-graph-vis';

class Network extends React.Component {
    constructor() {
        super();
        this.state = {
            graph: {
                nodes: [],
                edges: []
            },
            user_name: '',
            value: null,
            avatar: null,
            followers: [],
            following: [],
            clicking_node: [],
            clicked_nodes: []

        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.initGraph();
        // this.initSelf('coldray');
    }

    initGraph() {
        this.setState({
            graph: {
                nodes: [
                    {id: 1, label: 'Node 1'},
                    {id: 2, label: 'Node 2'},
                    {id: 3, label: 'Node 3'},
                    {id: 4, label: 'Node 4'},
                    {id: 5, label: 'Node 5'}
                ],
                edges: [
                    {from: 1, to: 2},
                    {from: 1, to: 3},
                    {from: 2, to: 4},
                    {from: 2, to: 5}
                ]
            },
            counter: 1

        });
    }

    getOptions() {
        return(
            {
                autoResize: true,
                size: 10,
                layout: {
                    hierarchical: false
                },

                edges: {
                    arrows: {
                        to:     {enabled: false, scaleFactor:1, type:'arrow'},
                        middle: {enabled: false, scaleFactor:1, type:'arrow'},
                        from:   {enabled: false, scaleFactor:1, type:'arrow'}
                    }
                }
            }
        );
    }

    getEvents() {
        return({
            select: function(event) {
                var { nodes, edges } = event;
                console.log("select node");
                console.log(nodes);
                console.log("select edge");
                console.log(edges);
                this.setState({
                    clicking_node: nodes
                });

            }.bind(this)
        });
    }

    deDupNode(nodesToAdd) {
        let nodes = this.state.graph.nodes;
        let len = nodes.length;
        let filteredNodes = [];
        function isNewNode(node) {
            for (var i = 0; i < len; i++) {
                if (node.id === nodes[i].id) {
                    // console.log("dup node");
                    return false;
                }
            }
            // console.log("is new node");
            return true;
        }
        for (var j = 0; j < nodesToAdd.length; j++) {
            if (isNewNode(nodesToAdd[j])) {
                // console.log("checking if this node should be add");
                filteredNodes.push(nodesToAdd[j]);
            }
        }
        return filteredNodes;
    }

    deDupEdge(edgesToAdd) {
        // There should only be 1 edge between two nodes
        let edges = this.state.graph.edges;
        let len = edges.length;
        let filteredEdges = [];
        function isNewEdge(edge) {
            for (var i = 0; i < len; i++) {
                if (edge.from === edges[i].from && edge.to === edges[i].to) {
                    // console.log("from === from, to === to");
                    return false;
                } else if (edge.to === edges[i].from && edge.from === edges[i].to) {
                    // console.log("to === from, from === to");
                    return false;
                } else if(edge.from === edge.to) {
                    return false;
                }
            }
           return true;
        }
        for (var j = 0; j < edgesToAdd.length; j++) {
            if (isNewEdge(edgesToAdd[j])) {
                // console.log("checking if the edge should be added");
                filteredEdges.push(edgesToAdd[j]);
            }
        }
        return filteredEdges;
    }

    get_avatar_from_user(username) {
        let request = new Request('https://api.github.com/users/' + username.toString(), {
            method: 'GET',
            cache: false
        });

        fetch(request)
            .then((res) => res.json())
            .then((data) => {
                console.log(data.avatar_url);

                this.setState({
                  avatar: data.avatar_url
              });
            });

    }



    initSelf(username) {
        this.setState({
            graph: {
                nodes: [
                    {id: username.toString(), label: username.toString(), shape: 'image', image: {
                        selected: this.state.avatar,
                        unselected: this.state.avatar
                    }},
                ],
                edges: []
            }

        });
    }

    handleChange(event) {
        console.log(event.target.value);
        this.setState({value: event.target.value});
        console.log(this.get_avatar_from_user('coldray'));
    }

    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
        this.initSelf(this.state.value);
        this.renderGraph();
    }

    getFollowers(username) {
        console.log("username: " + username);
        if (username) {
            let request = new Request('https://api.github.com/users/' + username + '/followers', {
                method: 'GET',
                cache: false
            });

            fetch(request)
                .then((res) => res.json())
                .then((data) => {

                    this.setState({
                        followers: data
                    });
                    return data;
                });
        }

    }
    click_handler() {
        const nodesToAdd = [];
        const edgesToAdd = [];
        const clicking_node = this.state.clicking_node;
        console.log(clicking_node);
        this.getFollowers(clicking_node["0"]);
        let followers = this.state.followers;
        console.log(followers);
        if (clicking_node.length !== 0)  {
            for (let i = 0; i < followers.length; i++) {
                nodesToAdd.push(
                    {id: followers[i].login, label: followers[i].login, shape: 'image', image: {
                    selected: followers[i].avatar_url,
                    unselected: followers[i].avatar_url}
                    });
                edgesToAdd.push({from: clicking_node["0"], to: followers[i].login});
                this.addSubNetwork(nodesToAdd, edgesToAdd);
            }
        }

        // this.setState({
        //     clicked_nodes: this.state.clicked_nodes.push(this.state.clicking_node)
        // });
    }
    // push is not a function because clicked nodes is an object not a array fix it tomorrow;
    hasNotBeenClicked(clicking_node) {
        console.log(this.state.clicked_nodes);
        var count=this.state.clicked_nodes.length;
        for(var i=0;i<count;i++)
        {
            if(this.state.clicked_nodes[i]=== clicking_node){return true;}
        }
        return false;

    }
    addSubNetwork(nodesToAdd, edgesToAdd) {
        let graph = this.state.graph;
        let nodes = graph.nodes;
        let edges = graph.edges;
        let deDupNodes = this.deDupNode(nodesToAdd);
        let deDupEdges = this.deDupEdge(edgesToAdd);
        this.setState({
            graph: {
                ...graph,
                nodes: nodes.concat(deDupNodes),
                edges: edges.concat(deDupEdges)
            }
        })
    }

    renderGraph() {
        return(
            <Graph graph={this.state.graph} options={this.getOptions()} events={this.getEvents()}/>
        );
    }

    render() {
        return(
            <div>
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            Name:
                            <input type="text" value={this.state.value} onChange={this.handleChange}  />
                        </label>
                        <input type="submit" value="Submit" />
                    </form>
                </div>
                <div onClick={this.click_handler.bind(this)}>
                    {this.renderGraph()}
                </div>
                {/*<div>*/}
                    {/*{this.renderGraph()}*/}
                {/*</div>*/}
            </div>

        );



    }
}

export default Network;