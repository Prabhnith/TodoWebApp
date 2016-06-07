var React =  require('react');
var ReactDOM=require('react-dom');

var TodoContainer = React.createClass({
  getInitialState : function(){
    return{
      list : ['TODO #1','TODO #2'],
    }
  },
  addItem: function(item){
    this.setState({
      list : this.state.list.concat([item])
    });
  },
  render : function(){
    return(
      <div className="jumbotron col-sm-6 col-sm-offset-3 text-center">
        <h3> TODO LIST</h3>
        <AddItem addItem={this.addItem} />
        <ShowList items={this.state.list} />
      </div>
    )
  }
});

var AddItem = React.createClass({
  getInitialState: function(){
    return{
      newItem:''
    }
  },
  handleChange : function(e){
    // e.preventDefault();
    this.setState({
      newItem: e.target.value
    });
  },
  handleAddItem: function(){
    this.props.addItem(this.state.newItem);
    this.setState({
      newItem:''
    });
  },
  render: function(){
    return (
      <div>
        <input type="text" value={this.state.addItem} onChange={this.handleChange} />
        <button onClick={this.handleAddItem}> Add Item</button>
      </div>
    );
  }
});
var ShowList = React.createClass({
  render : function(){
    var listItems = this.props.items.map(function(item){
      //return <li> {item} </li>;
      return <li > <input type="checkbox"> {item}</input></li>;
    });
    return(
      <div className="text-left col-sm-6 col-sm-offset-2">
        <ul > {listItems} </ul>
      </div>
    )
  }
});
ReactDOM.render(<TodoContainer />, document.getElementById('app'));
