$(function(){
  var Components = {};
  var Actions = {};
  var Stores = {};

  Actions.UISummary = Reflux.createActions([ "reload" ]);

  Stores.UISummary = Reflux.createStore({
    listenables: [Actions.UISummary],
    getInitialState: function() {
      this.state = {};
      return this.state;
    },

    setState: function(state, busy) {
      this.state = $.extend(this.state || {}, state, {busy: busy});
      this.trigger(this.state);
    },

    onReload: function() {
      var that = this;
      $.ajax({
        type: "GET",
        url: "/admin_users/sign_in",
        cache: false,
        success: function() { that.setHeartbeat("SUCCESSFULLY CONNECTED")},
        error: function() { that.setHeartbeat("COULDN'T CONNECT")}
      });
    },

    setHeartbeat: function(data){
      this.setState({heartbeat: data})
    }

  });


  Components.UISummary = React.createClass({
    mixins: [Reflux.connect(Stores.UISummary)],

    render: function() {
      return (
        <div className="commentBox">
          <h1>Welcome To LendingHome UI</h1>
          <p>You are awesome.</p>

          <br/>
          <table>
            <tr>
              <td>OPS: </td>
              <td class="mono">{this.state.heartbeat}</td>
            </tr>
            <tr>
              <td>jquery-version: </td>
              <td class="mono">{$.fn.jquery}</td>
            </tr>
            <tr>
              <td>react-version: </td>
              <td class="mono">{React.version}</td>
            </tr>
          </table>
          <br/>
          <br/>

          <div><a class="reload" href="#"><button class="btn-link" onClick={this.reload}>Refresh UI <span class="icon">&rarr;</span></button></a></div>
          <div><a class="reload" href="https://github.com/Lendinghome/lendinghome.ui"><button class="btn-link">Visit On Github <span class="icon">&rarr;</span></button></a></div>
        </div>
      );
    },

    reload: function(){
      Actions.UISummary.reload();
    }
  });

  React.render(
    <Components.UISummary />,
    document.getElementById('content')
  );


  Actions.UISummary.reload();


})

