$(function(){
  var Components = {};
  var Actions = {};
  var Stores = {};
  var taskStatus;

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

      $.ajax({
        type: "GET",
        url: 'https://gist.githubusercontent.com/edelbalso/e45a03a9a927a3138cfc/raw/622e4034656cc24453817800bbc74ac35b2e4c11/gistfile1.json',
        //url: 'https://gist.githubusercontent.com/edelbalso/58d03e12f98707251fe8/raw/ec5759fb33d5a1cc10542b0cf0cab4026d35d6f7/gistfile1.json',
        success: function(data) {
          that.setChartData(data);
        }
      });
    },

    setHeartbeat: function(data){
      this.setState({heartbeat: data})
    },

    setChartData: function(data) {
      this.setState({chartData: JSON.parse(data)});
    }

  });


  TaskChart = React.createClass({

    getInitialState: function() {
      //TODO these could be set from the UI
      var filters = {
        feature: true
      };
      return {
        filters
      }
    },

    pluckValue: function(list, value) {
      var values = _.pluck(list, value).sort();
      return _.uniq(values);
    },

    filterData: function() {
      var checklistItems = this.props.chartData ? this.props.chartData.checklist_item_report.checklist_items : undefined;

      //TODO write these to run based on state of various toggles
      var features = _.reject(checklistItems, function(cli) {
        return cli.feature === "";
      });

      var completed = _.reject(features, function(f) {
        return f.status === 'pending';
      });

      uniqFeatures = this.pluckValue(features, "feature");
      uniqResponsible = this.pluckValue(features, "responsible_first_name");
      console.log(uniqResponsible);

      return {
        completed: completed,
        uniqFeatures: uniqFeatures,
        uniqResponsible: uniqResponsible
      }
    },

    xform: function(data) {
      var transformed = [];
      //TODO handle no dates, etc
      _.each(data, function(d) {
        var obj = {
          "endDate": new Date(d.completed_at),
          "startDate": new Date(d.started_at),
          "taskName": d.feature,
          "status" : d.responsible_first_name,
          "highlighted": true
          }
        transformed.push(obj);
      });
      return transformed;
    },

    generateTaskStatus: function(people) {
      var status = {};
      _.each(people, function(person, i) {
          status[person] = "bar-person-" + i;
      });
      return status;
    },

    componentDidMount: function() {
      //var taskNames = [];
      //var tasks = [];
      //var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format).height(800).width(800);
      //gantt(tasks);
    },

    componentDidUpdate: function() {
      var filteredTasks = this.filterData();
      var tasks = this.xform(filteredTasks.completed);
      var taskNames = filteredTasks.uniqFeatures || [];
      var taskStatus = this.generateTaskStatus(filteredTasks.uniqResponsible) || [];
      var format = "%b %_d %H:%M";

      if (tasks.length > 0) {
        var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format).height(800).width(800);
        gantt(tasks);
      }
    },

    render: function() {
      return (
        <div className="task-chart"></div>
      );
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

          <TaskChart chartData={this.state.chartData}/>

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

