var React = require('react')
var ReactDOM = require('react-dom')
var uuid = require('uuid');
ws = new WebSocket('ws://192.168.1.117:3000/v5/ws');
// var ws = new WebSocket('ws://localhost:8008/ws');

setupWsHandle(ws);
function setupWsHandle(ws){
	console.log("Trying..");
	ws.onopen = () => {
			console.log("connection established");
			var sendToWs=JSON.stringify(todos);
			ws.send(sendToWs);
			console.log("data send intially");
	};
	ws.onmessage = (e) => {
	console.log("This is the received data " );
	console.log( e.data);
 };
	ws.onmessage = (e) => {
			console.log(e.data);
	};
	ws.onclose = (e) => {
			console.log(e.code, e.reason);
			console.log("connection dropped but changes will be saved to local storage");
			console.log("Retrying connection...");
			var wss = new WebSocket('ws://192.168.1.117:3000/v5/ws');
			// var wss = new WebSocket('ws://localhost:8008/ws');
			setupWsHandle(wss);
		}
};

var TodoBox = React.createClass({
	getInitialState: function () {
		return {
			data: this.props.todos
		};
	},
	//receive data from the url
	// loadTodosFromServer: function() {}
	// componentDidMount: function(){
	// 	this.loadTodosFromServer();
	// 	setInterval(this.loadTodosFromServer, this.props.refreshInterval)
	// },

	generateId: function () {
		return uuid.v4();
	},

	handleNodeRemoval: function (nodeId) {
		var data = this.state.data;
		var elementToSend = data.filter(function (element) {
			return element.id === nodeId;
		});

		elementToSend[0]["status"]="delete";
		var sendToWs=JSON.stringify(elementToSend);
		ws.send(sendToWs);

		data = data.filter(function (element) {
			return element.id !== nodeId;
		});

		this.setState({data});
		localStorage.setItem('todos', JSON.stringify(data));
		return;
	},
  	handleSubmit: function (task) {
		var data = this.state.data;
		var id = this.generateId();
		var complete = false;
		var status = "insert"

		elementToSend = [{id, task, complete,status}];
		var sendToWs=JSON.stringify(elementToSend);
		ws.send(sendToWs);

		data = data.concat([{id, task, complete,status}]);
		this.setState({data});
		localStorage.setItem('todos', JSON.stringify(data));
	},
	handleToggleComplete: function (nodeId) {
		var data = this.state.data;
		var position;
		for (var i in data) {
			if (data[i].id == nodeId) {
				data[i].complete = data[i].complete === true ? false : true;
				position=i;
				break;
			}
		}
		data[position]["status"]="update";
		this.setState({data});
		localStorage.setItem('todos', JSON.stringify(data));
		var elementToSend = data[position];
		var sendToWs=JSON.stringify(elementToSend);
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
//if you want to fetch todos from the server itself
//and add the refresh interval :use::
//use <TodoBox url="/api/todos" refreshInterval={2000} />
todos = JSON.parse(localStorage.getItem('todos')) || [];
ReactDOM.render(
	<TodoBox todos={todos} />,
	document.getElementById('app')
);
