require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
module.exports = function(el) {
  var $el, $toggler, app, e, node, nodeid, toc, toggler, togglers, view, _i, _len, _ref;
  $el = $(el);
  app = window.app;
  toc = app.getToc();
  if (!toc) {
    console.log('No table of contents found');
    return;
  }
  togglers = $el.find('a[data-toggle-node]');
  _ref = togglers.toArray();
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    toggler = _ref[_i];
    $toggler = $(toggler);
    nodeid = $toggler.data('toggle-node');
    try {
      view = toc.getChildViewById(nodeid);
      node = view.model;
      $toggler.attr('data-visible', !!node.get('visible'));
      $toggler.data('tocItem', view);
    } catch (_error) {
      e = _error;
      $toggler.attr('data-not-found', 'true');
    }
  }
  return togglers.on('click', function(e) {
    e.preventDefault();
    $el = $(e.target);
    view = $el.data('tocItem');
    if (view) {
      view.toggleVisibility(e);
      return $el.attr('data-visible', !!view.model.get('visible'));
    } else {
      return alert("Layer not found in the current Table of Contents. \nExpected nodeid " + ($el.data('toggle-node')));
    }
  });
};


},{}],3:[function(require,module,exports){
var JobItem,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JobItem = (function(_super) {
  __extends(JobItem, _super);

  JobItem.prototype.className = 'reportResult';

  JobItem.prototype.events = {};

  JobItem.prototype.bindings = {
    "h6 a": {
      observe: "serviceName",
      updateView: true,
      attributes: [
        {
          name: 'href',
          observe: 'serviceUrl'
        }
      ]
    },
    ".startedAt": {
      observe: ["startedAt", "status"],
      visible: function() {
        var _ref;
        return (_ref = this.model.get('status')) !== 'complete' && _ref !== 'error';
      },
      updateView: true,
      onGet: function() {
        if (this.model.get('startedAt')) {
          return "Started " + moment(this.model.get('startedAt')).fromNow() + ". ";
        } else {
          return "";
        }
      }
    },
    ".status": {
      observe: "status",
      onGet: function(s) {
        switch (s) {
          case 'pending':
            return "waiting in line";
          case 'running':
            return "running analytical service";
          case 'complete':
            return "completed";
          case 'error':
            return "an error occurred";
          default:
            return s;
        }
      }
    },
    ".queueLength": {
      observe: "queueLength",
      onGet: function(v) {
        var s;
        s = "Waiting behind " + v + " job";
        if (v.length > 1) {
          s += 's';
        }
        return s + ". ";
      },
      visible: function(v) {
        return (v != null) && parseInt(v) > 0;
      }
    },
    ".errors": {
      observe: 'error',
      updateView: true,
      visible: function(v) {
        return (v != null ? v.length : void 0) > 2;
      },
      onGet: function(v) {
        if (v != null) {
          return JSON.stringify(v, null, '  ');
        } else {
          return null;
        }
      }
    }
  };

  function JobItem(model) {
    this.model = model;
    JobItem.__super__.constructor.call(this);
  }

  JobItem.prototype.render = function() {
    this.$el.html("<h6><a href=\"#\" target=\"_blank\"></a><span class=\"status\"></span></h6>\n<div>\n  <span class=\"startedAt\"></span>\n  <span class=\"queueLength\"></span>\n  <pre class=\"errors\"></pre>\n</div>");
    return this.stickit();
  };

  return JobItem;

})(Backbone.View);

module.exports = JobItem;


},{}],4:[function(require,module,exports){
var ReportResults,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportResults = (function(_super) {
  __extends(ReportResults, _super);

  ReportResults.prototype.defaultPollingInterval = 3000;

  function ReportResults(sketch, deps) {
    var url;
    this.sketch = sketch;
    this.deps = deps;
    this.poll = __bind(this.poll, this);
    this.url = url = "/reports/" + this.sketch.id + "/" + (this.deps.join(','));
    ReportResults.__super__.constructor.call(this);
  }

  ReportResults.prototype.poll = function() {
    var _this = this;
    return this.fetch({
      success: function() {
        var payloadSize, problem, result, _i, _len, _ref, _ref1;
        _this.trigger('jobs');
        _ref = _this.models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          result = _ref[_i];
          if ((_ref1 = result.get('status')) !== 'complete' && _ref1 !== 'error') {
            if (!_this.interval) {
              _this.interval = setInterval(_this.poll, _this.defaultPollingInterval);
            }
            return;
          }
          console.log(_this.models[0].get('payloadSizeBytes'));
          payloadSize = Math.round(((_this.models[0].get('payloadSizeBytes') || 0) / 1024) * 100) / 100;
          console.log("FeatureSet sent to GP weighed in at " + payloadSize + "kb");
        }
        if (_this.interval) {
          window.clearInterval(_this.interval);
        }
        if (problem = _.find(_this.models, function(r) {
          return r.get('error') != null;
        })) {
          return _this.trigger('error', "Problem with " + (problem.get('serviceName')) + " job");
        } else {
          return _this.trigger('finished');
        }
      },
      error: function(e, res, a, b) {
        var json, _ref, _ref1;
        if (res.status !== 0) {
          if ((_ref = res.responseText) != null ? _ref.length : void 0) {
            try {
              json = JSON.parse(res.responseText);
            } catch (_error) {

            }
          }
          if (_this.interval) {
            window.clearInterval(_this.interval);
          }
          return _this.trigger('error', (json != null ? (_ref1 = json.error) != null ? _ref1.message : void 0 : void 0) || 'Problem contacting the SeaSketch server');
        }
      }
    });
  };

  return ReportResults;

})(Backbone.Collection);

module.exports = ReportResults;


},{}],"reportTab":[function(require,module,exports){
module.exports=require('a21iR2');
},{}],"a21iR2":[function(require,module,exports){
var CollectionView, JobItem, RecordSet, ReportResults, ReportTab, enableLayerTogglers, round, t, templates, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

enableLayerTogglers = require('./enableLayerTogglers.coffee');

round = require('./utils.coffee').round;

ReportResults = require('./reportResults.coffee');

t = require('../templates/templates.js');

templates = {
  reportLoading: t['node_modules/seasketch-reporting-api/reportLoading']
};

JobItem = require('./jobItem.coffee');

CollectionView = require('views/collectionView');

RecordSet = (function() {
  function RecordSet(data, tab, sketchClassId) {
    this.data = data;
    this.tab = tab;
    this.sketchClassId = sketchClassId;
  }

  RecordSet.prototype.toArray = function() {
    var data,
      _this = this;
    if (this.sketchClassId) {
      data = _.find(this.data.value, function(v) {
        var _ref, _ref1, _ref2;
        return ((_ref = v.features) != null ? (_ref1 = _ref[0]) != null ? (_ref2 = _ref1.attributes) != null ? _ref2['SC_ID'] : void 0 : void 0 : void 0) === _this.sketchClassId;
      });
      if (!data) {
        throw "Could not find data for sketchClass " + this.sketchClassId;
      }
    } else {
      if (_.isArray(this.data.value)) {
        data = this.data.value[0];
      } else {
        data = this.data.value;
      }
    }
    return _.map(data.features, function(feature) {
      return feature.attributes;
    });
  };

  RecordSet.prototype.raw = function(attr) {
    var attrs;
    attrs = _.map(this.toArray(), function(row) {
      return row[attr];
    });
    attrs = _.filter(attrs, function(attr) {
      return attr !== void 0;
    });
    if (attrs.length === 0) {
      console.log(this.data);
      this.tab.reportError("Could not get attribute " + attr + " from results");
      throw "Could not get attribute " + attr;
    } else if (attrs.length === 1) {
      return attrs[0];
    } else {
      return attrs;
    }
  };

  RecordSet.prototype.int = function(attr) {
    var raw;
    raw = this.raw(attr);
    if (_.isArray(raw)) {
      return _.map(raw, parseInt);
    } else {
      return parseInt(raw);
    }
  };

  RecordSet.prototype.float = function(attr, decimalPlaces) {
    var raw;
    if (decimalPlaces == null) {
      decimalPlaces = 2;
    }
    raw = this.raw(attr);
    if (_.isArray(raw)) {
      return _.map(raw, function(val) {
        return round(val, decimalPlaces);
      });
    } else {
      return round(raw, decimalPlaces);
    }
  };

  RecordSet.prototype.bool = function(attr) {
    var raw;
    raw = this.raw(attr);
    if (_.isArray(raw)) {
      return _.map(raw, function(val) {
        return val.toString().toLowerCase() === 'true';
      });
    } else {
      return raw.toString().toLowerCase() === 'true';
    }
  };

  return RecordSet;

})();

ReportTab = (function(_super) {
  __extends(ReportTab, _super);

  function ReportTab() {
    this.renderJobDetails = __bind(this.renderJobDetails, this);
    this.startEtaCountdown = __bind(this.startEtaCountdown, this);
    this.reportJobs = __bind(this.reportJobs, this);
    this.showError = __bind(this.showError, this);
    this.reportError = __bind(this.reportError, this);
    this.reportRequested = __bind(this.reportRequested, this);
    this.remove = __bind(this.remove, this);
    _ref = ReportTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ReportTab.prototype.name = 'Information';

  ReportTab.prototype.dependencies = [];

  ReportTab.prototype.initialize = function(model, options) {
    this.model = model;
    this.options = options;
    this.app = window.app;
    _.extend(this, this.options);
    this.reportResults = new ReportResults(this.model, this.dependencies);
    this.listenToOnce(this.reportResults, 'error', this.reportError);
    this.listenToOnce(this.reportResults, 'jobs', this.renderJobDetails);
    this.listenToOnce(this.reportResults, 'jobs', this.reportJobs);
    this.listenTo(this.reportResults, 'finished', _.bind(this.render, this));
    return this.listenToOnce(this.reportResults, 'request', this.reportRequested);
  };

  ReportTab.prototype.render = function() {
    throw 'render method must be overidden';
  };

  ReportTab.prototype.show = function() {
    var _ref1, _ref2;
    this.$el.show();
    this.visible = true;
    if (((_ref1 = this.dependencies) != null ? _ref1.length : void 0) && !this.reportResults.models.length) {
      return this.reportResults.poll();
    } else if (!((_ref2 = this.dependencies) != null ? _ref2.length : void 0)) {
      this.render();
      return this.$('[data-attribute-type=UrlField] .value, [data-attribute-type=UploadField] .value').each(function() {
        var html, name, text, url, _i, _len, _ref3;
        text = $(this).text();
        html = [];
        _ref3 = text.split(',');
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          url = _ref3[_i];
          if (url.length) {
            name = _.last(url.split('/'));
            html.push("<a target=\"_blank\" href=\"" + url + "\">" + name + "</a>");
          }
        }
        return $(this).html(html.join(', '));
      });
    }
  };

  ReportTab.prototype.hide = function() {
    this.$el.hide();
    return this.visible = false;
  };

  ReportTab.prototype.remove = function() {
    window.clearInterval(this.etaInterval);
    this.stopListening();
    return ReportTab.__super__.remove.call(this);
  };

  ReportTab.prototype.reportRequested = function() {
    return this.$el.html(templates.reportLoading.render({}));
  };

  ReportTab.prototype.reportError = function(msg, cancelledRequest) {
    if (!cancelledRequest) {
      if (msg === 'JOB_ERROR') {
        return this.showError('Error with specific job');
      } else {
        return this.showError(msg);
      }
    }
  };

  ReportTab.prototype.showError = function(msg) {
    this.$('.progress').remove();
    this.$('p.error').remove();
    return this.$('h4').text("An Error Occurred").after("<p class=\"error\" style=\"text-align:center;\">" + msg + "</p>");
  };

  ReportTab.prototype.reportJobs = function() {
    if (!this.maxEta) {
      this.$('.progress .bar').width('100%');
    }
    return this.$('h4').text("Analyzing Designs");
  };

  ReportTab.prototype.startEtaCountdown = function() {
    var _this = this;
    if (this.maxEta) {
      _.delay(function() {
        return _this.reportResults.poll();
      }, (this.maxEta + 1) * 1000);
      return _.delay(function() {
        _this.$('.progress .bar').css('transition-timing-function', 'linear');
        _this.$('.progress .bar').css('transition-duration', "" + (_this.maxEta + 1) + "s");
        return _this.$('.progress .bar').width('100%');
      }, 500);
    }
  };

  ReportTab.prototype.renderJobDetails = function() {
    var item, job, maxEta, _i, _j, _len, _len1, _ref1, _ref2, _results,
      _this = this;
    maxEta = null;
    _ref1 = this.reportResults.models;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      job = _ref1[_i];
      if (job.get('etaSeconds')) {
        if (!maxEta || job.get('etaSeconds') > maxEta) {
          maxEta = job.get('etaSeconds');
        }
      }
    }
    if (maxEta) {
      this.maxEta = maxEta;
      this.$('.progress .bar').width('5%');
      this.startEtaCountdown();
    }
    this.$('[rel=details]').css('display', 'block');
    this.$('[rel=details]').click(function(e) {
      e.preventDefault();
      _this.$('[rel=details]').hide();
      return _this.$('.details').show();
    });
    _ref2 = this.reportResults.models;
    _results = [];
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      job = _ref2[_j];
      item = new JobItem(job);
      item.render();
      _results.push(this.$('.details').append(item.el));
    }
    return _results;
  };

  ReportTab.prototype.getResult = function(id) {
    var result, results;
    results = this.getResults();
    result = _.find(results, function(r) {
      return r.paramName === id;
    });
    if (result == null) {
      throw new Error('No result with id ' + id);
    }
    return result.value;
  };

  ReportTab.prototype.getFirstResult = function(param, id) {
    var e, result;
    result = this.getResult(param);
    try {
      return result[0].features[0].attributes[id];
    } catch (_error) {
      e = _error;
      throw "Error finding " + param + ":" + id + " in gp results";
    }
  };

  ReportTab.prototype.getResults = function() {
    var results;
    results = this.reportResults.map(function(result) {
      return result.get('result').results;
    });
    if (!(results != null ? results.length : void 0)) {
      throw new Error('No gp results');
    }
    return _.filter(results, function(result) {
      var _ref1;
      return (_ref1 = result.paramName) !== 'ResultCode' && _ref1 !== 'ResultMsg';
    });
  };

  ReportTab.prototype.recordSet = function(dependency, paramName, sketchClassId) {
    var dep, param;
    if (sketchClassId == null) {
      sketchClassId = false;
    }
    if (__indexOf.call(this.dependencies, dependency) < 0) {
      throw new Error("Unknown dependency " + dependency);
    }
    dep = this.reportResults.find(function(r) {
      return r.get('serviceName') === dependency;
    });
    if (!dep) {
      console.log(this.reportResults.models);
      throw new Error("Could not find results for " + dependency + ".");
    }
    param = _.find(dep.get('result').results, function(param) {
      return param.paramName === paramName;
    });
    if (!param) {
      console.log(dep.get('data').results);
      throw new Error("Could not find param " + paramName + " in " + dependency);
    }
    return new RecordSet(param, this, sketchClassId);
  };

  ReportTab.prototype.enableTablePaging = function() {
    return this.$('[data-paging]').each(function() {
      var $table, i, noRowsMessage, pageSize, pages, parent, rows, ul, _i, _len, _ref1;
      $table = $(this);
      pageSize = $table.data('paging');
      rows = $table.find('tbody tr').length;
      pages = Math.ceil(rows / pageSize);
      if (pages > 1) {
        $table.append("<tfoot>\n  <tr>\n    <td colspan=\"" + ($table.find('thead th').length) + "\">\n      <div class=\"pagination\">\n        <ul>\n          <li><a href=\"#\">Prev</a></li>\n        </ul>\n      </div>\n    </td>\n  </tr>\n</tfoot>");
        ul = $table.find('tfoot ul');
        _ref1 = _.range(1, pages + 1);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          i = _ref1[_i];
          ul.append("<li><a href=\"#\">" + i + "</a></li>");
        }
        ul.append("<li><a href=\"#\">Next</a></li>");
        $table.find('li a').click(function(e) {
          var $a, a, n, offset, text;
          e.preventDefault();
          $a = $(this);
          text = $a.text();
          if (text === 'Next') {
            a = $a.parent().parent().find('.active').next().find('a');
            if (a.text() !== 'Next') {
              return a.click();
            }
          } else if (text === 'Prev') {
            a = $a.parent().parent().find('.active').prev().find('a');
            if (a.text() !== 'Prev') {
              return a.click();
            }
          } else {
            $a.parent().parent().find('.active').removeClass('active');
            $a.parent().addClass('active');
            n = parseInt(text);
            $table.find('tbody tr').hide();
            offset = pageSize * (n - 1);
            return $table.find("tbody tr").slice(offset, n * pageSize).show();
          }
        });
        $($table.find('li a')[1]).click();
      }
      if (noRowsMessage = $table.data('no-rows')) {
        if (rows === 0) {
          parent = $table.parent();
          $table.remove();
          parent.removeClass('tableContainer');
          return parent.append("<p>" + noRowsMessage + "</p>");
        }
      }
    });
  };

  ReportTab.prototype.enableLayerTogglers = function() {
    return enableLayerTogglers(this.$el);
  };

  ReportTab.prototype.getChildren = function(sketchClassId) {
    return _.filter(this.children, function(child) {
      return child.getSketchClass().id === sketchClassId;
    });
  };

  return ReportTab;

})(Backbone.View);

module.exports = ReportTab;


},{"../templates/templates.js":"CNqB+b","./enableLayerTogglers.coffee":2,"./jobItem.coffee":3,"./reportResults.coffee":4,"./utils.coffee":"+VosKh","views/collectionView":1}],"api/utils":[function(require,module,exports){
module.exports=require('+VosKh');
},{}],"+VosKh":[function(require,module,exports){
module.exports = {
  round: function(number, decimalPlaces) {
    var multiplier;
    if (!_.isNumber(number)) {
      number = parseFloat(number);
    }
    multiplier = Math.pow(10, decimalPlaces);
    return Math.round(number * multiplier) / multiplier;
  }
};


},{}],"CNqB+b":[function(require,module,exports){
this["Templates"] = this["Templates"] || {};
this["Templates"]["node_modules/seasketch-reporting-api/attributes/attributeItem"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<tr data-attribute-id=\"");_.b(_.v(_.f("id",c,p,0)));_.b("\" data-attribute-exportid=\"");_.b(_.v(_.f("exportid",c,p,0)));_.b("\" data-attribute-type=\"");_.b(_.v(_.f("type",c,p,0)));_.b("\">");_.b("\n" + i);_.b("  <td class=\"name\">");_.b(_.v(_.f("name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("  <td class=\"value\">");_.b(_.v(_.f("formattedValue",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("</tr>");_.b("\n");return _.fl();;});
this["Templates"]["node_modules/seasketch-reporting-api/attributes/attributesTable"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<table class=\"attributes\">");_.b("\n" + i);if(_.s(_.f("attributes",c,p,1),c,p,0,44,81,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(_.rp("attributes/attributeItem",c,p,"    "));});c.pop();}_.b("</table>");_.b("\n");return _.fl();;});
this["Templates"]["node_modules/seasketch-reporting-api/genericAttributes"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b(" Attributes</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"    "));_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});
this["Templates"]["node_modules/seasketch-reporting-api/reportLoading"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"reportLoading\">");_.b("\n" + i);_.b("  <!-- <div class=\"spinner\">3</div> -->");_.b("\n" + i);_.b("  <h4>Requesting Report from Server</h4>");_.b("\n" + i);_.b("  <div class=\"progress progress-striped active\">");_.b("\n" + i);_.b("    <div class=\"bar\" style=\"width: 100%;\"></div>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <a href=\"#\" rel=\"details\">details</a>");_.b("\n" + i);_.b("    <div class=\"details\">");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}],"api/templates":[function(require,module,exports){
module.exports=require('CNqB+b');
},{}],11:[function(require,module,exports){
var EnergyConsumptionTab, ReportGraphTab, key, partials, templates, val, _partials, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportGraphTab = require('reportGraphTab');

templates = require('../templates/templates.js');

_partials = require('../node_modules/seasketch-reporting-api/templates/templates.js');

partials = [];

for (key in _partials) {
  val = _partials[key];
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val;
}

EnergyConsumptionTab = (function(_super) {
  __extends(EnergyConsumptionTab, _super);

  function EnergyConsumptionTab() {
    _ref = EnergyConsumptionTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  EnergyConsumptionTab.prototype.name = 'Energy Consumption';

  EnergyConsumptionTab.prototype.className = 'EnergyConsumption';

  EnergyConsumptionTab.prototype.timeout = 120000;

  EnergyConsumptionTab.prototype.template = templates.energyConsumption;

  EnergyConsumptionTab.prototype.dependencies = ['EnergyPlan'];

  EnergyConsumptionTab.prototype.render = function() {
    var attributes, ch, comEC, com_chart, com_dblpa, com_nopa, com_pa, com_user, com_user_savings, comm_dbl_pa295_diff, comm_dbl_pa295_perc_diff, comm_dbl_pa295_total_ec, comm_has_savings_dbl_pa295, comm_has_savings_no_pa295, comm_has_savings_pa295, comm_no_pa295_diff, comm_no_pa295_perc_diff, comm_no_pa295_total_ec, comm_pa295_diff, comm_pa295_perc_diff, comm_pa295_total_ec, comm_sum, context, d3IsPresent, e, h, halfh, halfw, margin, msg, resEC, res_chart, res_dbl_pa295_diff, res_dbl_pa295_perc_diff, res_dbl_pa295_total_ec, res_dblpa, res_has_savings_dbl_pa295, res_has_savings_no_pa295, res_has_savings_pa295, res_no_pa295_diff, res_no_pa295_perc_diff, res_no_pa295_total_ec, res_nopa, res_pa, res_pa295_diff, res_pa295_perc_diff, res_pa295_total_ec, res_sum, res_user, res_user_savings, scenarios, sorted_comm_results, sorted_res_results, totalh, totalw, w,
      _this = this;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    try {
      msg = this.recordSet("EnergyPlan", "ResultMsg");
      console.log("msg is ", msg);
      comEC = this.recordSet("EnergyPlan", "ComEU").toArray();
      resEC = this.recordSet("EnergyPlan", "ResEU").toArray();
      com_pa = this.getMap(comEC, "PA");
      com_dblpa = this.getMap(comEC, "DblPA");
      com_nopa = this.getMap(comEC, "NoPA");
      com_user = this.getUserMap(comEC, "USER", com_nopa);
      com_user_savings = this.getUserSavings(comEC, com_user, com_nopa, 1);
      sorted_comm_results = [com_nopa, com_pa, com_dblpa, com_user];
      res_pa = this.getMap(resEC, "PA");
      res_dblpa = this.getMap(resEC, "DblPA");
      res_nopa = this.getMap(resEC, "NoPA");
      res_user = this.getUserMap(resEC, "USER", res_nopa);
      res_user_savings = this.getUserSavings(resEC, res_user, res_nopa, 1);
      sorted_res_results = [res_nopa, res_pa, res_dblpa, res_user];
      scenarios = ['', 'PA 295', 'No PA 295', 'Double PA 295'];
      res_sum = this.recordSet("EnergyPlan", "ResEUSum").float('USER_SUM', 1);
      res_pa295_total_ec = this.recordSet("EnergyPlan", "ResEUSum").float('PA_SUM', 1);
      res_no_pa295_total_ec = this.recordSet("EnergyPlan", "ResEUSum").float('NOPA_SUM', 1);
      res_dbl_pa295_total_ec = this.recordSet("EnergyPlan", "ResEUSum").float('DBLPA_SUM', 1);
      res_pa295_diff = Math.round(res_pa295_total_ec - res_sum, 0);
      res_pa295_perc_diff = Math.round((Math.abs(res_pa295_diff) / res_sum) * 100, 0);
      res_has_savings_pa295 = res_pa295_diff > 0;
      if (!res_has_savings_pa295) {
        res_pa295_diff = Math.abs(res_pa295_diff);
      }
      res_pa295_diff = this.addCommas(res_pa295_diff);
      res_no_pa295_diff = Math.round(res_no_pa295_total_ec - res_sum, 0);
      res_no_pa295_perc_diff = Math.round((Math.abs(res_no_pa295_diff) / res_sum) * 100, 0);
      res_has_savings_no_pa295 = res_no_pa295_diff > 0;
      if (!res_has_savings_no_pa295) {
        res_no_pa295_diff = Math.abs(res_no_pa295_diff);
      }
      res_no_pa295_diff = this.addCommas(res_no_pa295_diff);
      res_dbl_pa295_diff = Math.round(res_dbl_pa295_total_ec - res_sum, 0);
      res_dbl_pa295_perc_diff = Math.round((Math.abs(res_dbl_pa295_diff) / res_sum) * 100, 0);
      res_has_savings_dbl_pa295 = res_dbl_pa295_diff > 0;
      if (res_has_savings_dbl_pa295) {
        res_dbl_pa295_diff = Math.abs(res_dbl_pa295_diff);
      }
      res_dbl_pa295_diff = this.addCommas(res_dbl_pa295_diff);
      comm_sum = this.recordSet("EnergyPlan", "ComEUSum").float('USER_SUM', 1);
      comm_pa295_total_ec = this.recordSet("EnergyPlan", "ComEUSum").float('PA_SUM', 1);
      comm_no_pa295_total_ec = this.recordSet("EnergyPlan", "ComEUSum").float('NOPA_SUM', 1);
      comm_dbl_pa295_total_ec = this.recordSet("EnergyPlan", "ComEUSum").float('DBLPA_SUM', 1);
      comm_pa295_diff = Math.round(comm_pa295_total_ec - comm_sum, 0);
      comm_pa295_perc_diff = Math.round((Math.abs(comm_pa295_diff) / comm_sum) * 100, 0);
      comm_has_savings_pa295 = comm_pa295_diff > 0;
      if (!comm_has_savings_pa295) {
        comm_pa295_diff = Math.abs(comm_pa295_diff);
      }
      comm_pa295_diff = this.addCommas(comm_pa295_diff);
      comm_no_pa295_diff = Math.round(comm_no_pa295_total_ec - comm_sum, 0);
      comm_no_pa295_perc_diff = Math.round((Math.abs(comm_no_pa295_diff) / comm_sum) * 100, 0);
      comm_has_savings_no_pa295 = comm_no_pa295_diff > 0;
      if (!comm_has_savings_no_pa295) {
        comm_no_pa295_diff = Math.abs(comm_no_pa295_diff);
      }
      comm_no_pa295_diff = this.addCommas(comm_no_pa295_diff);
      comm_dbl_pa295_diff = Math.round(comm_dbl_pa295_total_ec - comm_sum, 0);
      comm_dbl_pa295_perc_diff = Math.round((Math.abs(comm_dbl_pa295_diff) / comm_sum) * 100, 0);
      comm_has_savings_dbl_pa295 = comm_dbl_pa295_diff > 0;
      if (!comm_has_savings_dbl_pa295) {
        comm_dbl_pa295_diff = Math.abs(comm_dbl_pa295_diff);
      }
      comm_dbl_pa295_diff = this.addCommas(comm_dbl_pa295_diff);
    } catch (_error) {
      e = _error;
      console.log("error: ", e);
    }
    attributes = this.model.getAttributes();
    context = {
      sketch: this.model.forTemplate(),
      sketchClass: this.sketchClass.forTemplate(),
      attributes: this.model.getAttributes(),
      anyAttributes: this.model.getAttributes().length > 0,
      admin: this.project.isAdmin(window.user),
      com_user_savings: com_user_savings,
      res_user_savings: res_user_savings,
      scenarios: scenarios,
      res_pa295_diff: res_pa295_diff,
      res_has_savings_pa295: res_has_savings_pa295,
      res_pa295_dir: this.getDirClass(res_has_savings_pa295),
      res_pa295_perc_diff: res_pa295_perc_diff,
      res_no_pa295_diff: res_no_pa295_diff,
      res_has_savings_no_pa295: res_has_savings_no_pa295,
      res_no_pa295_dir: this.getDirClass(res_has_savings_no_pa295),
      res_no_pa295_perc_diff: res_no_pa295_perc_diff,
      res_dbl_pa295_diff: res_dbl_pa295_diff,
      res_has_savings_dbl_pa295: res_has_savings_dbl_pa295,
      res_dbl_pa295_dir: this.getDirClass(res_has_savings_dbl_pa295),
      res_dbl_pa295_perc_diff: res_dbl_pa295_perc_diff,
      comm_pa295_diff: comm_pa295_diff,
      comm_has_savings_pa295: comm_has_savings_pa295,
      comm_pa295_dir: this.getDirClass(comm_has_savings_pa295),
      comm_pa295_perc_diff: comm_pa295_perc_diff,
      comm_no_pa295_diff: comm_no_pa295_diff,
      comm_has_savings_no_pa295: comm_has_savings_no_pa295,
      comm_no_pa295_dir: this.getDirClass(comm_has_savings_no_pa295),
      comm_no_pa295_perc_diff: comm_no_pa295_perc_diff,
      comm_dbl_pa295_diff: comm_dbl_pa295_diff,
      comm_has_savings_dbl_pa295: comm_has_savings_dbl_pa295,
      comm_dbl_pa295_dir: this.getDirClass(comm_has_savings_dbl_pa295),
      comm_dbl_pa295_perc_diff: comm_dbl_pa295_perc_diff,
      res_sum: res_sum,
      comm_sum: comm_sum,
      d3IsPresent: d3IsPresent
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
    this.$('.comm-chosen-ec').chosen({
      disable_search_threshold: 10,
      width: '200px'
    });
    this.$('.comm-chosen-ec').change(function() {
      return _this.renderDiffs('.comm-chosen-ec', 'comm', 'ec');
    });
    this.$('.res-chosen-ec').chosen({
      disable_search_threshold: 10,
      width: '200px'
    });
    this.$('.res-chosen-ec').change(function() {
      return _this.renderDiffs('.res-chosen-ec', 'res', 'ec');
    });
    if (window.d3) {
      h = 320;
      w = 380;
      margin = {
        left: 40,
        top: 5,
        right: 40,
        bottom: 40,
        inner: 5
      };
      halfh = h + margin.top + margin.bottom;
      totalh = halfh * 2;
      halfw = w + margin.left + margin.right;
      totalw = halfw * 2;
      com_chart = this.drawChart('.commercialEnergyConsumption').xvar(0).yvar(1).xlab("Year").ylab("Value (in millions)").height(h).width(w).margin(margin);
      ch = d3.select(this.$('.commercialEnergyConsumption'));
      ch.datum(sorted_comm_results).call(com_chart);
      res_chart = this.drawChart('.residentialEnergyConsumption').xvar(0).yvar(1).xlab("Year").ylab("Value (in millions)").height(h).width(w).margin(margin);
      ch = d3.select(this.$('.residentialEnergyConsumption'));
      return ch.datum(sorted_res_results).call(res_chart);
    } else {
      return console.log("NO D3!!!!!!!");
    }
  };

  return EnergyConsumptionTab;

})(ReportGraphTab);

module.exports = EnergyConsumptionTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":17,"reportGraphTab":"/1HLUW"}],12:[function(require,module,exports){
var FuelCostsTab, ReportGraphTab, key, partials, templates, val, _partials, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportGraphTab = require('reportGraphTab');

templates = require('../templates/templates.js');

_partials = require('../node_modules/seasketch-reporting-api/templates/templates.js');

partials = [];

for (key in _partials) {
  val = _partials[key];
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val;
}

FuelCostsTab = (function(_super) {
  __extends(FuelCostsTab, _super);

  function FuelCostsTab() {
    _ref = FuelCostsTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FuelCostsTab.prototype.name = 'Fuel Costs';

  FuelCostsTab.prototype.className = 'fuelCosts';

  FuelCostsTab.prototype.timeout = 120000;

  FuelCostsTab.prototype.template = templates.fuelCosts;

  FuelCostsTab.prototype.dependencies = ['EnergyPlan'];

  FuelCostsTab.prototype.render = function() {
    var attributes, ch, comFC, com_chart, com_dblpa, com_nopa, com_pa, com_user, com_user_savings, comm_dbl_pa295_diff, comm_dbl_pa295_total_fc, comm_has_savings_dbl_pa295, comm_has_savings_no_pa295, comm_has_savings_pa295, comm_no_pa295_diff, comm_no_pa295_total_fc, comm_pa295_diff, comm_pa295_total_fc, comm_sum, context, d3IsPresent, e, h, halfh, halfw, margin, msg, resFC, res_chart, res_dbl_pa295_diff, res_dbl_pa295_total_fc, res_dblpa, res_has_savings_dbl_pa295, res_has_savings_no_pa295, res_has_savings_pa295, res_no_pa295_diff, res_no_pa295_total_fc, res_nopa, res_pa, res_pa295_diff, res_pa295_total_fc, res_sum, res_user, res_user_savings, scenarios, sorted_comm_results, sorted_res_results, totalh, totalw, w,
      _this = this;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    attributes = this.model.getAttributes();
    try {
      msg = this.recordSet("EnergyPlan", "ResultMsg");
      console.log("......msg is ", msg);
      scenarios = ['PA 295', 'No PA 295', 'Double PA 295'];
      comFC = this.recordSet("EnergyPlan", "ComEC").toArray();
      resFC = this.recordSet("EnergyPlan", "ResEC").toArray();
      com_pa = this.getMap(comFC, "PA");
      com_dblpa = this.getMap(comFC, "DblPA");
      com_nopa = this.getMap(comFC, "NoPA");
      com_user = this.getUserMap(comFC, "USER", com_nopa);
      com_user_savings = this.getUserSavings(comFC, com_user, com_nopa, 2);
      sorted_comm_results = [com_nopa, com_pa, com_dblpa, com_user];
      res_pa = this.getMap(resFC, "PA");
      res_dblpa = this.getMap(resFC, "DblPA");
      res_nopa = this.getMap(resFC, "NoPA");
      res_user = this.getUserMap(resFC, "USER", res_nopa);
      res_user_savings = this.getUserSavings(resFC, res_user, res_nopa, 2);
      sorted_res_results = [res_nopa, res_pa, res_dblpa, res_user];
      res_sum = this.recordSet("EnergyPlan", "ResECSum").float('USER_SUM', 1);
      res_pa295_total_fc = this.recordSet("EnergyPlan", "ResECSum").float('PA_SUM', 1);
      res_no_pa295_total_fc = this.recordSet("EnergyPlan", "ResECSum").float('NOPA_SUM', 1);
      res_dbl_pa295_total_fc = this.recordSet("EnergyPlan", "ResECSum").float('DBLPA_SUM', 1);
      res_pa295_diff = Math.round(res_pa295_total_fc - res_sum, 0);
      res_has_savings_pa295 = res_pa295_diff > 0;
      if (!res_has_savings_pa295) {
        res_pa295_diff = Math.abs(res_pa295_diff);
      }
      res_pa295_diff = this.addCommas(res_pa295_diff);
      res_no_pa295_diff = Math.round(res_no_pa295_total_fc - res_sum, 0);
      res_has_savings_no_pa295 = res_no_pa295_diff > 0;
      if (!res_has_savings_no_pa295) {
        res_no_pa295_diff = Math.abs(res_no_pa295_diff);
      }
      res_no_pa295_diff = this.addCommas(res_no_pa295_diff);
      res_dbl_pa295_diff = Math.round(res_dbl_pa295_total_fc - res_sum, 0);
      res_has_savings_dbl_pa295 = res_dbl_pa295_diff > 0;
      if (!res_has_savings_dbl_pa295) {
        res_dbl_pa295_diff = Math.abs(res_dbl_pa295_diff);
      }
      res_dbl_pa295_diff = this.addCommas(res_dbl_pa295_diff);
      comm_sum = this.recordSet("EnergyPlan", "ComECSum").float('USER_SUM', 1);
      comm_pa295_total_fc = this.recordSet("EnergyPlan", "ComECSum").float('PA_SUM', 1);
      comm_no_pa295_total_fc = this.recordSet("EnergyPlan", "ComECSum").float('NOPA_SUM', 1);
      comm_dbl_pa295_total_fc = this.recordSet("EnergyPlan", "ComECSum").float('DBLPA_SUM', 1);
      comm_pa295_diff = Math.round(comm_pa295_total_fc - comm_sum, 0);
      comm_has_savings_pa295 = comm_pa295_diff > 0;
      if (!comm_has_savings_pa295) {
        comm_pa295_diff = Math.abs(comm_pa295_diff);
      }
      comm_pa295_diff = this.addCommas(comm_pa295_diff);
      comm_no_pa295_diff = Math.round(comm_no_pa295_total_fc - comm_sum, 0);
      comm_has_savings_no_pa295 = comm_no_pa295_diff > 0;
      if (!comm_has_savings_no_pa295) {
        comm_no_pa295_diff = Math.abs(comm_no_pa295_diff);
      }
      comm_no_pa295_diff = this.addCommas(comm_no_pa295_diff);
      comm_dbl_pa295_diff = Math.round(comm_dbl_pa295_total_fc - comm_sum, 0);
      comm_has_savings_dbl_pa295 = comm_dbl_pa295_diff > 0;
      if (!comm_has_savings_dbl_pa295) {
        comm_dbl_pa295_diff = Math.abs(comm_dbl_pa295_diff);
      }
      comm_dbl_pa295_diff = this.addCommas(comm_dbl_pa295_diff);
    } catch (_error) {
      e = _error;
      console.log("error....................: ", e);
    }
    context = {
      sketch: this.model.forTemplate(),
      sketchClass: this.sketchClass.forTemplate(),
      attributes: this.model.getAttributes(),
      anyAttributes: this.model.getAttributes().length > 0,
      admin: this.project.isAdmin(window.user),
      scenarios: scenarios,
      com_user_savings: com_user_savings,
      res_user_savings: res_user_savings,
      d3IsPresent: d3IsPresent,
      res_pa295_diff: res_pa295_diff,
      res_has_savings_pa295: res_has_savings_pa295,
      res_no_pa295_diff: res_no_pa295_diff,
      res_has_savings_no_pa295: res_has_savings_no_pa295,
      res_dbl_pa295_diff: res_dbl_pa295_diff,
      res_has_savings_dbl_pa295: res_has_savings_dbl_pa295,
      comm_pa295_diff: comm_pa295_diff,
      comm_has_savings_pa295: comm_has_savings_pa295,
      comm_no_pa295_diff: comm_no_pa295_diff,
      comm_has_savings_no_pa295: comm_has_savings_no_pa295,
      comm_dbl_pa295_diff: comm_dbl_pa295_diff,
      comm_has_savings_dbl_pa295: comm_has_savings_dbl_pa295
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
    this.$('.comm-chosen-fc').chosen({
      disable_search_threshold: 10,
      width: '220px'
    });
    this.$('.comm-chosen-fc').change(function() {
      return _this.renderDiffs('.comm-chosen-fc', 'comm', 'fc');
    });
    this.$('.res-chosen-fc').chosen({
      disable_search_threshold: 10,
      width: '220px'
    });
    this.$('.res-chosen-fc').change(function() {
      return _this.renderDiffs('.res-chosen-fc', 'res', 'fc');
    });
    if (window.d3) {
      h = 320;
      w = 380;
      margin = {
        left: 40,
        top: 5,
        right: 40,
        bottom: 40,
        inner: 5
      };
      halfh = h + margin.top + margin.bottom;
      totalh = halfh * 2;
      halfw = w + margin.left + margin.right;
      totalw = halfw * 2;
      com_chart = this.drawChart('.commercialFuelCosts').xvar(0).yvar(1).xlab("Year").ylab("Value (in million $)").height(h).width(w).margin(margin);
      ch = d3.select(this.$('.commercialFuelCosts'));
      ch.datum(sorted_comm_results).call(com_chart);
      res_chart = this.drawChart('.residentialFuelCosts').xvar(0).yvar(1).xlab("Year").ylab("Value (in million $)").height(h).width(w).margin(margin);
      ch = d3.select(this.$('.residentialFuelCosts'));
      return ch.datum(sorted_res_results).call(res_chart);
    }
  };

  return FuelCostsTab;

})(ReportGraphTab);

module.exports = FuelCostsTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":17,"reportGraphTab":"/1HLUW"}],13:[function(require,module,exports){
var GreenhouseGasesTab, ReportGraphTab, key, partials, templates, val, _partials, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportGraphTab = require('reportGraphTab');

templates = require('../templates/templates.js');

_partials = require('../node_modules/seasketch-reporting-api/templates/templates.js');

partials = [];

for (key in _partials) {
  val = _partials[key];
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val;
}

GreenhouseGasesTab = (function(_super) {
  __extends(GreenhouseGasesTab, _super);

  function GreenhouseGasesTab() {
    _ref = GreenhouseGasesTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  GreenhouseGasesTab.prototype.name = 'Greenhouse Gases';

  GreenhouseGasesTab.prototype.className = 'greenhouseGases';

  GreenhouseGasesTab.prototype.timeout = 120000;

  GreenhouseGasesTab.prototype.template = templates.greenhouseGases;

  GreenhouseGasesTab.prototype.dependencies = ['EnergyPlan'];

  GreenhouseGasesTab.prototype.render = function() {
    var attributes, ch, comGHG, com_chart, com_dblpa, com_nopa, com_pa, com_user, com_user_savings, comm_dbl_pa295_diff, comm_dbl_pa295_total_ghg, comm_has_savings_dbl_pa295, comm_has_savings_no_pa295, comm_has_savings_pa295, comm_no_pa295_diff, comm_no_pa295_total_ghg, comm_pa295_diff, comm_pa295_total_ghg, comm_sum, context, d3IsPresent, e, h, halfh, halfw, margin, resGHG, res_chart, res_dbl_pa295_diff, res_dbl_pa295_total_ghg, res_dblpa, res_has_savings_dbl_pa295, res_has_savings_no_pa295, res_has_savings_pa295, res_no_pa295_diff, res_no_pa295_total_ghg, res_nopa, res_pa, res_pa295_diff, res_pa295_total_ghg, res_sum, res_user, res_user_savings, scenarios, sorted_comm_results, sorted_res_results, totalh, totalw, w,
      _this = this;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    attributes = this.model.getAttributes();
    try {
      comGHG = this.recordSet("EnergyPlan", "ComGHG").toArray();
      resGHG = this.recordSet("EnergyPlan", "ResGHG").toArray();
      com_pa = this.getMap(comGHG, "PA");
      com_dblpa = this.getMap(comGHG, "DblPA");
      com_nopa = this.getMap(comGHG, "NoPA");
      com_user = this.getUserMap(comGHG, "USER", com_nopa);
      com_user_savings = this.getUserSavings(comGHG, com_user, com_nopa, 1);
      sorted_comm_results = [com_nopa, com_pa, com_dblpa, com_user];
      res_pa = this.getMap(resGHG, "PA");
      res_dblpa = this.getMap(resGHG, "DblPA");
      res_nopa = this.getMap(resGHG, "NoPA");
      res_user = this.getUserMap(resGHG, "USER", res_nopa);
      res_user_savings = this.getUserSavings(resGHG, res_user, res_nopa, 1);
      sorted_res_results = [res_nopa, res_pa, res_dblpa, res_user];
      scenarios = ['PA 295', 'No PA 295', 'Double PA 295'];
      res_sum = this.recordSet("EnergyPlan", "ResGHGSum").float('USER_SUM', 1);
      res_pa295_total_ghg = this.recordSet("EnergyPlan", "ResGHGSum").float('PA_SUM', 1);
      res_no_pa295_total_ghg = this.recordSet("EnergyPlan", "ResGHGSum").float('NOPA_SUM', 1);
      res_dbl_pa295_total_ghg = this.recordSet("EnergyPlan", "ResGHGSum").float('DBLPA_SUM', 1);
      res_pa295_diff = Math.round(res_pa295_total_ghg - res_sum, 0);
      res_has_savings_pa295 = res_pa295_diff > 0;
      if (!res_has_savings_pa295) {
        res_pa295_diff = Math.abs(res_pa295_diff);
      }
      res_pa295_diff = this.addCommas(res_pa295_diff);
      res_no_pa295_diff = Math.round(res_no_pa295_total_ghg - res_sum, 0);
      res_has_savings_no_pa295 = res_no_pa295_diff > 0;
      if (!res_has_savings_no_pa295) {
        res_no_pa295_diff = Math.abs(res_no_pa295_diff);
      }
      res_no_pa295_diff = this.addCommas(res_no_pa295_diff);
      res_dbl_pa295_diff = Math.round(res_dbl_pa295_total_ghg - res_sum, 0);
      res_has_savings_dbl_pa295 = res_dbl_pa295_diff > 0;
      if (res_has_savings_dbl_pa295) {
        res_dbl_pa295_diff = Math.abs(res_dbl_pa295_diff);
      }
      res_dbl_pa295_diff = this.addCommas(res_dbl_pa295_diff);
      comm_sum = this.recordSet("EnergyPlan", "ComGHGSum").float('USER_SUM', 1);
      comm_pa295_total_ghg = this.recordSet("EnergyPlan", "ComGHGSum").float('PA_SUM', 1);
      comm_no_pa295_total_ghg = this.recordSet("EnergyPlan", "ComGHGSum").float('NOPA_SUM', 1);
      comm_dbl_pa295_total_ghg = this.recordSet("EnergyPlan", "ComGHGSum").float('DBLPA_SUM', 1);
      comm_pa295_diff = Math.round(comm_pa295_total_ghg - comm_sum, 0);
      comm_has_savings_pa295 = comm_pa295_diff > 0;
      if (!comm_has_savings_pa295) {
        comm_pa295_diff = Math.abs(comm_pa295_diff);
      }
      comm_pa295_diff = this.addCommas(comm_pa295_diff);
      comm_no_pa295_diff = Math.round(comm_no_pa295_total_ghg - comm_sum, 0);
      comm_has_savings_no_pa295 = comm_no_pa295_diff > 0;
      if (!comm_has_savings_no_pa295) {
        comm_no_pa295_diff = Math.abs(comm_no_pa295_diff);
      }
      comm_no_pa295_diff = this.addCommas(comm_no_pa295_diff);
      comm_dbl_pa295_diff = Math.round(comm_dbl_pa295_total_ghg - comm_sum, 0);
      comm_has_savings_dbl_pa295 = comm_dbl_pa295_diff > 0;
      if (!comm_has_savings_dbl_pa295) {
        comm_dbl_pa295_diff = Math.abs(comm_dbl_pa295_diff);
      }
      comm_dbl_pa295_diff = this.addCommas(comm_dbl_pa295_diff);
    } catch (_error) {
      e = _error;
      console.log("error: ", e);
    }
    context = {
      sketch: this.model.forTemplate(),
      sketchClass: this.sketchClass.forTemplate(),
      attributes: this.model.getAttributes(),
      anyAttributes: this.model.getAttributes().length > 0,
      admin: this.project.isAdmin(window.user),
      com_user_savings: com_user_savings,
      res_user_savings: res_user_savings,
      d3IsPresent: d3IsPresent,
      scenarios: scenarios,
      res_pa295_diff: res_pa295_diff,
      res_has_savings_pa295: res_has_savings_pa295,
      res_no_pa295_diff: res_no_pa295_diff,
      res_has_savings_no_pa295: res_has_savings_no_pa295,
      res_dbl_pa295_diff: res_dbl_pa295_diff,
      res_has_savings_dbl_pa295: res_has_savings_dbl_pa295,
      comm_pa295_diff: comm_pa295_diff,
      comm_has_savings_pa295: comm_has_savings_pa295,
      comm_no_pa295_diff: comm_no_pa295_diff,
      comm_has_savings_no_pa295: comm_has_savings_no_pa295,
      comm_dbl_pa295_diff: comm_dbl_pa295_diff,
      comm_has_savings_dbl_pa295: comm_has_savings_dbl_pa295
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
    this.$('.comm-chosen-ghg').chosen({
      disable_search_threshold: 10,
      width: '200px'
    });
    this.$('.comm-chosen-ghg').change(function() {
      return _this.renderDiffs('.comm-chosen-ghg', 'comm', 'ghg');
    });
    this.$('.res-chosen-ghg').chosen({
      disable_search_threshold: 10,
      width: '200px'
    });
    this.$('.res-chosen-ghg').change(function() {
      return _this.renderDiffs('.res-chosen-ghg', 'res', 'ghg');
    });
    if (window.d3) {
      h = 320;
      w = 380;
      margin = {
        left: 40,
        top: 5,
        right: 40,
        bottom: 40,
        inner: 5
      };
      halfh = h + margin.top + margin.bottom;
      totalh = halfh * 2;
      halfw = w + margin.left + margin.right;
      totalw = halfw * 2;
      com_chart = this.drawChart('.commercialGreenhouseGases').xvar(0).yvar(1).xlab("Year").ylab("Value").height(h).width(w).margin(margin);
      ch = d3.select(this.$('.commercialGreenhouseGases'));
      ch.datum(sorted_comm_results).call(com_chart);
      res_chart = this.drawChart('.residentialGreenhouseGases').xvar(0).yvar(1).xlab("Year").ylab("Value").height(h).width(w).margin(margin);
      ch = d3.select(this.$('.residentialGreenhouseGases'));
      return ch.datum(sorted_res_results).call(res_chart);
    }
  };

  return GreenhouseGasesTab;

})(ReportGraphTab);

module.exports = GreenhouseGasesTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":17,"reportGraphTab":"/1HLUW"}],14:[function(require,module,exports){
var EnergyConsumptionTab, FuelCostsTab, GreenhouseGasesTab;

EnergyConsumptionTab = require('./energyConsumption.coffee');

FuelCostsTab = require('./fuelCosts.coffee');

GreenhouseGasesTab = require('./greenhouseGases.coffee');

window.app.registerReport(function(report) {
  report.tabs([EnergyConsumptionTab, FuelCostsTab, GreenhouseGasesTab]);
  return report.stylesheets(['./report.css']);
});


},{"./energyConsumption.coffee":11,"./fuelCosts.coffee":12,"./greenhouseGases.coffee":13}],"/1HLUW":[function(require,module,exports){
var ReportGraphTab, ReportTab, key, partials, templates, val, _partials, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportTab = require('reportTab');

templates = require('../templates/templates.js');

_partials = require('../node_modules/seasketch-reporting-api/templates/templates.js');

partials = [];

for (key in _partials) {
  val = _partials[key];
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val;
}

ReportGraphTab = (function(_super) {
  var formatAxis, getScenarioName, getStrokeColor;

  __extends(ReportGraphTab, _super);

  function ReportGraphTab() {
    this.drawChart = __bind(this.drawChart, this);
    this.addCommas = __bind(this.addCommas, this);
    _ref = ReportGraphTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ReportGraphTab.prototype.name = 'ReportGraph';

  ReportGraphTab.prototype.className = 'ReportGraph';

  ReportGraphTab.prototype.timeout = 120000;

  ReportGraphTab.prototype.renderDiffs = function(which_chosen, ce, tab) {
    var name;
    name = this.$(which_chosen).val();
    this.$('.default-chosen-selection' + '_' + tab).hide();
    if (name === "No PA 295") {
      this.$(this.getElemName('.no_pa295', ce, tab)).show();
      this.$(this.getElemName('.pa295', ce, tab)).hide();
      return this.$(this.getElemName('.dbl_pa295', ce, tab)).hide();
    } else if (name === "PA 295") {
      this.$(this.getElemName('.no_pa295', ce, tab)).hide();
      this.$(this.getElemName('.pa295', ce, tab)).show();
      return this.$(this.getElemName('.dbl_pa295', ce, tab)).hide();
    } else {
      this.$(this.getElemName('.no_pa295', ce, tab)).hide();
      this.$(this.getElemName('.pa295', ce, tab)).hide();
      return this.$(this.getElemName('.dbl_pa295', ce, tab)).show();
    }
  };

  ReportGraphTab.prototype.getElemName = function(name, comm_or_ec, tab) {
    return name + "_" + comm_or_ec + "_" + tab;
  };

  ReportGraphTab.prototype.getDirClass = function(dir) {
    if (dir) {
      return 'positive';
    } else {
      return 'negative';
    }
  };

  ReportGraphTab.prototype.getUserSavings = function(recSet, user_start_values, base_values, decs) {
    var base_val, dex, error, savings, user_val, _i, _len;
    savings = 0;
    try {
      for (dex = _i = 0, _len = base_values.length; _i < _len; dex = ++_i) {
        val = base_values[dex];
        user_val = user_start_values[dex].VALUE;
        base_val = val.VALUE;
        savings += base_val - user_val;
      }
      return Math.round(savings, decs);
    } catch (_error) {
      error = _error;
      return 0.0;
    }
  };

  ReportGraphTab.prototype.getUserMap = function(recSet, user_tag, base_values) {
    var rec, user_start_values, _i, _len;
    user_start_values = [];
    for (_i = 0, _len = recSet.length; _i < _len; _i++) {
      rec = recSet[_i];
      if (rec && rec.TYPE === user_tag) {
        user_start_values.push(rec);
      }
    }
    user_start_values = _.sortBy(user_start_values, function(row) {
      return row['YEAR'];
    });
    return user_start_values;
  };

  ReportGraphTab.prototype.getMap = function(recSet, scenario) {
    var rec, scenario_values, _i, _len;
    scenario_values = [];
    for (_i = 0, _len = recSet.length; _i < _len; _i++) {
      rec = recSet[_i];
      if (rec && rec.TYPE === scenario) {
        scenario_values.push(rec);
      }
    }
    return _.sortBy(scenario_values, function(row) {
      return row['YEAR'];
    });
  };

  ReportGraphTab.prototype.addCommas = function(num_str) {
    var rgx, x, x1, x2;
    num_str += '';
    x = num_str.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  };

  ReportGraphTab.prototype.drawChart = function(whichChart) {
    var axispos, chart, height, labelsSelect, legendSelect, legendheight, margin, nxticks, nyticks, pointsSelect, pointsize, rectcolor, tickcolor, view, width, xlab, xlim, xscale, xticks, ylab, ylim, yscale, yticks;
    view = this;
    width = 360;
    height = 500;
    margin = {
      left: 40,
      top: 5,
      right: 20,
      bottom: 40,
      inner: 10
    };
    axispos = {
      xtitle: 5,
      ytitle: 30,
      xlabel: 5,
      ylabel: 15
    };
    xlim = null;
    ylim = null;
    nxticks = 5;
    xticks = null;
    nyticks = 5;
    yticks = null;
    rectcolor = "#dbe4ee";
    tickcolor = "#dbe4ff";
    console.log("drawing chart now...");
    pointsize = 1;
    xlab = "X";
    ylab = "Y score";
    yscale = d3.scale.linear();
    xscale = d3.scale.linear();
    legendheight = 300;
    pointsSelect = null;
    labelsSelect = null;
    legendSelect = null;
    chart = function(selection) {
      return selection.each(function(data) {
        var cnt, currelem, d, g, line, line_color, panelheight, paneloffset, panelwidth, points, scen, scenario, svg, x, xaxis, xaxis_loc, xrange, xs, y, yaxis, yaxis_loc, yrange, ys, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m;
        y = [];
        x = [2012, 2015, 2020, 2025, 2030, 2035];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          scen = data[_i];
          for (_j = 0, _len1 = scen.length; _j < _len1; _j++) {
            d = scen[_j];
            y.push(d.VALUE / 1000000);
          }
        }
        paneloffset = 10;
        panelwidth = width;
        panelheight = height;
        if (!(xlim != null)) {
          xlim = [d3.min(x) - 1, parseFloat(d3.max(x) + 1)];
        }
        if (!(ylim != null)) {
          ylim = [d3.min(y), parseFloat(d3.max(y))];
        }
        currelem = d3.select(view.$(whichChart)[0]);
        svg = d3.select(view.$(whichChart)[0]).append("svg").data([data]);
        svg.append("g");
        svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom + data.length * 35);
        g = svg.select("g");
        g.append("rect").attr("x", paneloffset + margin.left).attr("y", margin.top).attr("height", panelheight).attr("width", panelwidth).attr("fill", "white").attr("stroke", "none");
        xrange = [margin.left + paneloffset + margin.inner, margin.left + paneloffset + panelwidth - margin.inner];
        yrange = [margin.top + panelheight - margin.inner, margin.top + margin.inner];
        xscale.domain(xlim).range(xrange);
        yscale.domain(ylim).range(yrange);
        xs = d3.scale.linear().domain(xlim).range(xrange);
        ys = d3.scale.linear().domain(ylim).range(yrange);
        if (!(yticks != null)) {
          yticks = ys.ticks(nyticks);
        }
        if (!(xticks != null)) {
          xticks = xs.ticks(nxticks);
        }
        xaxis = g.append("g").attr("class", "x axis");
        xaxis.selectAll("empty").data(xticks).enter().append("line").attr("x1", function(d) {
          return xscale(d);
        }).attr("x2", function(d) {
          return xscale(d);
        }).attr("y1", margin.top + height - 5).attr("y2", margin.top + height).attr("stroke-width", 1).style("pointer-events", "none");
        xaxis.selectAll("empty").data(xticks).enter().append("text").attr("x", function(d) {
          return xscale(d) - 14;
        }).attr("y", margin.top + height + axispos.xlabel + 10).text(function(d) {
          return formatAxis(xticks)(d);
        });
        xaxis.append("text").attr("class", "xaxis-title").attr("x", margin.left + width / 2).attr("y", margin.top + height + axispos.xtitle + 30).text(xlab);
        for (cnt = _k = 0, _len2 = data.length; _k < _len2; cnt = ++_k) {
          scenario = data[cnt];
          line_color = getStrokeColor(scenario);
          xaxis.selectAll("empty").data([scenario[0]]).enter().append("line").attr("x1", function(d, i) {
            return margin.left;
          }).attr("x2", function(d, i) {
            return margin.left + 10;
          }).attr("y1", function(d, i) {
            return margin.top + height + axispos.xtitle + ((cnt + 1) * 30) + 6;
          }).attr("y2", function(d, i) {
            return margin.top + height + axispos.xtitle + ((cnt + 1) * 30) + 6;
          }).attr("class", "chart-line").attr("stroke", function(d, i) {
            return line_color;
          }).attr("color", function(d, i) {
            return line_color;
          }).attr("stroke-width", 3);
        }
        for (cnt = _l = 0, _len3 = data.length; _l < _len3; cnt = ++_l) {
          scenario = data[cnt];
          xaxis.selectAll("empty").data([scenario[0]]).enter().append("text").attr("class", "legend-text").attr("x", function(d, i) {
            return margin.left + 17;
          }).attr("y", function(d, i) {
            return margin.top + height + 10 + axispos.xtitle + ((cnt + 1) * 30);
          }).text(function(d, i) {
            return getScenarioName([d]);
          });
        }
        yaxis = g.append("g").attr("class", "y axis");
        yaxis.selectAll("empty").data(yticks).enter().append("line").attr("y1", function(d) {
          return yscale(d);
        }).attr("y2", function(d) {
          return yscale(d);
        }).attr("x1", margin.left + 10).attr("x2", margin.left + 15).attr("fill", "none").attr("stroke", tickcolor).attr("stroke-width", 1).style("pointer-events", "none");
        yaxis_loc = function(d) {
          return yscale(d) + 3;
        };
        xaxis_loc = (margin.left - 4) - axispos.ylabel;
        yaxis.selectAll("empty").data(yticks).enter().append("text").attr("y", yaxis_loc).attr("x", xaxis_loc).text(function(d) {
          return formatAxis(yticks)(d);
        });
        yaxis.append("text").attr("class", "title").attr("y", margin.top + 35 + height / 2).attr("x", margin.left + 6 - axispos.ytitle).text(ylab).attr("transform", "rotate(270," + (margin.left + 4 - axispos.ytitle) + "," + (margin.top + 35 + height / 2) + ")");
        points = g.append("g").attr("id", "points");
        for (_m = 0, _len4 = data.length; _m < _len4; _m++) {
          scenario = data[_m];
          line_color = getStrokeColor(scenario);
          /*
          pointsSelect =
            points.selectAll("empty")
                  .data(scenario)
                  .enter()
                  .append("circle")
                  .attr("cx", (d,i) -> xscale(d.YEAR))
                  .attr("cy", (d,i) -> yscale(d.VALUE/1000000))
                  .attr("class", (d,i) -> "pt#{i}")
                  .attr("r", pointsize)
                  .attr("fill", (d,i) ->
                            val = i
                            col = line_color
                            return col
                            )
                  .attr("stroke", (d, i) ->
                            val = Math.floor(i/17) % 5
                            col = line_color
                            return col
                            )
                  .attr("stroke-width", "1")
                  .attr("opacity", (d,i) ->
                       return 1 if (x[i]? or xNA.handle) and (y[i]? or yNA.handle)
                       return 0)
          */

        }
        line = d3.svg.line(d).interpolate("basis").x(function(d) {
          return xscale(parseInt(d.YEAR));
        }).y(function(d) {
          return yscale(d.VALUE / 1000000);
        });
        points.selectAll("empty").data(data).enter().append("path").attr("d", function(d) {
          return line(d);
        }).attr("stroke", function(d) {
          return getStrokeColor(d);
        }).attr("stroke-width", 3).attr("fill", "none");
        return g.append("rect").attr("x", margin.left + paneloffset).attr("y", margin.top).attr("height", panelheight).attr("width", panelwidth).attr("fill", "none").attr("stroke", "black").attr("stroke-width", "none");
      });
    };
    chart.width = function(value) {
      if (!arguments.length) {
        return width;
      }
      width = value;
      return chart;
    };
    chart.height = function(value) {
      if (!arguments.length) {
        return height;
      }
      height = value;
      return chart;
    };
    chart.margin = function(value) {
      if (!arguments.length) {
        return margin;
      }
      margin = value;
      return chart;
    };
    chart.axispos = function(value) {
      if (!arguments.length) {
        return axispos;
      }
      axispos = value;
      return chart;
    };
    chart.xlim = function(value) {
      if (!arguments.length) {
        return xlim;
      }
      xlim = value;
      return chart;
    };
    chart.nxticks = function(value) {
      if (!arguments.length) {
        return nxticks;
      }
      nxticks = value;
      return chart;
    };
    chart.xticks = function(value) {
      if (!arguments.length) {
        return xticks;
      }
      xticks = value;
      return chart;
    };
    chart.ylim = function(value) {
      if (!arguments.length) {
        return ylim;
      }
      ylim = value;
      return chart;
    };
    chart.nyticks = function(value) {
      if (!arguments.length) {
        return nyticks;
      }
      nyticks = value;
      return chart;
    };
    chart.yticks = function(value) {
      if (!arguments.length) {
        return yticks;
      }
      yticks = value;
      return chart;
    };
    chart.rectcolor = function(value) {
      if (!arguments.length) {
        return rectcolor;
      }
      rectcolor = value;
      return chart;
    };
    chart.pointcolor = function(value) {
      var pointcolor;
      if (!arguments.length) {
        return pointcolor;
      }
      pointcolor = value;
      return chart;
    };
    chart.pointsize = function(value) {
      if (!arguments.length) {
        return pointsize;
      }
      pointsize = value;
      return chart;
    };
    chart.pointstroke = function(value) {
      var pointstroke;
      if (!arguments.length) {
        return pointstroke;
      }
      pointstroke = value;
      return chart;
    };
    chart.xlab = function(value) {
      if (!arguments.length) {
        return xlab;
      }
      xlab = value;
      return chart;
    };
    chart.ylab = function(value) {
      if (!arguments.length) {
        return ylab;
      }
      ylab = value;
      return chart;
    };
    chart.xvar = function(value) {
      var xvar;
      if (!arguments.length) {
        return xvar;
      }
      xvar = value;
      return chart;
    };
    chart.yvar = function(value) {
      var yvar;
      if (!arguments.length) {
        return yvar;
      }
      yvar = value;
      return chart;
    };
    chart.yscale = function() {
      return yscale;
    };
    chart.xscale = function() {
      return xscale;
    };
    chart.pointsSelect = function() {
      return pointsSelect;
    };
    chart.labelsSelect = function() {
      return labelsSelect;
    };
    chart.legendSelect = function() {
      return legendSelect;
    };
    return chart;
  };

  getScenarioName = function(scenario) {
    var d, _i, _len;
    for (_i = 0, _len = scenario.length; _i < _len; _i++) {
      d = scenario[_i];
      if (d === void 0) {
        return "User Scenario (with errors)";
      }
      if (d.TYPE === "PA") {
        return "PA 295";
      } else if (d.TYPE === "NoPA") {
        return "No PA 295";
      } else if (d.TYPE === "DblPA") {
        return "Double PA 295";
      } else {
        return "User Scenario";
      }
    }
  };

  getStrokeColor = function(scenario) {
    var d, dblpacolor, nopacolor, pacolor, _i, _len;
    pacolor = "#9aba8c";
    nopacolor = "#e5cace";
    dblpacolor = "#b3cfa7";
    for (_i = 0, _len = scenario.length; _i < _len; _i++) {
      d = scenario[_i];
      if (d.TYPE === "PA") {
        return pacolor;
      } else if (d.TYPE === "NoPA") {
        return nopacolor;
      } else if (d.TYPE === "DblPA") {
        return dblpacolor;
      } else {
        return "gray";
      }
    }
  };

  formatAxis = function(d) {
    var ndig;
    d = d[1] - d[0];
    ndig = Math.floor(Math.log(d % 10) / Math.log(10));
    if (ndig > 0) {
      ndig = 0;
    }
    ndig = Math.abs(ndig);
    return d3.format("." + ndig + "f");
  };

  return ReportGraphTab;

})(ReportTab);

module.exports = ReportGraphTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":17,"reportTab":"a21iR2"}],"reportGraphTab":[function(require,module,exports){
module.exports=require('/1HLUW');
},{}],17:[function(require,module,exports){
this["Templates"] = this["Templates"] || {};
this["Templates"]["energyConsumption"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("\n" + i);_.b("<p>");_.b("\n" + i);_.b("	In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong> A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial Energy Consumption -- MMBTU Equivalent</h4>");_.b("\n" + i);_.b("  <div class=\"chooser-div\">");_.b("\n" + i);_.b("    <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"comm-chosen-ec\">");_.b("\n" + i);_.b("      <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,656,708,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("    </select>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"pa295_comm_ec\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("comm_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("comm_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"pa295_comm_ec\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,0,967,971,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("comm_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"no_pa295_comm_ec\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("comm_no_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("comm_no_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"no_pa295_comm_ec\">By 2035, your energy plan is estimated to  <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,0,1432,1436,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("comm_no_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>No PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"dbl_pa295_comm_ec\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("comm_dbl_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("comm_dbl_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_comm_ec\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,0,1916,1920,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("comm_dbl_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>Double PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div  id=\"commercialEnergyConsumption\" class=\"commercialEnergyConsumption\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential Energy Consumption -- MMBTU Equivalent</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"res-chosen-ec\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,2589,2645,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"pa295_res_ec\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("res_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("res_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"pa295_res_ec\">By 2035, your energy plan is estimated to <strong>");if(_.s(_.f("res_has_savings_pa295",c,p,1),c,p,0,2901,2905,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("res_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"no_pa295_res_ec\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("res_no_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("res_no_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"no_pa295_res_ec\">By 2035, your energy plan is estimated to  <strong>");if(_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,0,3355,3359,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("res_no_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>No PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"dbl_pa295_res_ec\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("res_dbl_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("res_dbl_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_res_ec\">By 2035, your energy plan is estimated to <strong>");if(_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,0,3828,3832,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("res_dbl_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>Double PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"residentialEnergyConsumption\" class=\"residentialEnergyConsumption\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show energy consumption in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["fuelCosts"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("\n" + i);_.b("<p>");_.b("\n" + i);_.b("In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong>. A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial Fuel Costs -- 2012 Dollars</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"comm-chosen-fc\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,651,707,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  <p class=\"pa295_comm_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("comm_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,0,904,909,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong> than the <strong>PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_comm_fc\">By 2035, your energy plan is estimated to have fuel costs that are<strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("comm_no_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,0,1251,1256,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>  than the <strong>No PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_comm_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("comm_dbl_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,0,1615,1620,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>than the <strong>Double PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div  id=\"commercialFuelCosts\" class=\"commercialFuelCosts\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential Fuel Costs -- 2012 Dollars</h4>");_.b("\n" + i);_.b("  <div class=\"chooser-div\">");_.b("\n" + i);_.b("    <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"res-chosen-fc\">");_.b("\n" + i);_.b("      <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,2203,2255,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("    </select>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"pa295_res_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("res_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_pa295",c,p,1),c,p,0,2445,2450,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong> than the <strong>PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_res_fc\">By 2035, your energy plan is estimated to have fuel costs that are<strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("res_no_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,0,2787,2792,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>  than the <strong>No PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_res_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("res_dbl_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,0,3146,3151,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>than the <strong>Double PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div  id=\"residentialFuelCosts\" class=\"residentialFuelCosts\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show fuel costs in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");return _.fl();;});
this["Templates"]["greenhouseGases"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<p>");_.b("\n" + i);_.b("In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong>. A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial GHG's -- CO<sub>2</sub>-e Equivalent</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"comm-chosen-ghg\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,661,717,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  <p class=\"pa295_comm_ghg\">By 2035, your energy plan is estimated to<strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,0,866,872,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE ");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("comm_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_comm_ghg\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,0,1229,1235,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("comm_no_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>No PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_comm_ghg\">By 2035, your energy plan is estimated to  <strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,0,1609,1615,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong>GHGs by <strong>");_.b(_.v(_.f("comm_dbl_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>Double PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"commercialGreenhouseGases\" class=\"commercialGreenhouseGases\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential GHG's -- CO<sub>2</sub>-e Equivalent</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"res-chosen-ghg\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,2292,2348,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  <p class=\"pa295_res_ghg\">By 2035, your energy plan is estimated to<strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_pa295",c,p,1),c,p,0,2498,2504,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE ");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("res_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_res_ghg\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,0,2853,2859,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("res_no_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>No PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_res_ghg\">By 2035, your energy plan is estimated to  <strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,0,3228,3234,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong>GHGs by <strong>");_.b(_.v(_.f("res_dbl_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>Double PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div id=\"residentialGreenhouseGases\" class=\"residentialGreenhouseGases\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show greenhouse gas emissions in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");_.b("\n");return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[14])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL2VuYWJsZUxheWVyVG9nZ2xlcnMuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9tZW8tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy9qb2JJdGVtLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0UmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL3JlcG9ydFRhYi5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL3V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL3NjcmlwdHMvZW5lcmd5Q29uc3VtcHRpb24uY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9tZW8tcmVwb3J0cy9zY3JpcHRzL2Z1ZWxDb3N0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL3NjcmlwdHMvZ3JlZW5ob3VzZUdhc2VzLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvc2NyaXB0cy9yZXBvcnQuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9tZW8tcmVwb3J0cy9zY3JpcHRzL3JlcG9ydEdyYXBoVGFiLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBLENBQU8sQ0FBVSxDQUFBLEdBQVgsQ0FBTixFQUFrQjtDQUNoQixLQUFBLDJFQUFBO0NBQUEsQ0FBQSxDQUFBO0NBQUEsQ0FDQSxDQUFBLEdBQVk7Q0FEWixDQUVBLENBQUEsR0FBTTtBQUNDLENBQVAsQ0FBQSxDQUFBLENBQUE7Q0FDRSxFQUFBLENBQUEsR0FBTyxxQkFBUDtDQUNBLFNBQUE7SUFMRjtDQUFBLENBTUEsQ0FBVyxDQUFBLElBQVgsYUFBVztDQUVYO0NBQUEsTUFBQSxvQ0FBQTt3QkFBQTtDQUNFLEVBQVcsQ0FBWCxHQUFXLENBQVg7Q0FBQSxFQUNTLENBQVQsRUFBQSxFQUFpQixLQUFSO0NBQ1Q7Q0FDRSxFQUFPLENBQVAsRUFBQSxVQUFPO0NBQVAsRUFDTyxDQUFQLENBREEsQ0FDQTtBQUMrQixDQUYvQixDQUU4QixDQUFFLENBQWhDLEVB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LHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsbnVsbCwibW9kdWxlLmV4cG9ydHMgPSAoZWwpIC0+XG4gICRlbCA9ICQgZWxcbiAgYXBwID0gd2luZG93LmFwcFxuICB0b2MgPSBhcHAuZ2V0VG9jKClcbiAgdW5sZXNzIHRvY1xuICAgIGNvbnNvbGUubG9nICdObyB0YWJsZSBvZiBjb250ZW50cyBmb3VuZCdcbiAgICByZXR1cm5cbiAgdG9nZ2xlcnMgPSAkZWwuZmluZCgnYVtkYXRhLXRvZ2dsZS1ub2RlXScpXG4gICMgU2V0IGluaXRpYWwgc3RhdGVcbiAgZm9yIHRvZ2dsZXIgaW4gdG9nZ2xlcnMudG9BcnJheSgpXG4gICAgJHRvZ2dsZXIgPSAkKHRvZ2dsZXIpXG4gICAgbm9kZWlkID0gJHRvZ2dsZXIuZGF0YSgndG9nZ2xlLW5vZGUnKVxuICAgIHRyeVxuICAgICAgdmlldyA9IHRvYy5nZXRDaGlsZFZpZXdCeUlkIG5vZGVpZFxuICAgICAgbm9kZSA9IHZpZXcubW9kZWxcbiAgICAgICR0b2dnbGVyLmF0dHIgJ2RhdGEtdmlzaWJsZScsICEhbm9kZS5nZXQoJ3Zpc2libGUnKVxuICAgICAgJHRvZ2dsZXIuZGF0YSAndG9jSXRlbScsIHZpZXdcbiAgICBjYXRjaCBlXG4gICAgICAkdG9nZ2xlci5hdHRyICdkYXRhLW5vdC1mb3VuZCcsICd0cnVlJ1xuXG4gIHRvZ2dsZXJzLm9uICdjbGljaycsIChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICRlbCA9ICQoZS50YXJnZXQpXG4gICAgdmlldyA9ICRlbC5kYXRhKCd0b2NJdGVtJylcbiAgICBpZiB2aWV3XG4gICAgICB2aWV3LnRvZ2dsZVZpc2liaWxpdHkoZSlcbiAgICAgICRlbC5hdHRyICdkYXRhLXZpc2libGUnLCAhIXZpZXcubW9kZWwuZ2V0KCd2aXNpYmxlJylcbiAgICBlbHNlXG4gICAgICBhbGVydCBcIkxheWVyIG5vdCBmb3VuZCBpbiB0aGUgY3VycmVudCBUYWJsZSBvZiBDb250ZW50cy4gXFxuRXhwZWN0ZWQgbm9kZWlkICN7JGVsLmRhdGEoJ3RvZ2dsZS1ub2RlJyl9XCJcbiIsImNsYXNzIEpvYkl0ZW0gZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG4gIGNsYXNzTmFtZTogJ3JlcG9ydFJlc3VsdCdcbiAgZXZlbnRzOiB7fVxuICBiaW5kaW5nczpcbiAgICBcImg2IGFcIjpcbiAgICAgIG9ic2VydmU6IFwic2VydmljZU5hbWVcIlxuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgbmFtZTogJ2hyZWYnXG4gICAgICAgIG9ic2VydmU6ICdzZXJ2aWNlVXJsJ1xuICAgICAgfV1cbiAgICBcIi5zdGFydGVkQXRcIjpcbiAgICAgIG9ic2VydmU6IFtcInN0YXJ0ZWRBdFwiLCBcInN0YXR1c1wiXVxuICAgICAgdmlzaWJsZTogKCkgLT5cbiAgICAgICAgQG1vZGVsLmdldCgnc3RhdHVzJykgbm90IGluIFsnY29tcGxldGUnLCAnZXJyb3InXVxuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgb25HZXQ6ICgpIC0+XG4gICAgICAgIGlmIEBtb2RlbC5nZXQoJ3N0YXJ0ZWRBdCcpXG4gICAgICAgICAgcmV0dXJuIFwiU3RhcnRlZCBcIiArIG1vbWVudChAbW9kZWwuZ2V0KCdzdGFydGVkQXQnKSkuZnJvbU5vdygpICsgXCIuIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBcIlwiXG4gICAgXCIuc3RhdHVzXCI6ICAgICAgXG4gICAgICBvYnNlcnZlOiBcInN0YXR1c1wiXG4gICAgICBvbkdldDogKHMpIC0+XG4gICAgICAgIHN3aXRjaCBzXG4gICAgICAgICAgd2hlbiAncGVuZGluZydcbiAgICAgICAgICAgIFwid2FpdGluZyBpbiBsaW5lXCJcbiAgICAgICAgICB3aGVuICdydW5uaW5nJ1xuICAgICAgICAgICAgXCJydW5uaW5nIGFuYWx5dGljYWwgc2VydmljZVwiXG4gICAgICAgICAgd2hlbiAnY29tcGxldGUnXG4gICAgICAgICAgICBcImNvbXBsZXRlZFwiXG4gICAgICAgICAgd2hlbiAnZXJyb3InXG4gICAgICAgICAgICBcImFuIGVycm9yIG9jY3VycmVkXCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzXG4gICAgXCIucXVldWVMZW5ndGhcIjogXG4gICAgICBvYnNlcnZlOiBcInF1ZXVlTGVuZ3RoXCJcbiAgICAgIG9uR2V0OiAodikgLT5cbiAgICAgICAgcyA9IFwiV2FpdGluZyBiZWhpbmQgI3t2fSBqb2JcIlxuICAgICAgICBpZiB2Lmxlbmd0aCA+IDFcbiAgICAgICAgICBzICs9ICdzJ1xuICAgICAgICByZXR1cm4gcyArIFwiLiBcIlxuICAgICAgdmlzaWJsZTogKHYpIC0+XG4gICAgICAgIHY/IGFuZCBwYXJzZUludCh2KSA+IDBcbiAgICBcIi5lcnJvcnNcIjpcbiAgICAgIG9ic2VydmU6ICdlcnJvcidcbiAgICAgIHVwZGF0ZVZpZXc6IHRydWVcbiAgICAgIHZpc2libGU6ICh2KSAtPlxuICAgICAgICB2Py5sZW5ndGggPiAyXG4gICAgICBvbkdldDogKHYpIC0+XG4gICAgICAgIGlmIHY/XG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkodiwgbnVsbCwgJyAgJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEBtb2RlbCkgLT5cbiAgICBzdXBlcigpXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgIEAkZWwuaHRtbCBcIlwiXCJcbiAgICAgIDxoNj48YSBocmVmPVwiI1wiIHRhcmdldD1cIl9ibGFua1wiPjwvYT48c3BhbiBjbGFzcz1cInN0YXR1c1wiPjwvc3Bhbj48L2g2PlxuICAgICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJzdGFydGVkQXRcIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicXVldWVMZW5ndGhcIj48L3NwYW4+XG4gICAgICAgIDxwcmUgY2xhc3M9XCJlcnJvcnNcIj48L3ByZT5cbiAgICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICAgIEBzdGlja2l0KClcblxubW9kdWxlLmV4cG9ydHMgPSBKb2JJdGVtIiwiY2xhc3MgUmVwb3J0UmVzdWx0cyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblxuICBkZWZhdWx0UG9sbGluZ0ludGVydmFsOiAzMDAwXG5cbiAgY29uc3RydWN0b3I6IChAc2tldGNoLCBAZGVwcykgLT5cbiAgICBAdXJsID0gdXJsID0gXCIvcmVwb3J0cy8je0Bza2V0Y2guaWR9LyN7QGRlcHMuam9pbignLCcpfVwiXG4gICAgc3VwZXIoKVxuXG4gIHBvbGw6ICgpID0+XG4gICAgQGZldGNoIHtcbiAgICAgIHN1Y2Nlc3M6ICgpID0+XG4gICAgICAgIEB0cmlnZ2VyICdqb2JzJ1xuICAgICAgICBmb3IgcmVzdWx0IGluIEBtb2RlbHNcbiAgICAgICAgICBpZiByZXN1bHQuZ2V0KCdzdGF0dXMnKSBub3QgaW4gWydjb21wbGV0ZScsICdlcnJvciddXG4gICAgICAgICAgICB1bmxlc3MgQGludGVydmFsXG4gICAgICAgICAgICAgIEBpbnRlcnZhbCA9IHNldEludGVydmFsIEBwb2xsLCBAZGVmYXVsdFBvbGxpbmdJbnRlcnZhbFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgY29uc29sZS5sb2cgQG1vZGVsc1swXS5nZXQoJ3BheWxvYWRTaXplQnl0ZXMnKVxuICAgICAgICAgIHBheWxvYWRTaXplID0gTWF0aC5yb3VuZCgoKEBtb2RlbHNbMF0uZ2V0KCdwYXlsb2FkU2l6ZUJ5dGVzJykgb3IgMCkgLyAxMDI0KSAqIDEwMCkgLyAxMDBcbiAgICAgICAgICBjb25zb2xlLmxvZyBcIkZlYXR1cmVTZXQgc2VudCB0byBHUCB3ZWlnaGVkIGluIGF0ICN7cGF5bG9hZFNpemV9a2JcIlxuICAgICAgICAjIGFsbCBjb21wbGV0ZSB0aGVuXG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBpbnRlcnZhbCkgaWYgQGludGVydmFsXG4gICAgICAgIGlmIHByb2JsZW0gPSBfLmZpbmQoQG1vZGVscywgKHIpIC0+IHIuZ2V0KCdlcnJvcicpPylcbiAgICAgICAgICBAdHJpZ2dlciAnZXJyb3InLCBcIlByb2JsZW0gd2l0aCAje3Byb2JsZW0uZ2V0KCdzZXJ2aWNlTmFtZScpfSBqb2JcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHRyaWdnZXIgJ2ZpbmlzaGVkJ1xuICAgICAgZXJyb3I6IChlLCByZXMsIGEsIGIpID0+XG4gICAgICAgIHVubGVzcyByZXMuc3RhdHVzIGlzIDBcbiAgICAgICAgICBpZiByZXMucmVzcG9uc2VUZXh0Py5sZW5ndGhcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICBqc29uID0gSlNPTi5wYXJzZShyZXMucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgIyBkbyBub3RoaW5nXG4gICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGludGVydmFsKSBpZiBAaW50ZXJ2YWxcbiAgICAgICAgICBAdHJpZ2dlciAnZXJyb3InLCBqc29uPy5lcnJvcj8ubWVzc2FnZSBvclxuICAgICAgICAgICAgJ1Byb2JsZW0gY29udGFjdGluZyB0aGUgU2VhU2tldGNoIHNlcnZlcidcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0UmVzdWx0c1xuIiwiZW5hYmxlTGF5ZXJUb2dnbGVycyA9IHJlcXVpcmUgJy4vZW5hYmxlTGF5ZXJUb2dnbGVycy5jb2ZmZWUnXG5yb3VuZCA9IHJlcXVpcmUoJy4vdXRpbHMuY29mZmVlJykucm91bmRcblJlcG9ydFJlc3VsdHMgPSByZXF1aXJlICcuL3JlcG9ydFJlc3VsdHMuY29mZmVlJ1xudCA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnKVxudGVtcGxhdGVzID1cbiAgcmVwb3J0TG9hZGluZzogdFsnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3JlcG9ydExvYWRpbmcnXVxuSm9iSXRlbSA9IHJlcXVpcmUgJy4vam9iSXRlbS5jb2ZmZWUnXG5Db2xsZWN0aW9uVmlldyA9IHJlcXVpcmUoJ3ZpZXdzL2NvbGxlY3Rpb25WaWV3JylcblxuY2xhc3MgUmVjb3JkU2V0XG5cbiAgY29uc3RydWN0b3I6IChAZGF0YSwgQHRhYiwgQHNrZXRjaENsYXNzSWQpIC0+XG5cbiAgdG9BcnJheTogKCkgLT5cbiAgICBpZiBAc2tldGNoQ2xhc3NJZFxuICAgICAgZGF0YSA9IF8uZmluZCBAZGF0YS52YWx1ZSwgKHYpID0+XG4gICAgICAgIHYuZmVhdHVyZXM/WzBdPy5hdHRyaWJ1dGVzP1snU0NfSUQnXSBpcyBAc2tldGNoQ2xhc3NJZFxuICAgICAgdW5sZXNzIGRhdGFcbiAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBkYXRhIGZvciBza2V0Y2hDbGFzcyAje0Bza2V0Y2hDbGFzc0lkfVwiXG4gICAgZWxzZVxuICAgICAgaWYgXy5pc0FycmF5IEBkYXRhLnZhbHVlXG4gICAgICAgIGRhdGEgPSBAZGF0YS52YWx1ZVswXVxuICAgICAgZWxzZVxuICAgICAgICBkYXRhID0gQGRhdGEudmFsdWVcbiAgICBfLm1hcCBkYXRhLmZlYXR1cmVzLCAoZmVhdHVyZSkgLT5cbiAgICAgIGZlYXR1cmUuYXR0cmlidXRlc1xuXG4gIHJhdzogKGF0dHIpIC0+XG4gICAgYXR0cnMgPSBfLm1hcCBAdG9BcnJheSgpLCAocm93KSAtPlxuICAgICAgcm93W2F0dHJdXG4gICAgYXR0cnMgPSBfLmZpbHRlciBhdHRycywgKGF0dHIpIC0+IGF0dHIgIT0gdW5kZWZpbmVkXG4gICAgaWYgYXR0cnMubGVuZ3RoIGlzIDBcbiAgICAgIGNvbnNvbGUubG9nIEBkYXRhXG4gICAgICBAdGFiLnJlcG9ydEVycm9yIFwiQ291bGQgbm90IGdldCBhdHRyaWJ1dGUgI3thdHRyfSBmcm9tIHJlc3VsdHNcIlxuICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZ2V0IGF0dHJpYnV0ZSAje2F0dHJ9XCJcbiAgICBlbHNlIGlmIGF0dHJzLmxlbmd0aCBpcyAxXG4gICAgICByZXR1cm4gYXR0cnNbMF1cbiAgICBlbHNlXG4gICAgICByZXR1cm4gYXR0cnNcblxuICBpbnQ6IChhdHRyKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCBwYXJzZUludFxuICAgIGVsc2VcbiAgICAgIHBhcnNlSW50KHJhdylcblxuICBmbG9hdDogKGF0dHIsIGRlY2ltYWxQbGFjZXM9MikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgKHZhbCkgLT4gcm91bmQodmFsLCBkZWNpbWFsUGxhY2VzKVxuICAgIGVsc2VcbiAgICAgIHJvdW5kKHJhdywgZGVjaW1hbFBsYWNlcylcblxuICBib29sOiAoYXR0cikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgKHZhbCkgLT4gdmFsLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSBpcyAndHJ1ZSdcbiAgICBlbHNlXG4gICAgICByYXcudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpIGlzICd0cnVlJ1xuXG5jbGFzcyBSZXBvcnRUYWIgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG4gIG5hbWU6ICdJbmZvcm1hdGlvbidcbiAgZGVwZW5kZW5jaWVzOiBbXVxuXG4gIGluaXRpYWxpemU6IChAbW9kZWwsIEBvcHRpb25zKSAtPlxuICAgICMgV2lsbCBiZSBpbml0aWFsaXplZCBieSBTZWFTa2V0Y2ggd2l0aCB0aGUgZm9sbG93aW5nIGFyZ3VtZW50czpcbiAgICAjICAgKiBtb2RlbCAtIFRoZSBza2V0Y2ggYmVpbmcgcmVwb3J0ZWQgb25cbiAgICAjICAgKiBvcHRpb25zXG4gICAgIyAgICAgLSAucGFyZW50IC0gdGhlIHBhcmVudCByZXBvcnQgdmlld1xuICAgICMgICAgICAgIGNhbGwgQG9wdGlvbnMucGFyZW50LmRlc3Ryb3koKSB0byBjbG9zZSB0aGUgd2hvbGUgcmVwb3J0IHdpbmRvd1xuICAgIEBhcHAgPSB3aW5kb3cuYXBwXG4gICAgXy5leHRlbmQgQCwgQG9wdGlvbnNcbiAgICBAcmVwb3J0UmVzdWx0cyA9IG5ldyBSZXBvcnRSZXN1bHRzKEBtb2RlbCwgQGRlcGVuZGVuY2llcylcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnZXJyb3InLCBAcmVwb3J0RXJyb3JcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnam9icycsIEByZW5kZXJKb2JEZXRhaWxzXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ2pvYnMnLCBAcmVwb3J0Sm9ic1xuICAgIEBsaXN0ZW5UbyBAcmVwb3J0UmVzdWx0cywgJ2ZpbmlzaGVkJywgXy5iaW5kIEByZW5kZXIsIEBcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAncmVxdWVzdCcsIEByZXBvcnRSZXF1ZXN0ZWRcblxuICByZW5kZXI6ICgpIC0+XG4gICAgdGhyb3cgJ3JlbmRlciBtZXRob2QgbXVzdCBiZSBvdmVyaWRkZW4nXG5cbiAgc2hvdzogKCkgLT5cbiAgICBAJGVsLnNob3coKVxuICAgIEB2aXNpYmxlID0gdHJ1ZVxuICAgIGlmIEBkZXBlbmRlbmNpZXM/Lmxlbmd0aCBhbmQgIUByZXBvcnRSZXN1bHRzLm1vZGVscy5sZW5ndGhcbiAgICAgIEByZXBvcnRSZXN1bHRzLnBvbGwoKVxuICAgIGVsc2UgaWYgIUBkZXBlbmRlbmNpZXM/Lmxlbmd0aFxuICAgICAgQHJlbmRlcigpXG4gICAgICBAJCgnW2RhdGEtYXR0cmlidXRlLXR5cGU9VXJsRmllbGRdIC52YWx1ZSwgW2RhdGEtYXR0cmlidXRlLXR5cGU9VXBsb2FkRmllbGRdIC52YWx1ZScpLmVhY2ggKCkgLT5cbiAgICAgICAgdGV4dCA9ICQoQCkudGV4dCgpXG4gICAgICAgIGh0bWwgPSBbXVxuICAgICAgICBmb3IgdXJsIGluIHRleHQuc3BsaXQoJywnKVxuICAgICAgICAgIGlmIHVybC5sZW5ndGhcbiAgICAgICAgICAgIG5hbWUgPSBfLmxhc3QodXJsLnNwbGl0KCcvJykpXG4gICAgICAgICAgICBodG1sLnB1c2ggXCJcIlwiPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiN7dXJsfVwiPiN7bmFtZX08L2E+XCJcIlwiXG4gICAgICAgICQoQCkuaHRtbCBodG1sLmpvaW4oJywgJylcblxuXG4gIGhpZGU6ICgpIC0+XG4gICAgQCRlbC5oaWRlKClcbiAgICBAdmlzaWJsZSA9IGZhbHNlXG5cbiAgcmVtb3ZlOiAoKSA9PlxuICAgIHdpbmRvdy5jbGVhckludGVydmFsIEBldGFJbnRlcnZhbFxuICAgIEBzdG9wTGlzdGVuaW5nKClcbiAgICBzdXBlcigpXG5cbiAgcmVwb3J0UmVxdWVzdGVkOiAoKSA9PlxuICAgIEAkZWwuaHRtbCB0ZW1wbGF0ZXMucmVwb3J0TG9hZGluZy5yZW5kZXIoe30pXG5cbiAgcmVwb3J0RXJyb3I6IChtc2csIGNhbmNlbGxlZFJlcXVlc3QpID0+XG4gICAgdW5sZXNzIGNhbmNlbGxlZFJlcXVlc3RcbiAgICAgIGlmIG1zZyBpcyAnSk9CX0VSUk9SJ1xuICAgICAgICBAc2hvd0Vycm9yICdFcnJvciB3aXRoIHNwZWNpZmljIGpvYidcbiAgICAgIGVsc2VcbiAgICAgICAgQHNob3dFcnJvciBtc2dcblxuICBzaG93RXJyb3I6IChtc2cpID0+XG4gICAgQCQoJy5wcm9ncmVzcycpLnJlbW92ZSgpXG4gICAgQCQoJ3AuZXJyb3InKS5yZW1vdmUoKVxuICAgIEAkKCdoNCcpLnRleHQoXCJBbiBFcnJvciBPY2N1cnJlZFwiKS5hZnRlciBcIlwiXCJcbiAgICAgIDxwIGNsYXNzPVwiZXJyb3JcIiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPiN7bXNnfTwvcD5cbiAgICBcIlwiXCJcblxuICByZXBvcnRKb2JzOiAoKSA9PlxuICAgIHVubGVzcyBAbWF4RXRhXG4gICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS53aWR0aCgnMTAwJScpXG4gICAgQCQoJ2g0JykudGV4dCBcIkFuYWx5emluZyBEZXNpZ25zXCJcblxuICBzdGFydEV0YUNvdW50ZG93bjogKCkgPT5cbiAgICBpZiBAbWF4RXRhXG4gICAgICBfLmRlbGF5ICgpID0+XG4gICAgICAgIEByZXBvcnRSZXN1bHRzLnBvbGwoKVxuICAgICAgLCAoQG1heEV0YSArIDEpICogMTAwMFxuICAgICAgXy5kZWxheSAoKSA9PlxuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS5jc3MgJ3RyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uJywgJ2xpbmVhcidcbiAgICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykuY3NzICd0cmFuc2l0aW9uLWR1cmF0aW9uJywgXCIje0BtYXhFdGEgKyAxfXNcIlxuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS53aWR0aCgnMTAwJScpXG4gICAgICAsIDUwMFxuXG4gIHJlbmRlckpvYkRldGFpbHM6ICgpID0+XG4gICAgbWF4RXRhID0gbnVsbFxuICAgIGZvciBqb2IgaW4gQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICBpZiBqb2IuZ2V0KCdldGFTZWNvbmRzJylcbiAgICAgICAgaWYgIW1heEV0YSBvciBqb2IuZ2V0KCdldGFTZWNvbmRzJykgPiBtYXhFdGFcbiAgICAgICAgICBtYXhFdGEgPSBqb2IuZ2V0KCdldGFTZWNvbmRzJylcbiAgICBpZiBtYXhFdGFcbiAgICAgIEBtYXhFdGEgPSBtYXhFdGFcbiAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCc1JScpXG4gICAgICBAc3RhcnRFdGFDb3VudGRvd24oKVxuXG4gICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKVxuICAgIEAkKCdbcmVsPWRldGFpbHNdJykuY2xpY2sgKGUpID0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIEAkKCdbcmVsPWRldGFpbHNdJykuaGlkZSgpXG4gICAgICBAJCgnLmRldGFpbHMnKS5zaG93KClcbiAgICBmb3Igam9iIGluIEByZXBvcnRSZXN1bHRzLm1vZGVsc1xuICAgICAgaXRlbSA9IG5ldyBKb2JJdGVtKGpvYilcbiAgICAgIGl0ZW0ucmVuZGVyKClcbiAgICAgIEAkKCcuZGV0YWlscycpLmFwcGVuZCBpdGVtLmVsXG5cbiAgZ2V0UmVzdWx0OiAoaWQpIC0+XG4gICAgcmVzdWx0cyA9IEBnZXRSZXN1bHRzKClcbiAgICByZXN1bHQgPSBfLmZpbmQgcmVzdWx0cywgKHIpIC0+IHIucGFyYW1OYW1lIGlzIGlkXG4gICAgdW5sZXNzIHJlc3VsdD9cbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gcmVzdWx0IHdpdGggaWQgJyArIGlkKVxuICAgIHJlc3VsdC52YWx1ZVxuXG4gIGdldEZpcnN0UmVzdWx0OiAocGFyYW0sIGlkKSAtPlxuICAgIHJlc3VsdCA9IEBnZXRSZXN1bHQocGFyYW0pXG4gICAgdHJ5XG4gICAgICByZXR1cm4gcmVzdWx0WzBdLmZlYXR1cmVzWzBdLmF0dHJpYnV0ZXNbaWRdXG4gICAgY2F0Y2ggZVxuICAgICAgdGhyb3cgXCJFcnJvciBmaW5kaW5nICN7cGFyYW19OiN7aWR9IGluIGdwIHJlc3VsdHNcIlxuXG4gIGdldFJlc3VsdHM6ICgpIC0+XG4gICAgcmVzdWx0cyA9IEByZXBvcnRSZXN1bHRzLm1hcCgocmVzdWx0KSAtPiByZXN1bHQuZ2V0KCdyZXN1bHQnKS5yZXN1bHRzKVxuICAgIHVubGVzcyByZXN1bHRzPy5sZW5ndGhcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZ3AgcmVzdWx0cycpXG4gICAgXy5maWx0ZXIgcmVzdWx0cywgKHJlc3VsdCkgLT5cbiAgICAgIHJlc3VsdC5wYXJhbU5hbWUgbm90IGluIFsnUmVzdWx0Q29kZScsICdSZXN1bHRNc2cnXVxuXG4gIHJlY29yZFNldDogKGRlcGVuZGVuY3ksIHBhcmFtTmFtZSwgc2tldGNoQ2xhc3NJZD1mYWxzZSkgLT5cbiAgICB1bmxlc3MgZGVwZW5kZW5jeSBpbiBAZGVwZW5kZW5jaWVzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJVbmtub3duIGRlcGVuZGVuY3kgI3tkZXBlbmRlbmN5fVwiXG4gICAgZGVwID0gQHJlcG9ydFJlc3VsdHMuZmluZCAocikgLT4gci5nZXQoJ3NlcnZpY2VOYW1lJykgaXMgZGVwZW5kZW5jeVxuICAgIHVubGVzcyBkZXBcbiAgICAgIGNvbnNvbGUubG9nIEByZXBvcnRSZXN1bHRzLm1vZGVsc1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ291bGQgbm90IGZpbmQgcmVzdWx0cyBmb3IgI3tkZXBlbmRlbmN5fS5cIlxuICAgIHBhcmFtID0gXy5maW5kIGRlcC5nZXQoJ3Jlc3VsdCcpLnJlc3VsdHMsIChwYXJhbSkgLT5cbiAgICAgIHBhcmFtLnBhcmFtTmFtZSBpcyBwYXJhbU5hbWVcbiAgICB1bmxlc3MgcGFyYW1cbiAgICAgIGNvbnNvbGUubG9nIGRlcC5nZXQoJ2RhdGEnKS5yZXN1bHRzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDb3VsZCBub3QgZmluZCBwYXJhbSAje3BhcmFtTmFtZX0gaW4gI3tkZXBlbmRlbmN5fVwiXG4gICAgbmV3IFJlY29yZFNldChwYXJhbSwgQCwgc2tldGNoQ2xhc3NJZClcblxuICBlbmFibGVUYWJsZVBhZ2luZzogKCkgLT5cbiAgICBAJCgnW2RhdGEtcGFnaW5nXScpLmVhY2ggKCkgLT5cbiAgICAgICR0YWJsZSA9ICQoQClcbiAgICAgIHBhZ2VTaXplID0gJHRhYmxlLmRhdGEoJ3BhZ2luZycpXG4gICAgICByb3dzID0gJHRhYmxlLmZpbmQoJ3Rib2R5IHRyJykubGVuZ3RoXG4gICAgICBwYWdlcyA9IE1hdGguY2VpbChyb3dzIC8gcGFnZVNpemUpXG4gICAgICBpZiBwYWdlcyA+IDFcbiAgICAgICAgJHRhYmxlLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICA8dGZvb3Q+XG4gICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgIDx0ZCBjb2xzcGFuPVwiI3skdGFibGUuZmluZCgndGhlYWQgdGgnKS5sZW5ndGh9XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhZ2luYXRpb25cIj5cbiAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCI+UHJldjwvYT48L2xpPlxuICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPC90Zm9vdD5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIHVsID0gJHRhYmxlLmZpbmQoJ3Rmb290IHVsJylcbiAgICAgICAgZm9yIGkgaW4gXy5yYW5nZSgxLCBwYWdlcyArIDEpXG4gICAgICAgICAgdWwuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCI+I3tpfTwvYT48L2xpPlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICB1bC5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCI+TmV4dDwvYT48L2xpPlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgJHRhYmxlLmZpbmQoJ2xpIGEnKS5jbGljayAoZSkgLT5cbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAkYSA9ICQodGhpcylcbiAgICAgICAgICB0ZXh0ID0gJGEudGV4dCgpXG4gICAgICAgICAgaWYgdGV4dCBpcyAnTmV4dCdcbiAgICAgICAgICAgIGEgPSAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykubmV4dCgpLmZpbmQoJ2EnKVxuICAgICAgICAgICAgdW5sZXNzIGEudGV4dCgpIGlzICdOZXh0J1xuICAgICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICBlbHNlIGlmIHRleHQgaXMgJ1ByZXYnXG4gICAgICAgICAgICBhID0gJGEucGFyZW50KCkucGFyZW50KCkuZmluZCgnLmFjdGl2ZScpLnByZXYoKS5maW5kKCdhJylcbiAgICAgICAgICAgIHVubGVzcyBhLnRleHQoKSBpcyAnUHJldidcbiAgICAgICAgICAgICAgYS5jbGljaygpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgJGEucGFyZW50KCkucGFyZW50KCkuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkYS5wYXJlbnQoKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgbiA9IHBhcnNlSW50KHRleHQpXG4gICAgICAgICAgICAkdGFibGUuZmluZCgndGJvZHkgdHInKS5oaWRlKClcbiAgICAgICAgICAgIG9mZnNldCA9IHBhZ2VTaXplICogKG4gLSAxKVxuICAgICAgICAgICAgJHRhYmxlLmZpbmQoXCJ0Ym9keSB0clwiKS5zbGljZShvZmZzZXQsIG4qcGFnZVNpemUpLnNob3coKVxuICAgICAgICAkKCR0YWJsZS5maW5kKCdsaSBhJylbMV0pLmNsaWNrKClcblxuICAgICAgaWYgbm9Sb3dzTWVzc2FnZSA9ICR0YWJsZS5kYXRhKCduby1yb3dzJylcbiAgICAgICAgaWYgcm93cyBpcyAwXG4gICAgICAgICAgcGFyZW50ID0gJHRhYmxlLnBhcmVudCgpXG4gICAgICAgICAgJHRhYmxlLnJlbW92ZSgpXG4gICAgICAgICAgcGFyZW50LnJlbW92ZUNsYXNzICd0YWJsZUNvbnRhaW5lcidcbiAgICAgICAgICBwYXJlbnQuYXBwZW5kIFwiPHA+I3tub1Jvd3NNZXNzYWdlfTwvcD5cIlxuXG4gIGVuYWJsZUxheWVyVG9nZ2xlcnM6ICgpIC0+XG4gICAgZW5hYmxlTGF5ZXJUb2dnbGVycyhAJGVsKVxuXG4gIGdldENoaWxkcmVuOiAoc2tldGNoQ2xhc3NJZCkgLT5cbiAgICBfLmZpbHRlciBAY2hpbGRyZW4sIChjaGlsZCkgLT4gY2hpbGQuZ2V0U2tldGNoQ2xhc3MoKS5pZCBpcyBza2V0Y2hDbGFzc0lkXG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRUYWJcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgXG4gIHJvdW5kOiAobnVtYmVyLCBkZWNpbWFsUGxhY2VzKSAtPlxuICAgIHVubGVzcyBfLmlzTnVtYmVyIG51bWJlclxuICAgICAgbnVtYmVyID0gcGFyc2VGbG9hdChudW1iZXIpXG4gICAgbXVsdGlwbGllciA9IE1hdGgucG93IDEwLCBkZWNpbWFsUGxhY2VzXG4gICAgTWF0aC5yb3VuZChudW1iZXIgKiBtdWx0aXBsaWVyKSAvIG11bHRpcGxpZXIiLCJ0aGlzW1wiVGVtcGxhdGVzXCJdID0gdGhpc1tcIlRlbXBsYXRlc1wiXSB8fCB7fTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvYXR0cmlidXRlcy9hdHRyaWJ1dGVJdGVtXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjx0ciBkYXRhLWF0dHJpYnV0ZS1pZD1cXFwiXCIpO18uYihfLnYoXy5mKFwiaWRcIixjLHAsMCkpKTtfLmIoXCJcXFwiIGRhdGEtYXR0cmlidXRlLWV4cG9ydGlkPVxcXCJcIik7Xy5iKF8udihfLmYoXCJleHBvcnRpZFwiLGMscCwwKSkpO18uYihcIlxcXCIgZGF0YS1hdHRyaWJ1dGUtdHlwZT1cXFwiXCIpO18uYihfLnYoXy5mKFwidHlwZVwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGQgY2xhc3M9XFxcIm5hbWVcXFwiPlwiKTtfLmIoXy52KF8uZihcIm5hbWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRkIGNsYXNzPVxcXCJ2YWx1ZVxcXCI+XCIpO18uYihfLnYoXy5mKFwiZm9ybWF0dGVkVmFsdWVcIixjLHAsMCkpKTtfLmIoXCI8L3RkPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvdHI+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHRhYmxlIGNsYXNzPVxcXCJhdHRyaWJ1dGVzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwiYXR0cmlidXRlc1wiLGMscCwxKSxjLHAsMCw0NCw4MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKF8ucnAoXCJhdHRyaWJ1dGVzL2F0dHJpYnV0ZUl0ZW1cIixjLHAsXCIgICAgXCIpKTt9KTtjLnBvcCgpO31fLmIoXCI8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL2dlbmVyaWNBdHRyaWJ1dGVzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO2lmKF8ucyhfLmQoXCJza2V0Y2hDbGFzcy5kZWxldGVkXCIsYyxwLDEpLGMscCwwLDI0LDI3MCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtd2FyblxcXCIgc3R5bGU9XFxcIm1hcmdpbi1ib3R0b206MTBweDtcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgVGhpcyBza2V0Y2ggd2FzIGNyZWF0ZWQgdXNpbmcgdGhlIFxcXCJcIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiB0ZW1wbGF0ZSwgd2hpY2ggaXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIG5vIGxvbmdlciBhdmFpbGFibGUuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvcHkgdGhpcyBza2V0Y2ggb3IgbWFrZSBuZXdcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIHNrZXRjaGVzIG9mIHRoaXMgdHlwZS5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb25cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCIgQXR0cmlidXRlczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKF8ucnAoXCJhdHRyaWJ1dGVzL2F0dHJpYnV0ZXNUYWJsZVwiLGMscCxcIiAgICBcIikpO18uYihcIiAgPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9yZXBvcnRMb2FkaW5nXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydExvYWRpbmdcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPCEtLSA8ZGl2IGNsYXNzPVxcXCJzcGlubmVyXFxcIj4zPC9kaXY+IC0tPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlJlcXVlc3RpbmcgUmVwb3J0IGZyb20gU2VydmVyPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInByb2dyZXNzIHByb2dyZXNzLXN0cmlwZWQgYWN0aXZlXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiYmFyXFxcIiBzdHlsZT1cXFwid2lkdGg6IDEwMCU7XFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGEgaHJlZj1cXFwiI1xcXCIgcmVsPVxcXCJkZXRhaWxzXFxcIj5kZXRhaWxzPC9hPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJkZXRhaWxzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcblxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHRoaXNbXCJUZW1wbGF0ZXNcIl07XG59IiwiUmVwb3J0R3JhcGhUYWIgPSByZXF1aXJlICdyZXBvcnRHcmFwaFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuY2xhc3MgRW5lcmd5Q29uc3VtcHRpb25UYWIgZXh0ZW5kcyBSZXBvcnRHcmFwaFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdFbmVyZ3kgQ29uc3VtcHRpb24nXG4gIGNsYXNzTmFtZTogJ0VuZXJneUNvbnN1bXB0aW9uJ1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5lbmVyZ3lDb25zdW1wdGlvblxuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnRW5lcmd5UGxhbidcbiAgXVxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGQzSXNQcmVzZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGQzSXNQcmVzZW50ID0gZmFsc2VcblxuICAgIHRyeVxuICAgICAgXG4gICAgICBtc2cgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc3VsdE1zZ1wiKVxuICAgICAgY29uc29sZS5sb2coXCJtc2cgaXMgXCIsIG1zZylcblxuICAgICAgY29tRUMgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUVVXCIpLnRvQXJyYXkoKVxuICAgICAgcmVzRUMgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0VVXCIpLnRvQXJyYXkoKVxuXG5cbiAgICAgIGNvbV9wYSA9IEBnZXRNYXAoY29tRUMsIFwiUEFcIilcbiAgICAgIGNvbV9kYmxwYSA9IEBnZXRNYXAoY29tRUMsIFwiRGJsUEFcIilcbiAgICAgIGNvbV9ub3BhID0gQGdldE1hcChjb21FQywgXCJOb1BBXCIpXG4gICAgICBcbiAgICAgIGNvbV91c2VyID0gQGdldFVzZXJNYXAoY29tRUMsIFwiVVNFUlwiLCBjb21fbm9wYSlcblxuICAgICAgY29tX3VzZXJfc2F2aW5ncyA9IEBnZXRVc2VyU2F2aW5ncyhjb21FQywgY29tX3VzZXIsIGNvbV9ub3BhLCAxKVxuXG4gICAgICBzb3J0ZWRfY29tbV9yZXN1bHRzID0gW2NvbV9ub3BhLCBjb21fcGEsIGNvbV9kYmxwYSwgY29tX3VzZXJdXG5cbiAgICAgIHJlc19wYSA9IEBnZXRNYXAocmVzRUMsIFwiUEFcIilcbiAgICAgIHJlc19kYmxwYSA9IEBnZXRNYXAocmVzRUMsIFwiRGJsUEFcIilcbiAgICAgIHJlc19ub3BhID0gQGdldE1hcChyZXNFQywgXCJOb1BBXCIpXG4gICAgICBcbiAgICAgIHJlc191c2VyID0gQGdldFVzZXJNYXAocmVzRUMsIFwiVVNFUlwiLCByZXNfbm9wYSlcbiAgICAgIHJlc191c2VyX3NhdmluZ3MgPSBAZ2V0VXNlclNhdmluZ3MocmVzRUMsIHJlc191c2VyLCByZXNfbm9wYSwgMSlcbiAgICAgIHNvcnRlZF9yZXNfcmVzdWx0cyA9IFtyZXNfbm9wYSwgcmVzX3BhLCByZXNfZGJscGEsIHJlc191c2VyXVxuXG5cbiAgICAgIHNjZW5hcmlvcyA9IFsnJywnUEEgMjk1JywgJ05vIFBBIDI5NScsICdEb3VibGUgUEEgMjk1J11cblxuICAgICAgcmVzX3N1bSA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzRVVTdW1cIikuZmxvYXQoJ1VTRVJfU1VNJywgMSlcbiAgICAgIHJlc19wYTI5NV90b3RhbF9lYyA9ICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0VVU3VtXCIpLmZsb2F0KCdQQV9TVU0nLCAxKVxuICAgICAgcmVzX25vX3BhMjk1X3RvdGFsX2VjID0gIEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzRVVTdW1cIikuZmxvYXQoJ05PUEFfU1VNJywgMSlcbiAgICAgIHJlc19kYmxfcGEyOTVfdG90YWxfZWMgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0VVU3VtXCIpLmZsb2F0KCdEQkxQQV9TVU0nLCAxKVxuXG4gICAgICByZXNfcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKHJlc19wYTI5NV90b3RhbF9lYyAtIHJlc19zdW0pLDApXG4gICAgICByZXNfcGEyOTVfcGVyY19kaWZmID0gTWF0aC5yb3VuZCgoKE1hdGguYWJzKHJlc19wYTI5NV9kaWZmKS9yZXNfc3VtKSoxMDApLDApXG4gICAgICByZXNfaGFzX3NhdmluZ3NfcGEyOTUgPSByZXNfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCByZXNfaGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgICAgcmVzX3BhMjk1X2RpZmYgPSBNYXRoLmFicyhyZXNfcGEyOTVfZGlmZilcbiAgICAgIHJlc19wYTI5NV9kaWZmID0gQGFkZENvbW1hcyByZXNfcGEyOTVfZGlmZlxuICBcbiAgICAgIHJlc19ub19wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgocmVzX25vX3BhMjk1X3RvdGFsX2VjIC0gcmVzX3N1bSksMClcbiAgICAgIHJlc19ub19wYTI5NV9wZXJjX2RpZmYgPSBNYXRoLnJvdW5kKCgoTWF0aC5hYnMocmVzX25vX3BhMjk1X2RpZmYpL3Jlc19zdW0pKjEwMCksMClcbiAgICAgIHJlc19oYXNfc2F2aW5nc19ub19wYTI5NSA9IHJlc19ub19wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IHJlc19oYXNfc2F2aW5nc19ub19wYTI5NVxuICAgICAgICByZXNfbm9fcGEyOTVfZGlmZiA9IE1hdGguYWJzKHJlc19ub19wYTI5NV9kaWZmKVxuICAgICAgcmVzX25vX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIHJlc19ub19wYTI5NV9kaWZmXG5cbiAgICAgIHJlc19kYmxfcGEyOTVfZGlmZiA9ICBNYXRoLnJvdW5kKChyZXNfZGJsX3BhMjk1X3RvdGFsX2VjIC0gcmVzX3N1bSksMClcbiAgICAgIHJlc19kYmxfcGEyOTVfcGVyY19kaWZmID0gTWF0aC5yb3VuZCgoKE1hdGguYWJzKHJlc19kYmxfcGEyOTVfZGlmZikvcmVzX3N1bSkqMTAwKSwwKVxuICAgICAgcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NSA9IHJlc19kYmxfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgICAgcmVzX2RibF9wYTI5NV9kaWZmID0gTWF0aC5hYnMocmVzX2RibF9wYTI5NV9kaWZmKVxuICAgICAgcmVzX2RibF9wYTI5NV9kaWZmID0gQGFkZENvbW1hcyByZXNfZGJsX3BhMjk1X2RpZmZcblxuICAgICAgY29tbV9zdW0gPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUVVU3VtXCIpLmZsb2F0KCdVU0VSX1NVTScsIDEpXG4gICAgICBjb21tX3BhMjk1X3RvdGFsX2VjID0gICAgIEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tRVVTdW1cIikuZmxvYXQoJ1BBX1NVTScsIDEpXG4gICAgICBjb21tX25vX3BhMjk1X3RvdGFsX2VjID0gIEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tRVVTdW1cIikuZmxvYXQoJ05PUEFfU1VNJywgMSlcbiAgICAgIGNvbW1fZGJsX3BhMjk1X3RvdGFsX2VjID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21FVVN1bVwiKS5mbG9hdCgnREJMUEFfU1VNJywgMSlcblxuICAgICAgY29tbV9wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgoY29tbV9wYTI5NV90b3RhbF9lYyAtIGNvbW1fc3VtKSwwKVxuICAgICAgY29tbV9wYTI5NV9wZXJjX2RpZmYgPSBNYXRoLnJvdW5kKCgoTWF0aC5hYnMoY29tbV9wYTI5NV9kaWZmKS9jb21tX3N1bSkqMTAwKSwwKVxuICAgICAgY29tbV9oYXNfc2F2aW5nc19wYTI5NSA9IGNvbW1fcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCBjb21tX2hhc19zYXZpbmdzX3BhMjk1XG4gICAgICAgIGNvbW1fcGEyOTVfZGlmZj1NYXRoLmFicyhjb21tX3BhMjk1X2RpZmYpXG4gICAgICBjb21tX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIGNvbW1fcGEyOTVfZGlmZlxuXG4gICAgICBjb21tX25vX3BhMjk1X2RpZmYgPSAgTWF0aC5yb3VuZCgoY29tbV9ub19wYTI5NV90b3RhbF9lYyAtIGNvbW1fc3VtKSwwKVxuICAgICAgY29tbV9ub19wYTI5NV9wZXJjX2RpZmYgPSBNYXRoLnJvdW5kKCgoTWF0aC5hYnMoY29tbV9ub19wYTI5NV9kaWZmKS9jb21tX3N1bSkqMTAwKSwwKVxuICAgICAgY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NSA9IGNvbW1fbm9fcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCBjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICAgIGNvbW1fbm9fcGEyOTVfZGlmZiA9IE1hdGguYWJzKGNvbW1fbm9fcGEyOTVfZGlmZilcbiAgICAgIGNvbW1fbm9fcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgY29tbV9ub19wYTI5NV9kaWZmXG5cbiAgICAgIGNvbW1fZGJsX3BhMjk1X2RpZmYgPSBNYXRoLnJvdW5kKChjb21tX2RibF9wYTI5NV90b3RhbF9lYyAtIGNvbW1fc3VtKSwwKVxuICAgICAgY29tbV9kYmxfcGEyOTVfcGVyY19kaWZmID0gTWF0aC5yb3VuZCgoKE1hdGguYWJzKGNvbW1fZGJsX3BhMjk1X2RpZmYpL2NvbW1fc3VtKSoxMDApLDApXG4gICAgICBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NSA9IGNvbW1fZGJsX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZiA9IE1hdGguYWJzKGNvbW1fZGJsX3BhMjk1X2RpZmYpXG4gICAgICBjb21tX2RibF9wYTI5NV9kaWZmID0gQGFkZENvbW1hcyBjb21tX2RibF9wYTI5NV9kaWZmXG5cbiAgICBjYXRjaCBlXG4gICAgICBjb25zb2xlLmxvZyhcImVycm9yOiBcIiwgZSlcblxuICAgIGF0dHJpYnV0ZXMgPSBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgY29udGV4dCA9XG4gICAgICBza2V0Y2g6IEBtb2RlbC5mb3JUZW1wbGF0ZSgpXG4gICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgIGFueUF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKCkubGVuZ3RoID4gMFxuICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgIGNvbV91c2VyX3NhdmluZ3M6IGNvbV91c2VyX3NhdmluZ3NcbiAgICAgIHJlc191c2VyX3NhdmluZ3M6IHJlc191c2VyX3NhdmluZ3NcbiAgICAgIHNjZW5hcmlvczogc2NlbmFyaW9zXG5cbiAgICAgIHJlc19wYTI5NV9kaWZmOiByZXNfcGEyOTVfZGlmZlxuICAgICAgcmVzX2hhc19zYXZpbmdzX3BhMjk1OiByZXNfaGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgIHJlc19wYTI5NV9kaXI6IEBnZXREaXJDbGFzcyByZXNfaGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgIHJlc19wYTI5NV9wZXJjX2RpZmY6IHJlc19wYTI5NV9wZXJjX2RpZmZcblxuICAgICAgcmVzX25vX3BhMjk1X2RpZmY6IHJlc19ub19wYTI5NV9kaWZmXG4gICAgICByZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTU6IHJlc19oYXNfc2F2aW5nc19ub19wYTI5NVxuICAgICAgcmVzX25vX3BhMjk1X2RpcjogQGdldERpckNsYXNzIHJlc19oYXNfc2F2aW5nc19ub19wYTI5NVxuICAgICAgcmVzX25vX3BhMjk1X3BlcmNfZGlmZjogcmVzX25vX3BhMjk1X3BlcmNfZGlmZlxuXG4gICAgICByZXNfZGJsX3BhMjk1X2RpZmY6IHJlc19kYmxfcGEyOTVfZGlmZlxuICAgICAgcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NTogcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuICAgICAgcmVzX2RibF9wYTI5NV9kaXI6IEBnZXREaXJDbGFzcyByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1XG4gICAgICByZXNfZGJsX3BhMjk1X3BlcmNfZGlmZjogcmVzX2RibF9wYTI5NV9wZXJjX2RpZmZcblxuICAgICAgY29tbV9wYTI5NV9kaWZmOiBjb21tX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfcGEyOTU6IGNvbW1faGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgIGNvbW1fcGEyOTVfZGlyOiBAZ2V0RGlyQ2xhc3MgY29tbV9oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgY29tbV9wYTI5NV9wZXJjX2RpZmY6IGNvbW1fcGEyOTVfcGVyY19kaWZmXG5cbiAgICAgIGNvbW1fbm9fcGEyOTVfZGlmZjogY29tbV9ub19wYTI5NV9kaWZmXG4gICAgICBjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1OiBjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICBjb21tX25vX3BhMjk1X2RpcjogQGdldERpckNsYXNzIGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcbiAgICAgIGNvbW1fbm9fcGEyOTVfcGVyY19kaWZmOiBjb21tX25vX3BhMjk1X3BlcmNfZGlmZlxuXG4gICAgICBjb21tX2RibF9wYTI5NV9kaWZmOiBjb21tX2RibF9wYTI5NV9kaWZmXG4gICAgICBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NTogY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgIGNvbW1fZGJsX3BhMjk1X2RpcjogQGdldERpckNsYXNzIGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XG4gICAgICBjb21tX2RibF9wYTI5NV9wZXJjX2RpZmY6IGNvbW1fZGJsX3BhMjk1X3BlcmNfZGlmZlxuXG4gICAgICByZXNfc3VtOiByZXNfc3VtXG4gICAgICBjb21tX3N1bTogY29tbV9zdW1cbiAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuICAgIEAkKCcuY29tbS1jaG9zZW4tZWMnKS5jaG9zZW4oe2Rpc2FibGVfc2VhcmNoX3RocmVzaG9sZDogMTAsIHdpZHRoOicyMDBweCd9KVxuICAgIEAkKCcuY29tbS1jaG9zZW4tZWMnKS5jaGFuZ2UgKCkgPT5cbiAgICAgIEByZW5kZXJEaWZmcygnLmNvbW0tY2hvc2VuLWVjJywgJ2NvbW0nLCAnZWMnKVxuXG4gICAgQCQoJy5yZXMtY2hvc2VuLWVjJykuY2hvc2VuKHtkaXNhYmxlX3NlYXJjaF90aHJlc2hvbGQ6IDEwLCB3aWR0aDonMjAwcHgnfSlcbiAgICBAJCgnLnJlcy1jaG9zZW4tZWMnKS5jaGFuZ2UgKCkgPT5cbiAgICAgIEByZW5kZXJEaWZmcygnLnJlcy1jaG9zZW4tZWMnLCAncmVzJywgJ2VjJylcblxuXG4gICAgaWYgd2luZG93LmQzXG5cbiAgICAgIGggPSAzMjBcbiAgICAgIHcgPSAzODBcbiAgICAgIG1hcmdpbiA9IHtsZWZ0OjQwLCB0b3A6NSwgcmlnaHQ6NDAsIGJvdHRvbTogNDAsIGlubmVyOjV9XG4gICAgICBoYWxmaCA9IChoK21hcmdpbi50b3ArbWFyZ2luLmJvdHRvbSlcbiAgICAgIHRvdGFsaCA9IGhhbGZoKjJcbiAgICAgIGhhbGZ3ID0gKHcrbWFyZ2luLmxlZnQrbWFyZ2luLnJpZ2h0KVxuICAgICAgdG90YWx3ID0gaGFsZncqMlxuICAgICAgXG4gICAgICBjb21fY2hhcnQgPSBAZHJhd0NoYXJ0KCcuY29tbWVyY2lhbEVuZXJneUNvbnN1bXB0aW9uJykueHZhcigwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueXZhcigxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueGxhYihcIlllYXJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnlsYWIoXCJWYWx1ZSAoaW4gbWlsbGlvbnMpXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLndpZHRoKHcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4obWFyZ2luKVxuXG4gICAgICBjaCA9IGQzLnNlbGVjdChAJCgnLmNvbW1lcmNpYWxFbmVyZ3lDb25zdW1wdGlvbicpKVxuICAgICAgY2guZGF0dW0oc29ydGVkX2NvbW1fcmVzdWx0cylcbiAgICAgICAgLmNhbGwoY29tX2NoYXJ0KVxuXG4gICAgICByZXNfY2hhcnQgPSBAZHJhd0NoYXJ0KCcucmVzaWRlbnRpYWxFbmVyZ3lDb25zdW1wdGlvbicpLnh2YXIoMClcbiAgICAgICAgICAgICAgICAgICAgIC55dmFyKDEpXG4gICAgICAgICAgICAgICAgICAgICAueGxhYihcIlllYXJcIilcbiAgICAgICAgICAgICAgICAgICAgIC55bGFiKFwiVmFsdWUgKGluIG1pbGxpb25zKVwiKVxuICAgICAgICAgICAgICAgICAgICAgLmhlaWdodChoKVxuICAgICAgICAgICAgICAgICAgICAgLndpZHRoKHcpXG4gICAgICAgICAgICAgICAgICAgICAubWFyZ2luKG1hcmdpbilcblxuICAgICAgY2ggPSBkMy5zZWxlY3QoQCQoJy5yZXNpZGVudGlhbEVuZXJneUNvbnN1bXB0aW9uJykpXG4gICAgICBjaC5kYXR1bShzb3J0ZWRfcmVzX3Jlc3VsdHMpXG4gICAgICAgIC5jYWxsKHJlc19jaGFydClcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmxvZyhcIk5PIEQzISEhISEhIVwiKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBFbmVyZ3lDb25zdW1wdGlvblRhYiIsIlJlcG9ydEdyYXBoVGFiID0gcmVxdWlyZSAncmVwb3J0R3JhcGhUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmNsYXNzIEZ1ZWxDb3N0c1RhYiBleHRlbmRzIFJlcG9ydEdyYXBoVGFiXG4gICMgdGhpcyBpcyB0aGUgbmFtZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBUYWJcbiAgbmFtZTogJ0Z1ZWwgQ29zdHMnXG4gIGNsYXNzTmFtZTogJ2Z1ZWxDb3N0cydcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMuZnVlbENvc3RzXG4gIGRlcGVuZGVuY2llczogW1xuICAgICdFbmVyZ3lQbGFuJ1xuICBdXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcblxuICAgIHRyeVxuICAgICAgbXNnID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXN1bHRNc2dcIilcbiAgICAgIGNvbnNvbGUubG9nKFwiLi4uLi4ubXNnIGlzIFwiLCBtc2cpXG5cbiAgICAgIHNjZW5hcmlvcyA9IFsnUEEgMjk1JywgJ05vIFBBIDI5NScsICdEb3VibGUgUEEgMjk1J11cbiAgICAgIGNvbUZDID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21FQ1wiKS50b0FycmF5KClcbiAgICAgIHJlc0ZDID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFQ1wiKS50b0FycmF5KClcblxuICAgICAgY29tX3BhID0gQGdldE1hcChjb21GQywgXCJQQVwiKVxuICAgICAgY29tX2RibHBhID0gQGdldE1hcChjb21GQywgXCJEYmxQQVwiKVxuICAgICAgY29tX25vcGEgPSBAZ2V0TWFwKGNvbUZDLCBcIk5vUEFcIilcbiAgICAgIFxuICAgICAgY29tX3VzZXIgPSBAZ2V0VXNlck1hcChjb21GQywgXCJVU0VSXCIsIGNvbV9ub3BhKVxuICAgICAgY29tX3VzZXJfc2F2aW5ncyA9IEBnZXRVc2VyU2F2aW5ncyhjb21GQywgY29tX3VzZXIsIGNvbV9ub3BhLCAyKVxuICAgICAgc29ydGVkX2NvbW1fcmVzdWx0cyA9IFtjb21fbm9wYSwgY29tX3BhLCBjb21fZGJscGEsIGNvbV91c2VyXVxuXG4gICAgICByZXNfcGEgPSBAZ2V0TWFwKHJlc0ZDLCBcIlBBXCIpXG4gICAgICByZXNfZGJscGEgPSBAZ2V0TWFwKHJlc0ZDLCBcIkRibFBBXCIpXG4gICAgICByZXNfbm9wYSA9IEBnZXRNYXAocmVzRkMsIFwiTm9QQVwiKVxuICAgICAgXG4gICAgICByZXNfdXNlciA9IEBnZXRVc2VyTWFwKHJlc0ZDLCBcIlVTRVJcIiwgcmVzX25vcGEpXG4gICAgICByZXNfdXNlcl9zYXZpbmdzID0gQGdldFVzZXJTYXZpbmdzKHJlc0ZDLCByZXNfdXNlciwgcmVzX25vcGEsIDIpXG4gICAgICBzb3J0ZWRfcmVzX3Jlc3VsdHMgPSBbcmVzX25vcGEsIHJlc19wYSwgcmVzX2RibHBhLCByZXNfdXNlcl1cblxuXG4gICAgICByZXNfc3VtID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFQ1N1bVwiKS5mbG9hdCgnVVNFUl9TVU0nLCAxKVxuICAgICAgcmVzX3BhMjk1X3RvdGFsX2ZjID0gICAgIEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzRUNTdW1cIikuZmxvYXQoJ1BBX1NVTScsIDEpXG4gICAgICByZXNfbm9fcGEyOTVfdG90YWxfZmMgPSAgQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFQ1N1bVwiKS5mbG9hdCgnTk9QQV9TVU0nLCAxKVxuICAgICAgcmVzX2RibF9wYTI5NV90b3RhbF9mYyA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzRUNTdW1cIikuZmxvYXQoJ0RCTFBBX1NVTScsIDEpXG5cblxuXG4gICAgICByZXNfcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKHJlc19wYTI5NV90b3RhbF9mYyAtIHJlc19zdW0pLDApXG4gICAgICByZXNfaGFzX3NhdmluZ3NfcGEyOTUgPSByZXNfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCByZXNfaGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgICAgcmVzX3BhMjk1X2RpZmYgPSBNYXRoLmFicyhyZXNfcGEyOTVfZGlmZilcbiAgICAgIHJlc19wYTI5NV9kaWZmID0gQGFkZENvbW1hcyByZXNfcGEyOTVfZGlmZlxuXG4gICAgICByZXNfbm9fcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKHJlc19ub19wYTI5NV90b3RhbF9mYyAtIHJlc19zdW0pLDApXG4gICAgICByZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTUgPSByZXNfbm9fcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCByZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcbiAgICAgICAgcmVzX25vX3BhMjk1X2RpZmYgPSBNYXRoLmFicyhyZXNfbm9fcGEyOTVfZGlmZilcbiAgICAgIHJlc19ub19wYTI5NV9kaWZmID0gQGFkZENvbW1hcyByZXNfbm9fcGEyOTVfZGlmZlxuICAgICAgXG4gICAgICByZXNfZGJsX3BhMjk1X2RpZmYgPSBNYXRoLnJvdW5kKChyZXNfZGJsX3BhMjk1X3RvdGFsX2ZjIC0gcmVzX3N1bSksMClcbiAgICAgIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTUgPSByZXNfZGJsX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuICAgICAgICByZXNfZGJsX3BhMjk1X2RpZmYgPSAgTWF0aC5hYnMocmVzX2RibF9wYTI5NV9kaWZmKVxuICAgICAgcmVzX2RibF9wYTI5NV9kaWZmID0gQGFkZENvbW1hcyByZXNfZGJsX3BhMjk1X2RpZmZcblxuXG5cbiAgICAgIGNvbW1fc3VtID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21FQ1N1bVwiKS5mbG9hdCgnVVNFUl9TVU0nLCAxKVxuICAgICAgY29tbV9wYTI5NV90b3RhbF9mYyA9ICAgICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUVDU3VtXCIpLmZsb2F0KCdQQV9TVU0nLCAxKVxuICAgICAgY29tbV9ub19wYTI5NV90b3RhbF9mYyA9ICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUVDU3VtXCIpLmZsb2F0KCdOT1BBX1NVTScsIDEpXG4gICAgICBjb21tX2RibF9wYTI5NV90b3RhbF9mYyA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tRUNTdW1cIikuZmxvYXQoJ0RCTFBBX1NVTScsIDEpXG5cbiAgICAgIGNvbW1fcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKGNvbW1fcGEyOTVfdG90YWxfZmMgLSBjb21tX3N1bSksMClcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfcGEyOTUgPSBjb21tX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgY29tbV9oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgICBjb21tX3BhMjk1X2RpZmY9TWF0aC5hYnMoY29tbV9wYTI5NV9kaWZmKVxuICAgICAgY29tbV9wYTI5NV9kaWZmID0gQGFkZENvbW1hcyBjb21tX3BhMjk1X2RpZmZcblxuICAgICAgY29tbV9ub19wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgoY29tbV9ub19wYTI5NV90b3RhbF9mYyAtIGNvbW1fc3VtKSwwKVxuICAgICAgY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NSA9IGNvbW1fbm9fcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCBjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICAgIGNvbW1fbm9fcGEyOTVfZGlmZiA9IE1hdGguYWJzKGNvbW1fbm9fcGEyOTVfZGlmZilcbiAgICAgIGNvbW1fbm9fcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgY29tbV9ub19wYTI5NV9kaWZmXG5cblxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKGNvbW1fZGJsX3BhMjk1X3RvdGFsX2ZjIC0gY29tbV9zdW0pLDApXG4gICAgICBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NSA9IGNvbW1fZGJsX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZiA9IE1hdGguYWJzKGNvbW1fZGJsX3BhMjk1X2RpZmYpXG4gICAgICBjb21tX2RibF9wYTI5NV9kaWZmID0gQGFkZENvbW1hcyBjb21tX2RibF9wYTI5NV9kaWZmXG5cbiAgICBjYXRjaCBlXG4gICAgICBjb25zb2xlLmxvZyhcImVycm9yLi4uLi4uLi4uLi4uLi4uLi4uLi46IFwiLCBlKVxuXG4gICAgY29udGV4dCA9XG4gICAgICBza2V0Y2g6IEBtb2RlbC5mb3JUZW1wbGF0ZSgpXG4gICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgIGFueUF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKCkubGVuZ3RoID4gMFxuICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcblxuICAgICAgc2NlbmFyaW9zOiBzY2VuYXJpb3NcbiAgICAgIGNvbV91c2VyX3NhdmluZ3M6IGNvbV91c2VyX3NhdmluZ3NcbiAgICAgIHJlc191c2VyX3NhdmluZ3M6IHJlc191c2VyX3NhdmluZ3NcbiAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuXG4gICAgICByZXNfcGEyOTVfZGlmZjogcmVzX3BhMjk1X2RpZmZcbiAgICAgIHJlc19oYXNfc2F2aW5nc19wYTI5NTogcmVzX2hhc19zYXZpbmdzX3BhMjk1XG5cbiAgICAgIHJlc19ub19wYTI5NV9kaWZmOiByZXNfbm9fcGEyOTVfZGlmZlxuICAgICAgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1OiByZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcblxuICAgICAgcmVzX2RibF9wYTI5NV9kaWZmOiByZXNfZGJsX3BhMjk1X2RpZmZcbiAgICAgIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTU6IHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcblxuICAgICAgY29tbV9wYTI5NV9kaWZmOiBjb21tX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfcGEyOTU6IGNvbW1faGFzX3NhdmluZ3NfcGEyOTVcblxuICAgICAgY29tbV9ub19wYTI5NV9kaWZmOiBjb21tX25vX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTU6IGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcblxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZjogY29tbV9kYmxfcGEyOTVfZGlmZlxuICAgICAgY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTU6IGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG5cbiAgICBAJCgnLmNvbW0tY2hvc2VuLWZjJykuY2hvc2VuKHtkaXNhYmxlX3NlYXJjaF90aHJlc2hvbGQ6IDEwLCB3aWR0aDonMjIwcHgnfSlcbiAgICBAJCgnLmNvbW0tY2hvc2VuLWZjJykuY2hhbmdlICgpID0+XG4gICAgICBAcmVuZGVyRGlmZnMoJy5jb21tLWNob3Nlbi1mYycsICdjb21tJywgJ2ZjJylcblxuICAgIEAkKCcucmVzLWNob3Nlbi1mYycpLmNob3Nlbih7ZGlzYWJsZV9zZWFyY2hfdGhyZXNob2xkOiAxMCwgd2lkdGg6JzIyMHB4J30pXG4gICAgQCQoJy5yZXMtY2hvc2VuLWZjJykuY2hhbmdlICgpID0+XG4gICAgICBAcmVuZGVyRGlmZnMoJy5yZXMtY2hvc2VuLWZjJywgJ3JlcycsICdmYycpXG5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGggPSAzMjBcbiAgICAgIHcgPSAzODBcbiAgICAgIG1hcmdpbiA9IHtsZWZ0OjQwLCB0b3A6NSwgcmlnaHQ6NDAsIGJvdHRvbTogNDAsIGlubmVyOjV9XG4gICAgICBoYWxmaCA9IChoK21hcmdpbi50b3ArbWFyZ2luLmJvdHRvbSlcbiAgICAgIHRvdGFsaCA9IGhhbGZoKjJcbiAgICAgIGhhbGZ3ID0gKHcrbWFyZ2luLmxlZnQrbWFyZ2luLnJpZ2h0KVxuICAgICAgdG90YWx3ID0gaGFsZncqMlxuICAgICAgXG4gICAgICBjb21fY2hhcnQgPSBAZHJhd0NoYXJ0KCcuY29tbWVyY2lhbEZ1ZWxDb3N0cycpLnh2YXIoMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnl2YXIoMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnhsYWIoXCJZZWFyXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC55bGFiKFwiVmFsdWUgKGluIG1pbGxpb24gJClcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmhlaWdodChoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAud2lkdGgodylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcmdpbihtYXJnaW4pXG5cbiAgICAgIGNoID0gZDMuc2VsZWN0KEAkKCcuY29tbWVyY2lhbEZ1ZWxDb3N0cycpKVxuICAgICAgY2guZGF0dW0oc29ydGVkX2NvbW1fcmVzdWx0cylcbiAgICAgICAgLmNhbGwoY29tX2NoYXJ0KVxuXG4gICAgICByZXNfY2hhcnQgPSBAZHJhd0NoYXJ0KCcucmVzaWRlbnRpYWxGdWVsQ29zdHMnKS54dmFyKDApXG4gICAgICAgICAgICAgICAgICAgICAueXZhcigxKVxuICAgICAgICAgICAgICAgICAgICAgLnhsYWIoXCJZZWFyXCIpXG4gICAgICAgICAgICAgICAgICAgICAueWxhYihcIlZhbHVlIChpbiBtaWxsaW9uICQpXCIpXG4gICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KGgpXG4gICAgICAgICAgICAgICAgICAgICAud2lkdGgodylcbiAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4obWFyZ2luKVxuXG4gICAgICBjaCA9IGQzLnNlbGVjdChAJCgnLnJlc2lkZW50aWFsRnVlbENvc3RzJykpXG4gICAgICBjaC5kYXR1bShzb3J0ZWRfcmVzX3Jlc3VsdHMpXG4gICAgICAgIC5jYWxsKHJlc19jaGFydClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZ1ZWxDb3N0c1RhYiIsIlJlcG9ydEdyYXBoVGFiID0gcmVxdWlyZSAncmVwb3J0R3JhcGhUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cblxuY2xhc3MgR3JlZW5ob3VzZUdhc2VzVGFiIGV4dGVuZHMgUmVwb3J0R3JhcGhUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnR3JlZW5ob3VzZSBHYXNlcydcbiAgY2xhc3NOYW1lOiAnZ3JlZW5ob3VzZUdhc2VzJ1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5ncmVlbmhvdXNlR2FzZXNcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0VuZXJneVBsYW4nXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcblxuICAgIHRyeVxuICAgICAgY29tR0hHID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21HSEdcIikudG9BcnJheSgpXG4gICAgICByZXNHSEcgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0dIR1wiKS50b0FycmF5KClcblxuICAgICAgY29tX3BhID0gQGdldE1hcChjb21HSEcsIFwiUEFcIilcbiAgICAgIGNvbV9kYmxwYSA9IEBnZXRNYXAoY29tR0hHLCBcIkRibFBBXCIpXG4gICAgICBjb21fbm9wYSA9IEBnZXRNYXAoY29tR0hHLCBcIk5vUEFcIilcbiAgICAgIFxuICAgICAgY29tX3VzZXIgPSBAZ2V0VXNlck1hcChjb21HSEcsIFwiVVNFUlwiLCBjb21fbm9wYSlcbiAgICAgIGNvbV91c2VyX3NhdmluZ3MgPSBAZ2V0VXNlclNhdmluZ3MoY29tR0hHLCBjb21fdXNlcixjb21fbm9wYSwgMSlcbiAgICAgIHNvcnRlZF9jb21tX3Jlc3VsdHMgPSBbY29tX25vcGEsIGNvbV9wYSwgY29tX2RibHBhLCBjb21fdXNlcl1cblxuICAgICAgcmVzX3BhID0gQGdldE1hcChyZXNHSEcsIFwiUEFcIilcbiAgICAgIHJlc19kYmxwYSA9IEBnZXRNYXAocmVzR0hHLCBcIkRibFBBXCIpXG4gICAgICByZXNfbm9wYSA9IEBnZXRNYXAocmVzR0hHLCBcIk5vUEFcIilcbiAgICAgIFxuICAgICAgcmVzX3VzZXIgPSBAZ2V0VXNlck1hcChyZXNHSEcsIFwiVVNFUlwiLCByZXNfbm9wYSlcbiAgICAgIHJlc191c2VyX3NhdmluZ3MgPSBAZ2V0VXNlclNhdmluZ3MocmVzR0hHLCByZXNfdXNlcixyZXNfbm9wYSwgMSlcbiAgICAgIHNvcnRlZF9yZXNfcmVzdWx0cyA9IFtyZXNfbm9wYSwgcmVzX3BhLCByZXNfZGJscGEsIHJlc191c2VyXVxuXG4gICAgICBzY2VuYXJpb3MgPSBbJ1BBIDI5NScsICdObyBQQSAyOTUnLCAnRG91YmxlIFBBIDI5NSddXG5cbiAgICAgIHJlc19zdW0gPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0dIR1N1bVwiKS5mbG9hdCgnVVNFUl9TVU0nLCAxKVxuICAgICAgcmVzX3BhMjk1X3RvdGFsX2doZyA9ICAgICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0dIR1N1bVwiKS5mbG9hdCgnUEFfU1VNJywgMSlcbiAgICAgIHJlc19ub19wYTI5NV90b3RhbF9naGcgPSAgQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNHSEdTdW1cIikuZmxvYXQoJ05PUEFfU1VNJywgMSlcbiAgICAgIHJlc19kYmxfcGEyOTVfdG90YWxfZ2hnID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNHSEdTdW1cIikuZmxvYXQoJ0RCTFBBX1NVTScsIDEpXG5cbiAgICAgIHJlc19wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgocmVzX3BhMjk1X3RvdGFsX2doZyAtIHJlc19zdW0pLDApXG4gICAgICByZXNfaGFzX3NhdmluZ3NfcGEyOTUgPSByZXNfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCByZXNfaGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgICAgcmVzX3BhMjk1X2RpZmYgPSBNYXRoLmFicyhyZXNfcGEyOTVfZGlmZilcbiAgICAgIHJlc19wYTI5NV9kaWZmID0gQGFkZENvbW1hcyByZXNfcGEyOTVfZGlmZlxuXG4gICAgICByZXNfbm9fcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKHJlc19ub19wYTI5NV90b3RhbF9naGcgLSByZXNfc3VtKSwwKVxuICAgICAgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1ID0gcmVzX25vX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICAgIHJlc19ub19wYTI5NV9kaWZmID0gTWF0aC5hYnMocmVzX25vX3BhMjk1X2RpZmYpXG4gICAgICByZXNfbm9fcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgcmVzX25vX3BhMjk1X2RpZmZcblxuICAgICAgcmVzX2RibF9wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgocmVzX2RibF9wYTI5NV90b3RhbF9naGcgLSByZXNfc3VtKSwwKVxuICAgICAgcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NSA9IHJlc19kYmxfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgICAgcmVzX2RibF9wYTI5NV9kaWZmID0gTWF0aC5hYnMocmVzX2RibF9wYTI5NV9kaWZmKVxuICAgICAgcmVzX2RibF9wYTI5NV9kaWZmID0gQGFkZENvbW1hcyByZXNfZGJsX3BhMjk1X2RpZmZcblxuICAgICAgY29tbV9zdW0gPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUdIR1N1bVwiKS5mbG9hdCgnVVNFUl9TVU0nLCAxKVxuICAgICAgY29tbV9wYTI5NV90b3RhbF9naGcgPSAgICAgQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21HSEdTdW1cIikuZmxvYXQoJ1BBX1NVTScsIDEpXG4gICAgICBjb21tX25vX3BhMjk1X3RvdGFsX2doZyA9ICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUdIR1N1bVwiKS5mbG9hdCgnTk9QQV9TVU0nLCAxKVxuICAgICAgY29tbV9kYmxfcGEyOTVfdG90YWxfZ2hnID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21HSEdTdW1cIikuZmxvYXQoJ0RCTFBBX1NVTScsIDEpXG5cbiAgICAgIGNvbW1fcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKGNvbW1fcGEyOTVfdG90YWxfZ2hnIC0gY29tbV9zdW0pLDApXG4gICAgICBjb21tX2hhc19zYXZpbmdzX3BhMjk1ID0gY29tbV9wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IGNvbW1faGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgICAgY29tbV9wYTI5NV9kaWZmPU1hdGguYWJzKGNvbW1fcGEyOTVfZGlmZilcbiAgICAgIGNvbW1fcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgY29tbV9wYTI5NV9kaWZmXG5cbiAgICAgIGNvbW1fbm9fcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKGNvbW1fbm9fcGEyOTVfdG90YWxfZ2hnIC0gY29tbV9zdW0pLDApXG4gICAgICBjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1ID0gY29tbV9ub19wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcbiAgICAgICAgY29tbV9ub19wYTI5NV9kaWZmID0gTWF0aC5hYnMoY29tbV9ub19wYTI5NV9kaWZmKVxuICAgICAgY29tbV9ub19wYTI5NV9kaWZmID0gQGFkZENvbW1hcyBjb21tX25vX3BhMjk1X2RpZmZcblxuXG5cbiAgICAgIGNvbW1fZGJsX3BhMjk1X2RpZmYgPSBNYXRoLnJvdW5kKChjb21tX2RibF9wYTI5NV90b3RhbF9naGcgLSBjb21tX3N1bSksMClcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1ID0gY29tbV9kYmxfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuICAgICAgICBjb21tX2RibF9wYTI5NV9kaWZmID0gTWF0aC5hYnMoY29tbV9kYmxfcGEyOTVfZGlmZilcbiAgICAgIGNvbW1fZGJsX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIGNvbW1fZGJsX3BhMjk1X2RpZmZcblxuICAgIGNhdGNoIGVcbiAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3I6IFwiLCBlKVxuXG4gICAgY29udGV4dCA9XG4gICAgICBza2V0Y2g6IEBtb2RlbC5mb3JUZW1wbGF0ZSgpXG4gICAgICBza2V0Y2hDbGFzczogQHNrZXRjaENsYXNzLmZvclRlbXBsYXRlKClcbiAgICAgIGF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICAgIGFueUF0dHJpYnV0ZXM6IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKCkubGVuZ3RoID4gMFxuICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICAgIGNvbV91c2VyX3NhdmluZ3M6IGNvbV91c2VyX3NhdmluZ3NcbiAgICAgIHJlc191c2VyX3NhdmluZ3M6IHJlc191c2VyX3NhdmluZ3NcbiAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuXG4gICAgICBzY2VuYXJpb3M6IHNjZW5hcmlvc1xuICAgICAgcmVzX3BhMjk1X2RpZmY6IHJlc19wYTI5NV9kaWZmXG4gICAgICByZXNfaGFzX3NhdmluZ3NfcGEyOTU6IHJlc19oYXNfc2F2aW5nc19wYTI5NVxuXG4gICAgICByZXNfbm9fcGEyOTVfZGlmZjogcmVzX25vX3BhMjk1X2RpZmZcbiAgICAgIHJlc19oYXNfc2F2aW5nc19ub19wYTI5NTogcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XG5cbiAgICAgIHJlc19kYmxfcGEyOTVfZGlmZjogcmVzX2RibF9wYTI5NV9kaWZmXG4gICAgICByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1OiByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1XG5cbiAgICAgIGNvbW1fcGEyOTVfZGlmZjogY29tbV9wYTI5NV9kaWZmXG4gICAgICBjb21tX2hhc19zYXZpbmdzX3BhMjk1OiBjb21tX2hhc19zYXZpbmdzX3BhMjk1XG5cbiAgICAgIGNvbW1fbm9fcGEyOTVfZGlmZjogY29tbV9ub19wYTI5NV9kaWZmXG4gICAgICBjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1OiBjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XG5cbiAgICAgIGNvbW1fZGJsX3BhMjk1X2RpZmY6IGNvbW1fZGJsX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1OiBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuXG4gICAgQCQoJy5jb21tLWNob3Nlbi1naGcnKS5jaG9zZW4oe2Rpc2FibGVfc2VhcmNoX3RocmVzaG9sZDogMTAsIHdpZHRoOicyMDBweCd9KVxuICAgIEAkKCcuY29tbS1jaG9zZW4tZ2hnJykuY2hhbmdlICgpID0+XG4gICAgICBAcmVuZGVyRGlmZnMoJy5jb21tLWNob3Nlbi1naGcnLCAnY29tbScsICdnaGcnKVxuXG4gICAgQCQoJy5yZXMtY2hvc2VuLWdoZycpLmNob3Nlbih7ZGlzYWJsZV9zZWFyY2hfdGhyZXNob2xkOiAxMCwgd2lkdGg6JzIwMHB4J30pXG4gICAgQCQoJy5yZXMtY2hvc2VuLWdoZycpLmNoYW5nZSAoKSA9PlxuICAgICAgQHJlbmRlckRpZmZzKCcucmVzLWNob3Nlbi1naGcnLCAncmVzJywgJ2doZycpXG5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGggPSAzMjBcbiAgICAgIHcgPSAzODBcbiAgICAgIG1hcmdpbiA9IHtsZWZ0OjQwLCB0b3A6NSwgcmlnaHQ6NDAsIGJvdHRvbTogNDAsIGlubmVyOjV9XG4gICAgICBoYWxmaCA9IChoK21hcmdpbi50b3ArbWFyZ2luLmJvdHRvbSlcbiAgICAgIHRvdGFsaCA9IGhhbGZoKjJcbiAgICAgIGhhbGZ3ID0gKHcrbWFyZ2luLmxlZnQrbWFyZ2luLnJpZ2h0KVxuICAgICAgdG90YWx3ID0gaGFsZncqMlxuICAgICAgXG5cbiAgICAgIGNvbV9jaGFydCA9IEBkcmF3Q2hhcnQoJy5jb21tZXJjaWFsR3JlZW5ob3VzZUdhc2VzJykueHZhcigwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueXZhcigxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueGxhYihcIlllYXJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnlsYWIoXCJWYWx1ZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC53aWR0aCh3KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFyZ2luKG1hcmdpbilcblxuICAgICAgY2ggPSBkMy5zZWxlY3QoQCQoJy5jb21tZXJjaWFsR3JlZW5ob3VzZUdhc2VzJykpXG4gICAgICBjaC5kYXR1bShzb3J0ZWRfY29tbV9yZXN1bHRzKVxuICAgICAgICAuY2FsbChjb21fY2hhcnQpXG5cbiAgICAgIHJlc19jaGFydCA9IEBkcmF3Q2hhcnQoJy5yZXNpZGVudGlhbEdyZWVuaG91c2VHYXNlcycpLnh2YXIoMClcbiAgICAgICAgICAgICAgICAgICAgIC55dmFyKDEpXG4gICAgICAgICAgICAgICAgICAgICAueGxhYihcIlllYXJcIilcbiAgICAgICAgICAgICAgICAgICAgIC55bGFiKFwiVmFsdWVcIilcbiAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoaClcbiAgICAgICAgICAgICAgICAgICAgIC53aWR0aCh3KVxuICAgICAgICAgICAgICAgICAgICAgLm1hcmdpbihtYXJnaW4pXG5cbiAgICAgIGNoID0gZDMuc2VsZWN0KEAkKCcucmVzaWRlbnRpYWxHcmVlbmhvdXNlR2FzZXMnKSlcbiAgICAgIGNoLmRhdHVtKHNvcnRlZF9yZXNfcmVzdWx0cylcbiAgICAgICAgLmNhbGwocmVzX2NoYXJ0KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdyZWVuaG91c2VHYXNlc1RhYiIsIkVuZXJneUNvbnN1bXB0aW9uVGFiID0gcmVxdWlyZSAnLi9lbmVyZ3lDb25zdW1wdGlvbi5jb2ZmZWUnXG5GdWVsQ29zdHNUYWIgPSByZXF1aXJlICcuL2Z1ZWxDb3N0cy5jb2ZmZWUnXG5HcmVlbmhvdXNlR2FzZXNUYWIgPSByZXF1aXJlICcuL2dyZWVuaG91c2VHYXNlcy5jb2ZmZWUnXG5cbndpbmRvdy5hcHAucmVnaXN0ZXJSZXBvcnQgKHJlcG9ydCkgLT5cbiAgcmVwb3J0LnRhYnMgW0VuZXJneUNvbnN1bXB0aW9uVGFiLCBGdWVsQ29zdHNUYWIsIEdyZWVuaG91c2VHYXNlc1RhYl1cbiAgIyBwYXRoIG11c3QgYmUgcmVsYXRpdmUgdG8gZGlzdC9cbiAgcmVwb3J0LnN0eWxlc2hlZXRzIFsnLi9yZXBvcnQuY3NzJ11cblxuXG4iLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmNsYXNzIFJlcG9ydEdyYXBoVGFiIGV4dGVuZHMgUmVwb3J0VGFiXG5cbiAgbmFtZTogJ1JlcG9ydEdyYXBoJ1xuICBjbGFzc05hbWU6ICdSZXBvcnRHcmFwaCdcbiAgdGltZW91dDogMTIwMDAwXG5cbiAgcmVuZGVyRGlmZnM6ICh3aGljaF9jaG9zZW4sIGNlLCB0YWIpIC0+IFxuXG5cbiAgICBuYW1lID0gQCQod2hpY2hfY2hvc2VuKS52YWwoKVxuICAgIEAkKCcuZGVmYXVsdC1jaG9zZW4tc2VsZWN0aW9uJysnXycrdGFiKS5oaWRlKClcblxuICAgIGlmIG5hbWUgPT0gXCJObyBQQSAyOTVcIlxuICAgICAgQCQoQGdldEVsZW1OYW1lKCcubm9fcGEyOTUnLCBjZSwgdGFiKSkuc2hvdygpXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5wYTI5NScsY2UsdGFiKSkuaGlkZSgpXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5kYmxfcGEyOTUnLGNlLHRhYikpLmhpZGUoKVxuICAgIGVsc2UgaWYgbmFtZSA9PSBcIlBBIDI5NVwiXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5ub19wYTI5NScsY2UsdGFiKSkuaGlkZSgpXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5wYTI5NScsIGNlLCB0YWIpKS5zaG93KClcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLmRibF9wYTI5NScsY2UsdGFiKSkuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgQCQoQGdldEVsZW1OYW1lKCcubm9fcGEyOTUnLGNlLHRhYikpLmhpZGUoKVxuICAgICAgQCQoQGdldEVsZW1OYW1lKCcucGEyOTUnLGNlLHRhYikpLmhpZGUoKVxuICAgICAgQCQoQGdldEVsZW1OYW1lKCcuZGJsX3BhMjk1JyxjZSx0YWIpKS5zaG93KClcblxuICBnZXRFbGVtTmFtZTogKG5hbWUsIGNvbW1fb3JfZWMsIHRhYikgLT5cbiAgICByZXR1cm4gbmFtZStcIl9cIitjb21tX29yX2VjK1wiX1wiK3RhYlxuXG4gIGdldERpckNsYXNzOiAoZGlyKSAtPlxuICAgIHJldHVybiBpZiBkaXIgdGhlbiAncG9zaXRpdmUnIGVsc2UgJ25lZ2F0aXZlJ1xuICAgIFxuICBnZXRVc2VyU2F2aW5nczogKHJlY1NldCwgdXNlcl9zdGFydF92YWx1ZXMsIGJhc2VfdmFsdWVzLCBkZWNzKSAtPlxuXG4gICAgc2F2aW5ncyA9IDBcbiAgICB0cnlcbiAgICAgIGZvciB2YWwsIGRleCBpbiBiYXNlX3ZhbHVlc1xuICAgICAgICB1c2VyX3ZhbCA9IHVzZXJfc3RhcnRfdmFsdWVzW2RleF0uVkFMVUVcbiAgICAgICAgYmFzZV92YWwgPSB2YWwuVkFMVUVcbiAgICAgICAgc2F2aW5ncyArPSAoYmFzZV92YWwgLSB1c2VyX3ZhbClcbiAgICAgIHJldHVybiBNYXRoLnJvdW5kKHNhdmluZ3MsIGRlY3MpXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIHJldHVybiAwLjBcblxuICBnZXRVc2VyTWFwOiAocmVjU2V0LCB1c2VyX3RhZywgYmFzZV92YWx1ZXMpIC0+XG4gICAgdXNlcl9zdGFydF92YWx1ZXMgPSBbXVxuICAgIGZvciByZWMgaW4gcmVjU2V0XG4gICAgICBpZiByZWMgYW5kIHJlYy5UWVBFID09IHVzZXJfdGFnXG4gICAgICAgIHVzZXJfc3RhcnRfdmFsdWVzLnB1c2gocmVjKVxuICAgIHVzZXJfc3RhcnRfdmFsdWVzID0gXy5zb3J0QnkgdXNlcl9zdGFydF92YWx1ZXMsIChyb3cpIC0+IHJvd1snWUVBUiddXG4gICAgcmV0dXJuIHVzZXJfc3RhcnRfdmFsdWVzXG5cblxuICBnZXRNYXA6IChyZWNTZXQsIHNjZW5hcmlvKSAtPlxuICAgIHNjZW5hcmlvX3ZhbHVlcyA9IFtdXG4gICAgZm9yIHJlYyBpbiByZWNTZXRcbiAgICAgIGlmIHJlYyBhbmQgcmVjLlRZUEUgPT0gc2NlbmFyaW9cbiAgICAgICAgc2NlbmFyaW9fdmFsdWVzLnB1c2gocmVjKVxuXG4gICAgcmV0dXJuIF8uc29ydEJ5IHNjZW5hcmlvX3ZhbHVlcywgKHJvdykgLT4gcm93WydZRUFSJ11cbiAgXG4gIGFkZENvbW1hczogKG51bV9zdHIpID0+XG4gICAgbnVtX3N0ciArPSAnJ1xuICAgIHggPSBudW1fc3RyLnNwbGl0KCcuJylcbiAgICB4MSA9IHhbMF1cbiAgICB4MiA9IGlmIHgubGVuZ3RoID4gMSB0aGVuICcuJyArIHhbMV0gZWxzZSAnJ1xuICAgIHJneCA9IC8oXFxkKykoXFxkezN9KS9cbiAgICB3aGlsZSByZ3gudGVzdCh4MSlcbiAgICAgIHgxID0geDEucmVwbGFjZShyZ3gsICckMScgKyAnLCcgKyAnJDInKVxuICAgIHJldHVybiB4MSArIHgyXG5cbiAgZHJhd0NoYXJ0OiAod2hpY2hDaGFydCkgPT5cbiAgICB2aWV3ID0gQFxuICAgIHdpZHRoID0gMzYwXG4gICAgaGVpZ2h0ID0gNTAwXG4gICAgbWFyZ2luID0ge2xlZnQ6NDAsIHRvcDo1LCByaWdodDoyMCwgYm90dG9tOiA0MCwgaW5uZXI6MTB9XG4gICAgYXhpc3BvcyA9IHt4dGl0bGU6NSwgeXRpdGxlOjMwLCB4bGFiZWw6NSwgeWxhYmVsOjE1fVxuICAgIHhsaW0gPSBudWxsXG4gICAgeWxpbSA9IG51bGxcbiAgICBueHRpY2tzID0gNVxuICAgIHh0aWNrcyA9IG51bGxcbiAgICBueXRpY2tzID0gNVxuICAgIHl0aWNrcyA9IG51bGxcblxuICAgIHJlY3Rjb2xvciA9IFwiI2RiZTRlZVwiXG4gICAgdGlja2NvbG9yID0gXCIjZGJlNGZmXCJcbiAgICBjb25zb2xlLmxvZyhcImRyYXdpbmcgY2hhcnQgbm93Li4uXCIpXG5cbiAgICBwb2ludHNpemUgPSAxICMgZGVmYXVsdCA9IG5vIHZpc2libGUgcG9pbnRzIGF0IG1hcmtlcnNcbiAgICB4bGFiID0gXCJYXCJcbiAgICB5bGFiID0gXCJZIHNjb3JlXCJcbiAgICB5c2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuICAgIHhzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cbiAgICBsZWdlbmRoZWlnaHQgPSAzMDBcbiAgICBwb2ludHNTZWxlY3QgPSBudWxsXG4gICAgbGFiZWxzU2VsZWN0ID0gbnVsbFxuICAgIGxlZ2VuZFNlbGVjdCA9IG51bGxcbiAgICAjIyB0aGUgbWFpbiBmdW5jdGlvblxuICAgIGNoYXJ0ID0gKHNlbGVjdGlvbikgLT5cbiAgICAgIHNlbGVjdGlvbi5lYWNoIChkYXRhKSAtPlxuICAgICAgICB5ID0gW11cbiAgICAgICAgeCA9IFsyMDEyLCAyMDE1LCAyMDIwLCAyMDI1LCAyMDMwLCAyMDM1XVxuICAgICAgIFxuICAgICAgICBmb3Igc2NlbiBpbiBkYXRhXG4gICAgICAgICAgZm9yIGQgaW4gc2NlblxuICAgICAgICAgICAgeS5wdXNoKGQuVkFMVUUvMTAwMDAwMClcblxuXG4gICAgICAgICN4ID0gZGF0YS5tYXAgKGQpIC0+IHBhcnNlRmxvYXQoZC5ZRUFSKVxuICAgICAgICAjeSA9IGRhdGEubWFwIChkKSAtPiBwYXJzZUZsb2F0KGQuVkFMVUUpXG5cblxuICAgICAgICBwYW5lbG9mZnNldCA9IDEwXG4gICAgICAgIHBhbmVsd2lkdGggPSB3aWR0aFxuXG4gICAgICAgIHBhbmVsaGVpZ2h0ID0gaGVpZ2h0XG5cbiAgICAgICAgeGxpbSA9IFtkMy5taW4oeCktMSwgcGFyc2VGbG9hdChkMy5tYXgoeCkrMSldIGlmICEoeGxpbT8pXG5cbiAgICAgICAgeWxpbSA9IFtkMy5taW4oeSksIHBhcnNlRmxvYXQoZDMubWF4KHkpKV0gaWYgISh5bGltPylcblxuXG4gICAgICAgIGN1cnJlbGVtID0gZDMuc2VsZWN0KHZpZXcuJCh3aGljaENoYXJ0KVswXSlcbiAgICAgICAgc3ZnID0gZDMuc2VsZWN0KHZpZXcuJCh3aGljaENoYXJ0KVswXSkuYXBwZW5kKFwic3ZnXCIpLmRhdGEoW2RhdGFdKVxuICAgICAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuXG4gICAgICAgICMgVXBkYXRlIHRoZSBvdXRlciBkaW1lbnNpb25zLlxuICAgICAgICBzdmcuYXR0cihcIndpZHRoXCIsIHdpZHRoK21hcmdpbi5sZWZ0K21hcmdpbi5yaWdodClcbiAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0K21hcmdpbi50b3ArbWFyZ2luLmJvdHRvbStkYXRhLmxlbmd0aCozNSlcblxuICAgICAgICBnID0gc3ZnLnNlbGVjdChcImdcIilcblxuICAgICAgICAjIGJveFxuICAgICAgICBnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgIC5hdHRyKFwieFwiLCBwYW5lbG9mZnNldCttYXJnaW4ubGVmdClcbiAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wKVxuICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgcGFuZWxoZWlnaHQpXG4gICAgICAgICAuYXR0cihcIndpZHRoXCIsIHBhbmVsd2lkdGgpXG4gICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKVxuICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJub25lXCIpXG5cblxuICAgICAgICAjIHNpbXBsZSBzY2FsZXMgKGlnbm9yZSBOQSBidXNpbmVzcylcbiAgICAgICAgeHJhbmdlID0gW21hcmdpbi5sZWZ0K3BhbmVsb2Zmc2V0K21hcmdpbi5pbm5lciwgbWFyZ2luLmxlZnQrcGFuZWxvZmZzZXQrcGFuZWx3aWR0aC1tYXJnaW4uaW5uZXJdXG4gICAgICAgIHlyYW5nZSA9IFttYXJnaW4udG9wK3BhbmVsaGVpZ2h0LW1hcmdpbi5pbm5lciwgbWFyZ2luLnRvcCttYXJnaW4uaW5uZXJdXG4gICAgICAgIHhzY2FsZS5kb21haW4oeGxpbSkucmFuZ2UoeHJhbmdlKVxuICAgICAgICB5c2NhbGUuZG9tYWluKHlsaW0pLnJhbmdlKHlyYW5nZSlcbiAgICAgICAgeHMgPSBkMy5zY2FsZS5saW5lYXIoKS5kb21haW4oeGxpbSkucmFuZ2UoeHJhbmdlKVxuICAgICAgICB5cyA9IGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbih5bGltKS5yYW5nZSh5cmFuZ2UpXG5cblxuICAgICAgICAjIGlmIHl0aWNrcyBub3QgcHJvdmlkZWQsIHVzZSBueXRpY2tzIHRvIGNob29zZSBwcmV0dHkgb25lc1xuICAgICAgICB5dGlja3MgPSB5cy50aWNrcyhueXRpY2tzKSBpZiAhKHl0aWNrcz8pXG4gICAgICAgIHh0aWNrcyA9IHhzLnRpY2tzKG54dGlja3MpIGlmICEoeHRpY2tzPylcblxuICAgICAgICAjIHgtYXhpc1xuICAgICAgICB4YXhpcyA9IGcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJ4IGF4aXNcIilcbiAgICAgICAgeGF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YSh4dGlja3MpXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwibGluZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgKGQpIC0+IHhzY2FsZShkKSlcbiAgICAgICAgICAgICAuYXR0cihcIngyXCIsIChkKSAtPiB4c2NhbGUoZCkpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCBtYXJnaW4udG9wK2hlaWdodC01KVxuICAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgbWFyZ2luLnRvcCtoZWlnaHQpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSlcbiAgICAgICAgICAgICAuc3R5bGUoXCJwb2ludGVyLWV2ZW50c1wiLCBcIm5vbmVcIilcbiAgICAgICAgI3RoZSB4IGF4aXMgeWVhciBsYWJlbHNcbiAgICAgICAgeGF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YSh4dGlja3MpXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieFwiLCAoZCkgLT4geHNjYWxlKGQpLTE0KVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wK2hlaWdodCtheGlzcG9zLnhsYWJlbCsxMClcbiAgICAgICAgICAgICAudGV4dCgoZCkgLT4gZm9ybWF0QXhpcyh4dGlja3MpKGQpKVxuICAgICAgICAjdGhlIHggYXhpcyB0aXRsZVxuICAgICAgICB4YXhpcy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcInhheGlzLXRpdGxlXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIG1hcmdpbi5sZWZ0K3dpZHRoLzIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIG1hcmdpbi50b3AraGVpZ2h0K2F4aXNwb3MueHRpdGxlKzMwKVxuICAgICAgICAgICAgIC50ZXh0KHhsYWIpXG5cbiAgICAgICAgI2RyYXcgdGhlIGxlZ2VuZFxuICAgICAgICBmb3Igc2NlbmFyaW8sIGNudCBpbiBkYXRhXG4gICAgICAgICAgbGluZV9jb2xvciA9IGdldFN0cm9rZUNvbG9yKHNjZW5hcmlvKVxuICAgICAgICAgIHhheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoW3NjZW5hcmlvWzBdXSlcbiAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgIC5hcHBlbmQoXCJsaW5lXCIpXG5cbiAgICAgICAgICAgICAuYXR0cihcIngxXCIsIChkLGkpIC0+IHJldHVybiBtYXJnaW4ubGVmdClcbiAgICAgICAgICAgICAuYXR0cihcIngyXCIsIChkLGkpIC0+IHJldHVybiBtYXJnaW4ubGVmdCsxMClcbiAgICAgICAgICAgICAuYXR0cihcInkxXCIsIChkLGkpIC0+IG1hcmdpbi50b3AraGVpZ2h0K2F4aXNwb3MueHRpdGxlKygoY250KzEpKjMwKSs2KVxuICAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgKGQsaSkgLT4gbWFyZ2luLnRvcCtoZWlnaHQrYXhpc3Bvcy54dGl0bGUrKChjbnQrMSkqMzApKzYpXG4gICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImNoYXJ0LWxpbmVcIilcbiAgICAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCAoZCxpKSAtPiBsaW5lX2NvbG9yKVxuICAgICAgICAgICAgIC5hdHRyKFwiY29sb3JcIiwgKGQsaSkgLT4gbGluZV9jb2xvcilcbiAgICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAzKVxuXG4gICAgICAgICNhbmQgdGhlIGxlZ2VuZCB0ZXh0XG4gICAgICAgIGZvciBzY2VuYXJpbywgY250IGluIGRhdGEgICAgICAgICAgXG4gICAgICAgICAgeGF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YShbc2NlbmFyaW9bMF1dKVxuICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwibGVnZW5kLXRleHRcIilcbiAgICAgICAgICAgLmF0dHIoXCJ4XCIsIChkLGkpIC0+XG4gICAgICAgICAgICAgIHJldHVybiAobWFyZ2luLmxlZnQrMTcpKVxuICAgICAgICAgICAuYXR0cihcInlcIiwgKGQsaSkgLT5cbiAgICAgICAgICAgICAgbWFyZ2luLnRvcCtoZWlnaHQrMTArYXhpc3Bvcy54dGl0bGUrKChjbnQrMSkqMzApKVxuICAgICAgICAgICAudGV4dCgoZCxpKSAtPiByZXR1cm4gZ2V0U2NlbmFyaW9OYW1lKFtkXSkpXG5cbiAgICAgICAgIyB5LWF4aXNcbiAgICAgICAgeWF4aXMgPSBnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwieSBheGlzXCIpXG4gICAgICAgIHlheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoeXRpY2tzKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAuYXR0cihcInkxXCIsIChkKSAtPiB5c2NhbGUoZCkpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCAoZCkgLT4geXNjYWxlKGQpKVxuICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgbWFyZ2luLmxlZnQrMTApXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCBtYXJnaW4ubGVmdCsxNSlcbiAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgdGlja2NvbG9yKVxuICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpXG4gICAgICAgICAgICAgLnN0eWxlKFwicG9pbnRlci1ldmVudHNcIiwgXCJub25lXCIpXG5cbiAgICAgICAgeWF4aXNfbG9jID0gKGQpIC0+IHlzY2FsZShkKSszXG4gICAgICAgIHhheGlzX2xvYyA9IChtYXJnaW4ubGVmdC00KS1heGlzcG9zLnlsYWJlbFxuXG4gICAgICAgIHlheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoeXRpY2tzKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAuYXR0cihcInlcIiwgeWF4aXNfbG9jKVxuICAgICAgICAgICAgIC5hdHRyKFwieFwiLCB4YXhpc19sb2MpXG4gICAgICAgICAgICAgLnRleHQoKGQpIC0+IGZvcm1hdEF4aXMoeXRpY2tzKShkKSlcbiAgICAgICAgeWF4aXMuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ0aXRsZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wKzM1K2hlaWdodC8yKVxuICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBtYXJnaW4ubGVmdCs2LWF4aXNwb3MueXRpdGxlKVxuICAgICAgICAgICAgIC50ZXh0KHlsYWIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoMjcwLCN7bWFyZ2luLmxlZnQrNC1heGlzcG9zLnl0aXRsZX0sI3ttYXJnaW4udG9wKzM1K2hlaWdodC8yfSlcIilcblxuICAgICAgICBwb2ludHMgPSBnLmFwcGVuZChcImdcIikuYXR0cihcImlkXCIsIFwicG9pbnRzXCIpXG5cbiAgICAgICAgZm9yIHNjZW5hcmlvIGluIGRhdGFcbiAgICAgICAgICBsaW5lX2NvbG9yID0gZ2V0U3Ryb2tlQ29sb3Ioc2NlbmFyaW8pXG4gICAgICAgICAgIyMjXG4gICAgICAgICAgcG9pbnRzU2VsZWN0ID1cbiAgICAgICAgICAgIHBvaW50cy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgICAgICAgLmRhdGEoc2NlbmFyaW8pXG4gICAgICAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImNpcmNsZVwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjeFwiLCAoZCxpKSAtPiB4c2NhbGUoZC5ZRUFSKSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY3lcIiwgKGQsaSkgLT4geXNjYWxlKGQuVkFMVUUvMTAwMDAwMCkpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIChkLGkpIC0+IFwicHQje2l9XCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInJcIiwgcG9pbnRzaXplKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIChkLGkpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbCA9IGxpbmVfY29sb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgKGQsIGkpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gTWF0aC5mbG9vcihpLzE3KSAlIDVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2wgPSBsaW5lX2NvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwiMVwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJvcGFjaXR5XCIsIChkLGkpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxIGlmICh4W2ldPyBvciB4TkEuaGFuZGxlKSBhbmQgKHlbaV0/IG9yIHlOQS5oYW5kbGUpXG4gICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwKVxuICAgICAgICAgICMjI1xuICAgICAgICBsaW5lID0gZDMuc3ZnLmxpbmUoZClcbiAgICAgICAgICAgIC5pbnRlcnBvbGF0ZShcImJhc2lzXCIpXG4gICAgICAgICAgICAueCggKGQpIC0+IHhzY2FsZShwYXJzZUludChkLllFQVIpKSlcbiAgICAgICAgICAgIC55KCAoZCkgLT4geXNjYWxlKGQuVkFMVUUvMTAwMDAwMCkpXG5cblxuICAgICAgICBwb2ludHMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZChcInBhdGhcIilcbiAgICAgICAgICAuYXR0cihcImRcIiwgKGQpIC0+IGxpbmUgZClcbiAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCAoZCkgLT4gZ2V0U3Ryb2tlQ29sb3IoZCkpXG4gICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMylcbiAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG5cbiAgICAgICAgIyBib3hcbiAgICAgICAgZy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgICAgICAuYXR0cihcInhcIiwgbWFyZ2luLmxlZnQrcGFuZWxvZmZzZXQpXG4gICAgICAgICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLnRvcClcbiAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHBhbmVsaGVpZ2h0KVxuICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBwYW5lbHdpZHRoKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJibGFja1wiKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgXCJub25lXCIpXG5cblxuXG4gICAgIyMgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzXG5cblxuICAgIGNoYXJ0LndpZHRoID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHdpZHRoIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB3aWR0aCA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQuaGVpZ2h0ID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIGhlaWdodCBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgaGVpZ2h0ID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5tYXJnaW4gPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gbWFyZ2luIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBtYXJnaW4gPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LmF4aXNwb3MgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gYXhpc3BvcyBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgYXhpc3BvcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueGxpbSA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB4bGltIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB4bGltID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5ueHRpY2tzID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIG54dGlja3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIG54dGlja3MgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lnh0aWNrcyA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB4dGlja3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHh0aWNrcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueWxpbSA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB5bGltIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB5bGltID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5ueXRpY2tzID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIG55dGlja3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIG55dGlja3MgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lnl0aWNrcyA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB5dGlja3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHl0aWNrcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQucmVjdGNvbG9yID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHJlY3Rjb2xvciBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgcmVjdGNvbG9yID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5wb2ludGNvbG9yID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHBvaW50Y29sb3IgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHBvaW50Y29sb3IgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnBvaW50c2l6ZSA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBwb2ludHNpemUgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHBvaW50c2l6ZSA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQucG9pbnRzdHJva2UgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gcG9pbnRzdHJva2UgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHBvaW50c3Ryb2tlID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC54bGFiID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHhsYWIgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHhsYWIgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnlsYWIgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geWxhYiBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeWxhYiA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueHZhciA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB4dmFyIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB4dmFyID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC55dmFyID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHl2YXIgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHl2YXIgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnlzY2FsZSA9ICgpIC0+XG4gICAgICByZXR1cm4geXNjYWxlXG5cbiAgICBjaGFydC54c2NhbGUgPSAoKSAtPlxuICAgICAgcmV0dXJuIHhzY2FsZVxuXG4gICAgY2hhcnQucG9pbnRzU2VsZWN0ID0gKCkgLT5cbiAgICAgIHJldHVybiBwb2ludHNTZWxlY3RcblxuICAgIGNoYXJ0LmxhYmVsc1NlbGVjdCA9ICgpIC0+XG4gICAgICByZXR1cm4gbGFiZWxzU2VsZWN0XG5cbiAgICBjaGFydC5sZWdlbmRTZWxlY3QgPSAoKSAtPlxuICAgICAgcmV0dXJuIGxlZ2VuZFNlbGVjdFxuXG4gICAgIyByZXR1cm4gdGhlIGNoYXJ0IGZ1bmN0aW9uXG4gICAgY2hhcnRcblxuICBnZXRTY2VuYXJpb05hbWUgPSAoc2NlbmFyaW8pIC0+XG4gICAgZm9yIGQgaW4gc2NlbmFyaW9cbiAgICAgIGlmIGQgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgcmV0dXJuIFwiVXNlciBTY2VuYXJpbyAod2l0aCBlcnJvcnMpXCJcbiAgICAgIGlmIGQuVFlQRSA9PSBcIlBBXCJcbiAgICAgICAgcmV0dXJuIFwiUEEgMjk1XCJcbiAgICAgIGVsc2UgaWYgZC5UWVBFID09IFwiTm9QQVwiXG4gICAgICAgIHJldHVybiBcIk5vIFBBIDI5NVwiXG4gICAgICBlbHNlIGlmIGQuVFlQRSA9PSBcIkRibFBBXCJcbiAgICAgICAgcmV0dXJuIFwiRG91YmxlIFBBIDI5NVwiXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBcIlVzZXIgU2NlbmFyaW9cIlxuXG4gIGdldFN0cm9rZUNvbG9yID0gKHNjZW5hcmlvKSAtPlxuICAgIHBhY29sb3IgPSBcIiM5YWJhOGNcIlxuICAgIG5vcGFjb2xvciA9IFwiI2U1Y2FjZVwiXG4gICAgZGJscGFjb2xvciA9IFwiI2IzY2ZhN1wiXG4gICAgZm9yIGQgaW4gc2NlbmFyaW9cbiAgICAgIGlmIGQuVFlQRSA9PSBcIlBBXCJcbiAgICAgICAgcmV0dXJuICBwYWNvbG9yXG4gICAgICBlbHNlIGlmIGQuVFlQRSA9PSBcIk5vUEFcIlxuICAgICAgICByZXR1cm4gbm9wYWNvbG9yXG4gICAgICBlbHNlIGlmIGQuVFlQRSA9PSBcIkRibFBBXCJcbiAgICAgICAgcmV0dXJuIGRibHBhY29sb3JcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIFwiZ3JheVwiXG5cblxuICAjIGZ1bmN0aW9uIHRvIGRldGVybWluZSByb3VuZGluZyBvZiBheGlzIGxhYmVsc1xuICBmb3JtYXRBeGlzID0gKGQpIC0+XG4gICAgZCA9IGRbMV0gLSBkWzBdXG4gICAgbmRpZyA9IE1hdGguZmxvb3IoIE1hdGgubG9nKGQgJSAxMCkgLyBNYXRoLmxvZygxMCkgKVxuICAgIG5kaWcgPSAwIGlmIG5kaWcgPiAwXG4gICAgbmRpZyA9IE1hdGguYWJzKG5kaWcpXG4gICAgZDMuZm9ybWF0KFwiLiN7bmRpZ31mXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0R3JhcGhUYWIiLCJ0aGlzW1wiVGVtcGxhdGVzXCJdID0gdGhpc1tcIlRlbXBsYXRlc1wiXSB8fCB7fTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJlbmVyZ3lDb25zdW1wdGlvblwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0SW4gT2N0b2JlciAyMDA4LCBNaWNoaWdhbiBlbmFjdGVkIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmxlZ2lzbGF0dXJlLm1pLmdvdi8oUyhxNGViNGp6aXIyZzNoYXpoemhsMXRkNDUpKS9taWxlZy5hc3B4P3BhZ2U9Z2V0b2JqZWN0Jm9iamVjdE5hbWU9bWNsLWFjdC0yOTUtb2YtMjAwOFxcXCI+Q2xlYW4sIFJlbmV3YWJsZSwgYW5kIEVmZmljaWVudCBFbmVyZ3kgQWN0LCBQdWJsaWMgQWN0IDI5NTwvYT4gPHN0cm9uZz4oUEEgMjk1KTwvc3Ryb25nPiBBIGRlc2NyaXB0aW9uIG9mIGVhY2ggc2NlbmFyaW8gaXMgcHJvdmlkZWQgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZS4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+Q29tbWVyY2lhbCBFbmVyZ3kgQ29uc3VtcHRpb24gLS0gTU1CVFUgRXF1aXZhbGVudDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJjaG9vc2VyLWRpdlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInNlbC1sYWJlbFxcXCI+Q29tcGFyZSB5b3VyIHBsYW4gdG8gc2NlbmFyaW86PC9kaXY+PHNlbGVjdCBjbGFzcz1cXFwiY29tbS1jaG9zZW4tZWNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCw2NTYsNzA4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIlwiKTtfLmIoXy52KF8uZChcIi5cIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZChcIi5cIixjLHAsMCkpKTtfLmIoXCI8L29wdGlvbj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJwYTI5NV9jb21tX2VjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHNwYW4gY2xhc3M9XFxcImRpZmYgXCIpO18uYihfLnYoXy5mKFwiY29tbV9wYTI5NV9kaXJcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZihcImNvbW1fcGEyOTVfcGVyY19kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zcGFuPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwicGEyOTVfY29tbV9lY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMCw5NjcsOTcxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTQVZFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO18uYihfLnYoXy5mKFwiY29tbV9wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG1vcmUgTU1CVFUgZXF1aXZhbGVudCBlbmVyZ3kgdGhhbiB0aGUgPHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJub19wYTI5NV9jb21tX2VjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHNwYW4gY2xhc3M9XFxcImRpZmYgXCIpO18uYihfLnYoXy5mKFwiY29tbV9ub19wYTI5NV9kaXJcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZihcImNvbW1fbm9fcGEyOTVfcGVyY19kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zcGFuPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibm9fcGEyOTVfY29tbV9lY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDAsMTQzMiwxNDM2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTQVZFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO18uYihfLnYoXy5mKFwiY29tbV9ub19wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG1vcmUgTU1CVFUgZXF1aXZhbGVudCBlbmVyZ3kgdGhhbiB0aGUgPHN0cm9uZz5ObyBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJkYmxfcGEyOTVfY29tbV9lY1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxzcGFuIGNsYXNzPVxcXCJkaWZmIFwiKTtfLmIoXy52KF8uZihcImNvbW1fZGJsX3BhMjk1X2RpclwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5mKFwiY29tbV9kYmxfcGEyOTVfcGVyY19kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zcGFuPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwiZGJsX3BhMjk1X2NvbW1fZWNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XCIsYyxwLDEpLGMscCwwLDE5MTYsMTkyMCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiU0FWRVwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJVU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKF8udihfLmYoXCJjb21tX2RibF9wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG1vcmUgTU1CVFUgZXF1aXZhbGVudCBlbmVyZ3kgdGhhbiB0aGUgPHN0cm9uZz5Eb3VibGUgUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2ICBpZD1cXFwiY29tbWVyY2lhbEVuZXJneUNvbnN1bXB0aW9uXFxcIiBjbGFzcz1cXFwiY29tbWVyY2lhbEVuZXJneUNvbnN1bXB0aW9uXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlJlc2lkZW50aWFsIEVuZXJneSBDb25zdW1wdGlvbiAtLSBNTUJUVSBFcXVpdmFsZW50PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiY2hvb3Nlci1kaXZcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInNlbC1sYWJlbFxcXCI+Q29tcGFyZSB5b3VyIHBsYW4gdG8gc2NlbmFyaW86PC9kaXY+PHNlbGVjdCBjbGFzcz1cXFwicmVzLWNob3Nlbi1lY1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8b3B0aW9uIGNsYXNzPVxcXCJkZWZhdWx0LWNob3Nlbi1zZWxlY3Rpb25cXFwiIGxhYmVsPVxcXCJQQSAyOTVcXFwiPjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzY2VuYXJpb3NcIixjLHAsMSksYyxwLDAsMjU4OSwyNjQ1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgPC9zZWxlY3Q+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInBhMjk1X3Jlc19lY1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxzcGFuIGNsYXNzPVxcXCJkaWZmIFwiKTtfLmIoXy52KF8uZihcInJlc19wYTI5NV9kaXJcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZihcInJlc19wYTI5NV9wZXJjX2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJwYTI5NV9yZXNfZWNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIDxzdHJvbmc+XCIpO2lmKF8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDAsMjkwMSwyOTA1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTQVZFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJVU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKF8udihfLmYoXCJyZXNfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBtb3JlIE1NQlRVIGVxdWl2YWxlbnQgZW5lcmd5IHRoYW4gdGhlIDxzdHJvbmc+UEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSByZXNpZGVudGlhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcIm5vX3BhMjk1X3Jlc19lY1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxzcGFuIGNsYXNzPVxcXCJkaWZmIFwiKTtfLmIoXy52KF8uZihcInJlc19ub19wYTI5NV9kaXJcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZihcInJlc19ub19wYTI5NV9wZXJjX2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJub19wYTI5NV9yZXNfZWNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvICA8c3Ryb25nPlwiKTtpZihfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwwLDMzNTUsMzM1OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiU0FWRVwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO18uYihfLnYoXy5mKFwicmVzX25vX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gbW9yZSBNTUJUVSBlcXVpdmFsZW50IGVuZXJneSB0aGFuIHRoZSA8c3Ryb25nPk5vIFBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgcmVzaWRlbnRpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJkYmxfcGEyOTVfcmVzX2VjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHNwYW4gY2xhc3M9XFxcImRpZmYgXCIpO18uYihfLnYoXy5mKFwicmVzX2RibF9wYTI5NV9kaXJcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZihcInJlc19kYmxfcGEyOTVfcGVyY19kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zcGFuPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwiZGJsX3BhMjk1X3Jlc19lY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gPHN0cm9uZz5cIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDAsMzgyOCwzODMyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTQVZFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO18uYihfLnYoXy5mKFwicmVzX2RibF9wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG1vcmUgTU1CVFUgZXF1aXZhbGVudCBlbmVyZ3kgdGhhbiB0aGUgPHN0cm9uZz5Eb3VibGUgUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSByZXNpZGVudGlhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgIGlkPVxcXCJyZXNpZGVudGlhbEVuZXJneUNvbnN1bXB0aW9uXFxcIiBjbGFzcz1cXFwicmVzaWRlbnRpYWxFbmVyZ3lDb25zdW1wdGlvblxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPHA+VGhlIHJlcG9ydHMgc2hvdyBlbmVyZ3kgY29uc3VtcHRpb24gaW4gdGhlIGZvbGxvd2luZyBzY2VuYXJpb3M6XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5OTyBQQSAyOTU8L3N0cm9uZz4gLSBUaGUgcmVzdWx0IG9mIGhhdmluZyBubyBFbmVyZ3kgRWZmaWNpZW5jeSBSZXNvdXJjZSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBjb250aW51ZXMgdG8gaW5jcmVhc2Ugd2l0aCBwb3B1bGF0aW9uIGFuZCBlbXBsb3ltZW50XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gLSBNaWNoaWdhbidzIGN1cnJlbnQgRW5lcmd5IEVmZmljaWVuY3kgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gaXMgcmVkdWNlZCwgZWFjaCB5ZWFyLCBieSAxJSBvZiB0aGUgcHJldmlvdXMgeWVhcidzIHRvdGFsICBjb25zdW1wdGlvbiwgYW5kIDEwJSBvZiBlbGVjdHJpY2l0eSBkZW1hbmQgY29tZXMgZnJvbSByZW5ld2FibGUgZW5lcmd5IHNvdXJjZXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPlBBIDI5NSBEb3VibGU8L3N0cm9uZz4gLSBUaGUgcmVzdWx0IG9mIGRvdWJsaW5nIE1pY2hpZ2FuJ3MgRW5lcmd5IEVmZmljaWVuY3kgUmVzb3VyY2UgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gaXMgcmVkdWNlZCwgZWFjaCB5ZWFyLCBieSAyJSBvZiB0aGUgcHJldmlvdXMgeWVhcidzIHRvdGFsIGNvbnN1bXB0aW9uLCBhbmQgMjAlIG9mIGVsZWN0cmljaXR5IGRlbWFuZCBjb21lcyBmcm9tIHJlbmV3YWJsZSBlbmVyZ3kgc291cmNlcy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImZ1ZWxDb3N0c1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIkluIE9jdG9iZXIgMjAwOCwgTWljaGlnYW4gZW5hY3RlZCB0aGUgPGEgaHJlZj1cXFwiaHR0cDovL3d3dy5sZWdpc2xhdHVyZS5taS5nb3YvKFMocTRlYjRqemlyMmczaGF6aHpobDF0ZDQ1KSkvbWlsZWcuYXNweD9wYWdlPWdldG9iamVjdCZvYmplY3ROYW1lPW1jbC1hY3QtMjk1LW9mLTIwMDhcXFwiPkNsZWFuLCBSZW5ld2FibGUsIGFuZCBFZmZpY2llbnQgRW5lcmd5IEFjdCwgUHVibGljIEFjdCAyOTU8L2E+IDxzdHJvbmc+KFBBIDI5NSk8L3N0cm9uZz4uIEEgZGVzY3JpcHRpb24gb2YgZWFjaCBzY2VuYXJpbyBpcyBwcm92aWRlZCBhdCB0aGUgYm90dG9tIG9mIHRoZSBwYWdlLiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+Q29tbWVyY2lhbCBGdWVsIENvc3RzIC0tIDIwMTIgRG9sbGFyczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImNob29zZXItZGl2XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJzZWwtbGFiZWxcXFwiPkNvbXBhcmUgeW91ciBwbGFuIHRvIHNjZW5hcmlvOjwvZGl2PjxzZWxlY3QgY2xhc3M9XFxcImNvbW0tY2hvc2VuLWZjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCw2NTEsNzA3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgPC9zZWxlY3Q+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcInBhMjk1X2NvbW1fZmNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIGhhdmUgZnVlbCBjb3N0cyB0aGF0IGFyZSA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgJFwiKTtfLmIoXy52KF8uZihcImNvbW1fcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDAsOTA0LDkwOSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTE9XRVJcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJISUdIRVJcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz4gdGhhbiB0aGUgPHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcIm5vX3BhMjk1X2NvbW1fZmNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIGhhdmUgZnVlbCBjb3N0cyB0aGF0IGFyZTxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAkXCIpO18uYihfLnYoXy5mKFwiY29tbV9ub19wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMCwxMjUxLDEyNTYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkxPV0VSXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSElHSEVSXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+ICB0aGFuIHRoZSA8c3Ryb25nPk5vIFBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgY29tbWVyY2lhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwiZGJsX3BhMjk1X2NvbW1fZmNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIGhhdmUgZnVlbCBjb3N0cyB0aGF0IGFyZSA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgJFwiKTtfLmIoXy52KF8uZihcImNvbW1fZGJsX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMCwxNjE1LDE2MjAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkxPV0VSXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIkhJR0hFUlwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPnRoYW4gdGhlIDxzdHJvbmc+RG91YmxlIFBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgY29tbWVyY2lhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiAgaWQ9XFxcImNvbW1lcmNpYWxGdWVsQ29zdHNcXFwiIGNsYXNzPVxcXCJjb21tZXJjaWFsRnVlbENvc3RzXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlJlc2lkZW50aWFsIEZ1ZWwgQ29zdHMgLS0gMjAxMiBEb2xsYXJzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcImNob29zZXItZGl2XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwic2VsLWxhYmVsXFxcIj5Db21wYXJlIHlvdXIgcGxhbiB0byBzY2VuYXJpbzo8L2Rpdj48c2VsZWN0IGNsYXNzPVxcXCJyZXMtY2hvc2VuLWZjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8b3B0aW9uIGNsYXNzPVxcXCJkZWZhdWx0LWNob3Nlbi1zZWxlY3Rpb25cXFwiIGxhYmVsPVxcXCJQQSAyOTVcXFwiPjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzY2VuYXJpb3NcIixjLHAsMSksYyxwLDAsMjIwMywyMjU1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIlwiKTtfLmIoXy52KF8uZChcIi5cIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZChcIi5cIixjLHAsMCkpKTtfLmIoXCI8L29wdGlvbj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcInBhMjk1X3Jlc19mY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gaGF2ZSBmdWVsIGNvc3RzIHRoYXQgYXJlIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAkXCIpO18uYihfLnYoXy5mKFwicmVzX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDAsMjQ0NSwyNDUwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJMT1dFUlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSElHSEVSXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+IHRoYW4gdGhlIDxzdHJvbmc+UEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSByZXNpZGVudGlhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibm9fcGEyOTVfcmVzX2ZjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byBoYXZlIGZ1ZWwgY29zdHMgdGhhdCBhcmU8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgJFwiKTtfLmIoXy52KF8uZihcInJlc19ub19wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwwLDI3ODcsMjc5MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTE9XRVJcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIkhJR0hFUlwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPiAgdGhhbiB0aGUgPHN0cm9uZz5ObyBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfcmVzX2ZjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byBoYXZlIGZ1ZWwgY29zdHMgdGhhdCBhcmUgPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICRcIik7Xy5iKF8udihfLmYoXCJyZXNfZGJsX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1XCIsYyxwLDEpLGMscCwwLDMxNDYsMzE1MSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTE9XRVJcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJISUdIRVJcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz50aGFuIHRoZSA8c3Ryb25nPkRvdWJsZSBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2ICBpZD1cXFwicmVzaWRlbnRpYWxGdWVsQ29zdHNcXFwiIGNsYXNzPVxcXCJyZXNpZGVudGlhbEZ1ZWxDb3N0c1xcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPHA+VGhlIHJlcG9ydHMgc2hvdyBmdWVsIGNvc3RzIGluIHRoZSBmb2xsb3dpbmcgc2NlbmFyaW9zOlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+Tk8gUEEgMjk1PC9zdHJvbmc+IC0gVGhlIHJlc3VsdCBvZiBoYXZpbmcgbm8gRW5lcmd5IEVmZmljaWVuY3kgUmVzb3VyY2UgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gY29udGludWVzIHRvIGluY3JlYXNlIHdpdGggcG9wdWxhdGlvbiBhbmQgZW1wbG95bWVudFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+UEEgMjk1PC9zdHJvbmc+IC0gTWljaGlnYW4ncyBjdXJyZW50IEVuZXJneSBFZmZpY2llbmN5IGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGlzIHJlZHVjZWQsIGVhY2ggeWVhciwgYnkgMSUgb2YgdGhlIHByZXZpb3VzIHllYXIncyB0b3RhbCAgY29uc3VtcHRpb24sIGFuZCAxMCUgb2YgZWxlY3RyaWNpdHkgZGVtYW5kIGNvbWVzIGZyb20gcmVuZXdhYmxlIGVuZXJneSBzb3VyY2VzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5QQSAyOTUgRG91YmxlPC9zdHJvbmc+IC0gVGhlIHJlc3VsdCBvZiBkb3VibGluZyBNaWNoaWdhbidzIEVuZXJneSBFZmZpY2llbmN5IFJlc291cmNlIGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGlzIHJlZHVjZWQsIGVhY2ggeWVhciwgYnkgMiUgb2YgdGhlIHByZXZpb3VzIHllYXIncyB0b3RhbCBjb25zdW1wdGlvbiwgYW5kIDIwJSBvZiBlbGVjdHJpY2l0eSBkZW1hbmQgY29tZXMgZnJvbSByZW5ld2FibGUgZW5lcmd5IHNvdXJjZXMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9wPlwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJncmVlbmhvdXNlR2FzZXNcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiSW4gT2N0b2JlciAyMDA4LCBNaWNoaWdhbiBlbmFjdGVkIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmxlZ2lzbGF0dXJlLm1pLmdvdi8oUyhxNGViNGp6aXIyZzNoYXpoemhsMXRkNDUpKS9taWxlZy5hc3B4P3BhZ2U9Z2V0b2JqZWN0Jm9iamVjdE5hbWU9bWNsLWFjdC0yOTUtb2YtMjAwOFxcXCI+Q2xlYW4sIFJlbmV3YWJsZSwgYW5kIEVmZmljaWVudCBFbmVyZ3kgQWN0LCBQdWJsaWMgQWN0IDI5NTwvYT4gPHN0cm9uZz4oUEEgMjk1KTwvc3Ryb25nPi4gQSBkZXNjcmlwdGlvbiBvZiBlYWNoIHNjZW5hcmlvIGlzIHByb3ZpZGVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHBhZ2UuIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5Db21tZXJjaWFsIEdIRydzIC0tIENPPHN1Yj4yPC9zdWI+LWUgRXF1aXZhbGVudDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImNob29zZXItZGl2XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJzZWwtbGFiZWxcXFwiPkNvbXBhcmUgeW91ciBwbGFuIHRvIHNjZW5hcmlvOjwvZGl2PjxzZWxlY3QgY2xhc3M9XFxcImNvbW0tY2hvc2VuLWdoZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8b3B0aW9uIGNsYXNzPVxcXCJkZWZhdWx0LWNob3Nlbi1zZWxlY3Rpb25cXFwiIGxhYmVsPVxcXCJQQSAyOTVcXFwiPjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzY2VuYXJpb3NcIixjLHAsMSksYyxwLDAsNjYxLDcxNyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIlwiKTtfLmIoXy52KF8uZChcIi5cIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZChcIi5cIixjLHAsMCkpKTtfLmIoXCI8L29wdGlvbj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICAgIDwvc2VsZWN0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJwYTI5NV9jb21tX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG88c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwwLDg2Niw4NzIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlJFRFVDRVwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIklOQ1JFQVNFIFwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPiBHSEdzIGJ5IDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwiY29tbV9wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IENPMi1lIGNvbXBhcmVkIHRvIHRoZSA8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgY29tbWVyY2lhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibm9fcGEyOTVfY29tbV9naGdcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMCwxMjI5LDEyMzUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlJFRFVDRVwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIklOQ1JFQVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+IEdIR3MgYnkgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb21tX25vX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gQ08yLWUgY29tcGFyZWQgdG8gdGhlIDxzdHJvbmc+Tm8gUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfY29tbV9naGdcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvICA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XCIsYyxwLDEpLGMscCwwLDE2MDksMTYxNSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiUkVEVUNFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIklOQ1JFQVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+R0hHcyBieSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvbW1fZGJsX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gQ08yLWUgY29tcGFyZWQgdG8gdGhlIDxzdHJvbmc+RG91YmxlIFBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgY29tbWVyY2lhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgIGlkPVxcXCJjb21tZXJjaWFsR3JlZW5ob3VzZUdhc2VzXFxcIiBjbGFzcz1cXFwiY29tbWVyY2lhbEdyZWVuaG91c2VHYXNlc1xcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5SZXNpZGVudGlhbCBHSEcncyAtLSBDTzxzdWI+Mjwvc3ViPi1lIEVxdWl2YWxlbnQ8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJjaG9vc2VyLWRpdlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwic2VsLWxhYmVsXFxcIj5Db21wYXJlIHlvdXIgcGxhbiB0byBzY2VuYXJpbzo8L2Rpdj48c2VsZWN0IGNsYXNzPVxcXCJyZXMtY2hvc2VuLWdoZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8b3B0aW9uIGNsYXNzPVxcXCJkZWZhdWx0LWNob3Nlbi1zZWxlY3Rpb25cXFwiIGxhYmVsPVxcXCJQQSAyOTVcXFwiPjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzY2VuYXJpb3NcIixjLHAsMSksYyxwLDAsMjI5MiwyMzQ4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgPC9zZWxlY3Q+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcInBhMjk1X3Jlc19naGdcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDAsMjQ5OCwyNTA0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJSRURVQ0VcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIklOQ1JFQVNFIFwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPiBHSEdzIGJ5IDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwicmVzX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gQ08yLWUgY29tcGFyZWQgdG8gdGhlIDxzdHJvbmc+UEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSByZXNpZGVudGlhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibm9fcGEyOTVfcmVzX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwwLDI4NTMsMjg1OSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiUkVEVUNFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJJTkNSRUFTRVwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPiBHSEdzIGJ5IDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwicmVzX25vX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gQ08yLWUgY29tcGFyZWQgdG8gdGhlIDxzdHJvbmc+Tm8gUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSByZXNpZGVudGlhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwiZGJsX3BhMjk1X3Jlc19naGdcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvICA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDAsMzIyOCwzMjM0LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJSRURVQ0VcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJJTkNSRUFTRVwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPkdIR3MgYnkgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJyZXNfZGJsX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gQ08yLWUgY29tcGFyZWQgdG8gdGhlIDxzdHJvbmc+RG91YmxlIFBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgcmVzaWRlbnRpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgaWQ9XFxcInJlc2lkZW50aWFsR3JlZW5ob3VzZUdhc2VzXFxcIiBjbGFzcz1cXFwicmVzaWRlbnRpYWxHcmVlbmhvdXNlR2FzZXNcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxwPlRoZSByZXBvcnRzIHNob3cgZ3JlZW5ob3VzZSBnYXMgZW1pc3Npb25zIGluIHRoZSBmb2xsb3dpbmcgc2NlbmFyaW9zOlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+Tk8gUEEgMjk1PC9zdHJvbmc+IC0gVGhlIHJlc3VsdCBvZiBoYXZpbmcgbm8gRW5lcmd5IEVmZmljaWVuY3kgUmVzb3VyY2UgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gY29udGludWVzIHRvIGluY3JlYXNlIHdpdGggcG9wdWxhdGlvbiBhbmQgZW1wbG95bWVudFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+UEEgMjk1PC9zdHJvbmc+IC0gTWljaGlnYW4ncyBjdXJyZW50IEVuZXJneSBFZmZpY2llbmN5IGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGlzIHJlZHVjZWQsIGVhY2ggeWVhciwgYnkgMSUgb2YgdGhlIHByZXZpb3VzIHllYXIncyB0b3RhbCAgY29uc3VtcHRpb24sIGFuZCAxMCUgb2YgZWxlY3RyaWNpdHkgZGVtYW5kIGNvbWVzIGZyb20gcmVuZXdhYmxlIGVuZXJneSBzb3VyY2VzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5QQSAyOTUgRG91YmxlPC9zdHJvbmc+IC0gVGhlIHJlc3VsdCBvZiBkb3VibGluZyBNaWNoaWdhbidzIEVuZXJneSBFZmZpY2llbmN5IFJlc291cmNlIGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGlzIHJlZHVjZWQsIGVhY2ggeWVhciwgYnkgMiUgb2YgdGhlIHByZXZpb3VzIHllYXIncyB0b3RhbCBjb25zdW1wdGlvbiwgYW5kIDIwJSBvZiBlbGVjdHJpY2l0eSBkZW1hbmQgY29tZXMgZnJvbSByZW5ld2FibGUgZW5lcmd5IHNvdXJjZXMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9wPlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG5cbmlmKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB0aGlzW1wiVGVtcGxhdGVzXCJdO1xufSJdfQ==
