var React = require('react')
var ReactDOM = require('react-dom')
var ws = new WebSocket('ws://127.0.0.1:8008/ws');

var TodoBox = React.createClass({
	getInitialState: function () {
		return {
			data: []
		};
	},
	handleData: function(data){
		this.setState({data});
	},
	generateId: function () {
		return Math.floor(Math.random()*90000) + 10000;
	},
	handleNodeRemoval: function (nodeId) {
		var data = this.state.data;
		data = data.filter(function (element) {
			return element.id !== nodeId;
		});
		this.setState({data});
		var sendToWs=JSON.stringify(data);
		ws.send(sendToWs);
		return;
	},
  	handleSubmit: function (task) {
		var data = this.state.data;
		var id = this.generateId().toString();
		var complete = 'false';
		data = data.concat([{id, task, complete}]);
		this.setState({data});
		var sendToWs=JSON.stringify(data);
		ws.send(sendToWs);
	},
	handleToggleComplete: function (nodeId) {
		var data = this.state.data;
		for (var i in data) {
			if (data[i].id == nodeId) {
				data[i].complete = data[i].complete === 'true' ? 'false' : 'true';
				break;
			}
		}
		this.setState({data});
		var sendToWs=JSON.stringify(data);
		ws.send(sendToWs);
		return;
	},
	render: function() {
		return (
			<div className="well">
				<h1 className="vert-offset-top-0">TODO LIST</h1>
        <TodoForm onTaskSubmit={this.handleSubmit} />
        <TodoList data={this.state.data}
                  removeNode={this.handleNodeRemoval}
                  toggleComplete={this.handleToggleComplete} />
			</div>
		);
	}
});

var TodoList = React.createClass({
	removeNode: function (nodeId) {
		this.props.removeNode(nodeId);
		return;
	},
	toggleComplete: function (nodeId) {
		this.props.toggleComplete(nodeId);
		return;
	},
	render: function() {
		var listNodes = this.props.data.map(function (listItem) {
			return (
				<TodoItem key={listItem.id}
        nodeId={listItem.id}
        task={listItem.task}
        complete={listItem.complete}
        removeNode={this.removeNode}
        toggleComplete={this.toggleComplete} />
			);
		},this);
		return (
			<ul className="list-group">
				{listNodes}
			</ul>
		);
	}
});

var TodoItem = React.createClass({
	removeNode: function (e) {
		e.preventDefault();
		this.props.removeNode(this.props.nodeId);
		return;
	},
	toggleComplete: function (e) {
		e.preventDefault();
		this.props.toggleComplete(this.props.nodeId);
		return;
	},
	updateClass: function () {

	},
	render: function() {
		var classes = 'list-group-item clearfix';
		if (this.props.complete === 'true') {
			classes = classes + ' list-group-item-success';
		}
		return (
			<li className={classes}>
      {/*<input  type="checkbox" click={this.handleToggleComplete}></input>*/}
      <button type="button"
            className="btn btn-xs btn-success img-circle"
            onClick={this.toggleComplete}>&#x2713;
      </button>{"  "}
      {this.props.task}
				<div className="pull-right" role="group">
          <button
                type="button"
                className="btn btn-xs btn-danger img-circle"
                onClick={this.removeNode}>&#xff38;
          </button>
				</div>
			</li>
		);
	}
});

var TodoForm = React.createClass({
	doSubmit: function (e) {
		e.preventDefault();
		var task = ReactDOM.findDOMNode(this.refs.task).value.trim();
		if (!task) {
			return;
		}
		this.props.onTaskSubmit(task);
		ReactDOM.findDOMNode(this.refs.task).value = '';
		return;
	},
	render: function() {
		return (
			<div className="commentForm vert-offset-top-2">
				<hr />
				<div className="clearfix">
					<form className="todoForm form-horizontal" onSubmit={this.doSubmit}>
						<div className="form-group ">
							{/*<label htmlFor="task" className="col-md-2 control-label">Task</label>*/}
							<div className="col-md-10 ">
								<input  type="text" id="task" ref="task"
                        ///*className="form-control"*/
                        placeholder="Add TODO..." />
                <input type="submit" value="+" className="btn btn-primary btn-sm" />
              </div>
						</div>
					</form>
				</div>
			</div>
		);
	}
});

ReactDOM.render(
	<TodoBox />,
	document.getElementById('app')
);
