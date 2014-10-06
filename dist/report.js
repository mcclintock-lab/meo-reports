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
    var attributes, ch, comFC, com_chart, com_dblpa, com_nopa, com_pa, com_user, com_user_savings, comm_dbl_pa295_diff, comm_dbl_pa295_perc_diff, comm_dbl_pa295_total_fc, comm_has_savings_dbl_pa295, comm_has_savings_no_pa295, comm_has_savings_pa295, comm_no_pa295_diff, comm_no_pa295_perc_diff, comm_no_pa295_total_fc, comm_pa295_diff, comm_pa295_perc_diff, comm_pa295_total_fc, comm_sum, context, d3IsPresent, e, h, halfh, halfw, margin, msg, resFC, res_chart, res_dbl_pa295_diff, res_dbl_pa295_perc_diff, res_dbl_pa295_total_fc, res_dblpa, res_has_savings_dbl_pa295, res_has_savings_no_pa295, res_has_savings_pa295, res_no_pa295_diff, res_no_pa295_perc_diff, res_no_pa295_total_fc, res_nopa, res_pa, res_pa295_diff, res_pa295_perc_diff, res_pa295_total_fc, res_sum, res_user, res_user_savings, scenarios, sorted_comm_results, sorted_res_results, totalh, totalw, w,
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
      res_pa295_perc_diff = Math.round((Math.abs(res_pa295_diff) / res_sum) * 100, 0);
      res_has_savings_pa295 = res_pa295_diff > 0;
      if (!res_has_savings_pa295) {
        res_pa295_diff = Math.abs(res_pa295_diff);
      }
      res_pa295_diff = this.addCommas(res_pa295_diff);
      res_no_pa295_diff = Math.round(res_no_pa295_total_fc - res_sum, 0);
      res_no_pa295_perc_diff = Math.round((Math.abs(res_no_pa295_diff) / res_sum) * 100, 0);
      res_has_savings_no_pa295 = res_no_pa295_diff > 0;
      if (!res_has_savings_no_pa295) {
        res_no_pa295_diff = Math.abs(res_no_pa295_diff);
      }
      res_no_pa295_diff = this.addCommas(res_no_pa295_diff);
      res_dbl_pa295_diff = Math.round(res_dbl_pa295_total_fc - res_sum, 0);
      res_dbl_pa295_perc_diff = Math.round((Math.abs(res_dbl_pa295_diff) / res_sum) * 100, 0);
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
      comm_pa295_perc_diff = Math.round((Math.abs(comm_pa295_diff) / comm_sum) * 100, 0);
      comm_has_savings_pa295 = comm_pa295_diff > 0;
      if (!comm_has_savings_pa295) {
        comm_pa295_diff = Math.abs(comm_pa295_diff);
      }
      comm_pa295_diff = this.addCommas(comm_pa295_diff);
      comm_no_pa295_diff = Math.round(comm_no_pa295_total_fc - comm_sum, 0);
      comm_no_pa295_perc_diff = Math.round((Math.abs(comm_no_pa295_diff) / comm_sum) * 100, 0);
      comm_has_savings_no_pa295 = comm_no_pa295_diff > 0;
      if (!comm_has_savings_no_pa295) {
        comm_no_pa295_diff = Math.abs(comm_no_pa295_diff);
      }
      comm_no_pa295_diff = this.addCommas(comm_no_pa295_diff);
      comm_dbl_pa295_diff = Math.round(comm_dbl_pa295_total_fc - comm_sum, 0);
      comm_dbl_pa295_perc_diff = Math.round((Math.abs(comm_dbl_pa295_diff) / comm_sum) * 100, 0);
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
      comm_dbl_pa295_perc_diff: comm_dbl_pa295_perc_diff
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
    var attributes, ch, comGHG, com_chart, com_dblpa, com_nopa, com_pa, com_user, com_user_savings, comm_dbl_pa295_diff, comm_dbl_pa295_perc_diff, comm_dbl_pa295_total_ghg, comm_has_savings_dbl_pa295, comm_has_savings_no_pa295, comm_has_savings_pa295, comm_no_pa295_diff, comm_no_pa295_perc_diff, comm_no_pa295_total_ghg, comm_pa295_diff, comm_pa295_perc_diff, comm_pa295_total_ghg, comm_sum, context, d3IsPresent, e, h, halfh, halfw, margin, resGHG, res_chart, res_dbl_pa295_diff, res_dbl_pa295_perc_diff, res_dbl_pa295_total_ghg, res_dblpa, res_has_savings_dbl_pa295, res_has_savings_no_pa295, res_has_savings_pa295, res_no_pa295_diff, res_no_pa295_perc_diff, res_no_pa295_total_ghg, res_nopa, res_pa, res_pa295_diff, res_pa295_perc_diff, res_pa295_total_ghg, res_sum, res_user, res_user_savings, scenarios, sorted_comm_results, sorted_res_results, totalh, totalw, w,
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
      res_pa295_perc_diff = Math.round((Math.abs(res_pa295_diff) / res_sum) * 100, 0);
      res_has_savings_pa295 = res_pa295_diff > 0;
      if (!res_has_savings_pa295) {
        res_pa295_diff = Math.abs(res_pa295_diff);
      }
      res_pa295_diff = this.addCommas(res_pa295_diff);
      res_no_pa295_diff = Math.round(res_no_pa295_total_ghg - res_sum, 0);
      res_no_pa295_perc_diff = Math.round((Math.abs(res_no_pa295_diff) / res_sum) * 100, 0);
      res_has_savings_no_pa295 = res_no_pa295_diff > 0;
      if (!res_has_savings_no_pa295) {
        res_no_pa295_diff = Math.abs(res_no_pa295_diff);
      }
      res_no_pa295_diff = this.addCommas(res_no_pa295_diff);
      res_dbl_pa295_diff = Math.round(res_dbl_pa295_total_ghg - res_sum, 0);
      res_dbl_pa295_perc_diff = Math.round((Math.abs(res_dbl_pa295_diff) / res_sum) * 100, 0);
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
      comm_pa295_perc_diff = Math.round((Math.abs(comm_pa295_diff) / comm_sum) * 100, 0);
      comm_has_savings_pa295 = comm_pa295_diff > 0;
      if (!comm_has_savings_pa295) {
        comm_pa295_diff = Math.abs(comm_pa295_diff);
      }
      comm_pa295_diff = this.addCommas(comm_pa295_diff);
      comm_no_pa295_diff = Math.round(comm_no_pa295_total_ghg - comm_sum, 0);
      comm_no_pa295_perc_diff = Math.round((Math.abs(comm_no_pa295_diff) / comm_sum) * 100, 0);
      comm_has_savings_no_pa295 = comm_no_pa295_diff > 0;
      if (!comm_has_savings_no_pa295) {
        comm_no_pa295_diff = Math.abs(comm_no_pa295_diff);
      }
      comm_no_pa295_diff = this.addCommas(comm_no_pa295_diff);
      comm_dbl_pa295_diff = Math.round(comm_dbl_pa295_total_ghg - comm_sum, 0);
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
      comm_dbl_pa295_perc_diff: comm_dbl_pa295_perc_diff
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


},{"./energyConsumption.coffee":11,"./fuelCosts.coffee":12,"./greenhouseGases.coffee":13}],"reportGraphTab":[function(require,module,exports){
module.exports=require('/1HLUW');
},{}],"/1HLUW":[function(require,module,exports){
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
    pacolor = "#4682B4";
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


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":17,"reportTab":"a21iR2"}],17:[function(require,module,exports){
this["Templates"] = this["Templates"] || {};
this["Templates"]["energyConsumption"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("\n" + i);_.b("<p>");_.b("\n" + i);_.b("	In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong> A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial Energy Consumption -- MMBTU Equivalent</h4>");_.b("\n" + i);_.b("  <div class=\"chooser-div\">");_.b("\n" + i);_.b("    <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"comm-chosen-ec\">");_.b("\n" + i);_.b("      <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,656,708,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("    </select>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"pa295_comm_ec\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("comm_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("comm_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"pa295_comm_ec\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,0,967,971,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("comm_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"no_pa295_comm_ec\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("comm_no_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("comm_no_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"no_pa295_comm_ec\">By 2035, your energy plan is estimated to  <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,0,1432,1436,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("comm_no_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>No PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"dbl_pa295_comm_ec\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("comm_dbl_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("comm_dbl_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_comm_ec\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,0,1916,1920,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("comm_dbl_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>Double PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div  id=\"commercialEnergyConsumption\" class=\"commercialEnergyConsumption\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential Energy Consumption -- MMBTU Equivalent</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"res-chosen-ec\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,2589,2645,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"pa295_res_ec\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("res_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("res_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"pa295_res_ec\">By 2035, your energy plan is estimated to <strong>");if(_.s(_.f("res_has_savings_pa295",c,p,1),c,p,0,2901,2905,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("res_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"no_pa295_res_ec\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("res_no_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("res_no_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"no_pa295_res_ec\">By 2035, your energy plan is estimated to  <strong>");if(_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,0,3355,3359,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("res_no_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>No PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"dbl_pa295_res_ec\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("res_dbl_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("res_dbl_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_res_ec\">By 2035, your energy plan is estimated to <strong>");if(_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,0,3828,3832,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("res_dbl_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>Double PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"residentialEnergyConsumption\" class=\"residentialEnergyConsumption\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show energy consumption in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["fuelCosts"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("\n" + i);_.b("<p>");_.b("\n" + i);_.b("In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong>. A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial Fuel Costs -- 2012 Dollars</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"comm-chosen-fc\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,651,707,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  <div class=\"pa295_comm_fc\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("comm_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("comm_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"pa295_comm_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("comm_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,0,1017,1022,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong> than the <strong>PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <div class=\"no_pa295_comm_fc\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("comm_no_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("comm_no_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"no_pa295_comm_fc\">By 2035, your energy plan is estimated to have fuel costs that are<strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("comm_no_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,0,1486,1491,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>  than the <strong>No PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <div class=\"dbl_pa295_comm_fc\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("comm_dbl_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("comm_dbl_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_comm_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("comm_dbl_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,0,1975,1980,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>than the <strong>Double PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div  id=\"commercialFuelCosts\" class=\"commercialFuelCosts\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential Fuel Costs -- 2012 Dollars</h4>");_.b("\n" + i);_.b("  <div class=\"chooser-div\">");_.b("\n" + i);_.b("    <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"res-chosen-fc\">");_.b("\n" + i);_.b("      <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,2563,2615,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("    </select>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <div class=\"pa295_res_fc\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("res_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("res_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"pa295_res_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("res_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_pa295",c,p,1),c,p,0,2915,2920,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong> than the <strong>PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <div class=\"no_pa295_res_fc\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("res_no_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("res_no_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"no_pa295_res_fc\">By 2035, your energy plan is estimated to have fuel costs that are<strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("res_no_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,0,3376,3381,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>  than the <strong>No PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <div class=\"dbl_pa295_res_fc\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("res_dbl_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("res_dbl_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_res_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("res_dbl_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,0,3857,3862,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>than the <strong>Double PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div  id=\"residentialFuelCosts\" class=\"residentialFuelCosts\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show fuel costs in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");return _.fl();;});
this["Templates"]["greenhouseGases"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<p>");_.b("\n" + i);_.b("In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong>. A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial GHG's -- CO<sub>2</sub>-e Equivalent</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"comm-chosen-ghg\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,661,717,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  <div class=\"pa295_comm_ghg\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("comm_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("comm_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"pa295_comm_ghg\">By 2035, your energy plan is estimated to<strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,0,980,986,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE ");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("comm_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"no_pa295_comm_ghg\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("comm_no_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("comm_no_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"no_pa295_comm_ghg\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,0,1467,1473,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("comm_no_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>No PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"dbl_pa295_comm_ghg\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("comm_dbl_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("comm_dbl_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_comm_ghg\">By 2035, your energy plan is estimated to  <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,0,1971,1977,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong>GHGs by <strong>");_.b(_.v(_.f("comm_dbl_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>Double PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"commercialGreenhouseGases\" class=\"commercialGreenhouseGases\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential GHG's -- CO<sub>2</sub>-e Equivalent</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"res-chosen-ghg\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,2654,2710,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"pa295_res_ghg\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("res_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("res_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"pa295_res_ghg\">By 2035, your energy plan is estimated to<strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_pa295",c,p,1),c,p,0,2969,2975,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE ");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("res_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <div class=\"no_pa295_res_ghg\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("res_no_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("res_no_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"no_pa295_res_ghg\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,0,3444,3450,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("res_no_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>No PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("  <div class=\"dbl_pa295_res_ghg\">");_.b("\n" + i);_.b("    <span class=\"diff ");_.b(_.v(_.f("res_dbl_pa295_dir",c,p,0)));_.b("\">");_.b(_.v(_.f("res_dbl_pa295_perc_diff",c,p,0)));_.b("</span>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_res_ghg\">By 2035, your energy plan is estimated to  <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,0,3940,3946,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong>GHGs by <strong>");_.b(_.v(_.f("res_dbl_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>Double PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div id=\"residentialGreenhouseGases\" class=\"residentialGreenhouseGases\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show greenhouse gas emissions in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");_.b("\n");return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[14])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL2VuYWJsZUxheWVyVG9nZ2xlcnMuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9tZW8tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy9qb2JJdGVtLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0UmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL3JlcG9ydFRhYi5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL3V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL3NjcmlwdHMvZW5lcmd5Q29uc3VtcHRpb24uY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9tZW8tcmVwb3J0cy9zY3JpcHRzL2Z1ZWxDb3N0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL3NjcmlwdHMvZ3JlZW5ob3VzZUdhc2VzLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvc2NyaXB0cy9yZXBvcnQuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9tZW8tcmVwb3J0cy9zY3JpcHRzL3JlcG9ydEdyYXBoVGFiLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBLENBQU8sQ0FBVSxDQUFBLEdBQVgsQ0FBTixFQUFrQjtDQUNoQixLQUFBLDJFQUFBO0NBQUEsQ0FBQSxDQUFBO0NBQUEsQ0FDQSxDQUFBLEdBQVk7Q0FEWixDQUVBLENBQUEsR0FBTTtBQUNDLENBQVAsQ0FBQSxDQUFBLENBQUE7Q0FDRSxFQUFBLENBQUEsR0FBTyxxQkFBUDtDQUNBLFNBQUE7SUFMRjtDQUFBLENBTUEsQ0FBVyxDQUFBLElBQVgsYUFBVztDQUVYO0NBQUEsTUFBQSxvQ0FBQTt3QkFBQTtDQUNFLEVBQVcsQ0FBWCxHQUFXLENBQVg7Q0FBQSxFQUNTLENBQVQsRUFBQSxFQUFpQixLQUFSO0NBQ1Q7Q0FDRSxFQUFPLENBQVAsRUFBQSxVQUFPO0NBQVAsRUFDTyxDQUFQLENBREEsQ0FDQTtBQUMrQixDQUYvQixDQUU4QixDQUFFLENBQWhDLEVB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QSxRQUFBLHNDQUFBO3dCQUFBO0NBQ0UsR0FBRyxDQUFVLENBQWI7Q0FDRSxNQUFBLFFBQVE7Q0FDRCxHQUFELENBQVUsQ0FGbEIsRUFBQTtDQUdFLFFBQUEsTUFBTztDQUNBLEdBQUQsQ0FBVSxDQUpsQixDQUFBLENBQUE7Q0FLRSxTQUFBLEtBQU87TUFMVCxFQUFBO0NBT0UsS0FBQSxTQUFPO1FBUlg7Q0FBQSxJQUplO0NBcGFqQixFQW9haUI7O0NBcGFqQixDQW9iQSxDQUFhLE1BQUMsQ0FBZDtDQUNFLEdBQUEsSUFBQTtDQUFBLEVBQUksQ0FBSjtDQUFBLENBQ21CLENBQVosQ0FBUCxDQUFPO0NBQ1AsRUFBbUIsQ0FBbkI7Q0FBQSxFQUFPLENBQVAsRUFBQTtNQUZBO0NBQUEsRUFHTyxDQUFQO0NBQ0csQ0FBRCxDQUFTLENBQUEsRUFBWCxLQUFBO0NBemJGLEVBb2JhOztDQXBiYjs7Q0FGMkI7O0FBNmI3QixDQXJjQSxFQXFjaUIsR0FBWCxDQUFOLE9BcmNBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIixudWxsLCJtb2R1bGUuZXhwb3J0cyA9IChlbCkgLT5cbiAgJGVsID0gJCBlbFxuICBhcHAgPSB3aW5kb3cuYXBwXG4gIHRvYyA9IGFwcC5nZXRUb2MoKVxuICB1bmxlc3MgdG9jXG4gICAgY29uc29sZS5sb2cgJ05vIHRhYmxlIG9mIGNvbnRlbnRzIGZvdW5kJ1xuICAgIHJldHVyblxuICB0b2dnbGVycyA9ICRlbC5maW5kKCdhW2RhdGEtdG9nZ2xlLW5vZGVdJylcbiAgIyBTZXQgaW5pdGlhbCBzdGF0ZVxuICBmb3IgdG9nZ2xlciBpbiB0b2dnbGVycy50b0FycmF5KClcbiAgICAkdG9nZ2xlciA9ICQodG9nZ2xlcilcbiAgICBub2RlaWQgPSAkdG9nZ2xlci5kYXRhKCd0b2dnbGUtbm9kZScpXG4gICAgdHJ5XG4gICAgICB2aWV3ID0gdG9jLmdldENoaWxkVmlld0J5SWQgbm9kZWlkXG4gICAgICBub2RlID0gdmlldy5tb2RlbFxuICAgICAgJHRvZ2dsZXIuYXR0ciAnZGF0YS12aXNpYmxlJywgISFub2RlLmdldCgndmlzaWJsZScpXG4gICAgICAkdG9nZ2xlci5kYXRhICd0b2NJdGVtJywgdmlld1xuICAgIGNhdGNoIGVcbiAgICAgICR0b2dnbGVyLmF0dHIgJ2RhdGEtbm90LWZvdW5kJywgJ3RydWUnXG5cbiAgdG9nZ2xlcnMub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgJGVsID0gJChlLnRhcmdldClcbiAgICB2aWV3ID0gJGVsLmRhdGEoJ3RvY0l0ZW0nKVxuICAgIGlmIHZpZXdcbiAgICAgIHZpZXcudG9nZ2xlVmlzaWJpbGl0eShlKVxuICAgICAgJGVsLmF0dHIgJ2RhdGEtdmlzaWJsZScsICEhdmlldy5tb2RlbC5nZXQoJ3Zpc2libGUnKVxuICAgIGVsc2VcbiAgICAgIGFsZXJ0IFwiTGF5ZXIgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IFRhYmxlIG9mIENvbnRlbnRzLiBcXG5FeHBlY3RlZCBub2RlaWQgI3skZWwuZGF0YSgndG9nZ2xlLW5vZGUnKX1cIlxuIiwiY2xhc3MgSm9iSXRlbSBleHRlbmRzIEJhY2tib25lLlZpZXdcbiAgY2xhc3NOYW1lOiAncmVwb3J0UmVzdWx0J1xuICBldmVudHM6IHt9XG4gIGJpbmRpbmdzOlxuICAgIFwiaDYgYVwiOlxuICAgICAgb2JzZXJ2ZTogXCJzZXJ2aWNlTmFtZVwiXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICBuYW1lOiAnaHJlZidcbiAgICAgICAgb2JzZXJ2ZTogJ3NlcnZpY2VVcmwnXG4gICAgICB9XVxuICAgIFwiLnN0YXJ0ZWRBdFwiOlxuICAgICAgb2JzZXJ2ZTogW1wic3RhcnRlZEF0XCIsIFwic3RhdHVzXCJdXG4gICAgICB2aXNpYmxlOiAoKSAtPlxuICAgICAgICBAbW9kZWwuZ2V0KCdzdGF0dXMnKSBub3QgaW4gWydjb21wbGV0ZScsICdlcnJvciddXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICBvbkdldDogKCkgLT5cbiAgICAgICAgaWYgQG1vZGVsLmdldCgnc3RhcnRlZEF0JylcbiAgICAgICAgICByZXR1cm4gXCJTdGFydGVkIFwiICsgbW9tZW50KEBtb2RlbC5nZXQoJ3N0YXJ0ZWRBdCcpKS5mcm9tTm93KCkgKyBcIi4gXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiXCJcbiAgICBcIi5zdGF0dXNcIjogICAgICBcbiAgICAgIG9ic2VydmU6IFwic3RhdHVzXCJcbiAgICAgIG9uR2V0OiAocykgLT5cbiAgICAgICAgc3dpdGNoIHNcbiAgICAgICAgICB3aGVuICdwZW5kaW5nJ1xuICAgICAgICAgICAgXCJ3YWl0aW5nIGluIGxpbmVcIlxuICAgICAgICAgIHdoZW4gJ3J1bm5pbmcnXG4gICAgICAgICAgICBcInJ1bm5pbmcgYW5hbHl0aWNhbCBzZXJ2aWNlXCJcbiAgICAgICAgICB3aGVuICdjb21wbGV0ZSdcbiAgICAgICAgICAgIFwiY29tcGxldGVkXCJcbiAgICAgICAgICB3aGVuICdlcnJvcidcbiAgICAgICAgICAgIFwiYW4gZXJyb3Igb2NjdXJyZWRcIlxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNcbiAgICBcIi5xdWV1ZUxlbmd0aFwiOiBcbiAgICAgIG9ic2VydmU6IFwicXVldWVMZW5ndGhcIlxuICAgICAgb25HZXQ6ICh2KSAtPlxuICAgICAgICBzID0gXCJXYWl0aW5nIGJlaGluZCAje3Z9IGpvYlwiXG4gICAgICAgIGlmIHYubGVuZ3RoID4gMVxuICAgICAgICAgIHMgKz0gJ3MnXG4gICAgICAgIHJldHVybiBzICsgXCIuIFwiXG4gICAgICB2aXNpYmxlOiAodikgLT5cbiAgICAgICAgdj8gYW5kIHBhcnNlSW50KHYpID4gMFxuICAgIFwiLmVycm9yc1wiOlxuICAgICAgb2JzZXJ2ZTogJ2Vycm9yJ1xuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgdmlzaWJsZTogKHYpIC0+XG4gICAgICAgIHY/Lmxlbmd0aCA+IDJcbiAgICAgIG9uR2V0OiAodikgLT5cbiAgICAgICAgaWYgdj9cbiAgICAgICAgICBKU09OLnN0cmluZ2lmeSh2LCBudWxsLCAnICAnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQG1vZGVsKSAtPlxuICAgIHN1cGVyKClcblxuICByZW5kZXI6ICgpIC0+XG4gICAgQCRlbC5odG1sIFwiXCJcIlxuICAgICAgPGg2PjxhIGhyZWY9XCIjXCIgdGFyZ2V0PVwiX2JsYW5rXCI+PC9hPjxzcGFuIGNsYXNzPVwic3RhdHVzXCI+PC9zcGFuPjwvaDY+XG4gICAgICA8ZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz1cInN0YXJ0ZWRBdFwiPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJxdWV1ZUxlbmd0aFwiPjwvc3Bhbj5cbiAgICAgICAgPHByZSBjbGFzcz1cImVycm9yc1wiPjwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgQHN0aWNraXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEpvYkl0ZW0iLCJjbGFzcyBSZXBvcnRSZXN1bHRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG4gIGRlZmF1bHRQb2xsaW5nSW50ZXJ2YWw6IDMwMDBcblxuICBjb25zdHJ1Y3RvcjogKEBza2V0Y2gsIEBkZXBzKSAtPlxuICAgIEB1cmwgPSB1cmwgPSBcIi9yZXBvcnRzLyN7QHNrZXRjaC5pZH0vI3tAZGVwcy5qb2luKCcsJyl9XCJcbiAgICBzdXBlcigpXG5cbiAgcG9sbDogKCkgPT5cbiAgICBAZmV0Y2gge1xuICAgICAgc3VjY2VzczogKCkgPT5cbiAgICAgICAgQHRyaWdnZXIgJ2pvYnMnXG4gICAgICAgIGZvciByZXN1bHQgaW4gQG1vZGVsc1xuICAgICAgICAgIGlmIHJlc3VsdC5nZXQoJ3N0YXR1cycpIG5vdCBpbiBbJ2NvbXBsZXRlJywgJ2Vycm9yJ11cbiAgICAgICAgICAgIHVubGVzcyBAaW50ZXJ2YWxcbiAgICAgICAgICAgICAgQGludGVydmFsID0gc2V0SW50ZXJ2YWwgQHBvbGwsIEBkZWZhdWx0UG9sbGluZ0ludGVydmFsXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBjb25zb2xlLmxvZyBAbW9kZWxzWzBdLmdldCgncGF5bG9hZFNpemVCeXRlcycpXG4gICAgICAgICAgcGF5bG9hZFNpemUgPSBNYXRoLnJvdW5kKCgoQG1vZGVsc1swXS5nZXQoJ3BheWxvYWRTaXplQnl0ZXMnKSBvciAwKSAvIDEwMjQpICogMTAwKSAvIDEwMFxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRmVhdHVyZVNldCBzZW50IHRvIEdQIHdlaWdoZWQgaW4gYXQgI3twYXlsb2FkU2l6ZX1rYlwiXG4gICAgICAgICMgYWxsIGNvbXBsZXRlIHRoZW5cbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGludGVydmFsKSBpZiBAaW50ZXJ2YWxcbiAgICAgICAgaWYgcHJvYmxlbSA9IF8uZmluZChAbW9kZWxzLCAocikgLT4gci5nZXQoJ2Vycm9yJyk/KVxuICAgICAgICAgIEB0cmlnZ2VyICdlcnJvcicsIFwiUHJvYmxlbSB3aXRoICN7cHJvYmxlbS5nZXQoJ3NlcnZpY2VOYW1lJyl9IGpvYlwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdHJpZ2dlciAnZmluaXNoZWQnXG4gICAgICBlcnJvcjogKGUsIHJlcywgYSwgYikgPT5cbiAgICAgICAgdW5sZXNzIHJlcy5zdGF0dXMgaXMgMFxuICAgICAgICAgIGlmIHJlcy5yZXNwb25zZVRleHQ/Lmxlbmd0aFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgIGpzb24gPSBKU09OLnBhcnNlKHJlcy5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgICAjIGRvIG5vdGhpbmdcbiAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAaW50ZXJ2YWwpIGlmIEBpbnRlcnZhbFxuICAgICAgICAgIEB0cmlnZ2VyICdlcnJvcicsIGpzb24/LmVycm9yPy5tZXNzYWdlIG9yXG4gICAgICAgICAgICAnUHJvYmxlbSBjb250YWN0aW5nIHRoZSBTZWFTa2V0Y2ggc2VydmVyJ1xuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRSZXN1bHRzXG4iLCJlbmFibGVMYXllclRvZ2dsZXJzID0gcmVxdWlyZSAnLi9lbmFibGVMYXllclRvZ2dsZXJzLmNvZmZlZSdcbnJvdW5kID0gcmVxdWlyZSgnLi91dGlscy5jb2ZmZWUnKS5yb3VuZFxuUmVwb3J0UmVzdWx0cyA9IHJlcXVpcmUgJy4vcmVwb3J0UmVzdWx0cy5jb2ZmZWUnXG50ID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcycpXG50ZW1wbGF0ZXMgPVxuICByZXBvcnRMb2FkaW5nOiB0Wydub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvcmVwb3J0TG9hZGluZyddXG5Kb2JJdGVtID0gcmVxdWlyZSAnLi9qb2JJdGVtLmNvZmZlZSdcbkNvbGxlY3Rpb25WaWV3ID0gcmVxdWlyZSgndmlld3MvY29sbGVjdGlvblZpZXcnKVxuXG5jbGFzcyBSZWNvcmRTZXRcblxuICBjb25zdHJ1Y3RvcjogKEBkYXRhLCBAdGFiLCBAc2tldGNoQ2xhc3NJZCkgLT5cblxuICB0b0FycmF5OiAoKSAtPlxuICAgIGlmIEBza2V0Y2hDbGFzc0lkXG4gICAgICBkYXRhID0gXy5maW5kIEBkYXRhLnZhbHVlLCAodikgPT5cbiAgICAgICAgdi5mZWF0dXJlcz9bMF0/LmF0dHJpYnV0ZXM/WydTQ19JRCddIGlzIEBza2V0Y2hDbGFzc0lkXG4gICAgICB1bmxlc3MgZGF0YVxuICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGRhdGEgZm9yIHNrZXRjaENsYXNzICN7QHNrZXRjaENsYXNzSWR9XCJcbiAgICBlbHNlXG4gICAgICBpZiBfLmlzQXJyYXkgQGRhdGEudmFsdWVcbiAgICAgICAgZGF0YSA9IEBkYXRhLnZhbHVlWzBdXG4gICAgICBlbHNlXG4gICAgICAgIGRhdGEgPSBAZGF0YS52YWx1ZVxuICAgIF8ubWFwIGRhdGEuZmVhdHVyZXMsIChmZWF0dXJlKSAtPlxuICAgICAgZmVhdHVyZS5hdHRyaWJ1dGVzXG5cbiAgcmF3OiAoYXR0cikgLT5cbiAgICBhdHRycyA9IF8ubWFwIEB0b0FycmF5KCksIChyb3cpIC0+XG4gICAgICByb3dbYXR0cl1cbiAgICBhdHRycyA9IF8uZmlsdGVyIGF0dHJzLCAoYXR0cikgLT4gYXR0ciAhPSB1bmRlZmluZWRcbiAgICBpZiBhdHRycy5sZW5ndGggaXMgMFxuICAgICAgY29uc29sZS5sb2cgQGRhdGFcbiAgICAgIEB0YWIucmVwb3J0RXJyb3IgXCJDb3VsZCBub3QgZ2V0IGF0dHJpYnV0ZSAje2F0dHJ9IGZyb20gcmVzdWx0c1wiXG4gICAgICB0aHJvdyBcIkNvdWxkIG5vdCBnZXQgYXR0cmlidXRlICN7YXR0cn1cIlxuICAgIGVsc2UgaWYgYXR0cnMubGVuZ3RoIGlzIDFcbiAgICAgIHJldHVybiBhdHRyc1swXVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBhdHRyc1xuXG4gIGludDogKGF0dHIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsIHBhcnNlSW50XG4gICAgZWxzZVxuICAgICAgcGFyc2VJbnQocmF3KVxuXG4gIGZsb2F0OiAoYXR0ciwgZGVjaW1hbFBsYWNlcz0yKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCAodmFsKSAtPiByb3VuZCh2YWwsIGRlY2ltYWxQbGFjZXMpXG4gICAgZWxzZVxuICAgICAgcm91bmQocmF3LCBkZWNpbWFsUGxhY2VzKVxuXG4gIGJvb2w6IChhdHRyKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCAodmFsKSAtPiB2YWwudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpIGlzICd0cnVlJ1xuICAgIGVsc2VcbiAgICAgIHJhdy50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgaXMgJ3RydWUnXG5cbmNsYXNzIFJlcG9ydFRhYiBleHRlbmRzIEJhY2tib25lLlZpZXdcbiAgbmFtZTogJ0luZm9ybWF0aW9uJ1xuICBkZXBlbmRlbmNpZXM6IFtdXG5cbiAgaW5pdGlhbGl6ZTogKEBtb2RlbCwgQG9wdGlvbnMpIC0+XG4gICAgIyBXaWxsIGJlIGluaXRpYWxpemVkIGJ5IFNlYVNrZXRjaCB3aXRoIHRoZSBmb2xsb3dpbmcgYXJndW1lbnRzOlxuICAgICMgICAqIG1vZGVsIC0gVGhlIHNrZXRjaCBiZWluZyByZXBvcnRlZCBvblxuICAgICMgICAqIG9wdGlvbnNcbiAgICAjICAgICAtIC5wYXJlbnQgLSB0aGUgcGFyZW50IHJlcG9ydCB2aWV3XG4gICAgIyAgICAgICAgY2FsbCBAb3B0aW9ucy5wYXJlbnQuZGVzdHJveSgpIHRvIGNsb3NlIHRoZSB3aG9sZSByZXBvcnQgd2luZG93XG4gICAgQGFwcCA9IHdpbmRvdy5hcHBcbiAgICBfLmV4dGVuZCBALCBAb3B0aW9uc1xuICAgIEByZXBvcnRSZXN1bHRzID0gbmV3IFJlcG9ydFJlc3VsdHMoQG1vZGVsLCBAZGVwZW5kZW5jaWVzKVxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdlcnJvcicsIEByZXBvcnRFcnJvclxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdqb2JzJywgQHJlbmRlckpvYkRldGFpbHNcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnam9icycsIEByZXBvcnRKb2JzXG4gICAgQGxpc3RlblRvIEByZXBvcnRSZXN1bHRzLCAnZmluaXNoZWQnLCBfLmJpbmQgQHJlbmRlciwgQFxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdyZXF1ZXN0JywgQHJlcG9ydFJlcXVlc3RlZFxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICB0aHJvdyAncmVuZGVyIG1ldGhvZCBtdXN0IGJlIG92ZXJpZGRlbidcblxuICBzaG93OiAoKSAtPlxuICAgIEAkZWwuc2hvdygpXG4gICAgQHZpc2libGUgPSB0cnVlXG4gICAgaWYgQGRlcGVuZGVuY2llcz8ubGVuZ3RoIGFuZCAhQHJlcG9ydFJlc3VsdHMubW9kZWxzLmxlbmd0aFxuICAgICAgQHJlcG9ydFJlc3VsdHMucG9sbCgpXG4gICAgZWxzZSBpZiAhQGRlcGVuZGVuY2llcz8ubGVuZ3RoXG4gICAgICBAcmVuZGVyKClcbiAgICAgIEAkKCdbZGF0YS1hdHRyaWJ1dGUtdHlwZT1VcmxGaWVsZF0gLnZhbHVlLCBbZGF0YS1hdHRyaWJ1dGUtdHlwZT1VcGxvYWRGaWVsZF0gLnZhbHVlJykuZWFjaCAoKSAtPlxuICAgICAgICB0ZXh0ID0gJChAKS50ZXh0KClcbiAgICAgICAgaHRtbCA9IFtdXG4gICAgICAgIGZvciB1cmwgaW4gdGV4dC5zcGxpdCgnLCcpXG4gICAgICAgICAgaWYgdXJsLmxlbmd0aFxuICAgICAgICAgICAgbmFtZSA9IF8ubGFzdCh1cmwuc3BsaXQoJy8nKSlcbiAgICAgICAgICAgIGh0bWwucHVzaCBcIlwiXCI8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+I3tuYW1lfTwvYT5cIlwiXCJcbiAgICAgICAgJChAKS5odG1sIGh0bWwuam9pbignLCAnKVxuXG5cbiAgaGlkZTogKCkgLT5cbiAgICBAJGVsLmhpZGUoKVxuICAgIEB2aXNpYmxlID0gZmFsc2VcblxuICByZW1vdmU6ICgpID0+XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwgQGV0YUludGVydmFsXG4gICAgQHN0b3BMaXN0ZW5pbmcoKVxuICAgIHN1cGVyKClcblxuICByZXBvcnRSZXF1ZXN0ZWQ6ICgpID0+XG4gICAgQCRlbC5odG1sIHRlbXBsYXRlcy5yZXBvcnRMb2FkaW5nLnJlbmRlcih7fSlcblxuICByZXBvcnRFcnJvcjogKG1zZywgY2FuY2VsbGVkUmVxdWVzdCkgPT5cbiAgICB1bmxlc3MgY2FuY2VsbGVkUmVxdWVzdFxuICAgICAgaWYgbXNnIGlzICdKT0JfRVJST1InXG4gICAgICAgIEBzaG93RXJyb3IgJ0Vycm9yIHdpdGggc3BlY2lmaWMgam9iJ1xuICAgICAgZWxzZVxuICAgICAgICBAc2hvd0Vycm9yIG1zZ1xuXG4gIHNob3dFcnJvcjogKG1zZykgPT5cbiAgICBAJCgnLnByb2dyZXNzJykucmVtb3ZlKClcbiAgICBAJCgncC5lcnJvcicpLnJlbW92ZSgpXG4gICAgQCQoJ2g0JykudGV4dChcIkFuIEVycm9yIE9jY3VycmVkXCIpLmFmdGVyIFwiXCJcIlxuICAgICAgPHAgY2xhc3M9XCJlcnJvclwiIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+I3ttc2d9PC9wPlxuICAgIFwiXCJcIlxuXG4gIHJlcG9ydEpvYnM6ICgpID0+XG4gICAgdW5sZXNzIEBtYXhFdGFcbiAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCcxMDAlJylcbiAgICBAJCgnaDQnKS50ZXh0IFwiQW5hbHl6aW5nIERlc2lnbnNcIlxuXG4gIHN0YXJ0RXRhQ291bnRkb3duOiAoKSA9PlxuICAgIGlmIEBtYXhFdGFcbiAgICAgIF8uZGVsYXkgKCkgPT5cbiAgICAgICAgQHJlcG9ydFJlc3VsdHMucG9sbCgpXG4gICAgICAsIChAbWF4RXRhICsgMSkgKiAxMDAwXG4gICAgICBfLmRlbGF5ICgpID0+XG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLmNzcyAndHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb24nLCAnbGluZWFyJ1xuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS5jc3MgJ3RyYW5zaXRpb24tZHVyYXRpb24nLCBcIiN7QG1heEV0YSArIDF9c1wiXG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCcxMDAlJylcbiAgICAgICwgNTAwXG5cbiAgcmVuZGVySm9iRGV0YWlsczogKCkgPT5cbiAgICBtYXhFdGEgPSBudWxsXG4gICAgZm9yIGpvYiBpbiBAcmVwb3J0UmVzdWx0cy5tb2RlbHNcbiAgICAgIGlmIGpvYi5nZXQoJ2V0YVNlY29uZHMnKVxuICAgICAgICBpZiAhbWF4RXRhIG9yIGpvYi5nZXQoJ2V0YVNlY29uZHMnKSA+IG1heEV0YVxuICAgICAgICAgIG1heEV0YSA9IGpvYi5nZXQoJ2V0YVNlY29uZHMnKVxuICAgIGlmIG1heEV0YVxuICAgICAgQG1heEV0YSA9IG1heEV0YVxuICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykud2lkdGgoJzUlJylcbiAgICAgIEBzdGFydEV0YUNvdW50ZG93bigpXG5cbiAgICBAJCgnW3JlbD1kZXRhaWxzXScpLmNzcygnZGlzcGxheScsICdibG9jaycpXG4gICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5oaWRlKClcbiAgICAgIEAkKCcuZGV0YWlscycpLnNob3coKVxuICAgIGZvciBqb2IgaW4gQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICBpdGVtID0gbmV3IEpvYkl0ZW0oam9iKVxuICAgICAgaXRlbS5yZW5kZXIoKVxuICAgICAgQCQoJy5kZXRhaWxzJykuYXBwZW5kIGl0ZW0uZWxcblxuICBnZXRSZXN1bHQ6IChpZCkgLT5cbiAgICByZXN1bHRzID0gQGdldFJlc3VsdHMoKVxuICAgIHJlc3VsdCA9IF8uZmluZCByZXN1bHRzLCAocikgLT4gci5wYXJhbU5hbWUgaXMgaWRcbiAgICB1bmxlc3MgcmVzdWx0P1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyByZXN1bHQgd2l0aCBpZCAnICsgaWQpXG4gICAgcmVzdWx0LnZhbHVlXG5cbiAgZ2V0Rmlyc3RSZXN1bHQ6IChwYXJhbSwgaWQpIC0+XG4gICAgcmVzdWx0ID0gQGdldFJlc3VsdChwYXJhbSlcbiAgICB0cnlcbiAgICAgIHJldHVybiByZXN1bHRbMF0uZmVhdHVyZXNbMF0uYXR0cmlidXRlc1tpZF1cbiAgICBjYXRjaCBlXG4gICAgICB0aHJvdyBcIkVycm9yIGZpbmRpbmcgI3twYXJhbX06I3tpZH0gaW4gZ3AgcmVzdWx0c1wiXG5cbiAgZ2V0UmVzdWx0czogKCkgLT5cbiAgICByZXN1bHRzID0gQHJlcG9ydFJlc3VsdHMubWFwKChyZXN1bHQpIC0+IHJlc3VsdC5nZXQoJ3Jlc3VsdCcpLnJlc3VsdHMpXG4gICAgdW5sZXNzIHJlc3VsdHM/Lmxlbmd0aFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBncCByZXN1bHRzJylcbiAgICBfLmZpbHRlciByZXN1bHRzLCAocmVzdWx0KSAtPlxuICAgICAgcmVzdWx0LnBhcmFtTmFtZSBub3QgaW4gWydSZXN1bHRDb2RlJywgJ1Jlc3VsdE1zZyddXG5cbiAgcmVjb3JkU2V0OiAoZGVwZW5kZW5jeSwgcGFyYW1OYW1lLCBza2V0Y2hDbGFzc0lkPWZhbHNlKSAtPlxuICAgIHVubGVzcyBkZXBlbmRlbmN5IGluIEBkZXBlbmRlbmNpZXNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlVua25vd24gZGVwZW5kZW5jeSAje2RlcGVuZGVuY3l9XCJcbiAgICBkZXAgPSBAcmVwb3J0UmVzdWx0cy5maW5kIChyKSAtPiByLmdldCgnc2VydmljZU5hbWUnKSBpcyBkZXBlbmRlbmN5XG4gICAgdW5sZXNzIGRlcFxuICAgICAgY29uc29sZS5sb2cgQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDb3VsZCBub3QgZmluZCByZXN1bHRzIGZvciAje2RlcGVuZGVuY3l9LlwiXG4gICAgcGFyYW0gPSBfLmZpbmQgZGVwLmdldCgncmVzdWx0JykucmVzdWx0cywgKHBhcmFtKSAtPlxuICAgICAgcGFyYW0ucGFyYW1OYW1lIGlzIHBhcmFtTmFtZVxuICAgIHVubGVzcyBwYXJhbVxuICAgICAgY29uc29sZS5sb2cgZGVwLmdldCgnZGF0YScpLnJlc3VsdHNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNvdWxkIG5vdCBmaW5kIHBhcmFtICN7cGFyYW1OYW1lfSBpbiAje2RlcGVuZGVuY3l9XCJcbiAgICBuZXcgUmVjb3JkU2V0KHBhcmFtLCBALCBza2V0Y2hDbGFzc0lkKVxuXG4gIGVuYWJsZVRhYmxlUGFnaW5nOiAoKSAtPlxuICAgIEAkKCdbZGF0YS1wYWdpbmddJykuZWFjaCAoKSAtPlxuICAgICAgJHRhYmxlID0gJChAKVxuICAgICAgcGFnZVNpemUgPSAkdGFibGUuZGF0YSgncGFnaW5nJylcbiAgICAgIHJvd3MgPSAkdGFibGUuZmluZCgndGJvZHkgdHInKS5sZW5ndGhcbiAgICAgIHBhZ2VzID0gTWF0aC5jZWlsKHJvd3MgLyBwYWdlU2l6ZSlcbiAgICAgIGlmIHBhZ2VzID4gMVxuICAgICAgICAkdGFibGUuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgIDx0Zm9vdD5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgPHRkIGNvbHNwYW49XCIjeyR0YWJsZS5maW5kKCd0aGVhZCB0aCcpLmxlbmd0aH1cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFnaW5hdGlvblwiPlxuICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5QcmV2PC9hPjwvbGk+XG4gICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3Rmb290PlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgdWwgPSAkdGFibGUuZmluZCgndGZvb3QgdWwnKVxuICAgICAgICBmb3IgaSBpbiBfLnJhbmdlKDEsIHBhZ2VzICsgMSlcbiAgICAgICAgICB1bC5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj4je2l9PC9hPjwvbGk+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHVsLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5OZXh0PC9hPjwvbGk+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAkdGFibGUuZmluZCgnbGkgYScpLmNsaWNrIChlKSAtPlxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICRhID0gJCh0aGlzKVxuICAgICAgICAgIHRleHQgPSAkYS50ZXh0KClcbiAgICAgICAgICBpZiB0ZXh0IGlzICdOZXh0J1xuICAgICAgICAgICAgYSA9ICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5uZXh0KCkuZmluZCgnYScpXG4gICAgICAgICAgICB1bmxlc3MgYS50ZXh0KCkgaXMgJ05leHQnXG4gICAgICAgICAgICAgIGEuY2xpY2soKVxuICAgICAgICAgIGVsc2UgaWYgdGV4dCBpcyAnUHJldidcbiAgICAgICAgICAgIGEgPSAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucHJldigpLmZpbmQoJ2EnKVxuICAgICAgICAgICAgdW5sZXNzIGEudGV4dCgpIGlzICdQcmV2J1xuICAgICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICRhLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBuID0gcGFyc2VJbnQodGV4dClcbiAgICAgICAgICAgICR0YWJsZS5maW5kKCd0Ym9keSB0cicpLmhpZGUoKVxuICAgICAgICAgICAgb2Zmc2V0ID0gcGFnZVNpemUgKiAobiAtIDEpXG4gICAgICAgICAgICAkdGFibGUuZmluZChcInRib2R5IHRyXCIpLnNsaWNlKG9mZnNldCwgbipwYWdlU2l6ZSkuc2hvdygpXG4gICAgICAgICQoJHRhYmxlLmZpbmQoJ2xpIGEnKVsxXSkuY2xpY2soKVxuXG4gICAgICBpZiBub1Jvd3NNZXNzYWdlID0gJHRhYmxlLmRhdGEoJ25vLXJvd3MnKVxuICAgICAgICBpZiByb3dzIGlzIDBcbiAgICAgICAgICBwYXJlbnQgPSAkdGFibGUucGFyZW50KClcbiAgICAgICAgICAkdGFibGUucmVtb3ZlKClcbiAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2xhc3MgJ3RhYmxlQ29udGFpbmVyJ1xuICAgICAgICAgIHBhcmVudC5hcHBlbmQgXCI8cD4je25vUm93c01lc3NhZ2V9PC9wPlwiXG5cbiAgZW5hYmxlTGF5ZXJUb2dnbGVyczogKCkgLT5cbiAgICBlbmFibGVMYXllclRvZ2dsZXJzKEAkZWwpXG5cbiAgZ2V0Q2hpbGRyZW46IChza2V0Y2hDbGFzc0lkKSAtPlxuICAgIF8uZmlsdGVyIEBjaGlsZHJlbiwgKGNoaWxkKSAtPiBjaGlsZC5nZXRTa2V0Y2hDbGFzcygpLmlkIGlzIHNrZXRjaENsYXNzSWRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydFRhYlxuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBcbiAgcm91bmQ6IChudW1iZXIsIGRlY2ltYWxQbGFjZXMpIC0+XG4gICAgdW5sZXNzIF8uaXNOdW1iZXIgbnVtYmVyXG4gICAgICBudW1iZXIgPSBwYXJzZUZsb2F0KG51bWJlcilcbiAgICBtdWx0aXBsaWVyID0gTWF0aC5wb3cgMTAsIGRlY2ltYWxQbGFjZXNcbiAgICBNYXRoLnJvdW5kKG51bWJlciAqIG11bHRpcGxpZXIpIC8gbXVsdGlwbGllciIsInRoaXNbXCJUZW1wbGF0ZXNcIl0gPSB0aGlzW1wiVGVtcGxhdGVzXCJdIHx8IHt9O1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9hdHRyaWJ1dGVzL2F0dHJpYnV0ZUl0ZW1cIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHRyIGRhdGEtYXR0cmlidXRlLWlkPVxcXCJcIik7Xy5iKF8udihfLmYoXCJpZFwiLGMscCwwKSkpO18uYihcIlxcXCIgZGF0YS1hdHRyaWJ1dGUtZXhwb3J0aWQ9XFxcIlwiKTtfLmIoXy52KF8uZihcImV4cG9ydGlkXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiBkYXRhLWF0dHJpYnV0ZS10eXBlPVxcXCJcIik7Xy5iKF8udihfLmYoXCJ0eXBlXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx0ZCBjbGFzcz1cXFwibmFtZVxcXCI+XCIpO18uYihfLnYoXy5mKFwibmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGQgY2xhc3M9XFxcInZhbHVlXFxcIj5cIik7Xy5iKF8udihfLmYoXCJmb3JtYXR0ZWRWYWx1ZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC90cj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9hdHRyaWJ1dGVzL2F0dHJpYnV0ZXNUYWJsZVwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8dGFibGUgY2xhc3M9XFxcImF0dHJpYnV0ZXNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJhdHRyaWJ1dGVzXCIsYyxwLDEpLGMscCwwLDQ0LDgxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlSXRlbVwiLGMscCxcIiAgICBcIikpO30pO2MucG9wKCk7fV8uYihcIjwvdGFibGU+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvZ2VuZXJpY0F0dHJpYnV0ZXNcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+XCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIiBBdHRyaWJ1dGVzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCIsYyxwLFwiICAgIFwiKSk7Xy5iKFwiICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3JlcG9ydExvYWRpbmdcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0TG9hZGluZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8IS0tIDxkaXYgY2xhc3M9XFxcInNwaW5uZXJcXFwiPjM8L2Rpdj4gLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVxdWVzdGluZyBSZXBvcnQgZnJvbSBTZXJ2ZXI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MgcHJvZ3Jlc3Mtc3RyaXBlZCBhY3RpdmVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJiYXJcXFwiIHN0eWxlPVxcXCJ3aWR0aDogMTAwJTtcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8YSBocmVmPVxcXCIjXFxcIiByZWw9XFxcImRldGFpbHNcXFwiPmRldGFpbHM8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImRldGFpbHNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xuXG5pZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gdGhpc1tcIlRlbXBsYXRlc1wiXTtcbn0iLCJSZXBvcnRHcmFwaFRhYiA9IHJlcXVpcmUgJ3JlcG9ydEdyYXBoVGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5wYXJ0aWFscyA9IFtdXG5mb3Iga2V5LCB2YWwgb2YgX3BhcnRpYWxzXG4gIHBhcnRpYWxzW2tleS5yZXBsYWNlKCdub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvJywgJycpXSA9IHZhbFxuXG5jbGFzcyBFbmVyZ3lDb25zdW1wdGlvblRhYiBleHRlbmRzIFJlcG9ydEdyYXBoVGFiXG4gICMgdGhpcyBpcyB0aGUgbmFtZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBUYWJcbiAgbmFtZTogJ0VuZXJneSBDb25zdW1wdGlvbidcbiAgY2xhc3NOYW1lOiAnRW5lcmd5Q29uc3VtcHRpb24nXG4gIHRpbWVvdXQ6IDEyMDAwMFxuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLmVuZXJneUNvbnN1bXB0aW9uXG4gIGRlcGVuZGVuY2llczogW1xuICAgICdFbmVyZ3lQbGFuJ1xuICBdXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG4gICAgdHJ5XG4gICAgICBcbiAgICAgIG1zZyA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzdWx0TXNnXCIpXG4gICAgICBjb25zb2xlLmxvZyhcIm1zZyBpcyBcIiwgbXNnKVxuXG4gICAgICBjb21FQyA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tRVVcIikudG9BcnJheSgpXG4gICAgICByZXNFQyA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzRVVcIikudG9BcnJheSgpXG5cblxuICAgICAgY29tX3BhID0gQGdldE1hcChjb21FQywgXCJQQVwiKVxuICAgICAgY29tX2RibHBhID0gQGdldE1hcChjb21FQywgXCJEYmxQQVwiKVxuICAgICAgY29tX25vcGEgPSBAZ2V0TWFwKGNvbUVDLCBcIk5vUEFcIilcbiAgICAgIFxuICAgICAgY29tX3VzZXIgPSBAZ2V0VXNlck1hcChjb21FQywgXCJVU0VSXCIsIGNvbV9ub3BhKVxuXG4gICAgICBjb21fdXNlcl9zYXZpbmdzID0gQGdldFVzZXJTYXZpbmdzKGNvbUVDLCBjb21fdXNlciwgY29tX25vcGEsIDEpXG5cbiAgICAgIHNvcnRlZF9jb21tX3Jlc3VsdHMgPSBbY29tX25vcGEsIGNvbV9wYSwgY29tX2RibHBhLCBjb21fdXNlcl1cblxuICAgICAgcmVzX3BhID0gQGdldE1hcChyZXNFQywgXCJQQVwiKVxuICAgICAgcmVzX2RibHBhID0gQGdldE1hcChyZXNFQywgXCJEYmxQQVwiKVxuICAgICAgcmVzX25vcGEgPSBAZ2V0TWFwKHJlc0VDLCBcIk5vUEFcIilcbiAgICAgIFxuICAgICAgcmVzX3VzZXIgPSBAZ2V0VXNlck1hcChyZXNFQywgXCJVU0VSXCIsIHJlc19ub3BhKVxuICAgICAgcmVzX3VzZXJfc2F2aW5ncyA9IEBnZXRVc2VyU2F2aW5ncyhyZXNFQywgcmVzX3VzZXIsIHJlc19ub3BhLCAxKVxuICAgICAgc29ydGVkX3Jlc19yZXN1bHRzID0gW3Jlc19ub3BhLCByZXNfcGEsIHJlc19kYmxwYSwgcmVzX3VzZXJdXG5cblxuICAgICAgc2NlbmFyaW9zID0gWycnLCdQQSAyOTUnLCAnTm8gUEEgMjk1JywgJ0RvdWJsZSBQQSAyOTUnXVxuXG4gICAgICByZXNfc3VtID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFVVN1bVwiKS5mbG9hdCgnVVNFUl9TVU0nLCAxKVxuICAgICAgcmVzX3BhMjk1X3RvdGFsX2VjID0gIEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzRVVTdW1cIikuZmxvYXQoJ1BBX1NVTScsIDEpXG4gICAgICByZXNfbm9fcGEyOTVfdG90YWxfZWMgPSAgQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFVVN1bVwiKS5mbG9hdCgnTk9QQV9TVU0nLCAxKVxuICAgICAgcmVzX2RibF9wYTI5NV90b3RhbF9lYyA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzRVVTdW1cIikuZmxvYXQoJ0RCTFBBX1NVTScsIDEpXG5cbiAgICAgIHJlc19wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgocmVzX3BhMjk1X3RvdGFsX2VjIC0gcmVzX3N1bSksMClcbiAgICAgIHJlc19wYTI5NV9wZXJjX2RpZmYgPSBNYXRoLnJvdW5kKCgoTWF0aC5hYnMocmVzX3BhMjk1X2RpZmYpL3Jlc19zdW0pKjEwMCksMClcbiAgICAgIHJlc19oYXNfc2F2aW5nc19wYTI5NSA9IHJlc19wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IHJlc19oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgICByZXNfcGEyOTVfZGlmZiA9IE1hdGguYWJzKHJlc19wYTI5NV9kaWZmKVxuICAgICAgcmVzX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIHJlc19wYTI5NV9kaWZmXG4gIFxuICAgICAgcmVzX25vX3BhMjk1X2RpZmYgPSBNYXRoLnJvdW5kKChyZXNfbm9fcGEyOTVfdG90YWxfZWMgLSByZXNfc3VtKSwwKVxuICAgICAgcmVzX25vX3BhMjk1X3BlcmNfZGlmZiA9IE1hdGgucm91bmQoKChNYXRoLmFicyhyZXNfbm9fcGEyOTVfZGlmZikvcmVzX3N1bSkqMTAwKSwwKVxuICAgICAgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1ID0gcmVzX25vX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICAgIHJlc19ub19wYTI5NV9kaWZmID0gTWF0aC5hYnMocmVzX25vX3BhMjk1X2RpZmYpXG4gICAgICByZXNfbm9fcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgcmVzX25vX3BhMjk1X2RpZmZcblxuICAgICAgcmVzX2RibF9wYTI5NV9kaWZmID0gIE1hdGgucm91bmQoKHJlc19kYmxfcGEyOTVfdG90YWxfZWMgLSByZXNfc3VtKSwwKVxuICAgICAgcmVzX2RibF9wYTI5NV9wZXJjX2RpZmYgPSBNYXRoLnJvdW5kKCgoTWF0aC5hYnMocmVzX2RibF9wYTI5NV9kaWZmKS9yZXNfc3VtKSoxMDApLDApXG4gICAgICByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1ID0gcmVzX2RibF9wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuICAgICAgICByZXNfZGJsX3BhMjk1X2RpZmYgPSBNYXRoLmFicyhyZXNfZGJsX3BhMjk1X2RpZmYpXG4gICAgICByZXNfZGJsX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIHJlc19kYmxfcGEyOTVfZGlmZlxuXG4gICAgICBjb21tX3N1bSA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tRVVTdW1cIikuZmxvYXQoJ1VTRVJfU1VNJywgMSlcbiAgICAgIGNvbW1fcGEyOTVfdG90YWxfZWMgPSAgICAgQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21FVVN1bVwiKS5mbG9hdCgnUEFfU1VNJywgMSlcbiAgICAgIGNvbW1fbm9fcGEyOTVfdG90YWxfZWMgPSAgQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21FVVN1bVwiKS5mbG9hdCgnTk9QQV9TVU0nLCAxKVxuICAgICAgY29tbV9kYmxfcGEyOTVfdG90YWxfZWMgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUVVU3VtXCIpLmZsb2F0KCdEQkxQQV9TVU0nLCAxKVxuXG4gICAgICBjb21tX3BhMjk1X2RpZmYgPSBNYXRoLnJvdW5kKChjb21tX3BhMjk1X3RvdGFsX2VjIC0gY29tbV9zdW0pLDApXG4gICAgICBjb21tX3BhMjk1X3BlcmNfZGlmZiA9IE1hdGgucm91bmQoKChNYXRoLmFicyhjb21tX3BhMjk1X2RpZmYpL2NvbW1fc3VtKSoxMDApLDApXG4gICAgICBjb21tX2hhc19zYXZpbmdzX3BhMjk1ID0gY29tbV9wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IGNvbW1faGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgICAgY29tbV9wYTI5NV9kaWZmPU1hdGguYWJzKGNvbW1fcGEyOTVfZGlmZilcbiAgICAgIGNvbW1fcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgY29tbV9wYTI5NV9kaWZmXG5cbiAgICAgIGNvbW1fbm9fcGEyOTVfZGlmZiA9ICBNYXRoLnJvdW5kKChjb21tX25vX3BhMjk1X3RvdGFsX2VjIC0gY29tbV9zdW0pLDApXG4gICAgICBjb21tX25vX3BhMjk1X3BlcmNfZGlmZiA9IE1hdGgucm91bmQoKChNYXRoLmFicyhjb21tX25vX3BhMjk1X2RpZmYpL2NvbW1fc3VtKSoxMDApLDApXG4gICAgICBjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1ID0gY29tbV9ub19wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcbiAgICAgICAgY29tbV9ub19wYTI5NV9kaWZmID0gTWF0aC5hYnMoY29tbV9ub19wYTI5NV9kaWZmKVxuICAgICAgY29tbV9ub19wYTI5NV9kaWZmID0gQGFkZENvbW1hcyBjb21tX25vX3BhMjk1X2RpZmZcblxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKGNvbW1fZGJsX3BhMjk1X3RvdGFsX2VjIC0gY29tbV9zdW0pLDApXG4gICAgICBjb21tX2RibF9wYTI5NV9wZXJjX2RpZmYgPSBNYXRoLnJvdW5kKCgoTWF0aC5hYnMoY29tbV9kYmxfcGEyOTVfZGlmZikvY29tbV9zdW0pKjEwMCksMClcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1ID0gY29tbV9kYmxfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuICAgICAgICBjb21tX2RibF9wYTI5NV9kaWZmID0gTWF0aC5hYnMoY29tbV9kYmxfcGEyOTVfZGlmZilcbiAgICAgIGNvbW1fZGJsX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIGNvbW1fZGJsX3BhMjk1X2RpZmZcblxuICAgIGNhdGNoIGVcbiAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3I6IFwiLCBlKVxuXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICBjb250ZXh0ID1cbiAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuICAgICAgY29tX3VzZXJfc2F2aW5nczogY29tX3VzZXJfc2F2aW5nc1xuICAgICAgcmVzX3VzZXJfc2F2aW5nczogcmVzX3VzZXJfc2F2aW5nc1xuICAgICAgc2NlbmFyaW9zOiBzY2VuYXJpb3NcblxuICAgICAgcmVzX3BhMjk1X2RpZmY6IHJlc19wYTI5NV9kaWZmXG4gICAgICByZXNfaGFzX3NhdmluZ3NfcGEyOTU6IHJlc19oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgcmVzX3BhMjk1X2RpcjogQGdldERpckNsYXNzIHJlc19oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgcmVzX3BhMjk1X3BlcmNfZGlmZjogcmVzX3BhMjk1X3BlcmNfZGlmZlxuXG4gICAgICByZXNfbm9fcGEyOTVfZGlmZjogcmVzX25vX3BhMjk1X2RpZmZcbiAgICAgIHJlc19oYXNfc2F2aW5nc19ub19wYTI5NTogcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICByZXNfbm9fcGEyOTVfZGlyOiBAZ2V0RGlyQ2xhc3MgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICByZXNfbm9fcGEyOTVfcGVyY19kaWZmOiByZXNfbm9fcGEyOTVfcGVyY19kaWZmXG5cbiAgICAgIHJlc19kYmxfcGEyOTVfZGlmZjogcmVzX2RibF9wYTI5NV9kaWZmXG4gICAgICByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1OiByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1XG4gICAgICByZXNfZGJsX3BhMjk1X2RpcjogQGdldERpckNsYXNzIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgIHJlc19kYmxfcGEyOTVfcGVyY19kaWZmOiByZXNfZGJsX3BhMjk1X3BlcmNfZGlmZlxuXG4gICAgICBjb21tX3BhMjk1X2RpZmY6IGNvbW1fcGEyOTVfZGlmZlxuICAgICAgY29tbV9oYXNfc2F2aW5nc19wYTI5NTogY29tbV9oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgY29tbV9wYTI5NV9kaXI6IEBnZXREaXJDbGFzcyBjb21tX2hhc19zYXZpbmdzX3BhMjk1XG4gICAgICBjb21tX3BhMjk1X3BlcmNfZGlmZjogY29tbV9wYTI5NV9wZXJjX2RpZmZcblxuICAgICAgY29tbV9ub19wYTI5NV9kaWZmOiBjb21tX25vX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTU6IGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcbiAgICAgIGNvbW1fbm9fcGEyOTVfZGlyOiBAZ2V0RGlyQ2xhc3MgY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NVxuICAgICAgY29tbV9ub19wYTI5NV9wZXJjX2RpZmY6IGNvbW1fbm9fcGEyOTVfcGVyY19kaWZmXG5cbiAgICAgIGNvbW1fZGJsX3BhMjk1X2RpZmY6IGNvbW1fZGJsX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1OiBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlyOiBAZ2V0RGlyQ2xhc3MgY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgIGNvbW1fZGJsX3BhMjk1X3BlcmNfZGlmZjogY29tbV9kYmxfcGEyOTVfcGVyY19kaWZmXG5cbiAgICAgIHJlc19zdW06IHJlc19zdW1cbiAgICAgIGNvbW1fc3VtOiBjb21tX3N1bVxuICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG4gICAgQCQoJy5jb21tLWNob3Nlbi1lYycpLmNob3Nlbih7ZGlzYWJsZV9zZWFyY2hfdGhyZXNob2xkOiAxMCwgd2lkdGg6JzIwMHB4J30pXG4gICAgQCQoJy5jb21tLWNob3Nlbi1lYycpLmNoYW5nZSAoKSA9PlxuICAgICAgQHJlbmRlckRpZmZzKCcuY29tbS1jaG9zZW4tZWMnLCAnY29tbScsICdlYycpXG5cbiAgICBAJCgnLnJlcy1jaG9zZW4tZWMnKS5jaG9zZW4oe2Rpc2FibGVfc2VhcmNoX3RocmVzaG9sZDogMTAsIHdpZHRoOicyMDBweCd9KVxuICAgIEAkKCcucmVzLWNob3Nlbi1lYycpLmNoYW5nZSAoKSA9PlxuICAgICAgQHJlbmRlckRpZmZzKCcucmVzLWNob3Nlbi1lYycsICdyZXMnLCAnZWMnKVxuXG5cbiAgICBpZiB3aW5kb3cuZDNcblxuICAgICAgaCA9IDMyMFxuICAgICAgdyA9IDM4MFxuICAgICAgbWFyZ2luID0ge2xlZnQ6NDAsIHRvcDo1LCByaWdodDo0MCwgYm90dG9tOiA0MCwgaW5uZXI6NX1cbiAgICAgIGhhbGZoID0gKGgrbWFyZ2luLnRvcCttYXJnaW4uYm90dG9tKVxuICAgICAgdG90YWxoID0gaGFsZmgqMlxuICAgICAgaGFsZncgPSAodyttYXJnaW4ubGVmdCttYXJnaW4ucmlnaHQpXG4gICAgICB0b3RhbHcgPSBoYWxmdyoyXG4gICAgICBcbiAgICAgIGNvbV9jaGFydCA9IEBkcmF3Q2hhcnQoJy5jb21tZXJjaWFsRW5lcmd5Q29uc3VtcHRpb24nKS54dmFyKDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC55dmFyKDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC54bGFiKFwiWWVhclwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueWxhYihcIlZhbHVlIChpbiBtaWxsaW9ucylcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmhlaWdodChoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAud2lkdGgodylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcmdpbihtYXJnaW4pXG5cbiAgICAgIGNoID0gZDMuc2VsZWN0KEAkKCcuY29tbWVyY2lhbEVuZXJneUNvbnN1bXB0aW9uJykpXG4gICAgICBjaC5kYXR1bShzb3J0ZWRfY29tbV9yZXN1bHRzKVxuICAgICAgICAuY2FsbChjb21fY2hhcnQpXG5cbiAgICAgIHJlc19jaGFydCA9IEBkcmF3Q2hhcnQoJy5yZXNpZGVudGlhbEVuZXJneUNvbnN1bXB0aW9uJykueHZhcigwKVxuICAgICAgICAgICAgICAgICAgICAgLnl2YXIoMSlcbiAgICAgICAgICAgICAgICAgICAgIC54bGFiKFwiWWVhclwiKVxuICAgICAgICAgICAgICAgICAgICAgLnlsYWIoXCJWYWx1ZSAoaW4gbWlsbGlvbnMpXCIpXG4gICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KGgpXG4gICAgICAgICAgICAgICAgICAgICAud2lkdGgodylcbiAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4obWFyZ2luKVxuXG4gICAgICBjaCA9IGQzLnNlbGVjdChAJCgnLnJlc2lkZW50aWFsRW5lcmd5Q29uc3VtcHRpb24nKSlcbiAgICAgIGNoLmRhdHVtKHNvcnRlZF9yZXNfcmVzdWx0cylcbiAgICAgICAgLmNhbGwocmVzX2NoYXJ0KVxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUubG9nKFwiTk8gRDMhISEhISEhXCIpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZXJneUNvbnN1bXB0aW9uVGFiIiwiUmVwb3J0R3JhcGhUYWIgPSByZXF1aXJlICdyZXBvcnRHcmFwaFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuY2xhc3MgRnVlbENvc3RzVGFiIGV4dGVuZHMgUmVwb3J0R3JhcGhUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnRnVlbCBDb3N0cydcbiAgY2xhc3NOYW1lOiAnZnVlbENvc3RzJ1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5mdWVsQ29zdHNcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0VuZXJneVBsYW4nXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuXG4gICAgdHJ5XG4gICAgICBtc2cgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc3VsdE1zZ1wiKVxuICAgICAgY29uc29sZS5sb2coXCIuLi4uLi5tc2cgaXMgXCIsIG1zZylcblxuICAgICAgc2NlbmFyaW9zID0gWydQQSAyOTUnLCAnTm8gUEEgMjk1JywgJ0RvdWJsZSBQQSAyOTUnXVxuICAgICAgY29tRkMgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUVDXCIpLnRvQXJyYXkoKVxuICAgICAgcmVzRkMgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0VDXCIpLnRvQXJyYXkoKVxuXG4gICAgICBjb21fcGEgPSBAZ2V0TWFwKGNvbUZDLCBcIlBBXCIpXG4gICAgICBjb21fZGJscGEgPSBAZ2V0TWFwKGNvbUZDLCBcIkRibFBBXCIpXG4gICAgICBjb21fbm9wYSA9IEBnZXRNYXAoY29tRkMsIFwiTm9QQVwiKVxuICAgICAgXG4gICAgICBjb21fdXNlciA9IEBnZXRVc2VyTWFwKGNvbUZDLCBcIlVTRVJcIiwgY29tX25vcGEpXG4gICAgICBjb21fdXNlcl9zYXZpbmdzID0gQGdldFVzZXJTYXZpbmdzKGNvbUZDLCBjb21fdXNlciwgY29tX25vcGEsIDIpXG4gICAgICBzb3J0ZWRfY29tbV9yZXN1bHRzID0gW2NvbV9ub3BhLCBjb21fcGEsIGNvbV9kYmxwYSwgY29tX3VzZXJdXG5cbiAgICAgIHJlc19wYSA9IEBnZXRNYXAocmVzRkMsIFwiUEFcIilcbiAgICAgIHJlc19kYmxwYSA9IEBnZXRNYXAocmVzRkMsIFwiRGJsUEFcIilcbiAgICAgIHJlc19ub3BhID0gQGdldE1hcChyZXNGQywgXCJOb1BBXCIpXG4gICAgICBcbiAgICAgIHJlc191c2VyID0gQGdldFVzZXJNYXAocmVzRkMsIFwiVVNFUlwiLCByZXNfbm9wYSlcbiAgICAgIHJlc191c2VyX3NhdmluZ3MgPSBAZ2V0VXNlclNhdmluZ3MocmVzRkMsIHJlc191c2VyLCByZXNfbm9wYSwgMilcbiAgICAgIHNvcnRlZF9yZXNfcmVzdWx0cyA9IFtyZXNfbm9wYSwgcmVzX3BhLCByZXNfZGJscGEsIHJlc191c2VyXVxuXG5cbiAgICAgIHJlc19zdW0gPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0VDU3VtXCIpLmZsb2F0KCdVU0VSX1NVTScsIDEpXG4gICAgICByZXNfcGEyOTVfdG90YWxfZmMgPSAgICAgQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFQ1N1bVwiKS5mbG9hdCgnUEFfU1VNJywgMSlcbiAgICAgIHJlc19ub19wYTI5NV90b3RhbF9mYyA9ICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0VDU3VtXCIpLmZsb2F0KCdOT1BBX1NVTScsIDEpXG4gICAgICByZXNfZGJsX3BhMjk1X3RvdGFsX2ZjID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFQ1N1bVwiKS5mbG9hdCgnREJMUEFfU1VNJywgMSlcblxuXG5cbiAgICAgIHJlc19wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgocmVzX3BhMjk1X3RvdGFsX2ZjIC0gcmVzX3N1bSksMClcbiAgICAgIHJlc19wYTI5NV9wZXJjX2RpZmYgPSBNYXRoLnJvdW5kKCgoTWF0aC5hYnMocmVzX3BhMjk1X2RpZmYpL3Jlc19zdW0pKjEwMCksMClcbiAgICAgIHJlc19oYXNfc2F2aW5nc19wYTI5NSA9IHJlc19wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IHJlc19oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgICByZXNfcGEyOTVfZGlmZiA9IE1hdGguYWJzKHJlc19wYTI5NV9kaWZmKVxuICAgICAgcmVzX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIHJlc19wYTI5NV9kaWZmXG5cbiAgICAgIHJlc19ub19wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgocmVzX25vX3BhMjk1X3RvdGFsX2ZjIC0gcmVzX3N1bSksMClcbiAgICAgIHJlc19ub19wYTI5NV9wZXJjX2RpZmYgPSBNYXRoLnJvdW5kKCgoTWF0aC5hYnMocmVzX25vX3BhMjk1X2RpZmYpL3Jlc19zdW0pKjEwMCksMClcbiAgICAgIHJlc19oYXNfc2F2aW5nc19ub19wYTI5NSA9IHJlc19ub19wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IHJlc19oYXNfc2F2aW5nc19ub19wYTI5NVxuICAgICAgICByZXNfbm9fcGEyOTVfZGlmZiA9IE1hdGguYWJzKHJlc19ub19wYTI5NV9kaWZmKVxuICAgICAgcmVzX25vX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIHJlc19ub19wYTI5NV9kaWZmXG4gICAgICBcbiAgICAgIHJlc19kYmxfcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKHJlc19kYmxfcGEyOTVfdG90YWxfZmMgLSByZXNfc3VtKSwwKVxuICAgICAgcmVzX2RibF9wYTI5NV9wZXJjX2RpZmYgPSBNYXRoLnJvdW5kKCgoTWF0aC5hYnMocmVzX2RibF9wYTI5NV9kaWZmKS9yZXNfc3VtKSoxMDApLDApXG4gICAgICByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1ID0gcmVzX2RibF9wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgICAgcmVzX2RibF9wYTI5NV9kaWZmID0gIE1hdGguYWJzKHJlc19kYmxfcGEyOTVfZGlmZilcbiAgICAgIHJlc19kYmxfcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgcmVzX2RibF9wYTI5NV9kaWZmXG5cblxuICAgICAgY29tbV9zdW0gPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUVDU3VtXCIpLmZsb2F0KCdVU0VSX1NVTScsIDEpXG4gICAgICBjb21tX3BhMjk1X3RvdGFsX2ZjID0gICAgIEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tRUNTdW1cIikuZmxvYXQoJ1BBX1NVTScsIDEpXG4gICAgICBjb21tX25vX3BhMjk1X3RvdGFsX2ZjID0gIEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tRUNTdW1cIikuZmxvYXQoJ05PUEFfU1VNJywgMSlcbiAgICAgIGNvbW1fZGJsX3BhMjk1X3RvdGFsX2ZjID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21FQ1N1bVwiKS5mbG9hdCgnREJMUEFfU1VNJywgMSlcblxuICAgICAgY29tbV9wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgoY29tbV9wYTI5NV90b3RhbF9mYyAtIGNvbW1fc3VtKSwwKVxuICAgICAgY29tbV9wYTI5NV9wZXJjX2RpZmYgPSBNYXRoLnJvdW5kKCgoTWF0aC5hYnMoY29tbV9wYTI5NV9kaWZmKS9jb21tX3N1bSkqMTAwKSwwKVxuICAgICAgY29tbV9oYXNfc2F2aW5nc19wYTI5NSA9IGNvbW1fcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCBjb21tX2hhc19zYXZpbmdzX3BhMjk1XG4gICAgICAgIGNvbW1fcGEyOTVfZGlmZj1NYXRoLmFicyhjb21tX3BhMjk1X2RpZmYpXG4gICAgICBjb21tX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIGNvbW1fcGEyOTVfZGlmZlxuXG4gICAgICBjb21tX25vX3BhMjk1X2RpZmYgPSBNYXRoLnJvdW5kKChjb21tX25vX3BhMjk1X3RvdGFsX2ZjIC0gY29tbV9zdW0pLDApXG4gICAgICBjb21tX25vX3BhMjk1X3BlcmNfZGlmZiA9IE1hdGgucm91bmQoKChNYXRoLmFicyhjb21tX25vX3BhMjk1X2RpZmYpL2NvbW1fc3VtKSoxMDApLDApXG4gICAgICBjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1ID0gY29tbV9ub19wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcbiAgICAgICAgY29tbV9ub19wYTI5NV9kaWZmID0gTWF0aC5hYnMoY29tbV9ub19wYTI5NV9kaWZmKVxuICAgICAgY29tbV9ub19wYTI5NV9kaWZmID0gQGFkZENvbW1hcyBjb21tX25vX3BhMjk1X2RpZmZcblxuXG4gICAgICBjb21tX2RibF9wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgoY29tbV9kYmxfcGEyOTVfdG90YWxfZmMgLSBjb21tX3N1bSksMClcbiAgICAgIGNvbW1fZGJsX3BhMjk1X3BlcmNfZGlmZiA9IE1hdGgucm91bmQoKChNYXRoLmFicyhjb21tX2RibF9wYTI5NV9kaWZmKS9jb21tX3N1bSkqMTAwKSwwKVxuICAgICAgY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTUgPSBjb21tX2RibF9wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XG4gICAgICAgIGNvbW1fZGJsX3BhMjk1X2RpZmYgPSBNYXRoLmFicyhjb21tX2RibF9wYTI5NV9kaWZmKVxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgY29tbV9kYmxfcGEyOTVfZGlmZlxuXG4gICAgY2F0Y2ggZVxuICAgICAgY29uc29sZS5sb2coXCJlcnJvci4uLi4uLi4uLi4uLi4uLi4uLi4uOiBcIiwgZSlcblxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG5cbiAgICAgIHNjZW5hcmlvczogc2NlbmFyaW9zXG4gICAgICBjb21fdXNlcl9zYXZpbmdzOiBjb21fdXNlcl9zYXZpbmdzXG4gICAgICByZXNfdXNlcl9zYXZpbmdzOiByZXNfdXNlcl9zYXZpbmdzXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcblxuICAgICAgcmVzX3BhMjk1X2RpZmY6IHJlc19wYTI5NV9kaWZmXG4gICAgICByZXNfaGFzX3NhdmluZ3NfcGEyOTU6IHJlc19oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgcmVzX3BhMjk1X2RpcjogQGdldERpckNsYXNzIHJlc19oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgcmVzX3BhMjk1X3BlcmNfZGlmZjogcmVzX3BhMjk1X3BlcmNfZGlmZlxuXG4gICAgICByZXNfbm9fcGEyOTVfZGlmZjogcmVzX25vX3BhMjk1X2RpZmZcbiAgICAgIHJlc19oYXNfc2F2aW5nc19ub19wYTI5NTogcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICByZXNfbm9fcGEyOTVfZGlyOiBAZ2V0RGlyQ2xhc3MgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICByZXNfbm9fcGEyOTVfcGVyY19kaWZmOiByZXNfbm9fcGEyOTVfcGVyY19kaWZmXG5cbiAgICAgIHJlc19kYmxfcGEyOTVfZGlmZjogcmVzX2RibF9wYTI5NV9kaWZmXG4gICAgICByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1OiByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1XG4gICAgICByZXNfZGJsX3BhMjk1X2RpcjogQGdldERpckNsYXNzIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgIHJlc19kYmxfcGEyOTVfcGVyY19kaWZmOiByZXNfZGJsX3BhMjk1X3BlcmNfZGlmZlxuXG4gICAgICBjb21tX3BhMjk1X2RpZmY6IGNvbW1fcGEyOTVfZGlmZlxuICAgICAgY29tbV9oYXNfc2F2aW5nc19wYTI5NTogY29tbV9oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgY29tbV9wYTI5NV9kaXI6IEBnZXREaXJDbGFzcyBjb21tX2hhc19zYXZpbmdzX3BhMjk1XG4gICAgICBjb21tX3BhMjk1X3BlcmNfZGlmZjogY29tbV9wYTI5NV9wZXJjX2RpZmZcblxuICAgICAgY29tbV9ub19wYTI5NV9kaWZmOiBjb21tX25vX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTU6IGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcbiAgICAgIGNvbW1fbm9fcGEyOTVfZGlyOiBAZ2V0RGlyQ2xhc3MgY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NVxuICAgICAgY29tbV9ub19wYTI5NV9wZXJjX2RpZmY6IGNvbW1fbm9fcGEyOTVfcGVyY19kaWZmXG5cbiAgICAgIGNvbW1fZGJsX3BhMjk1X2RpZmY6IGNvbW1fZGJsX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1OiBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlyOiBAZ2V0RGlyQ2xhc3MgY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgIGNvbW1fZGJsX3BhMjk1X3BlcmNfZGlmZjogY29tbV9kYmxfcGEyOTVfcGVyY19kaWZmXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG5cbiAgICBAJCgnLmNvbW0tY2hvc2VuLWZjJykuY2hvc2VuKHtkaXNhYmxlX3NlYXJjaF90aHJlc2hvbGQ6IDEwLCB3aWR0aDonMjIwcHgnfSlcbiAgICBAJCgnLmNvbW0tY2hvc2VuLWZjJykuY2hhbmdlICgpID0+XG4gICAgICBAcmVuZGVyRGlmZnMoJy5jb21tLWNob3Nlbi1mYycsICdjb21tJywgJ2ZjJylcblxuICAgIEAkKCcucmVzLWNob3Nlbi1mYycpLmNob3Nlbih7ZGlzYWJsZV9zZWFyY2hfdGhyZXNob2xkOiAxMCwgd2lkdGg6JzIyMHB4J30pXG4gICAgQCQoJy5yZXMtY2hvc2VuLWZjJykuY2hhbmdlICgpID0+XG4gICAgICBAcmVuZGVyRGlmZnMoJy5yZXMtY2hvc2VuLWZjJywgJ3JlcycsICdmYycpXG5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGggPSAzMjBcbiAgICAgIHcgPSAzODBcbiAgICAgIG1hcmdpbiA9IHtsZWZ0OjQwLCB0b3A6NSwgcmlnaHQ6NDAsIGJvdHRvbTogNDAsIGlubmVyOjV9XG4gICAgICBoYWxmaCA9IChoK21hcmdpbi50b3ArbWFyZ2luLmJvdHRvbSlcbiAgICAgIHRvdGFsaCA9IGhhbGZoKjJcbiAgICAgIGhhbGZ3ID0gKHcrbWFyZ2luLmxlZnQrbWFyZ2luLnJpZ2h0KVxuICAgICAgdG90YWx3ID0gaGFsZncqMlxuICAgICAgXG4gICAgICBjb21fY2hhcnQgPSBAZHJhd0NoYXJ0KCcuY29tbWVyY2lhbEZ1ZWxDb3N0cycpLnh2YXIoMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnl2YXIoMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnhsYWIoXCJZZWFyXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC55bGFiKFwiVmFsdWUgKGluIG1pbGxpb24gJClcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmhlaWdodChoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAud2lkdGgodylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcmdpbihtYXJnaW4pXG5cbiAgICAgIGNoID0gZDMuc2VsZWN0KEAkKCcuY29tbWVyY2lhbEZ1ZWxDb3N0cycpKVxuICAgICAgY2guZGF0dW0oc29ydGVkX2NvbW1fcmVzdWx0cylcbiAgICAgICAgLmNhbGwoY29tX2NoYXJ0KVxuXG4gICAgICByZXNfY2hhcnQgPSBAZHJhd0NoYXJ0KCcucmVzaWRlbnRpYWxGdWVsQ29zdHMnKS54dmFyKDApXG4gICAgICAgICAgICAgICAgICAgICAueXZhcigxKVxuICAgICAgICAgICAgICAgICAgICAgLnhsYWIoXCJZZWFyXCIpXG4gICAgICAgICAgICAgICAgICAgICAueWxhYihcIlZhbHVlIChpbiBtaWxsaW9uICQpXCIpXG4gICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KGgpXG4gICAgICAgICAgICAgICAgICAgICAud2lkdGgodylcbiAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4obWFyZ2luKVxuXG4gICAgICBjaCA9IGQzLnNlbGVjdChAJCgnLnJlc2lkZW50aWFsRnVlbENvc3RzJykpXG4gICAgICBjaC5kYXR1bShzb3J0ZWRfcmVzX3Jlc3VsdHMpXG4gICAgICAgIC5jYWxsKHJlc19jaGFydClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZ1ZWxDb3N0c1RhYiIsIlJlcG9ydEdyYXBoVGFiID0gcmVxdWlyZSAncmVwb3J0R3JhcGhUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cblxuY2xhc3MgR3JlZW5ob3VzZUdhc2VzVGFiIGV4dGVuZHMgUmVwb3J0R3JhcGhUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnR3JlZW5ob3VzZSBHYXNlcydcbiAgY2xhc3NOYW1lOiAnZ3JlZW5ob3VzZUdhc2VzJ1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5ncmVlbmhvdXNlR2FzZXNcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0VuZXJneVBsYW4nXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcblxuICAgIHRyeVxuICAgICAgY29tR0hHID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21HSEdcIikudG9BcnJheSgpXG4gICAgICByZXNHSEcgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0dIR1wiKS50b0FycmF5KClcblxuICAgICAgY29tX3BhID0gQGdldE1hcChjb21HSEcsIFwiUEFcIilcbiAgICAgIGNvbV9kYmxwYSA9IEBnZXRNYXAoY29tR0hHLCBcIkRibFBBXCIpXG4gICAgICBjb21fbm9wYSA9IEBnZXRNYXAoY29tR0hHLCBcIk5vUEFcIilcbiAgICAgIFxuICAgICAgY29tX3VzZXIgPSBAZ2V0VXNlck1hcChjb21HSEcsIFwiVVNFUlwiLCBjb21fbm9wYSlcbiAgICAgIGNvbV91c2VyX3NhdmluZ3MgPSBAZ2V0VXNlclNhdmluZ3MoY29tR0hHLCBjb21fdXNlcixjb21fbm9wYSwgMSlcbiAgICAgIHNvcnRlZF9jb21tX3Jlc3VsdHMgPSBbY29tX25vcGEsIGNvbV9wYSwgY29tX2RibHBhLCBjb21fdXNlcl1cblxuICAgICAgcmVzX3BhID0gQGdldE1hcChyZXNHSEcsIFwiUEFcIilcbiAgICAgIHJlc19kYmxwYSA9IEBnZXRNYXAocmVzR0hHLCBcIkRibFBBXCIpXG4gICAgICByZXNfbm9wYSA9IEBnZXRNYXAocmVzR0hHLCBcIk5vUEFcIilcbiAgICAgIFxuICAgICAgcmVzX3VzZXIgPSBAZ2V0VXNlck1hcChyZXNHSEcsIFwiVVNFUlwiLCByZXNfbm9wYSlcbiAgICAgIHJlc191c2VyX3NhdmluZ3MgPSBAZ2V0VXNlclNhdmluZ3MocmVzR0hHLCByZXNfdXNlcixyZXNfbm9wYSwgMSlcbiAgICAgIHNvcnRlZF9yZXNfcmVzdWx0cyA9IFtyZXNfbm9wYSwgcmVzX3BhLCByZXNfZGJscGEsIHJlc191c2VyXVxuXG4gICAgICBzY2VuYXJpb3MgPSBbJ1BBIDI5NScsICdObyBQQSAyOTUnLCAnRG91YmxlIFBBIDI5NSddXG5cbiAgICAgIHJlc19zdW0gPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0dIR1N1bVwiKS5mbG9hdCgnVVNFUl9TVU0nLCAxKVxuICAgICAgcmVzX3BhMjk1X3RvdGFsX2doZyA9ICAgICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0dIR1N1bVwiKS5mbG9hdCgnUEFfU1VNJywgMSlcbiAgICAgIHJlc19ub19wYTI5NV90b3RhbF9naGcgPSAgQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNHSEdTdW1cIikuZmxvYXQoJ05PUEFfU1VNJywgMSlcbiAgICAgIHJlc19kYmxfcGEyOTVfdG90YWxfZ2hnID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNHSEdTdW1cIikuZmxvYXQoJ0RCTFBBX1NVTScsIDEpXG5cbiAgICAgIHJlc19wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgocmVzX3BhMjk1X3RvdGFsX2doZyAtIHJlc19zdW0pLDApXG4gICAgICByZXNfcGEyOTVfcGVyY19kaWZmID0gTWF0aC5yb3VuZCgoKE1hdGguYWJzKHJlc19wYTI5NV9kaWZmKS9yZXNfc3VtKSoxMDApLDApXG4gICAgICByZXNfaGFzX3NhdmluZ3NfcGEyOTUgPSByZXNfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCByZXNfaGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgICAgcmVzX3BhMjk1X2RpZmYgPSBNYXRoLmFicyhyZXNfcGEyOTVfZGlmZilcbiAgICAgIHJlc19wYTI5NV9kaWZmID0gQGFkZENvbW1hcyByZXNfcGEyOTVfZGlmZlxuXG4gICAgICByZXNfbm9fcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKHJlc19ub19wYTI5NV90b3RhbF9naGcgLSByZXNfc3VtKSwwKVxuICAgICAgcmVzX25vX3BhMjk1X3BlcmNfZGlmZiA9IE1hdGgucm91bmQoKChNYXRoLmFicyhyZXNfbm9fcGEyOTVfZGlmZikvcmVzX3N1bSkqMTAwKSwwKVxuICAgICAgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1ID0gcmVzX25vX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICAgIHJlc19ub19wYTI5NV9kaWZmID0gTWF0aC5hYnMocmVzX25vX3BhMjk1X2RpZmYpXG4gICAgICByZXNfbm9fcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgcmVzX25vX3BhMjk1X2RpZmZcblxuICAgICAgcmVzX2RibF9wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgocmVzX2RibF9wYTI5NV90b3RhbF9naGcgLSByZXNfc3VtKSwwKVxuICAgICAgcmVzX2RibF9wYTI5NV9wZXJjX2RpZmYgPSBNYXRoLnJvdW5kKCgoTWF0aC5hYnMocmVzX2RibF9wYTI5NV9kaWZmKS9yZXNfc3VtKSoxMDApLDApXG4gICAgICByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1ID0gcmVzX2RibF9wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuICAgICAgICByZXNfZGJsX3BhMjk1X2RpZmYgPSBNYXRoLmFicyhyZXNfZGJsX3BhMjk1X2RpZmYpXG4gICAgICByZXNfZGJsX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIHJlc19kYmxfcGEyOTVfZGlmZlxuXG4gICAgICBjb21tX3N1bSA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tR0hHU3VtXCIpLmZsb2F0KCdVU0VSX1NVTScsIDEpXG4gICAgICBjb21tX3BhMjk1X3RvdGFsX2doZyA9ICAgICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUdIR1N1bVwiKS5mbG9hdCgnUEFfU1VNJywgMSlcbiAgICAgIGNvbW1fbm9fcGEyOTVfdG90YWxfZ2hnID0gIEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tR0hHU3VtXCIpLmZsb2F0KCdOT1BBX1NVTScsIDEpXG4gICAgICBjb21tX2RibF9wYTI5NV90b3RhbF9naGcgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUdIR1N1bVwiKS5mbG9hdCgnREJMUEFfU1VNJywgMSlcblxuICAgICAgY29tbV9wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgoY29tbV9wYTI5NV90b3RhbF9naGcgLSBjb21tX3N1bSksMClcbiAgICAgIGNvbW1fcGEyOTVfcGVyY19kaWZmID0gTWF0aC5yb3VuZCgoKE1hdGguYWJzKGNvbW1fcGEyOTVfZGlmZikvY29tbV9zdW0pKjEwMCksMClcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfcGEyOTUgPSBjb21tX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgY29tbV9oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgICBjb21tX3BhMjk1X2RpZmY9TWF0aC5hYnMoY29tbV9wYTI5NV9kaWZmKVxuICAgICAgY29tbV9wYTI5NV9kaWZmID0gQGFkZENvbW1hcyBjb21tX3BhMjk1X2RpZmZcblxuICAgICAgY29tbV9ub19wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgoY29tbV9ub19wYTI5NV90b3RhbF9naGcgLSBjb21tX3N1bSksMClcbiAgICAgIGNvbW1fbm9fcGEyOTVfcGVyY19kaWZmID0gTWF0aC5yb3VuZCgoKE1hdGguYWJzKGNvbW1fbm9fcGEyOTVfZGlmZikvY29tbV9zdW0pKjEwMCksMClcbiAgICAgIGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTUgPSBjb21tX25vX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NVxuICAgICAgICBjb21tX25vX3BhMjk1X2RpZmYgPSBNYXRoLmFicyhjb21tX25vX3BhMjk1X2RpZmYpXG4gICAgICBjb21tX25vX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIGNvbW1fbm9fcGEyOTVfZGlmZlxuXG5cblxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKGNvbW1fZGJsX3BhMjk1X3RvdGFsX2doZyAtIGNvbW1fc3VtKSwwKVxuICAgICAgY29tbV9kYmxfcGEyOTVfcGVyY19kaWZmID0gTWF0aC5yb3VuZCgoKE1hdGguYWJzKGNvbW1fZGJsX3BhMjk1X2RpZmYpL2NvbW1fc3VtKSoxMDApLDApXG4gICAgICBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NSA9IGNvbW1fZGJsX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZiA9IE1hdGguYWJzKGNvbW1fZGJsX3BhMjk1X2RpZmYpXG4gICAgICBjb21tX2RibF9wYTI5NV9kaWZmID0gQGFkZENvbW1hcyBjb21tX2RibF9wYTI5NV9kaWZmXG5cbiAgICBjYXRjaCBlXG4gICAgICBjb25zb2xlLmxvZyhcImVycm9yOiBcIiwgZSlcblxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBjb21fdXNlcl9zYXZpbmdzOiBjb21fdXNlcl9zYXZpbmdzXG4gICAgICByZXNfdXNlcl9zYXZpbmdzOiByZXNfdXNlcl9zYXZpbmdzXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcblxuICAgICAgc2NlbmFyaW9zOiBzY2VuYXJpb3NcbiAgICAgIHJlc19wYTI5NV9kaWZmOiByZXNfcGEyOTVfZGlmZlxuICAgICAgcmVzX2hhc19zYXZpbmdzX3BhMjk1OiByZXNfaGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgIHJlc19wYTI5NV9kaXI6IEBnZXREaXJDbGFzcyByZXNfaGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgIHJlc19wYTI5NV9wZXJjX2RpZmY6IHJlc19wYTI5NV9wZXJjX2RpZmZcblxuICAgICAgcmVzX25vX3BhMjk1X2RpZmY6IHJlc19ub19wYTI5NV9kaWZmXG4gICAgICByZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTU6IHJlc19oYXNfc2F2aW5nc19ub19wYTI5NVxuICAgICAgcmVzX25vX3BhMjk1X2RpcjogQGdldERpckNsYXNzIHJlc19oYXNfc2F2aW5nc19ub19wYTI5NVxuICAgICAgcmVzX25vX3BhMjk1X3BlcmNfZGlmZjogcmVzX25vX3BhMjk1X3BlcmNfZGlmZlxuXG5cbiAgICAgIHJlc19kYmxfcGEyOTVfZGlmZjogcmVzX2RibF9wYTI5NV9kaWZmXG4gICAgICByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1OiByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1XG4gICAgICByZXNfZGJsX3BhMjk1X2RpcjogQGdldERpckNsYXNzIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgIHJlc19kYmxfcGEyOTVfcGVyY19kaWZmOiByZXNfZGJsX3BhMjk1X3BlcmNfZGlmZlxuXG4gICAgICBjb21tX3BhMjk1X2RpZmY6IGNvbW1fcGEyOTVfZGlmZlxuICAgICAgY29tbV9oYXNfc2F2aW5nc19wYTI5NTogY29tbV9oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgY29tbV9wYTI5NV9kaXI6IEBnZXREaXJDbGFzcyBjb21tX2hhc19zYXZpbmdzX3BhMjk1XG4gICAgICBjb21tX3BhMjk1X3BlcmNfZGlmZjogY29tbV9wYTI5NV9wZXJjX2RpZmZcblxuICAgICAgY29tbV9ub19wYTI5NV9kaWZmOiBjb21tX25vX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTU6IGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcbiAgICAgIGNvbW1fbm9fcGEyOTVfZGlyOiBAZ2V0RGlyQ2xhc3MgY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NVxuICAgICAgY29tbV9ub19wYTI5NV9wZXJjX2RpZmY6IGNvbW1fbm9fcGEyOTVfcGVyY19kaWZmXG5cbiAgICAgIGNvbW1fZGJsX3BhMjk1X2RpZmY6IGNvbW1fZGJsX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1OiBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlyOiBAZ2V0RGlyQ2xhc3MgY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgIGNvbW1fZGJsX3BhMjk1X3BlcmNfZGlmZjogY29tbV9kYmxfcGEyOTVfcGVyY19kaWZmXG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG5cbiAgICBAJCgnLmNvbW0tY2hvc2VuLWdoZycpLmNob3Nlbih7ZGlzYWJsZV9zZWFyY2hfdGhyZXNob2xkOiAxMCwgd2lkdGg6JzIwMHB4J30pXG4gICAgQCQoJy5jb21tLWNob3Nlbi1naGcnKS5jaGFuZ2UgKCkgPT5cbiAgICAgIEByZW5kZXJEaWZmcygnLmNvbW0tY2hvc2VuLWdoZycsICdjb21tJywgJ2doZycpXG5cbiAgICBAJCgnLnJlcy1jaG9zZW4tZ2hnJykuY2hvc2VuKHtkaXNhYmxlX3NlYXJjaF90aHJlc2hvbGQ6IDEwLCB3aWR0aDonMjAwcHgnfSlcbiAgICBAJCgnLnJlcy1jaG9zZW4tZ2hnJykuY2hhbmdlICgpID0+XG4gICAgICBAcmVuZGVyRGlmZnMoJy5yZXMtY2hvc2VuLWdoZycsICdyZXMnLCAnZ2hnJylcblxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgaCA9IDMyMFxuICAgICAgdyA9IDM4MFxuICAgICAgbWFyZ2luID0ge2xlZnQ6NDAsIHRvcDo1LCByaWdodDo0MCwgYm90dG9tOiA0MCwgaW5uZXI6NX1cbiAgICAgIGhhbGZoID0gKGgrbWFyZ2luLnRvcCttYXJnaW4uYm90dG9tKVxuICAgICAgdG90YWxoID0gaGFsZmgqMlxuICAgICAgaGFsZncgPSAodyttYXJnaW4ubGVmdCttYXJnaW4ucmlnaHQpXG4gICAgICB0b3RhbHcgPSBoYWxmdyoyXG4gICAgICBcblxuICAgICAgY29tX2NoYXJ0ID0gQGRyYXdDaGFydCgnLmNvbW1lcmNpYWxHcmVlbmhvdXNlR2FzZXMnKS54dmFyKDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC55dmFyKDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC54bGFiKFwiWWVhclwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueWxhYihcIlZhbHVlXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLndpZHRoKHcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4obWFyZ2luKVxuXG4gICAgICBjaCA9IGQzLnNlbGVjdChAJCgnLmNvbW1lcmNpYWxHcmVlbmhvdXNlR2FzZXMnKSlcbiAgICAgIGNoLmRhdHVtKHNvcnRlZF9jb21tX3Jlc3VsdHMpXG4gICAgICAgIC5jYWxsKGNvbV9jaGFydClcblxuICAgICAgcmVzX2NoYXJ0ID0gQGRyYXdDaGFydCgnLnJlc2lkZW50aWFsR3JlZW5ob3VzZUdhc2VzJykueHZhcigwKVxuICAgICAgICAgICAgICAgICAgICAgLnl2YXIoMSlcbiAgICAgICAgICAgICAgICAgICAgIC54bGFiKFwiWWVhclwiKVxuICAgICAgICAgICAgICAgICAgICAgLnlsYWIoXCJWYWx1ZVwiKVxuICAgICAgICAgICAgICAgICAgICAgLmhlaWdodChoKVxuICAgICAgICAgICAgICAgICAgICAgLndpZHRoKHcpXG4gICAgICAgICAgICAgICAgICAgICAubWFyZ2luKG1hcmdpbilcblxuICAgICAgY2ggPSBkMy5zZWxlY3QoQCQoJy5yZXNpZGVudGlhbEdyZWVuaG91c2VHYXNlcycpKVxuICAgICAgY2guZGF0dW0oc29ydGVkX3Jlc19yZXN1bHRzKVxuICAgICAgICAuY2FsbChyZXNfY2hhcnQpXG5cbm1vZHVsZS5leHBvcnRzID0gR3JlZW5ob3VzZUdhc2VzVGFiIiwiRW5lcmd5Q29uc3VtcHRpb25UYWIgPSByZXF1aXJlICcuL2VuZXJneUNvbnN1bXB0aW9uLmNvZmZlZSdcbkZ1ZWxDb3N0c1RhYiA9IHJlcXVpcmUgJy4vZnVlbENvc3RzLmNvZmZlZSdcbkdyZWVuaG91c2VHYXNlc1RhYiA9IHJlcXVpcmUgJy4vZ3JlZW5ob3VzZUdhc2VzLmNvZmZlZSdcblxud2luZG93LmFwcC5yZWdpc3RlclJlcG9ydCAocmVwb3J0KSAtPlxuICByZXBvcnQudGFicyBbRW5lcmd5Q29uc3VtcHRpb25UYWIsIEZ1ZWxDb3N0c1RhYiwgR3JlZW5ob3VzZUdhc2VzVGFiXVxuICAjIHBhdGggbXVzdCBiZSByZWxhdGl2ZSB0byBkaXN0L1xuICByZXBvcnQuc3R5bGVzaGVldHMgWycuL3JlcG9ydC5jc3MnXVxuXG5cbiIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuY2xhc3MgUmVwb3J0R3JhcGhUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcblxuICBuYW1lOiAnUmVwb3J0R3JhcGgnXG4gIGNsYXNzTmFtZTogJ1JlcG9ydEdyYXBoJ1xuICB0aW1lb3V0OiAxMjAwMDBcblxuICByZW5kZXJEaWZmczogKHdoaWNoX2Nob3NlbiwgY2UsIHRhYikgLT4gXG5cblxuICAgIG5hbWUgPSBAJCh3aGljaF9jaG9zZW4pLnZhbCgpXG4gICAgQCQoJy5kZWZhdWx0LWNob3Nlbi1zZWxlY3Rpb24nKydfJyt0YWIpLmhpZGUoKVxuXG4gICAgaWYgbmFtZSA9PSBcIk5vIFBBIDI5NVwiXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5ub19wYTI5NScsIGNlLCB0YWIpKS5zaG93KClcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLnBhMjk1JyxjZSx0YWIpKS5oaWRlKClcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLmRibF9wYTI5NScsY2UsdGFiKSkuaGlkZSgpXG4gICAgZWxzZSBpZiBuYW1lID09IFwiUEEgMjk1XCJcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLm5vX3BhMjk1JyxjZSx0YWIpKS5oaWRlKClcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLnBhMjk1JywgY2UsIHRhYikpLnNob3coKVxuICAgICAgQCQoQGdldEVsZW1OYW1lKCcuZGJsX3BhMjk1JyxjZSx0YWIpKS5oaWRlKClcbiAgICBlbHNlXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5ub19wYTI5NScsY2UsdGFiKSkuaGlkZSgpXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5wYTI5NScsY2UsdGFiKSkuaGlkZSgpXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5kYmxfcGEyOTUnLGNlLHRhYikpLnNob3coKVxuXG4gIGdldEVsZW1OYW1lOiAobmFtZSwgY29tbV9vcl9lYywgdGFiKSAtPlxuICAgIHJldHVybiBuYW1lK1wiX1wiK2NvbW1fb3JfZWMrXCJfXCIrdGFiXG5cbiAgZ2V0RGlyQ2xhc3M6IChkaXIpIC0+XG4gICAgcmV0dXJuIGlmIGRpciB0aGVuICdwb3NpdGl2ZScgZWxzZSAnbmVnYXRpdmUnXG4gICAgXG4gIGdldFVzZXJTYXZpbmdzOiAocmVjU2V0LCB1c2VyX3N0YXJ0X3ZhbHVlcywgYmFzZV92YWx1ZXMsIGRlY3MpIC0+XG5cbiAgICBzYXZpbmdzID0gMFxuICAgIHRyeVxuICAgICAgZm9yIHZhbCwgZGV4IGluIGJhc2VfdmFsdWVzXG4gICAgICAgIHVzZXJfdmFsID0gdXNlcl9zdGFydF92YWx1ZXNbZGV4XS5WQUxVRVxuICAgICAgICBiYXNlX3ZhbCA9IHZhbC5WQUxVRVxuICAgICAgICBzYXZpbmdzICs9IChiYXNlX3ZhbCAtIHVzZXJfdmFsKVxuICAgICAgcmV0dXJuIE1hdGgucm91bmQoc2F2aW5ncywgZGVjcylcbiAgICBjYXRjaCBlcnJvclxuICAgICAgcmV0dXJuIDAuMFxuXG4gIGdldFVzZXJNYXA6IChyZWNTZXQsIHVzZXJfdGFnLCBiYXNlX3ZhbHVlcykgLT5cbiAgICB1c2VyX3N0YXJ0X3ZhbHVlcyA9IFtdXG4gICAgZm9yIHJlYyBpbiByZWNTZXRcbiAgICAgIGlmIHJlYyBhbmQgcmVjLlRZUEUgPT0gdXNlcl90YWdcbiAgICAgICAgdXNlcl9zdGFydF92YWx1ZXMucHVzaChyZWMpXG4gICAgdXNlcl9zdGFydF92YWx1ZXMgPSBfLnNvcnRCeSB1c2VyX3N0YXJ0X3ZhbHVlcywgKHJvdykgLT4gcm93WydZRUFSJ11cbiAgICByZXR1cm4gdXNlcl9zdGFydF92YWx1ZXNcblxuXG4gIGdldE1hcDogKHJlY1NldCwgc2NlbmFyaW8pIC0+XG4gICAgc2NlbmFyaW9fdmFsdWVzID0gW11cbiAgICBmb3IgcmVjIGluIHJlY1NldFxuICAgICAgaWYgcmVjIGFuZCByZWMuVFlQRSA9PSBzY2VuYXJpb1xuICAgICAgICBzY2VuYXJpb192YWx1ZXMucHVzaChyZWMpXG5cbiAgICByZXR1cm4gXy5zb3J0Qnkgc2NlbmFyaW9fdmFsdWVzLCAocm93KSAtPiByb3dbJ1lFQVInXVxuICBcbiAgYWRkQ29tbWFzOiAobnVtX3N0cikgPT5cbiAgICBudW1fc3RyICs9ICcnXG4gICAgeCA9IG51bV9zdHIuc3BsaXQoJy4nKVxuICAgIHgxID0geFswXVxuICAgIHgyID0gaWYgeC5sZW5ndGggPiAxIHRoZW4gJy4nICsgeFsxXSBlbHNlICcnXG4gICAgcmd4ID0gLyhcXGQrKShcXGR7M30pL1xuICAgIHdoaWxlIHJneC50ZXN0KHgxKVxuICAgICAgeDEgPSB4MS5yZXBsYWNlKHJneCwgJyQxJyArICcsJyArICckMicpXG4gICAgcmV0dXJuIHgxICsgeDJcblxuICBkcmF3Q2hhcnQ6ICh3aGljaENoYXJ0KSA9PlxuICAgIHZpZXcgPSBAXG4gICAgd2lkdGggPSAzNjBcbiAgICBoZWlnaHQgPSA1MDBcbiAgICBtYXJnaW4gPSB7bGVmdDo0MCwgdG9wOjUsIHJpZ2h0OjIwLCBib3R0b206IDQwLCBpbm5lcjoxMH1cbiAgICBheGlzcG9zID0ge3h0aXRsZTo1LCB5dGl0bGU6MzAsIHhsYWJlbDo1LCB5bGFiZWw6MTV9XG4gICAgeGxpbSA9IG51bGxcbiAgICB5bGltID0gbnVsbFxuICAgIG54dGlja3MgPSA1XG4gICAgeHRpY2tzID0gbnVsbFxuICAgIG55dGlja3MgPSA1XG4gICAgeXRpY2tzID0gbnVsbFxuXG4gICAgcmVjdGNvbG9yID0gXCIjZGJlNGVlXCJcbiAgICB0aWNrY29sb3IgPSBcIiNkYmU0ZmZcIlxuICAgIGNvbnNvbGUubG9nKFwiZHJhd2luZyBjaGFydCBub3cuLi5cIilcblxuICAgIHBvaW50c2l6ZSA9IDEgIyBkZWZhdWx0ID0gbm8gdmlzaWJsZSBwb2ludHMgYXQgbWFya2Vyc1xuICAgIHhsYWIgPSBcIlhcIlxuICAgIHlsYWIgPSBcIlkgc2NvcmVcIlxuICAgIHlzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgeHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblxuICAgIGxlZ2VuZGhlaWdodCA9IDMwMFxuICAgIHBvaW50c1NlbGVjdCA9IG51bGxcbiAgICBsYWJlbHNTZWxlY3QgPSBudWxsXG4gICAgbGVnZW5kU2VsZWN0ID0gbnVsbFxuICAgICMjIHRoZSBtYWluIGZ1bmN0aW9uXG4gICAgY2hhcnQgPSAoc2VsZWN0aW9uKSAtPlxuICAgICAgc2VsZWN0aW9uLmVhY2ggKGRhdGEpIC0+XG4gICAgICAgIHkgPSBbXVxuICAgICAgICB4ID0gWzIwMTIsIDIwMTUsIDIwMjAsIDIwMjUsIDIwMzAsIDIwMzVdXG4gICAgICAgXG4gICAgICAgIGZvciBzY2VuIGluIGRhdGFcbiAgICAgICAgICBmb3IgZCBpbiBzY2VuXG4gICAgICAgICAgICB5LnB1c2goZC5WQUxVRS8xMDAwMDAwKVxuXG5cbiAgICAgICAgI3ggPSBkYXRhLm1hcCAoZCkgLT4gcGFyc2VGbG9hdChkLllFQVIpXG4gICAgICAgICN5ID0gZGF0YS5tYXAgKGQpIC0+IHBhcnNlRmxvYXQoZC5WQUxVRSlcblxuXG4gICAgICAgIHBhbmVsb2Zmc2V0ID0gMTBcbiAgICAgICAgcGFuZWx3aWR0aCA9IHdpZHRoXG5cbiAgICAgICAgcGFuZWxoZWlnaHQgPSBoZWlnaHRcblxuICAgICAgICB4bGltID0gW2QzLm1pbih4KS0xLCBwYXJzZUZsb2F0KGQzLm1heCh4KSsxKV0gaWYgISh4bGltPylcblxuICAgICAgICB5bGltID0gW2QzLm1pbih5KSwgcGFyc2VGbG9hdChkMy5tYXgoeSkpXSBpZiAhKHlsaW0/KVxuXG5cbiAgICAgICAgY3VycmVsZW0gPSBkMy5zZWxlY3Qodmlldy4kKHdoaWNoQ2hhcnQpWzBdKVxuICAgICAgICBzdmcgPSBkMy5zZWxlY3Qodmlldy4kKHdoaWNoQ2hhcnQpWzBdKS5hcHBlbmQoXCJzdmdcIikuZGF0YShbZGF0YV0pXG4gICAgICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG5cbiAgICAgICAgIyBVcGRhdGUgdGhlIG91dGVyIGRpbWVuc2lvbnMuXG4gICAgICAgIHN2Zy5hdHRyKFwid2lkdGhcIiwgd2lkdGgrbWFyZ2luLmxlZnQrbWFyZ2luLnJpZ2h0KVxuICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQrbWFyZ2luLnRvcCttYXJnaW4uYm90dG9tK2RhdGEubGVuZ3RoKjM1KVxuXG4gICAgICAgIGcgPSBzdmcuc2VsZWN0KFwiZ1wiKVxuXG4gICAgICAgICMgYm94XG4gICAgICAgIGcuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgLmF0dHIoXCJ4XCIsIHBhbmVsb2Zmc2V0K21hcmdpbi5sZWZ0KVxuICAgICAgICAgLmF0dHIoXCJ5XCIsIG1hcmdpbi50b3ApXG4gICAgICAgICAuYXR0cihcImhlaWdodFwiLCBwYW5lbGhlaWdodClcbiAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgcGFuZWx3aWR0aClcbiAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIndoaXRlXCIpXG4gICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcIm5vbmVcIilcblxuXG4gICAgICAgICMgc2ltcGxlIHNjYWxlcyAoaWdub3JlIE5BIGJ1c2luZXNzKVxuICAgICAgICB4cmFuZ2UgPSBbbWFyZ2luLmxlZnQrcGFuZWxvZmZzZXQrbWFyZ2luLmlubmVyLCBtYXJnaW4ubGVmdCtwYW5lbG9mZnNldCtwYW5lbHdpZHRoLW1hcmdpbi5pbm5lcl1cbiAgICAgICAgeXJhbmdlID0gW21hcmdpbi50b3ArcGFuZWxoZWlnaHQtbWFyZ2luLmlubmVyLCBtYXJnaW4udG9wK21hcmdpbi5pbm5lcl1cbiAgICAgICAgeHNjYWxlLmRvbWFpbih4bGltKS5yYW5nZSh4cmFuZ2UpXG4gICAgICAgIHlzY2FsZS5kb21haW4oeWxpbSkucmFuZ2UoeXJhbmdlKVxuICAgICAgICB4cyA9IGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbih4bGltKS5yYW5nZSh4cmFuZ2UpXG4gICAgICAgIHlzID0gZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKHlsaW0pLnJhbmdlKHlyYW5nZSlcblxuXG4gICAgICAgICMgaWYgeXRpY2tzIG5vdCBwcm92aWRlZCwgdXNlIG55dGlja3MgdG8gY2hvb3NlIHByZXR0eSBvbmVzXG4gICAgICAgIHl0aWNrcyA9IHlzLnRpY2tzKG55dGlja3MpIGlmICEoeXRpY2tzPylcbiAgICAgICAgeHRpY2tzID0geHMudGlja3Mobnh0aWNrcykgaWYgISh4dGlja3M/KVxuXG4gICAgICAgICMgeC1heGlzXG4gICAgICAgIHhheGlzID0gZy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInggYXhpc1wiKVxuICAgICAgICB4YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKHh0aWNrcylcbiAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgIC5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCAoZCkgLT4geHNjYWxlKGQpKVxuICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgKGQpIC0+IHhzY2FsZShkKSlcbiAgICAgICAgICAgICAuYXR0cihcInkxXCIsIG1hcmdpbi50b3AraGVpZ2h0LTUpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCBtYXJnaW4udG9wK2hlaWdodClcbiAgICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAxKVxuICAgICAgICAgICAgIC5zdHlsZShcInBvaW50ZXItZXZlbnRzXCIsIFwibm9uZVwiKVxuICAgICAgICAjdGhlIHggYXhpcyB5ZWFyIGxhYmVsc1xuICAgICAgICB4YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKHh0aWNrcylcbiAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIChkKSAtPiB4c2NhbGUoZCktMTQpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIG1hcmdpbi50b3AraGVpZ2h0K2F4aXNwb3MueGxhYmVsKzEwKVxuICAgICAgICAgICAgIC50ZXh0KChkKSAtPiBmb3JtYXRBeGlzKHh0aWNrcykoZCkpXG4gICAgICAgICN0aGUgeCBheGlzIHRpdGxlXG4gICAgICAgIHhheGlzLmFwcGVuZChcInRleHRcIikuYXR0cihcImNsYXNzXCIsIFwieGF4aXMtdGl0bGVcIilcbiAgICAgICAgICAgICAuYXR0cihcInhcIiwgbWFyZ2luLmxlZnQrd2lkdGgvMilcbiAgICAgICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLnRvcCtoZWlnaHQrYXhpc3Bvcy54dGl0bGUrMzApXG4gICAgICAgICAgICAgLnRleHQoeGxhYilcblxuICAgICAgICAjZHJhdyB0aGUgbGVnZW5kXG4gICAgICAgIGZvciBzY2VuYXJpbywgY250IGluIGRhdGFcbiAgICAgICAgICBsaW5lX2NvbG9yID0gZ2V0U3Ryb2tlQ29sb3Ioc2NlbmFyaW8pXG4gICAgICAgICAgeGF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YShbc2NlbmFyaW9bMF1dKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZChcImxpbmVcIilcblxuICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgKGQsaSkgLT4gcmV0dXJuIG1hcmdpbi5sZWZ0KVxuICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgKGQsaSkgLT4gcmV0dXJuIG1hcmdpbi5sZWZ0KzEwKVxuICAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgKGQsaSkgLT4gbWFyZ2luLnRvcCtoZWlnaHQrYXhpc3Bvcy54dGl0bGUrKChjbnQrMSkqMzApKzYpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCAoZCxpKSAtPiBtYXJnaW4udG9wK2hlaWdodCtheGlzcG9zLnh0aXRsZSsoKGNudCsxKSozMCkrNilcbiAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiY2hhcnQtbGluZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIChkLGkpIC0+IGxpbmVfY29sb3IpXG4gICAgICAgICAgICAgLmF0dHIoXCJjb2xvclwiLCAoZCxpKSAtPiBsaW5lX2NvbG9yKVxuICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDMpXG5cbiAgICAgICAgI2FuZCB0aGUgbGVnZW5kIHRleHRcbiAgICAgICAgZm9yIHNjZW5hcmlvLCBjbnQgaW4gZGF0YSAgICAgICAgICBcbiAgICAgICAgICB4YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKFtzY2VuYXJpb1swXV0pXG4gICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsZWdlbmQtdGV4dFwiKVxuICAgICAgICAgICAuYXR0cihcInhcIiwgKGQsaSkgLT5cbiAgICAgICAgICAgICAgcmV0dXJuIChtYXJnaW4ubGVmdCsxNykpXG4gICAgICAgICAgIC5hdHRyKFwieVwiLCAoZCxpKSAtPlxuICAgICAgICAgICAgICBtYXJnaW4udG9wK2hlaWdodCsxMCtheGlzcG9zLnh0aXRsZSsoKGNudCsxKSozMCkpXG4gICAgICAgICAgIC50ZXh0KChkLGkpIC0+IHJldHVybiBnZXRTY2VuYXJpb05hbWUoW2RdKSlcblxuICAgICAgICAjIHktYXhpc1xuICAgICAgICB5YXhpcyA9IGcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJ5IGF4aXNcIilcbiAgICAgICAgeWF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YSh5dGlja3MpXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwibGluZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgKGQpIC0+IHlzY2FsZShkKSlcbiAgICAgICAgICAgICAuYXR0cihcInkyXCIsIChkKSAtPiB5c2NhbGUoZCkpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCBtYXJnaW4ubGVmdCsxMClcbiAgICAgICAgICAgICAuYXR0cihcIngyXCIsIG1hcmdpbi5sZWZ0KzE1KVxuICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIilcbiAgICAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCB0aWNrY29sb3IpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSlcbiAgICAgICAgICAgICAuc3R5bGUoXCJwb2ludGVyLWV2ZW50c1wiLCBcIm5vbmVcIilcblxuICAgICAgICB5YXhpc19sb2MgPSAoZCkgLT4geXNjYWxlKGQpKzNcbiAgICAgICAgeGF4aXNfbG9jID0gKG1hcmdpbi5sZWZ0LTQpLWF4aXNwb3MueWxhYmVsXG5cbiAgICAgICAgeWF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YSh5dGlja3MpXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCB5YXhpc19sb2MpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIHhheGlzX2xvYylcbiAgICAgICAgICAgICAudGV4dCgoZCkgLT4gZm9ybWF0QXhpcyh5dGlja3MpKGQpKVxuICAgICAgICB5YXhpcy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcInRpdGxlXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIG1hcmdpbi50b3ArMzUraGVpZ2h0LzIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIG1hcmdpbi5sZWZ0KzYtYXhpc3Bvcy55dGl0bGUpXG4gICAgICAgICAgICAgLnRleHQoeWxhYilcbiAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInJvdGF0ZSgyNzAsI3ttYXJnaW4ubGVmdCs0LWF4aXNwb3MueXRpdGxlfSwje21hcmdpbi50b3ArMzUraGVpZ2h0LzJ9KVwiKVxuXG4gICAgICAgIHBvaW50cyA9IGcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiaWRcIiwgXCJwb2ludHNcIilcblxuICAgICAgICBmb3Igc2NlbmFyaW8gaW4gZGF0YVxuICAgICAgICAgIGxpbmVfY29sb3IgPSBnZXRTdHJva2VDb2xvcihzY2VuYXJpbylcbiAgICAgICAgICAjIyNcbiAgICAgICAgICBwb2ludHNTZWxlY3QgPVxuICAgICAgICAgICAgcG9pbnRzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgICAgICAuZGF0YShzY2VuYXJpbylcbiAgICAgICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiY2lyY2xlXCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImN4XCIsIChkLGkpIC0+IHhzY2FsZShkLllFQVIpKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjeVwiLCAoZCxpKSAtPiB5c2NhbGUoZC5WQUxVRS8xMDAwMDAwKSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgKGQsaSkgLT4gXCJwdCN7aX1cIilcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwiclwiLCBwb2ludHNpemUpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgKGQsaSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWwgPSBpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sID0gbGluZV9jb2xvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCAoZCwgaSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWwgPSBNYXRoLmZsb29yKGkvMTcpICUgNVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbCA9IGxpbmVfY29sb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgXCIxXCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcIm9wYWNpdHlcIiwgKGQsaSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDEgaWYgKHhbaV0/IG9yIHhOQS5oYW5kbGUpIGFuZCAoeVtpXT8gb3IgeU5BLmhhbmRsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDApXG4gICAgICAgICAgIyMjXG4gICAgICAgIGxpbmUgPSBkMy5zdmcubGluZShkKVxuICAgICAgICAgICAgLmludGVycG9sYXRlKFwiYmFzaXNcIilcbiAgICAgICAgICAgIC54KCAoZCkgLT4geHNjYWxlKHBhcnNlSW50KGQuWUVBUikpKVxuICAgICAgICAgICAgLnkoIChkKSAtPiB5c2NhbGUoZC5WQUxVRS8xMDAwMDAwKSlcblxuXG4gICAgICAgIHBvaW50cy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKFwicGF0aFwiKVxuICAgICAgICAgIC5hdHRyKFwiZFwiLCAoZCkgLT4gbGluZSBkKVxuICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIChkKSAtPiBnZXRTdHJva2VDb2xvcihkKSlcbiAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAzKVxuICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIilcblxuICAgICAgICAjIGJveFxuICAgICAgICBnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBtYXJnaW4ubGVmdCtwYW5lbG9mZnNldClcbiAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgcGFuZWxoZWlnaHQpXG4gICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHBhbmVsd2lkdGgpXG4gICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG4gICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcImJsYWNrXCIpXG4gICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCBcIm5vbmVcIilcblxuXG5cbiAgICAjIyBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnNcblxuXG4gICAgY2hhcnQud2lkdGggPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gd2lkdGggaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHdpZHRoID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5oZWlnaHQgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gaGVpZ2h0IGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBoZWlnaHQgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lm1hcmdpbiA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBtYXJnaW4gaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIG1hcmdpbiA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQuYXhpc3BvcyA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBheGlzcG9zIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBheGlzcG9zID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC54bGltID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHhsaW0gaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHhsaW0gPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lm54dGlja3MgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gbnh0aWNrcyBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgbnh0aWNrcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueHRpY2tzID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHh0aWNrcyBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeHRpY2tzID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC55bGltID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHlsaW0gaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHlsaW0gPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lm55dGlja3MgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gbnl0aWNrcyBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgbnl0aWNrcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueXRpY2tzID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHl0aWNrcyBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeXRpY2tzID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5yZWN0Y29sb3IgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gcmVjdGNvbG9yIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICByZWN0Y29sb3IgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnBvaW50Y29sb3IgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gcG9pbnRjb2xvciBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgcG9pbnRjb2xvciA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQucG9pbnRzaXplID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHBvaW50c2l6ZSBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgcG9pbnRzaXplID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5wb2ludHN0cm9rZSA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBwb2ludHN0cm9rZSBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgcG9pbnRzdHJva2UgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnhsYWIgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geGxhYiBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeGxhYiA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueWxhYiA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB5bGFiIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB5bGFiID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC54dmFyID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHh2YXIgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHh2YXIgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lnl2YXIgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geXZhciBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeXZhciA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueXNjYWxlID0gKCkgLT5cbiAgICAgIHJldHVybiB5c2NhbGVcblxuICAgIGNoYXJ0LnhzY2FsZSA9ICgpIC0+XG4gICAgICByZXR1cm4geHNjYWxlXG5cbiAgICBjaGFydC5wb2ludHNTZWxlY3QgPSAoKSAtPlxuICAgICAgcmV0dXJuIHBvaW50c1NlbGVjdFxuXG4gICAgY2hhcnQubGFiZWxzU2VsZWN0ID0gKCkgLT5cbiAgICAgIHJldHVybiBsYWJlbHNTZWxlY3RcblxuICAgIGNoYXJ0LmxlZ2VuZFNlbGVjdCA9ICgpIC0+XG4gICAgICByZXR1cm4gbGVnZW5kU2VsZWN0XG5cbiAgICAjIHJldHVybiB0aGUgY2hhcnQgZnVuY3Rpb25cbiAgICBjaGFydFxuXG4gIGdldFNjZW5hcmlvTmFtZSA9IChzY2VuYXJpbykgLT5cbiAgICBmb3IgZCBpbiBzY2VuYXJpb1xuICAgICAgaWYgZCBpcyB1bmRlZmluZWRcbiAgICAgICAgICByZXR1cm4gXCJVc2VyIFNjZW5hcmlvICh3aXRoIGVycm9ycylcIlxuICAgICAgaWYgZC5UWVBFID09IFwiUEFcIlxuICAgICAgICByZXR1cm4gXCJQQSAyOTVcIlxuICAgICAgZWxzZSBpZiBkLlRZUEUgPT0gXCJOb1BBXCJcbiAgICAgICAgcmV0dXJuIFwiTm8gUEEgMjk1XCJcbiAgICAgIGVsc2UgaWYgZC5UWVBFID09IFwiRGJsUEFcIlxuICAgICAgICByZXR1cm4gXCJEb3VibGUgUEEgMjk1XCJcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIFwiVXNlciBTY2VuYXJpb1wiXG5cbiAgZ2V0U3Ryb2tlQ29sb3IgPSAoc2NlbmFyaW8pIC0+XG4gICAgcGFjb2xvciA9IFwiIzQ2ODJCNFwiXG4gICAgbm9wYWNvbG9yID0gXCIjZTVjYWNlXCJcbiAgICBkYmxwYWNvbG9yID0gXCIjYjNjZmE3XCJcbiAgICBmb3IgZCBpbiBzY2VuYXJpb1xuICAgICAgaWYgZC5UWVBFID09IFwiUEFcIlxuICAgICAgICByZXR1cm4gIHBhY29sb3JcbiAgICAgIGVsc2UgaWYgZC5UWVBFID09IFwiTm9QQVwiXG4gICAgICAgIHJldHVybiBub3BhY29sb3JcbiAgICAgIGVsc2UgaWYgZC5UWVBFID09IFwiRGJsUEFcIlxuICAgICAgICByZXR1cm4gZGJscGFjb2xvclxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gXCJncmF5XCJcblxuXG4gICMgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIHJvdW5kaW5nIG9mIGF4aXMgbGFiZWxzXG4gIGZvcm1hdEF4aXMgPSAoZCkgLT5cbiAgICBkID0gZFsxXSAtIGRbMF1cbiAgICBuZGlnID0gTWF0aC5mbG9vciggTWF0aC5sb2coZCAlIDEwKSAvIE1hdGgubG9nKDEwKSApXG4gICAgbmRpZyA9IDAgaWYgbmRpZyA+IDBcbiAgICBuZGlnID0gTWF0aC5hYnMobmRpZylcbiAgICBkMy5mb3JtYXQoXCIuI3tuZGlnfWZcIilcblxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRHcmFwaFRhYiIsInRoaXNbXCJUZW1wbGF0ZXNcIl0gPSB0aGlzW1wiVGVtcGxhdGVzXCJdIHx8IHt9O1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImVuZXJneUNvbnN1bXB0aW9uXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRJbiBPY3RvYmVyIDIwMDgsIE1pY2hpZ2FuIGVuYWN0ZWQgdGhlIDxhIGhyZWY9XFxcImh0dHA6Ly93d3cubGVnaXNsYXR1cmUubWkuZ292LyhTKHE0ZWI0anppcjJnM2hhemh6aGwxdGQ0NSkpL21pbGVnLmFzcHg/cGFnZT1nZXRvYmplY3Qmb2JqZWN0TmFtZT1tY2wtYWN0LTI5NS1vZi0yMDA4XFxcIj5DbGVhbiwgUmVuZXdhYmxlLCBhbmQgRWZmaWNpZW50IEVuZXJneSBBY3QsIFB1YmxpYyBBY3QgMjk1PC9hPiA8c3Ryb25nPihQQSAyOTUpPC9zdHJvbmc+IEEgZGVzY3JpcHRpb24gb2YgZWFjaCBzY2VuYXJpbyBpcyBwcm92aWRlZCBhdCB0aGUgYm90dG9tIG9mIHRoZSBwYWdlLiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5Db21tZXJjaWFsIEVuZXJneSBDb25zdW1wdGlvbiAtLSBNTUJUVSBFcXVpdmFsZW50PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcImNob29zZXItZGl2XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwic2VsLWxhYmVsXFxcIj5Db21wYXJlIHlvdXIgcGxhbiB0byBzY2VuYXJpbzo8L2Rpdj48c2VsZWN0IGNsYXNzPVxcXCJjb21tLWNob3Nlbi1lY1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPG9wdGlvbiBjbGFzcz1cXFwiZGVmYXVsdC1jaG9zZW4tc2VsZWN0aW9uXFxcIiBsYWJlbD1cXFwiUEEgMjk1XFxcIj48L29wdGlvbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2NlbmFyaW9zXCIsYyxwLDEpLGMscCwwLDY1Niw3MDgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIDwvc2VsZWN0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInBhMjk1X2NvbW1fZWNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8c3BhbiBjbGFzcz1cXFwiZGlmZiBcIik7Xy5iKF8udihfLmYoXCJjb21tX3BhMjk1X2RpclwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5mKFwiY29tbV9wYTI5NV9wZXJjX2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJwYTI5NV9jb21tX2VjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwwLDk2Nyw5NzEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNBVkVcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJVU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKF8udihfLmYoXCJjb21tX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gbW9yZSBNTUJUVSBlcXVpdmFsZW50IGVuZXJneSB0aGFuIHRoZSA8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgY29tbWVyY2lhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcIm5vX3BhMjk1X2NvbW1fZWNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8c3BhbiBjbGFzcz1cXFwiZGlmZiBcIik7Xy5iKF8udihfLmYoXCJjb21tX25vX3BhMjk1X2RpclwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5mKFwiY29tbV9ub19wYTI5NV9wZXJjX2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJub19wYTI5NV9jb21tX2VjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byAgPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMCwxNDMyLDE0MzYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNBVkVcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJVU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKF8udihfLmYoXCJjb21tX25vX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gbW9yZSBNTUJUVSBlcXVpdmFsZW50IGVuZXJneSB0aGFuIHRoZSA8c3Ryb25nPk5vIFBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgY29tbWVyY2lhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcImRibF9wYTI5NV9jb21tX2VjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHNwYW4gY2xhc3M9XFxcImRpZmYgXCIpO18uYihfLnYoXy5mKFwiY29tbV9kYmxfcGEyOTVfZGlyXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKF8udihfLmYoXCJjb21tX2RibF9wYTI5NV9wZXJjX2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfY29tbV9lY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDAsMTkxNiwxOTIwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTQVZFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlVTRVwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtfLmIoXy52KF8uZihcImNvbW1fZGJsX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gbW9yZSBNTUJUVSBlcXVpdmFsZW50IGVuZXJneSB0aGFuIHRoZSA8c3Ryb25nPkRvdWJsZSBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgIGlkPVxcXCJjb21tZXJjaWFsRW5lcmd5Q29uc3VtcHRpb25cXFwiIGNsYXNzPVxcXCJjb21tZXJjaWFsRW5lcmd5Q29uc3VtcHRpb25cXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVzaWRlbnRpYWwgRW5lcmd5IENvbnN1bXB0aW9uIC0tIE1NQlRVIEVxdWl2YWxlbnQ8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJjaG9vc2VyLWRpdlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwic2VsLWxhYmVsXFxcIj5Db21wYXJlIHlvdXIgcGxhbiB0byBzY2VuYXJpbzo8L2Rpdj48c2VsZWN0IGNsYXNzPVxcXCJyZXMtY2hvc2VuLWVjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCwyNTg5LDI2NDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiPC9vcHRpb24+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwicGEyOTVfcmVzX2VjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHNwYW4gY2xhc3M9XFxcImRpZmYgXCIpO18uYihfLnYoXy5mKFwicmVzX3BhMjk1X2RpclwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5mKFwicmVzX3BhMjk1X3BlcmNfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcInBhMjk1X3Jlc19lY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gPHN0cm9uZz5cIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMCwyOTAxLDI5MDUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNBVkVcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlVTRVwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtfLmIoXy52KF8uZihcInJlc19wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG1vcmUgTU1CVFUgZXF1aXZhbGVudCBlbmVyZ3kgdGhhbiB0aGUgPHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwibm9fcGEyOTVfcmVzX2VjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHNwYW4gY2xhc3M9XFxcImRpZmYgXCIpO18uYihfLnYoXy5mKFwicmVzX25vX3BhMjk1X2RpclwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5mKFwicmVzX25vX3BhMjk1X3BlcmNfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcIm5vX3BhMjk1X3Jlc19lY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gIDxzdHJvbmc+XCIpO2lmKF8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDAsMzM1NSwzMzU5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTQVZFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJVU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKF8udihfLmYoXCJyZXNfbm9fcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBtb3JlIE1NQlRVIGVxdWl2YWxlbnQgZW5lcmd5IHRoYW4gdGhlIDxzdHJvbmc+Tm8gUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSByZXNpZGVudGlhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcImRibF9wYTI5NV9yZXNfZWNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8c3BhbiBjbGFzcz1cXFwiZGlmZiBcIik7Xy5iKF8udihfLmYoXCJyZXNfZGJsX3BhMjk1X2RpclwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5mKFwicmVzX2RibF9wYTI5NV9wZXJjX2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfcmVzX2VjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byA8c3Ryb25nPlwiKTtpZihfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMCwzODI4LDM4MzIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNBVkVcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJVU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKF8udihfLmYoXCJyZXNfZGJsX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gbW9yZSBNTUJUVSBlcXVpdmFsZW50IGVuZXJneSB0aGFuIHRoZSA8c3Ryb25nPkRvdWJsZSBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiAgaWQ9XFxcInJlc2lkZW50aWFsRW5lcmd5Q29uc3VtcHRpb25cXFwiIGNsYXNzPVxcXCJyZXNpZGVudGlhbEVuZXJneUNvbnN1bXB0aW9uXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8cD5UaGUgcmVwb3J0cyBzaG93IGVuZXJneSBjb25zdW1wdGlvbiBpbiB0aGUgZm9sbG93aW5nIHNjZW5hcmlvczpcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPk5PIFBBIDI5NTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgaGF2aW5nIG5vIEVuZXJneSBFZmZpY2llbmN5IFJlc291cmNlIGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGNvbnRpbnVlcyB0byBpbmNyZWFzZSB3aXRoIHBvcHVsYXRpb24gYW5kIGVtcGxveW1lbnRcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiAtIE1pY2hpZ2FuJ3MgY3VycmVudCBFbmVyZ3kgRWZmaWNpZW5jeSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDElIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgIGNvbnN1bXB0aW9uLCBhbmQgMTAlIG9mIGVsZWN0cmljaXR5IGRlbWFuZCBjb21lcyBmcm9tIHJlbmV3YWJsZSBlbmVyZ3kgc291cmNlc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+UEEgMjk1IERvdWJsZTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgZG91YmxpbmcgTWljaGlnYW4ncyBFbmVyZ3kgRWZmaWNpZW5jeSBSZXNvdXJjZSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDIlIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgY29uc3VtcHRpb24sIGFuZCAyMCUgb2YgZWxlY3RyaWNpdHkgZGVtYW5kIGNvbWVzIGZyb20gcmVuZXdhYmxlIGVuZXJneSBzb3VyY2VzLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZnVlbENvc3RzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiSW4gT2N0b2JlciAyMDA4LCBNaWNoaWdhbiBlbmFjdGVkIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmxlZ2lzbGF0dXJlLm1pLmdvdi8oUyhxNGViNGp6aXIyZzNoYXpoemhsMXRkNDUpKS9taWxlZy5hc3B4P3BhZ2U9Z2V0b2JqZWN0Jm9iamVjdE5hbWU9bWNsLWFjdC0yOTUtb2YtMjAwOFxcXCI+Q2xlYW4sIFJlbmV3YWJsZSwgYW5kIEVmZmljaWVudCBFbmVyZ3kgQWN0LCBQdWJsaWMgQWN0IDI5NTwvYT4gPHN0cm9uZz4oUEEgMjk1KTwvc3Ryb25nPi4gQSBkZXNjcmlwdGlvbiBvZiBlYWNoIHNjZW5hcmlvIGlzIHByb3ZpZGVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHBhZ2UuIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5Db21tZXJjaWFsIEZ1ZWwgQ29zdHMgLS0gMjAxMiBEb2xsYXJzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiY2hvb3Nlci1kaXZcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInNlbC1sYWJlbFxcXCI+Q29tcGFyZSB5b3VyIHBsYW4gdG8gc2NlbmFyaW86PC9kaXY+PHNlbGVjdCBjbGFzcz1cXFwiY29tbS1jaG9zZW4tZmNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPG9wdGlvbiBjbGFzcz1cXFwiZGVmYXVsdC1jaG9zZW4tc2VsZWN0aW9uXFxcIiBsYWJlbD1cXFwiUEEgMjk1XFxcIj48L29wdGlvbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2NlbmFyaW9zXCIsYyxwLDEpLGMscCwwLDY1MSw3MDcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiPC9vcHRpb24+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJwYTI5NV9jb21tX2ZjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHNwYW4gY2xhc3M9XFxcImRpZmYgXCIpO18uYihfLnYoXy5mKFwiY29tbV9wYTI5NV9kaXJcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZihcImNvbW1fcGEyOTVfcGVyY19kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zcGFuPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwicGEyOTVfY29tbV9mY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gaGF2ZSBmdWVsIGNvc3RzIHRoYXQgYXJlIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAkXCIpO18uYihfLnYoXy5mKFwiY29tbV9wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMCwxMDE3LDEwMjIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkxPV0VSXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSElHSEVSXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+IHRoYW4gdGhlIDxzdHJvbmc+UEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcIm5vX3BhMjk1X2NvbW1fZmNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8c3BhbiBjbGFzcz1cXFwiZGlmZiBcIik7Xy5iKF8udihfLmYoXCJjb21tX25vX3BhMjk1X2RpclwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5mKFwiY29tbV9ub19wYTI5NV9wZXJjX2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJub19wYTI5NV9jb21tX2ZjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byBoYXZlIGZ1ZWwgY29zdHMgdGhhdCBhcmU8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgJFwiKTtfLmIoXy52KF8uZihcImNvbW1fbm9fcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDAsMTQ4NiwxNDkxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJMT1dFUlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIkhJR0hFUlwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPiAgdGhhbiB0aGUgPHN0cm9uZz5ObyBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwiZGJsX3BhMjk1X2NvbW1fZmNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8c3BhbiBjbGFzcz1cXFwiZGlmZiBcIik7Xy5iKF8udihfLmYoXCJjb21tX2RibF9wYTI5NV9kaXJcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZihcImNvbW1fZGJsX3BhMjk1X3BlcmNfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcImRibF9wYTI5NV9jb21tX2ZjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byBoYXZlIGZ1ZWwgY29zdHMgdGhhdCBhcmUgPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICRcIik7Xy5iKF8udihfLmYoXCJjb21tX2RibF9wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDAsMTk3NSwxOTgwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJMT1dFUlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJISUdIRVJcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz50aGFuIHRoZSA8c3Ryb25nPkRvdWJsZSBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgIGlkPVxcXCJjb21tZXJjaWFsRnVlbENvc3RzXFxcIiBjbGFzcz1cXFwiY29tbWVyY2lhbEZ1ZWxDb3N0c1xcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5SZXNpZGVudGlhbCBGdWVsIENvc3RzIC0tIDIwMTIgRG9sbGFyczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJjaG9vc2VyLWRpdlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInNlbC1sYWJlbFxcXCI+Q29tcGFyZSB5b3VyIHBsYW4gdG8gc2NlbmFyaW86PC9kaXY+PHNlbGVjdCBjbGFzcz1cXFwicmVzLWNob3Nlbi1mY1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPG9wdGlvbiBjbGFzcz1cXFwiZGVmYXVsdC1jaG9zZW4tc2VsZWN0aW9uXFxcIiBsYWJlbD1cXFwiUEEgMjk1XFxcIj48L29wdGlvbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2NlbmFyaW9zXCIsYyxwLDEpLGMscCwwLDI1NjMsMjYxNSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiPC9vcHRpb24+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgPC9zZWxlY3Q+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxkaXYgY2xhc3M9XFxcInBhMjk1X3Jlc19mY1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxzcGFuIGNsYXNzPVxcXCJkaWZmIFwiKTtfLmIoXy52KF8uZihcInJlc19wYTI5NV9kaXJcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZihcInJlc19wYTI5NV9wZXJjX2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJwYTI5NV9yZXNfZmNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIGhhdmUgZnVlbCBjb3N0cyB0aGF0IGFyZSA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgJFwiKTtfLmIoXy52KF8uZihcInJlc19wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwwLDI5MTUsMjkyMCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTE9XRVJcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIkhJR0hFUlwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPiB0aGFuIHRoZSA8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgcmVzaWRlbnRpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwibm9fcGEyOTVfcmVzX2ZjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHNwYW4gY2xhc3M9XFxcImRpZmYgXCIpO18uYihfLnYoXy5mKFwicmVzX25vX3BhMjk1X2RpclwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5mKFwicmVzX25vX3BhMjk1X3BlcmNfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcIm5vX3BhMjk1X3Jlc19mY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gaGF2ZSBmdWVsIGNvc3RzIHRoYXQgYXJlPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICRcIik7Xy5iKF8udihfLmYoXCJyZXNfbm9fcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMCwzMzc2LDMzODEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkxPV0VSXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJISUdIRVJcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz4gIHRoYW4gdGhlIDxzdHJvbmc+Tm8gUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSByZXNpZGVudGlhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJkYmxfcGEyOTVfcmVzX2ZjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHNwYW4gY2xhc3M9XFxcImRpZmYgXCIpO18uYihfLnYoXy5mKFwicmVzX2RibF9wYTI5NV9kaXJcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZihcInJlc19kYmxfcGEyOTVfcGVyY19kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zcGFuPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwiZGJsX3BhMjk1X3Jlc19mY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gaGF2ZSBmdWVsIGNvc3RzIHRoYXQgYXJlIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAkXCIpO18uYihfLnYoXy5mKFwicmVzX2RibF9wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMCwzODU3LDM4NjIsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkxPV0VSXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSElHSEVSXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+dGhhbiB0aGUgPHN0cm9uZz5Eb3VibGUgUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSByZXNpZGVudGlhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiAgaWQ9XFxcInJlc2lkZW50aWFsRnVlbENvc3RzXFxcIiBjbGFzcz1cXFwicmVzaWRlbnRpYWxGdWVsQ29zdHNcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxwPlRoZSByZXBvcnRzIHNob3cgZnVlbCBjb3N0cyBpbiB0aGUgZm9sbG93aW5nIHNjZW5hcmlvczpcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPk5PIFBBIDI5NTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgaGF2aW5nIG5vIEVuZXJneSBFZmZpY2llbmN5IFJlc291cmNlIGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGNvbnRpbnVlcyB0byBpbmNyZWFzZSB3aXRoIHBvcHVsYXRpb24gYW5kIGVtcGxveW1lbnRcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiAtIE1pY2hpZ2FuJ3MgY3VycmVudCBFbmVyZ3kgRWZmaWNpZW5jeSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDElIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgIGNvbnN1bXB0aW9uLCBhbmQgMTAlIG9mIGVsZWN0cmljaXR5IGRlbWFuZCBjb21lcyBmcm9tIHJlbmV3YWJsZSBlbmVyZ3kgc291cmNlc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+UEEgMjk1IERvdWJsZTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgZG91YmxpbmcgTWljaGlnYW4ncyBFbmVyZ3kgRWZmaWNpZW5jeSBSZXNvdXJjZSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDIlIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgY29uc3VtcHRpb24sIGFuZCAyMCUgb2YgZWxlY3RyaWNpdHkgZGVtYW5kIGNvbWVzIGZyb20gcmVuZXdhYmxlIGVuZXJneSBzb3VyY2VzLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZ3JlZW5ob3VzZUdhc2VzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIkluIE9jdG9iZXIgMjAwOCwgTWljaGlnYW4gZW5hY3RlZCB0aGUgPGEgaHJlZj1cXFwiaHR0cDovL3d3dy5sZWdpc2xhdHVyZS5taS5nb3YvKFMocTRlYjRqemlyMmczaGF6aHpobDF0ZDQ1KSkvbWlsZWcuYXNweD9wYWdlPWdldG9iamVjdCZvYmplY3ROYW1lPW1jbC1hY3QtMjk1LW9mLTIwMDhcXFwiPkNsZWFuLCBSZW5ld2FibGUsIGFuZCBFZmZpY2llbnQgRW5lcmd5IEFjdCwgUHVibGljIEFjdCAyOTU8L2E+IDxzdHJvbmc+KFBBIDI5NSk8L3N0cm9uZz4uIEEgZGVzY3JpcHRpb24gb2YgZWFjaCBzY2VuYXJpbyBpcyBwcm92aWRlZCBhdCB0aGUgYm90dG9tIG9mIHRoZSBwYWdlLiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+Q29tbWVyY2lhbCBHSEcncyAtLSBDTzxzdWI+Mjwvc3ViPi1lIEVxdWl2YWxlbnQ8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJjaG9vc2VyLWRpdlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwic2VsLWxhYmVsXFxcIj5Db21wYXJlIHlvdXIgcGxhbiB0byBzY2VuYXJpbzo8L2Rpdj48c2VsZWN0IGNsYXNzPVxcXCJjb21tLWNob3Nlbi1naGdcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPG9wdGlvbiBjbGFzcz1cXFwiZGVmYXVsdC1jaG9zZW4tc2VsZWN0aW9uXFxcIiBsYWJlbD1cXFwiUEEgMjk1XFxcIj48L29wdGlvbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2NlbmFyaW9zXCIsYyxwLDEpLGMscCwwLDY2MSw3MTcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiPC9vcHRpb24+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJwYTI5NV9jb21tX2doZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxzcGFuIGNsYXNzPVxcXCJkaWZmIFwiKTtfLmIoXy52KF8uZihcImNvbW1fcGEyOTVfZGlyXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKF8udihfLmYoXCJjb21tX3BhMjk1X3BlcmNfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcInBhMjk1X2NvbW1fZ2hnXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0bzxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDAsOTgwLDk4NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiUkVEVUNFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSU5DUkVBU0UgXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+IEdIR3MgYnkgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb21tX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gQ08yLWUgY29tcGFyZWQgdG8gdGhlIDxzdHJvbmc+UEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwibm9fcGEyOTVfY29tbV9naGdcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8c3BhbiBjbGFzcz1cXFwiZGlmZiBcIik7Xy5iKF8udihfLmYoXCJjb21tX25vX3BhMjk1X2RpclwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5mKFwiY29tbV9ub19wYTI5NV9wZXJjX2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJub19wYTI5NV9jb21tX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwwLDE0NjcsMTQ3MyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiUkVEVUNFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSU5DUkVBU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz4gR0hHcyBieSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvbW1fbm9fcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBDTzItZSBjb21wYXJlZCB0byB0aGUgPHN0cm9uZz5ObyBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJkYmxfcGEyOTVfY29tbV9naGdcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8c3BhbiBjbGFzcz1cXFwiZGlmZiBcIik7Xy5iKF8udihfLmYoXCJjb21tX2RibF9wYTI5NV9kaXJcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZihcImNvbW1fZGJsX3BhMjk1X3BlcmNfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcImRibF9wYTI5NV9jb21tX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XCIsYyxwLDEpLGMscCwwLDE5NzEsMTk3NyxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiUkVEVUNFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIklOQ1JFQVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+R0hHcyBieSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvbW1fZGJsX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gQ08yLWUgY29tcGFyZWQgdG8gdGhlIDxzdHJvbmc+RG91YmxlIFBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgY29tbWVyY2lhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgIGlkPVxcXCJjb21tZXJjaWFsR3JlZW5ob3VzZUdhc2VzXFxcIiBjbGFzcz1cXFwiY29tbWVyY2lhbEdyZWVuaG91c2VHYXNlc1xcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5SZXNpZGVudGlhbCBHSEcncyAtLSBDTzxzdWI+Mjwvc3ViPi1lIEVxdWl2YWxlbnQ8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJjaG9vc2VyLWRpdlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwic2VsLWxhYmVsXFxcIj5Db21wYXJlIHlvdXIgcGxhbiB0byBzY2VuYXJpbzo8L2Rpdj48c2VsZWN0IGNsYXNzPVxcXCJyZXMtY2hvc2VuLWdoZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8b3B0aW9uIGNsYXNzPVxcXCJkZWZhdWx0LWNob3Nlbi1zZWxlY3Rpb25cXFwiIGxhYmVsPVxcXCJQQSAyOTVcXFwiPjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJzY2VuYXJpb3NcIixjLHAsMSksYyxwLDAsMjY1NCwyNzEwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgPC9zZWxlY3Q+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJwYTI5NV9yZXNfZ2hnXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPHNwYW4gY2xhc3M9XFxcImRpZmYgXCIpO18uYihfLnYoXy5mKFwicmVzX3BhMjk1X2RpclwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5mKFwicmVzX3BhMjk1X3BlcmNfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Bhbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcInBhMjk1X3Jlc19naGdcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwwLDI5NjksMjk3NSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiUkVEVUNFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJJTkNSRUFTRSBcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz4gR0hHcyBieSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInJlc19wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IENPMi1lIGNvbXBhcmVkIHRvIHRoZSA8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgcmVzaWRlbnRpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwibm9fcGEyOTVfcmVzX2doZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxzcGFuIGNsYXNzPVxcXCJkaWZmIFwiKTtfLmIoXy52KF8uZihcInJlc19ub19wYTI5NV9kaXJcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZihcInJlc19ub19wYTI5NV9wZXJjX2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJub19wYTI5NV9yZXNfZ2hnXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDAsMzQ0NCwzNDUwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJSRURVQ0VcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIklOQ1JFQVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+IEdIR3MgYnkgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJyZXNfbm9fcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBDTzItZSBjb21wYXJlZCB0byB0aGUgPHN0cm9uZz5ObyBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwiZGJsX3BhMjk1X3Jlc19naGdcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8c3BhbiBjbGFzcz1cXFwiZGlmZiBcIik7Xy5iKF8udihfLmYoXCJyZXNfZGJsX3BhMjk1X2RpclwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5mKFwicmVzX2RibF9wYTI5NV9wZXJjX2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3NwYW4+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfcmVzX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDAsMzk0MCwzOTQ2LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJSRURVQ0VcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJJTkNSRUFTRVwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPkdIR3MgYnkgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJyZXNfZGJsX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gQ08yLWUgY29tcGFyZWQgdG8gdGhlIDxzdHJvbmc+RG91YmxlIFBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgcmVzaWRlbnRpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGlkPVxcXCJyZXNpZGVudGlhbEdyZWVuaG91c2VHYXNlc1xcXCIgY2xhc3M9XFxcInJlc2lkZW50aWFsR3JlZW5ob3VzZUdhc2VzXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8cD5UaGUgcmVwb3J0cyBzaG93IGdyZWVuaG91c2UgZ2FzIGVtaXNzaW9ucyBpbiB0aGUgZm9sbG93aW5nIHNjZW5hcmlvczpcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPk5PIFBBIDI5NTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgaGF2aW5nIG5vIEVuZXJneSBFZmZpY2llbmN5IFJlc291cmNlIGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGNvbnRpbnVlcyB0byBpbmNyZWFzZSB3aXRoIHBvcHVsYXRpb24gYW5kIGVtcGxveW1lbnRcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiAtIE1pY2hpZ2FuJ3MgY3VycmVudCBFbmVyZ3kgRWZmaWNpZW5jeSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDElIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgIGNvbnN1bXB0aW9uLCBhbmQgMTAlIG9mIGVsZWN0cmljaXR5IGRlbWFuZCBjb21lcyBmcm9tIHJlbmV3YWJsZSBlbmVyZ3kgc291cmNlc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+UEEgMjk1IERvdWJsZTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgZG91YmxpbmcgTWljaGlnYW4ncyBFbmVyZ3kgRWZmaWNpZW5jeSBSZXNvdXJjZSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDIlIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgY29uc3VtcHRpb24sIGFuZCAyMCUgb2YgZWxlY3RyaWNpdHkgZGVtYW5kIGNvbWVzIGZyb20gcmVuZXdhYmxlIGVuZXJneSBzb3VyY2VzLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xuXG5pZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gdGhpc1tcIlRlbXBsYXRlc1wiXTtcbn0iXX0=
