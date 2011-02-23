var wu = require('wu').wu
	, util = require('util')

var Node = function( graph,id,obj ) {
	this._graph = function() {return graph}
	this._id = id
	this._obj = obj
}
Node.prototype.id = function() { return this._id }
Node.prototype.obj = function() { return this._obj }
Node.prototype.link = function( node ) {
	if( typeof node == 'object' && node._id ) {
		this._graph().link(this.id(),node.id())
	}
	this._graph().link(this.id(),node)
}
Node.prototype.hasLink = function( node ) {
	var g=this._graph()
	var strId = g.getIndex(this.id())
	var endId = g.getIndex(node.id())
	
	return wu(this._graph().edges).any( function(e) {
		return e.start==strId && e.end==endId
	} )
}

var Graph = module.exports = function( nodeEqFun ) {
	
	this.nodeEq = nodeEqFun || function(n1,n2) { return n1.id() == n2.id() }
	
	this.index = {}
	this.nodes = []
	this.edges = []
	
}
Graph.prototype.newNode = function( id,obj ) {
	var n = new Node(this,id,obj)
	this.nodes.push(n)
	this.index[id] = this.nodes.length - 1
	return n
}
Graph.prototype.get = function( id ) {
	return this.nodes[ this.index[id] ]
}
Graph.prototype.getIndex = function( id ) {
	return this.index[id]
}
Graph.prototype.getIdFromIdx = function( idx ) {
	return this.nodes[ idx ].id()
}
Graph.prototype.link = function( id1,id2 ) {
	var str = this.getIndex(id1)
	var end = this.getIndex(id2)
//	util.log('creating link between ' + id1 + '/' + str + ' and ' + id2 + '/' + end)
	this.edges.push( { start:str, end:end} )
}
Graph.prototype.search = function( criteria, reduce ) {
	var matches =  wu(this.nodes).filter( wrap(criteria,false) ).toArray()
	if(!reduce) return matches
	return reduce(matches)
}

Graph.prototype.remove = function( id ) {
	var idx = this.getIndex(id)
	delete (this.nodes[ idx ])
	delete (this.index[ id ])
	
	for(var i=0;i<this.edges.length;i++) {
		var e = this.edges[i]
		if( e && (e.start==idx || e.end==idx) ) {
			this.edges.splice(i,1)
		}
	}
}

Graph.prototype.eachNode = function( fun ) {
	wu(this.nodes).each( wrap(fun) )
}

Graph.prototype.countNodes = function() {
	return wu(this.nodes).filter(function(n){return n!=undefined}).toArray().length
}
Graph.prototype.nodesTo = function( id ) {
	return this.selnodes(false,id)
}
Graph.prototype.nodesFrom = function( id ) {
	return this.selnodes(true,id)
}
Graph.prototype.selnodes = function( from,id ) {
	var s=this
	return wu(this.seledges(from,id)).map(function(e){ return s.nodes[ (from)?(e.end):(e.start) ] }).toArray()
}
Graph.prototype.edgesTo = function( id ) {
	return this.edges(false,id)
}
Graph.prototype.edgesFrom = function( id ) {
	return this.edges(true,id)
}
Graph.prototype.seledges = function( from,id ) {
	var idx=this.getIndex(id)
	return wu(this.edges).filter( wrap(function(e){ return (from)?(e.start==idx):(e.end==idx) },false) ).toArray()
}

Graph.prototype.hasCycle = function() {
	var UNVISITED=0, INPROGRESS=1, DONE=2
	var s=this
	var nodes = []
	for(var i=0;i<this.nodes.length;i++) {
		if(this.nodes[i]) {
			nodes[i] = {id:this.nodes[i].id(),idx:i,mark:UNVISITED}
		}
	}
	
	var adj = function(startNode) {
		var out = wu(s.edges).filter(function(e){ return e.start==startNode.idx }).toArray()
		return out
	}
	var _hasCycle = function(node) {
		node.mark = INPROGRESS
		var cycle = wu( adj(node) ).map(function(e){
			var m=nodes[e.end]
			if(m.mark==INPROGRESS) { return true }
			if(m.mark!=DONE) {
				if(_hasCycle(m)) { return true }
			}
			return false
		}).any(function(b){return b==true})
		if(cycle) { return true }
		node.mark = DONE
		return false
	}
	
	var out = []
	for(var i=0;i<nodes.length;i++) {
		if(nodes[i]) {
			var n = nodes[i]
			if(n.mark==UNVISITED && _hasCycle(n)) {
				out.push( n.id )
			}
		}
	}
	return (out.length==0)?false:out
}

var insp = function(str,obj) { util.log(str + '> ' + util.inspect(obj,true,null)) }
Graph.prototype.stronglyConnectedComponents = function() {
	var s=this
	return wu(this.nodes).map( wrap(function(n) { return {node:n.id(),scc:s.getSCC(n)} },{node:undefined}) )
	.filter(function(c){return c.node!=undefined}).toArray()
}
Graph.prototype.getSCC = function(rootNode) {
	
	var search = function(nd,edges,forward) {
		nd.visited=forward
		adjs = adj(edges,nd)
		if(adjs==undefined) {
			if(forward) stack.push(nd)
			return
		}
		wu(adjs).each(function(e){
			if(nodes[e.end].visited != forward) {
				search(nodes[e.end],edges,forward)
			}
		})
		if(forward) stack.push(nd)
	}
	var adj = function(lst,nd) {
		var out =  wu(lst).filter( function(e) { return e.start==nd.idx } ).toArray()
		return out
	}
	
	var nodes = []
	var stack = []
	var edges = []
	
	var root = {}
	for(var i=0;i<this.nodes.length;i++) {
		if(this.nodes[i]) {
			nodes[i] = {id:this.nodes[i].id(),idx:i,visited:false}
			if(rootNode.id()==nodes[i].id) { root=nodes[i] }
		}
	}
	
	wu(this.edges).each(function(e){edges.push(e)})
	search(root,edges,true)
	edges=wu(edges).map(function(e){ return {start:e.end,end:e.start} }).toArray()
	
	SCC = []
	while(stack.length!=0) {
		search(stack[0],edges,false)
		component = wu(stack).filter(function(n){ return !n.visited }).toArray()
		stack = wu(stack).filter(function(n){ return n.visited }).toArray()
		SCC.push(component)
	}
	return SCC
}

// since we delete node ids, better
// wraps functions that needs to iterate on the
// graph nodes
var wrap = function( fun,defRet ) {
	return function(el) {
		return (el==undefined)?defRet:fun(el)
	}
}
