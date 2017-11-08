import React from 'react';
import Graph from 'react-graph-vis';
import UserTable from '../ExploreForm/userTable';
import TraverseTable from '../ExploreForm/traverseTable';
import queue from 'queue';
import Set from 'simple-hashset';
import {Button} from 'react-bootstrap';
import './Network.css'
class Network extends React.Component {
    constructor() {
        super();
        this.state = {
            graph: {
                nodes: [],
                edges: []
            },
            user: [],
            user_name: '',
            value: null,
            avatar: null,
            followers: [],
            following: [],
            clicking_node: [],
            clicked_nodes: [],
            tra_user: {
                user_1: '',
                user_2: '',
            },
            connections: [],
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate() {
        this.renderGraph();
    }
    componentDidMount() {
        this.initGraph();
    }

    initGraph(username, url) {
        if (username && url) {
            this.setState({
                graph: {
                    nodes: [
                        {id: username, label: username, shape: 'image', image: {
                            selected: url,
                            unselected: url,
                        }},
                    ],
                    edges: []
                }

            });
        }
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


    //pass name and url to init self
    initSelf(username, url) {
        this.setState({
            graph: {
                nodes: [
                    {id: username, label: username, shape: 'image', image: {
                        selected: url,
                        unselected: url
                    }},
                ],
                edges: []
            }

        });
    }

    handleChange(event) {
        console.log(event.target.value);
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
        let request = new Request('http://localhost:3000/users?name=' + this.state.value.toString(), {
            method: 'GET',
            cache: false
        });
        this.setState({
            user: [],
        });
        fetch(request)
            .then((res) => res.json())
            .then((data) => {
                if (data.login && data.avatar_url) {
                        this.setState({
                            graph: {
                                nodes: [
                                    {id: data.login, label: data.login, shape: 'image', image: {
                                        selected: data.avatar_url,
                                        unselected: data.avatar_url,
                                    }},
                                ],
                                edges: []
                            }

                        });
                }
                return data;
            });
        console.log('click the search');
        console.log(this.state.user.login);
        console.log(this.state.user.avatar_url);
        this.initSelf(this.state.user.login, this.state.user.avatar_url);
        // this.renderGraph();
    }

    click_handler() {
        const nodesToAdd = [];
        const edgesToAdd = [];
        const clicking_node = this.state.clicking_node;
        console.log(clicking_node);
        var username = clicking_node["0"];
        if (username) {
            let request = new Request('http://localhost:3000/followers?name=' + username , {
                method: 'GET',
                cache: false
            });
            fetch(request)
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    this.setState({
                        followers: data
                    }, function () {
                        var followers = this.state.followers;
                        console.log(followers);
                        console.log(followers.length);
                        console.log(followers);
                        if (clicking_node.length !== 0)  {
                            if (followers.length === 0) {
                                alert("Opps, this person has no followers");
                                return;
                            }
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
                    });
                    return data;
                });
        }
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

    getUserInfo() {
        var clicking_node = this.state.clicking_node;
        var username = clicking_node['0'];
        let request = new Request('http://localhost:3000/users?name=' + username , {
            method: 'GET',
            cache: false
        });
        fetch(request)
            .then((res) => res.json())
            .then((data) => {
                this.setState({
                    user: data,
                });
                return data;
            });
    }

    getTraverseUser() {
        var clicking_node = this.state.clicking_node;
        var username = clicking_node['0'];
        let request = new Request('http://localhost:3000/users?name=' + username , {
            method: 'GET',
            cache: false
        });
        fetch(request)
            .then((res) => res.json())
            .then((data) => {
            if (this.state.tra_user.user_1 === '') {
                this.setState({
                    tra_user: {
                        user_1: data.login,
                    }
                });
                console.log("set user1");
            } else  {
                this.setState({
                    tra_user: {
                        user_1: this.state.tra_user.user_1,
                        user_2: data.login,
                    },
                });
            }
            return data;
            });
        console.log(this.state.tra_user);
    }

    reset() {
        this.setState( {
            tra_user: {
                user_1: '',
                user_2: ''
            }
        });
    }

    caldis() {
        var user_1 = this.state.tra_user.user_1;
        var user_2 = this.state.tra_user.user_2;
        var dis = 0;
        var set = new Set();
        if (user_1 && user_2) {
            var q = queue();
            q.push(user_1);
            var edges = this.state.graph.edges;
            while (q.length != 0) {
                var size = q.length;
                console.log('size is ' + size);
                for (var i = 0; i < size; i++) {
                    q.reverse();
                    var cur = q.pop();
                    set.add(cur);
                    console.log('cur is ' + cur);
                    if (cur === user_2) {
                        // if (q.length === 0) {
                        //     alert('the shortest distance is ' + dis+1);
                        // } else {
                        //     alert('the shortest distance is ' + (dis+1))};
                        alert('the shortest distance is ' + dis);
                        return ++dis;
                    }
                    this.addNeighbor(q, cur, set);
                }
                dis++;
                console.log('dis++, dis = ' + dis);
            }
            alert('the shortest distance is infinity');
            return 'infinity';
        }
        console.log(dis);

    }

    addNeighbor(q, cur, set) {
        console.log(set);
        var edges = this.state.graph.edges;
        for (var i = 0; i < edges.length; i++) {
            if (edges[i].from == cur && !set.contains(edges[i].to)) {
                console.log(edges[i].to);
                console.log('push to q ' + edges[i].to);
                q.push(edges[i].to);
            } else if (!set.contains(edges[i].from) && edges[i].to == cur) {
                console.log('push to q ' + edges[i].from);
                q.push(edges[i].from);
                console.log(edges[i].from);
            }
        }
    }

    render() {
        // init state
        if (this.props.tabKey == 1) {
            return(
                <div>
                    <div>
                        <form onSubmit={this.handleSubmit}>
                            <label>
                                Github Username: &nbsp; <span></span>
                                <input type="text" value={this.state.value} onChange={this.handleChange}  ></input>
                            </label>
                            &nbsp; &nbsp;
                            <input type="image" src={require('../images/search.png')} height="20" width="20" />
                        </form>
                    </div>
                    <div id="graph" onClick={this.click_handler.bind(this)}>
                        {this.renderGraph()}
                    </div>
                </div>

            );
        } else if (this.props.tabKey == 2) {
            // explore state
            return (
                <div>
                    <div>
                        <form onSubmit={this.handleSubmit}>
                            <label>
                                Github Username: &nbsp; <span></span>
                                <input type="text" value={this.state.value} onChange={this.handleChange}  ></input>
                            </label>
                            &nbsp; &nbsp;
                            <input type="image" src={require('../images/search.png')} height="20" width="20" />
                        </form>
                    </div>
                    <div id="graph" onClick={this.getUserInfo.bind(this)}>
                        {this.renderGraph()}
                    </div>
                    <div id="table">
                        <UserTable userInfo={this.state.user} />
                    </div>
                </div>
            )
        } else {
            return(
                <div>
                    <div>
                        <form onSubmit={this.handleSubmit}>
                            <label>
                                Github Username: &nbsp; <span></span>
                                <input type="text" value={this.state.value} onChange={this.handleChange}  ></input>
                            </label>
                            &nbsp; &nbsp;
                            <input type="image" src={require('../images/search.png')} height="20" width="20" />
                        </form>
                    </div>
                    <div id="graph" onClick={this.getTraverseUser.bind(this)}>
                        {this.renderGraph()}
                    </div>

                    <div id="tratable" >
                        <TraverseTable user_1={this.state.tra_user.user_1} user_2 = {this.state.tra_user.user_2}/>
                    </div>
                    <div id='reset'>
                        <Button bsStyle="danger" bsSize="small" onClick={this.reset.bind(this)}>Reset</Button>
                    </div>
                    <div id='caldis'>
                        <Button bsStyle="primary" bsSize="small" onClick={this.caldis.bind(this)}>Calculate Distance</Button>
                    </div>
                </div>
            )
        }




    }
}

export default Network;