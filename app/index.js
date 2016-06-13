var React = require('react')
var ReactDOM = require('react-dom')
var uuid = require('uuid');
pendingInsertData = [];
pendingDeleteData = [];
pendingUpdateData = [];
// ws = new WebSocket('ws://192.168.1.117:3000/v5/ws');
// ws = new WebSocket('ws://127.0.0.1:8008/ws');
// wsocks = {connection: new WebSocket('ws://127.0.0.1:8008/ws') }
wsocks = {connection: new WebSocket('ws://192.168.1.117:3000/v5/ws') }
setupWsHandle();
function sendPendingData(data, status ){
		console.log("data.length is");
		console.log(data.length);
		if (data.length == 0){
			return;
		}
		var messageToSend = { "messageData" : data , "messageLabel": status }
		var sendToWs=JSON.stringify(messageToSend);
		wsocks.connection.send(sendToWs);
		data = [];
};
function setupWsHandle(){
	console.log("Trying..");
	// ws = new WebSocket('ws://127.0.0.1:8008/ws');
	wsocks.connection.onopen = () => {
			console.log("connection established");
			console.log(wsocks.connection.readyState);
			sendPendingData(pendingInsertData,"insert");
			sendPendingData(pendingUpdateData,"update");
			sendPendingData(pendingDeleteData,"delete");
	};

	wsocks.connection.onmessage = (e) => {
	console.log("This is the received data " );
	console.log( e.data);
 };
	wsocks.connection.onmessage = (e) => {
			console.log(e.data);
	};
	wsocks.connection.onclose = (e) => {
			console.log(e.code, e.reason);
			console.log("connection dropped but changes will be saved to local storage");
			console.log("Retrying connection...");
			console.log(wsocks.connection.readyState);
			try {
			    wsocks.connection = new WebSocket('ws://192.168.1.117:3000/v5/ws');
			    // wsocks.connection = new WebSocket('ws://127.0.0.1:8008/ws');
			}
			catch(err) {
			    console.log("connection can't be established");
			}
			setupWsHandle();
		}
};
var TodoBox = React.createClass({
	getInitialState: function () {
		return {
			data: this.props.todos
		};
	},

	generateId: function () {
		return uuid.v4();
	},


	handleNodeRemoval: function (nodeId) {
		var data = this.state.data;
		var elementToSend = data.filter(function (element) {
			return element.id === nodeId;
		});
		// elementToSend[0]["status"]="delete";
		var messageToSend = { "messageData" : elementToSend , "messageLabel":"delete" }
		try {
			var sendToWs=JSON.stringify(messageToSend);
			wsocks.connection.send(sendToWs);
		}
		catch(err) {
		    pendingDeleteData = pendingDeleteData.concat(elementToSend);
				console.log(wsocks.connection.readyState);
				console.log(err);
		}

		data = data.filter(function (element) {
			return element.id !== nodeId;
		}
	);

		this.setState({data});
		localStorage.setItem('todos', JSON.stringify(data));
		return;
	},
  	handleSubmit: function (content) {
		var data = this.state.data;
		var id = this.generateId();
		var complete = false;
		var content = content;
		// var status = "insert"

		elementToSend = [{id, content, complete}];
		var messageToSend = { "messageData" : elementToSend , "messageLabel":"insert" }
		try {
			var sendToWs=JSON.stringify(messageToSend);
			wsocks.connection.send(sendToWs);
		}
		catch(err) {
		    pendingInsertData = pendingInsertData.concat(elementToSend);
				console.log(wsocks.connection.readyState);
				console.log(err);
		}
				// var sendToWs=JSON.stringify(elementToSend);
		// wsocks.connection.send(sendToWs);

		data = data.concat([{id, content, complete}]);
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
		// data[position]["status"]="update";

		this.setState({data});
		localStorage.setItem('todos', JSON.stringify(data));
		var elementToSend = [];
		elementToSend.push(data[position]);
		var messageToSend = { "messageData" : elementToSend , "messageLabel":"update" }
		console.log(messageToSend);
		try {
			var sendToWs=JSON.stringify(messageToSend);
			wsocks.connection.send(sendToWs);
		}
		catch(err) {
				pendingUpdateData = pendingUpdateData.concat(elementToSend);
				console.log(wsocks.connection.readyState);
				console.log(err);
		}


		// var sendToWs=JSON.stringify(elementToSend);
		// wsocks.connection.send(sendToWs);
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
        content={listItem.content}
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
		if (this.props.complete === true) {
			classes = classes + ' list-group-item-success';
		}
		return (
			<li className={classes}>
      <button type="button"
            className="btn btn-xs btn-success img-circle"
            onClick={this.toggleComplete}>&#x2713;
      </button>{"  "}
      {this.props.content}
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
		var content = ReactDOM.findDOMNode(this.refs.content).value.trim();
		if (!content) {
			return;
		}
		this.props.onTaskSubmit(content);
		ReactDOM.findDOMNode(this.refs.content).value = '';
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
								<input  type="text" id="content" ref="content"
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
