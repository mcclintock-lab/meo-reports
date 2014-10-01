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
    var attributes, ch, comEC, com_chart, com_dblpa, com_nopa, com_pa, com_user, com_user_savings, comm_dbl_pa295_diff, comm_dbl_pa295_total_ec, comm_has_savings_dbl_pa295, comm_has_savings_no_pa295, comm_has_savings_pa295, comm_no_pa295_diff, comm_no_pa295_total_ec, comm_pa295_diff, comm_pa295_total_ec, comm_sum, context, d3IsPresent, e, h, halfh, halfw, margin, msg, resEC, res_chart, res_dbl_pa295_diff, res_dbl_pa295_total_ec, res_dblpa, res_has_savings_dbl_pa295, res_has_savings_no_pa295, res_has_savings_pa295, res_no_pa295_diff, res_no_pa295_total_ec, res_nopa, res_pa, res_pa295_diff, res_pa295_total_ec, res_sum, res_user, res_user_savings, scenarios, sorted_comm_results, sorted_res_results, totalh, totalw, w,
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
      res_has_savings_pa295 = res_pa295_diff > 0;
      if (!res_has_savings_pa295) {
        res_has_savings_pa295 = res_has_savings_pa295 * -1;
      }
      res_pa295_diff = this.addCommas(res_pa295_diff);
      res_no_pa295_diff = Math.round(res_no_pa295_total_ec - res_sum, 0);
      res_has_savings_no_pa295 = res_no_pa295_diff > 0;
      if (!res_has_savings_no_pa295) {
        res_has_savings_no_pa295 = res_has_savings_no_pa295 * -1;
      }
      res_no_pa295_diff = this.addCommas(res_no_pa295_diff);
      res_dbl_pa295_diff = Math.round(res_dbl_pa295_total_ec - res_sum, 0);
      res_has_savings_dbl_pa295 = res_dbl_pa295_diff > 0;
      if (res_has_savings_dbl_pa295) {
        res_has_savings_dbl_pa295 = res_has_savings_dbl_pa295 * -1;
      }
      res_dbl_pa295_diff = this.addCommas(res_dbl_pa295_diff);
      comm_sum = this.recordSet("EnergyPlan", "ComEUSum").float('USER_SUM', 1);
      comm_pa295_total_ec = this.recordSet("EnergyPlan", "ComEUSum").float('PA_SUM', 1);
      comm_no_pa295_total_ec = this.recordSet("EnergyPlan", "ComEUSum").float('NOPA_SUM', 1);
      comm_dbl_pa295_total_ec = this.recordSet("EnergyPlan", "ComEUSum").float('DBLPA_SUM', 1);
      comm_pa295_diff = Math.round(comm_pa295_total_ec - comm_sum, 0);
      comm_has_savings_pa295 = comm_pa295_diff > 0;
      if (!comm_has_savings_pa295) {
        comm_pa295_diff = comm_pa295_diff * -1;
      }
      comm_pa295_diff = this.addCommas(comm_pa295_diff);
      comm_no_pa295_diff = Math.round(comm_no_pa295_total_ec - comm_sum, 0);
      comm_has_savings_no_pa295 = comm_no_pa295_diff > 0;
      if (!comm_has_savings_no_pa295) {
        comm_no_pa295_diff = comm_no_pa295_diff * -1;
      }
      comm_no_pa295_diff = this.addCommas(comm_no_pa295_diff);
      comm_dbl_pa295_diff = Math.round(comm_dbl_pa295_total_ec - comm_sum, 0);
      comm_has_savings_dbl_pa295 = comm_dbl_pa295_diff > 0;
      if (!comm_has_savings_dbl_pa295) {
        comm_dbl_pa295_diff = comm_dbl_pa295_diff * -1;
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
      res_no_pa295_diff: res_no_pa295_diff,
      res_has_savings_no_pa295: res_has_savings_no_pa295,
      res_dbl_pa295_diff: res_dbl_pa295_diff,
      res_has_savings_dbl_pa295: res_has_savings_dbl_pa295,
      comm_pa295_diff: comm_pa295_diff,
      comm_has_savings_pa295: comm_has_savings_pa295,
      comm_no_pa295_diff: comm_no_pa295_diff,
      comm_has_savings_no_pa295: comm_has_savings_no_pa295,
      comm_dbl_pa295_diff: comm_dbl_pa295_diff,
      comm_has_savings_dbl_pa295: comm_has_savings_dbl_pa295,
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
    var attributes, ch, comFC, com_chart, com_dblpa, com_nopa, com_pa, com_user, com_user_savings, comm_dbl_pa295_diff, comm_dbl_pa295_total_fc, comm_has_savings_dbl_pa295, comm_has_savings_no_pa295, comm_has_savings_pa295, comm_no_pa295_diff, comm_no_pa295_total_fc, comm_pa295_diff, comm_pa295_total_fc, comm_sum, context, d3IsPresent, e, h, halfh, halfw, margin, resFC, res_chart, res_dbl_pa295_diff, res_dbl_pa295_total_fc, res_dblpa, res_has_savings_dbl_pa295, res_has_savings_no_pa295, res_has_savings_pa295, res_no_pa295_diff, res_no_pa295_total_fc, res_nopa, res_pa, res_pa295_diff, res_pa295_total_fc, res_sum, res_user, res_user_savings, scenarios, sorted_comm_results, sorted_res_results, totalh, totalw, w,
      _this = this;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    attributes = this.model.getAttributes();
    try {
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
        res_has_savings_pa295 = res_has_savings_pa295 * -1;
      }
      res_pa295_diff = this.addCommas(res_pa295_diff);
      res_no_pa295_diff = Math.round(res_no_pa295_total_fc - res_sum, 0);
      res_has_savings_no_pa295 = res_no_pa295_diff > 0;
      if (!res_has_savings_no_pa295) {
        res_has_savings_no_pa295 = res_has_savings_no_pa295 * -1;
      }
      res_no_pa295_diff = this.addCommas(res_no_pa295_diff);
      res_dbl_pa295_diff = Math.round(res_dbl_pa295_total_fc - res_sum, 0);
      res_has_savings_dbl_pa295 = res_dbl_pa295_diff > 0;
      if (res_has_savings_dbl_pa295) {
        res_has_savings_dbl_pa295 = res_has_savings_dbl_pa295 * -1;
      }
      res_dbl_pa295_diff = this.addCommas(res_dbl_pa295_diff);
      comm_sum = this.recordSet("EnergyPlan", "ComECSum").float('USER_SUM', 1);
      comm_pa295_total_fc = this.recordSet("EnergyPlan", "ComECSum").float('PA_SUM', 1);
      comm_no_pa295_total_fc = this.recordSet("EnergyPlan", "ComECSum").float('NOPA_SUM', 1);
      comm_dbl_pa295_total_fc = this.recordSet("EnergyPlan", "ComECSum").float('DBLPA_SUM', 1);
      comm_pa295_diff = Math.round(comm_pa295_total_fc - comm_sum, 0);
      comm_has_savings_pa295 = comm_pa295_diff > 0;
      if (!comm_has_savings_pa295) {
        comm_pa295_diff = comm_pa295_diff * -1;
      }
      comm_pa295_diff = this.addCommas(comm_pa295_diff);
      comm_no_pa295_diff = Math.round(comm_no_pa295_total_fc - comm_sum, 0);
      comm_has_savings_no_pa295 = comm_no_pa295_diff > 0;
      if (!comm_has_savings_no_pa295) {
        comm_no_pa295_diff = comm_no_pa295_diff * -1;
      }
      comm_no_pa295_diff = this.addCommas(comm_no_pa295_diff);
      comm_dbl_pa295_diff = Math.round(comm_dbl_pa295_total_fc - comm_sum, 0);
      comm_has_savings_dbl_pa295 = comm_dbl_pa295_diff > 0;
      if (!comm_has_savings_dbl_pa295) {
        comm_dbl_pa295_diff = comm_dbl_pa295_diff * -1;
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
        res_has_savings_pa295 = res_has_savings_pa295 * -1;
      }
      res_pa295_diff = this.addCommas(res_pa295_diff);
      res_no_pa295_diff = Math.round(res_no_pa295_total_ghg - res_sum, 0);
      res_has_savings_no_pa295 = res_no_pa295_diff > 0;
      if (!res_has_savings_no_pa295) {
        res_has_savings_no_pa295 = res_has_savings_no_pa295 * -1;
      }
      res_no_pa295_diff = this.addCommas(res_no_pa295_diff);
      res_dbl_pa295_diff = Math.round(res_dbl_pa295_total_ghg - res_sum, 0);
      res_has_savings_dbl_pa295 = res_dbl_pa295_diff > 0;
      if (res_has_savings_dbl_pa295) {
        res_has_savings_dbl_pa295 = res_has_savings_dbl_pa295 * -1;
      }
      res_dbl_pa295_diff = this.addCommas(res_dbl_pa295_diff);
      comm_sum = this.recordSet("EnergyPlan", "ComGHGSum").float('USER_SUM', 1);
      comm_pa295_total_ghg = this.recordSet("EnergyPlan", "ComGHGSum").float('PA_SUM', 1);
      comm_no_pa295_total_ghg = this.recordSet("EnergyPlan", "ComGHGSum").float('NOPA_SUM', 1);
      comm_dbl_pa295_total_ghg = this.recordSet("EnergyPlan", "ComGHGSum").float('DBLPA_SUM', 1);
      comm_pa295_diff = Math.round(comm_pa295_total_ghg - comm_sum, 0);
      comm_has_savings_pa295 = comm_pa295_diff > 0;
      if (!comm_has_savings_pa295) {
        comm_pa295_diff = comm_pa295_diff * -1;
      }
      comm_pa295_diff = this.addCommas(comm_pa295_diff);
      comm_no_pa295_diff = Math.round(comm_no_pa295_total_ghg - comm_sum, 0);
      comm_has_savings_no_pa295 = comm_no_pa295_diff > 0;
      if (!comm_has_savings_no_pa295) {
        comm_no_pa295_diff = comm_no_pa295_diff * -1;
      }
      comm_no_pa295_diff = this.addCommas(comm_no_pa295_diff);
      comm_dbl_pa295_diff = Math.round(comm_dbl_pa295_total_ghg - comm_sum, 0);
      comm_has_savings_dbl_pa295 = comm_dbl_pa295_diff > 0;
      if (!comm_has_savings_dbl_pa295) {
        comm_dbl_pa295_diff = comm_dbl_pa295_diff * -1;
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
        var cnt, currelem, d, g, line, line_color, panelheight, paneloffset, panelwidth, points, scen, scenario, svg, x, xaxis, xrange, xs, y, yaxis, yrange, ys, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m;
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
        yaxis.selectAll("empty").data(yticks).enter().append("text").attr("y", function(d) {
          return yscale(d) + 3;
        }).attr("x", margin.left + 3 - axispos.ylabel).text(function(d) {
          return formatAxis(yticks)(d);
        });
        yaxis.append("text").attr("class", "title").attr("y", margin.top + 35 + height / 2).attr("x", margin.left + 8 - axispos.ytitle).text(ylab).attr("transform", "rotate(270," + (margin.left + 8 - axispos.ytitle) + "," + (margin.top + 35 + height / 2) + ")");
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


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":17,"reportTab":"a21iR2"}],17:[function(require,module,exports){
this["Templates"] = this["Templates"] || {};
this["Templates"]["energyConsumption"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("\n" + i);_.b("<p>");_.b("\n" + i);_.b("	In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong> A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial Energy Consumption -- MMBTU Equivalent</h4>");_.b("\n" + i);_.b("  <div class=\"chooser-div\">");_.b("\n" + i);_.b("    <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"comm-chosen-ec\">");_.b("\n" + i);_.b("      <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,656,708,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("    </select>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <p class=\"pa295_comm_ec\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,0,854,858,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("comm_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_comm_ec\">By 2035, your energy plan is estimated to  <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,0,1196,1200,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("comm_no_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>No PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_comm_ec\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,0,1554,1558,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("comm_dbl_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>Double PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div  id=\"commercialEnergyConsumption\" class=\"commercialEnergyConsumption\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential Energy Consumption -- MMBTU Equivalent</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"res-chosen-ec\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,2227,2283,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <p class=\"pa295_res_ec\">By 2035, your energy plan is estimated to <strong>");if(_.s(_.f("res_has_savings_pa295",c,p,1),c,p,0,2428,2432,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("res_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_res_ec\">By 2035, your energy plan is estimated to  <strong>");if(_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,0,2762,2766,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("res_no_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>No PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_res_ec\">By 2035, your energy plan is estimated to <strong>");if(_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,0,3112,3116,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("res_dbl_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>Double PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"residentialEnergyConsumption\" class=\"residentialEnergyConsumption\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show energy consumption in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["fuelCosts"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("\n" + i);_.b("<p>");_.b("\n" + i);_.b("In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong>. A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial Fuel Costs -- 2012 Dollars</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"comm-chosen-fc\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,651,707,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  <p class=\"pa295_comm_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("comm_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,0,904,909,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong> than the <strong>PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_comm_fc\">By 2035, your energy plan is estimated to have fuel costs that are<strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("comm_no_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,0,1251,1256,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>  than the <strong>No PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_comm_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("comm_dbl_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,0,1615,1620,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>than the <strong>Double PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div  id=\"commercialFuelCosts\" class=\"commercialFuelCosts\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential Fuel Costs -- 2012 Dollars</h4>");_.b("\n" + i);_.b("  <div class=\"chooser-div\">");_.b("\n" + i);_.b("    <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"res-chosen-fc\">");_.b("\n" + i);_.b("      <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,2203,2255,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("    </select>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"pa295_res_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("res_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_pa295",c,p,1),c,p,0,2445,2450,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong> than the <strong>PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_res_fc\">By 2035, your energy plan is estimated to have fuel costs that are<strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("res_no_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,0,2787,2792,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>  than the <strong>No PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_res_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("res_dbl_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,0,3146,3151,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>than the <strong>Double PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div  id=\"residentialFuelCosts\" class=\"residentialFuelCosts\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show fuel costs in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");return _.fl();;});
this["Templates"]["greenhouseGases"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<p>");_.b("\n" + i);_.b("In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong>. A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial GHG's -- CO<sub>2</sub>-e Equivalent</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"comm-chosen-ghg\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,661,717,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  <p class=\"pa295_comm_ghg\">By 2035, your energy plan is estimated to<strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,0,866,872,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE ");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("comm_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_comm_ghg\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,0,1229,1235,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("comm_no_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>No PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_comm_ghg\">By 2035, your energy plan is estimated to  <strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,0,1609,1615,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong>GHGs by <strong>");_.b(_.v(_.f("comm_dbl_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>Double PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"commercialGreenhouseGases\" class=\"commercialGreenhouseGases\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential GHG's -- CO<sub>2</sub>-e Equivalent</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"res-chosen-ghg\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,2292,2348,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  <p class=\"pa295_res_ghg\">By 2035, your energy plan is estimated to<strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_pa295",c,p,1),c,p,0,2498,2504,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE ");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("res_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_res_ghg\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,0,2853,2859,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("res_no_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>No PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_res_ghg\">By 2035, your energy plan is estimated to  <strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,0,3228,3234,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong>GHGs by <strong>");_.b(_.v(_.f("res_dbl_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>Double PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div id=\"residentialGreenhouseGases\" class=\"residentialGreenhouseGases\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show greenhouse gas emissions in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");_.b("\n");return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[14])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL2VuYWJsZUxheWVyVG9nZ2xlcnMuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9tZW8tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy9qb2JJdGVtLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0UmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL3JlcG9ydFRhYi5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL3V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL3NjcmlwdHMvZW5lcmd5Q29uc3VtcHRpb24uY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9tZW8tcmVwb3J0cy9zY3JpcHRzL2Z1ZWxDb3N0cy5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL3NjcmlwdHMvZ3JlZW5ob3VzZUdhc2VzLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvc2NyaXB0cy9yZXBvcnQuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9tZW8tcmVwb3J0cy9zY3JpcHRzL3JlcG9ydEdyYXBoVGFiLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBLENBQU8sQ0FBVSxDQUFBLEdBQVgsQ0FBTixFQUFrQjtDQUNoQixLQUFBLDJFQUFBO0NBQUEsQ0FBQSxDQUFBO0NBQUEsQ0FDQSxDQUFBLEdBQVk7Q0FEWixDQUVBLENBQUEsR0FBTTtBQUNDLENBQVAsQ0FBQSxDQUFBLENBQUE7Q0FDRSxFQUFBLENBQUEsR0FBTyxxQkFBUDtDQUNBLFNBQUE7SUFMRjtDQUFBLENBTUEsQ0FBVyxDQUFBLElBQVgsYUFBVztDQUVYO0NBQUEsTUFBQSxvQ0FBQTt3QkFBQTtDQUNFLEVBQVcsQ0FBWCxHQUFXLENBQVg7Q0FBQSxFQUNTLENBQVQsRUFBQSxFQUFpQixLQUFSO0NBQ1Q7Q0FDRSxFQUFPLENBQVAsRUFBQSxVQUFPO0NBQVAsRUFDTyxDQUFQLENBREEsQ0FDQTtBQUMrQixDQUYvQixDQUU4QixDQUFFLENBQWhDLEVB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KGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLG51bGwsIm1vZHVsZS5leHBvcnRzID0gKGVsKSAtPlxuICAkZWwgPSAkIGVsXG4gIGFwcCA9IHdpbmRvdy5hcHBcbiAgdG9jID0gYXBwLmdldFRvYygpXG4gIHVubGVzcyB0b2NcbiAgICBjb25zb2xlLmxvZyAnTm8gdGFibGUgb2YgY29udGVudHMgZm91bmQnXG4gICAgcmV0dXJuXG4gIHRvZ2dsZXJzID0gJGVsLmZpbmQoJ2FbZGF0YS10b2dnbGUtbm9kZV0nKVxuICAjIFNldCBpbml0aWFsIHN0YXRlXG4gIGZvciB0b2dnbGVyIGluIHRvZ2dsZXJzLnRvQXJyYXkoKVxuICAgICR0b2dnbGVyID0gJCh0b2dnbGVyKVxuICAgIG5vZGVpZCA9ICR0b2dnbGVyLmRhdGEoJ3RvZ2dsZS1ub2RlJylcbiAgICB0cnlcbiAgICAgIHZpZXcgPSB0b2MuZ2V0Q2hpbGRWaWV3QnlJZCBub2RlaWRcbiAgICAgIG5vZGUgPSB2aWV3Lm1vZGVsXG4gICAgICAkdG9nZ2xlci5hdHRyICdkYXRhLXZpc2libGUnLCAhIW5vZGUuZ2V0KCd2aXNpYmxlJylcbiAgICAgICR0b2dnbGVyLmRhdGEgJ3RvY0l0ZW0nLCB2aWV3XG4gICAgY2F0Y2ggZVxuICAgICAgJHRvZ2dsZXIuYXR0ciAnZGF0YS1ub3QtZm91bmQnLCAndHJ1ZSdcblxuICB0b2dnbGVycy5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAkZWwgPSAkKGUudGFyZ2V0KVxuICAgIHZpZXcgPSAkZWwuZGF0YSgndG9jSXRlbScpXG4gICAgaWYgdmlld1xuICAgICAgdmlldy50b2dnbGVWaXNpYmlsaXR5KGUpXG4gICAgICAkZWwuYXR0ciAnZGF0YS12aXNpYmxlJywgISF2aWV3Lm1vZGVsLmdldCgndmlzaWJsZScpXG4gICAgZWxzZVxuICAgICAgYWxlcnQgXCJMYXllciBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgVGFibGUgb2YgQ29udGVudHMuIFxcbkV4cGVjdGVkIG5vZGVpZCAjeyRlbC5kYXRhKCd0b2dnbGUtbm9kZScpfVwiXG4iLCJjbGFzcyBKb2JJdGVtIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuICBjbGFzc05hbWU6ICdyZXBvcnRSZXN1bHQnXG4gIGV2ZW50czoge31cbiAgYmluZGluZ3M6XG4gICAgXCJoNiBhXCI6XG4gICAgICBvYnNlcnZlOiBcInNlcnZpY2VOYW1lXCJcbiAgICAgIHVwZGF0ZVZpZXc6IHRydWVcbiAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgIG5hbWU6ICdocmVmJ1xuICAgICAgICBvYnNlcnZlOiAnc2VydmljZVVybCdcbiAgICAgIH1dXG4gICAgXCIuc3RhcnRlZEF0XCI6XG4gICAgICBvYnNlcnZlOiBbXCJzdGFydGVkQXRcIiwgXCJzdGF0dXNcIl1cbiAgICAgIHZpc2libGU6ICgpIC0+XG4gICAgICAgIEBtb2RlbC5nZXQoJ3N0YXR1cycpIG5vdCBpbiBbJ2NvbXBsZXRlJywgJ2Vycm9yJ11cbiAgICAgIHVwZGF0ZVZpZXc6IHRydWVcbiAgICAgIG9uR2V0OiAoKSAtPlxuICAgICAgICBpZiBAbW9kZWwuZ2V0KCdzdGFydGVkQXQnKVxuICAgICAgICAgIHJldHVybiBcIlN0YXJ0ZWQgXCIgKyBtb21lbnQoQG1vZGVsLmdldCgnc3RhcnRlZEF0JykpLmZyb21Ob3coKSArIFwiLiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgXCJcIlxuICAgIFwiLnN0YXR1c1wiOiAgICAgIFxuICAgICAgb2JzZXJ2ZTogXCJzdGF0dXNcIlxuICAgICAgb25HZXQ6IChzKSAtPlxuICAgICAgICBzd2l0Y2ggc1xuICAgICAgICAgIHdoZW4gJ3BlbmRpbmcnXG4gICAgICAgICAgICBcIndhaXRpbmcgaW4gbGluZVwiXG4gICAgICAgICAgd2hlbiAncnVubmluZydcbiAgICAgICAgICAgIFwicnVubmluZyBhbmFseXRpY2FsIHNlcnZpY2VcIlxuICAgICAgICAgIHdoZW4gJ2NvbXBsZXRlJ1xuICAgICAgICAgICAgXCJjb21wbGV0ZWRcIlxuICAgICAgICAgIHdoZW4gJ2Vycm9yJ1xuICAgICAgICAgICAgXCJhbiBlcnJvciBvY2N1cnJlZFwiXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgc1xuICAgIFwiLnF1ZXVlTGVuZ3RoXCI6IFxuICAgICAgb2JzZXJ2ZTogXCJxdWV1ZUxlbmd0aFwiXG4gICAgICBvbkdldDogKHYpIC0+XG4gICAgICAgIHMgPSBcIldhaXRpbmcgYmVoaW5kICN7dn0gam9iXCJcbiAgICAgICAgaWYgdi5sZW5ndGggPiAxXG4gICAgICAgICAgcyArPSAncydcbiAgICAgICAgcmV0dXJuIHMgKyBcIi4gXCJcbiAgICAgIHZpc2libGU6ICh2KSAtPlxuICAgICAgICB2PyBhbmQgcGFyc2VJbnQodikgPiAwXG4gICAgXCIuZXJyb3JzXCI6XG4gICAgICBvYnNlcnZlOiAnZXJyb3InXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICB2aXNpYmxlOiAodikgLT5cbiAgICAgICAgdj8ubGVuZ3RoID4gMlxuICAgICAgb25HZXQ6ICh2KSAtPlxuICAgICAgICBpZiB2P1xuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHYsIG51bGwsICcgICcpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAbW9kZWwpIC0+XG4gICAgc3VwZXIoKVxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICBAJGVsLmh0bWwgXCJcIlwiXG4gICAgICA8aDY+PGEgaHJlZj1cIiNcIiB0YXJnZXQ9XCJfYmxhbmtcIj48L2E+PHNwYW4gY2xhc3M9XCJzdGF0dXNcIj48L3NwYW4+PC9oNj5cbiAgICAgIDxkaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwic3RhcnRlZEF0XCI+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInF1ZXVlTGVuZ3RoXCI+PC9zcGFuPlxuICAgICAgICA8cHJlIGNsYXNzPVwiZXJyb3JzXCI+PC9wcmU+XG4gICAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICBAc3RpY2tpdCgpXG5cbm1vZHVsZS5leHBvcnRzID0gSm9iSXRlbSIsImNsYXNzIFJlcG9ydFJlc3VsdHMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgZGVmYXVsdFBvbGxpbmdJbnRlcnZhbDogMzAwMFxuXG4gIGNvbnN0cnVjdG9yOiAoQHNrZXRjaCwgQGRlcHMpIC0+XG4gICAgQHVybCA9IHVybCA9IFwiL3JlcG9ydHMvI3tAc2tldGNoLmlkfS8je0BkZXBzLmpvaW4oJywnKX1cIlxuICAgIHN1cGVyKClcblxuICBwb2xsOiAoKSA9PlxuICAgIEBmZXRjaCB7XG4gICAgICBzdWNjZXNzOiAoKSA9PlxuICAgICAgICBAdHJpZ2dlciAnam9icydcbiAgICAgICAgZm9yIHJlc3VsdCBpbiBAbW9kZWxzXG4gICAgICAgICAgaWYgcmVzdWx0LmdldCgnc3RhdHVzJykgbm90IGluIFsnY29tcGxldGUnLCAnZXJyb3InXVxuICAgICAgICAgICAgdW5sZXNzIEBpbnRlcnZhbFxuICAgICAgICAgICAgICBAaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAcG9sbCwgQGRlZmF1bHRQb2xsaW5nSW50ZXJ2YWxcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIGNvbnNvbGUubG9nIEBtb2RlbHNbMF0uZ2V0KCdwYXlsb2FkU2l6ZUJ5dGVzJylcbiAgICAgICAgICBwYXlsb2FkU2l6ZSA9IE1hdGgucm91bmQoKChAbW9kZWxzWzBdLmdldCgncGF5bG9hZFNpemVCeXRlcycpIG9yIDApIC8gMTAyNCkgKiAxMDApIC8gMTAwXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJGZWF0dXJlU2V0IHNlbnQgdG8gR1Agd2VpZ2hlZCBpbiBhdCAje3BheWxvYWRTaXplfWtiXCJcbiAgICAgICAgIyBhbGwgY29tcGxldGUgdGhlblxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAaW50ZXJ2YWwpIGlmIEBpbnRlcnZhbFxuICAgICAgICBpZiBwcm9ibGVtID0gXy5maW5kKEBtb2RlbHMsIChyKSAtPiByLmdldCgnZXJyb3InKT8pXG4gICAgICAgICAgQHRyaWdnZXIgJ2Vycm9yJywgXCJQcm9ibGVtIHdpdGggI3twcm9ibGVtLmdldCgnc2VydmljZU5hbWUnKX0gam9iXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB0cmlnZ2VyICdmaW5pc2hlZCdcbiAgICAgIGVycm9yOiAoZSwgcmVzLCBhLCBiKSA9PlxuICAgICAgICB1bmxlc3MgcmVzLnN0YXR1cyBpcyAwXG4gICAgICAgICAgaWYgcmVzLnJlc3BvbnNlVGV4dD8ubGVuZ3RoXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UocmVzLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICMgZG8gbm90aGluZ1xuICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBpbnRlcnZhbCkgaWYgQGludGVydmFsXG4gICAgICAgICAgQHRyaWdnZXIgJ2Vycm9yJywganNvbj8uZXJyb3I/Lm1lc3NhZ2Ugb3JcbiAgICAgICAgICAgICdQcm9ibGVtIGNvbnRhY3RpbmcgdGhlIFNlYVNrZXRjaCBzZXJ2ZXInXG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydFJlc3VsdHNcbiIsImVuYWJsZUxheWVyVG9nZ2xlcnMgPSByZXF1aXJlICcuL2VuYWJsZUxheWVyVG9nZ2xlcnMuY29mZmVlJ1xucm91bmQgPSByZXF1aXJlKCcuL3V0aWxzLmNvZmZlZScpLnJvdW5kXG5SZXBvcnRSZXN1bHRzID0gcmVxdWlyZSAnLi9yZXBvcnRSZXN1bHRzLmNvZmZlZSdcbnQgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJylcbnRlbXBsYXRlcyA9XG4gIHJlcG9ydExvYWRpbmc6IHRbJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9yZXBvcnRMb2FkaW5nJ11cbkpvYkl0ZW0gPSByZXF1aXJlICcuL2pvYkl0ZW0uY29mZmVlJ1xuQ29sbGVjdGlvblZpZXcgPSByZXF1aXJlKCd2aWV3cy9jb2xsZWN0aW9uVmlldycpXG5cbmNsYXNzIFJlY29yZFNldFxuXG4gIGNvbnN0cnVjdG9yOiAoQGRhdGEsIEB0YWIsIEBza2V0Y2hDbGFzc0lkKSAtPlxuXG4gIHRvQXJyYXk6ICgpIC0+XG4gICAgaWYgQHNrZXRjaENsYXNzSWRcbiAgICAgIGRhdGEgPSBfLmZpbmQgQGRhdGEudmFsdWUsICh2KSA9PlxuICAgICAgICB2LmZlYXR1cmVzP1swXT8uYXR0cmlidXRlcz9bJ1NDX0lEJ10gaXMgQHNrZXRjaENsYXNzSWRcbiAgICAgIHVubGVzcyBkYXRhXG4gICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgZGF0YSBmb3Igc2tldGNoQ2xhc3MgI3tAc2tldGNoQ2xhc3NJZH1cIlxuICAgIGVsc2VcbiAgICAgIGlmIF8uaXNBcnJheSBAZGF0YS52YWx1ZVxuICAgICAgICBkYXRhID0gQGRhdGEudmFsdWVbMF1cbiAgICAgIGVsc2VcbiAgICAgICAgZGF0YSA9IEBkYXRhLnZhbHVlXG4gICAgXy5tYXAgZGF0YS5mZWF0dXJlcywgKGZlYXR1cmUpIC0+XG4gICAgICBmZWF0dXJlLmF0dHJpYnV0ZXNcblxuICByYXc6IChhdHRyKSAtPlxuICAgIGF0dHJzID0gXy5tYXAgQHRvQXJyYXkoKSwgKHJvdykgLT5cbiAgICAgIHJvd1thdHRyXVxuICAgIGF0dHJzID0gXy5maWx0ZXIgYXR0cnMsIChhdHRyKSAtPiBhdHRyICE9IHVuZGVmaW5lZFxuICAgIGlmIGF0dHJzLmxlbmd0aCBpcyAwXG4gICAgICBjb25zb2xlLmxvZyBAZGF0YVxuICAgICAgQHRhYi5yZXBvcnRFcnJvciBcIkNvdWxkIG5vdCBnZXQgYXR0cmlidXRlICN7YXR0cn0gZnJvbSByZXN1bHRzXCJcbiAgICAgIHRocm93IFwiQ291bGQgbm90IGdldCBhdHRyaWJ1dGUgI3thdHRyfVwiXG4gICAgZWxzZSBpZiBhdHRycy5sZW5ndGggaXMgMVxuICAgICAgcmV0dXJuIGF0dHJzWzBdXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGF0dHJzXG5cbiAgaW50OiAoYXR0cikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgcGFyc2VJbnRcbiAgICBlbHNlXG4gICAgICBwYXJzZUludChyYXcpXG5cbiAgZmxvYXQ6IChhdHRyLCBkZWNpbWFsUGxhY2VzPTIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsICh2YWwpIC0+IHJvdW5kKHZhbCwgZGVjaW1hbFBsYWNlcylcbiAgICBlbHNlXG4gICAgICByb3VuZChyYXcsIGRlY2ltYWxQbGFjZXMpXG5cbiAgYm9vbDogKGF0dHIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsICh2YWwpIC0+IHZhbC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgaXMgJ3RydWUnXG4gICAgZWxzZVxuICAgICAgcmF3LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSBpcyAndHJ1ZSdcblxuY2xhc3MgUmVwb3J0VGFiIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuICBuYW1lOiAnSW5mb3JtYXRpb24nXG4gIGRlcGVuZGVuY2llczogW11cblxuICBpbml0aWFsaXplOiAoQG1vZGVsLCBAb3B0aW9ucykgLT5cbiAgICAjIFdpbGwgYmUgaW5pdGlhbGl6ZWQgYnkgU2VhU2tldGNoIHdpdGggdGhlIGZvbGxvd2luZyBhcmd1bWVudHM6XG4gICAgIyAgICogbW9kZWwgLSBUaGUgc2tldGNoIGJlaW5nIHJlcG9ydGVkIG9uXG4gICAgIyAgICogb3B0aW9uc1xuICAgICMgICAgIC0gLnBhcmVudCAtIHRoZSBwYXJlbnQgcmVwb3J0IHZpZXdcbiAgICAjICAgICAgICBjYWxsIEBvcHRpb25zLnBhcmVudC5kZXN0cm95KCkgdG8gY2xvc2UgdGhlIHdob2xlIHJlcG9ydCB3aW5kb3dcbiAgICBAYXBwID0gd2luZG93LmFwcFxuICAgIF8uZXh0ZW5kIEAsIEBvcHRpb25zXG4gICAgQHJlcG9ydFJlc3VsdHMgPSBuZXcgUmVwb3J0UmVzdWx0cyhAbW9kZWwsIEBkZXBlbmRlbmNpZXMpXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ2Vycm9yJywgQHJlcG9ydEVycm9yXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ2pvYnMnLCBAcmVuZGVySm9iRGV0YWlsc1xuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdqb2JzJywgQHJlcG9ydEpvYnNcbiAgICBAbGlzdGVuVG8gQHJlcG9ydFJlc3VsdHMsICdmaW5pc2hlZCcsIF8uYmluZCBAcmVuZGVyLCBAXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ3JlcXVlc3QnLCBAcmVwb3J0UmVxdWVzdGVkXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgIHRocm93ICdyZW5kZXIgbWV0aG9kIG11c3QgYmUgb3ZlcmlkZGVuJ1xuXG4gIHNob3c6ICgpIC0+XG4gICAgQCRlbC5zaG93KClcbiAgICBAdmlzaWJsZSA9IHRydWVcbiAgICBpZiBAZGVwZW5kZW5jaWVzPy5sZW5ndGggYW5kICFAcmVwb3J0UmVzdWx0cy5tb2RlbHMubGVuZ3RoXG4gICAgICBAcmVwb3J0UmVzdWx0cy5wb2xsKClcbiAgICBlbHNlIGlmICFAZGVwZW5kZW5jaWVzPy5sZW5ndGhcbiAgICAgIEByZW5kZXIoKVxuICAgICAgQCQoJ1tkYXRhLWF0dHJpYnV0ZS10eXBlPVVybEZpZWxkXSAudmFsdWUsIFtkYXRhLWF0dHJpYnV0ZS10eXBlPVVwbG9hZEZpZWxkXSAudmFsdWUnKS5lYWNoICgpIC0+XG4gICAgICAgIHRleHQgPSAkKEApLnRleHQoKVxuICAgICAgICBodG1sID0gW11cbiAgICAgICAgZm9yIHVybCBpbiB0ZXh0LnNwbGl0KCcsJylcbiAgICAgICAgICBpZiB1cmwubGVuZ3RoXG4gICAgICAgICAgICBuYW1lID0gXy5sYXN0KHVybC5zcGxpdCgnLycpKVxuICAgICAgICAgICAgaHRtbC5wdXNoIFwiXCJcIjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj4je25hbWV9PC9hPlwiXCJcIlxuICAgICAgICAkKEApLmh0bWwgaHRtbC5qb2luKCcsICcpXG5cblxuICBoaWRlOiAoKSAtPlxuICAgIEAkZWwuaGlkZSgpXG4gICAgQHZpc2libGUgPSBmYWxzZVxuXG4gIHJlbW92ZTogKCkgPT5cbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCBAZXRhSW50ZXJ2YWxcbiAgICBAc3RvcExpc3RlbmluZygpXG4gICAgc3VwZXIoKVxuXG4gIHJlcG9ydFJlcXVlc3RlZDogKCkgPT5cbiAgICBAJGVsLmh0bWwgdGVtcGxhdGVzLnJlcG9ydExvYWRpbmcucmVuZGVyKHt9KVxuXG4gIHJlcG9ydEVycm9yOiAobXNnLCBjYW5jZWxsZWRSZXF1ZXN0KSA9PlxuICAgIHVubGVzcyBjYW5jZWxsZWRSZXF1ZXN0XG4gICAgICBpZiBtc2cgaXMgJ0pPQl9FUlJPUidcbiAgICAgICAgQHNob3dFcnJvciAnRXJyb3Igd2l0aCBzcGVjaWZpYyBqb2InXG4gICAgICBlbHNlXG4gICAgICAgIEBzaG93RXJyb3IgbXNnXG5cbiAgc2hvd0Vycm9yOiAobXNnKSA9PlxuICAgIEAkKCcucHJvZ3Jlc3MnKS5yZW1vdmUoKVxuICAgIEAkKCdwLmVycm9yJykucmVtb3ZlKClcbiAgICBAJCgnaDQnKS50ZXh0KFwiQW4gRXJyb3IgT2NjdXJyZWRcIikuYWZ0ZXIgXCJcIlwiXG4gICAgICA8cCBjbGFzcz1cImVycm9yXCIgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj4je21zZ308L3A+XG4gICAgXCJcIlwiXG5cbiAgcmVwb3J0Sm9iczogKCkgPT5cbiAgICB1bmxlc3MgQG1heEV0YVxuICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykud2lkdGgoJzEwMCUnKVxuICAgIEAkKCdoNCcpLnRleHQgXCJBbmFseXppbmcgRGVzaWduc1wiXG5cbiAgc3RhcnRFdGFDb3VudGRvd246ICgpID0+XG4gICAgaWYgQG1heEV0YVxuICAgICAgXy5kZWxheSAoKSA9PlxuICAgICAgICBAcmVwb3J0UmVzdWx0cy5wb2xsKClcbiAgICAgICwgKEBtYXhFdGEgKyAxKSAqIDEwMDBcbiAgICAgIF8uZGVsYXkgKCkgPT5cbiAgICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykuY3NzICd0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbicsICdsaW5lYXInXG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLmNzcyAndHJhbnNpdGlvbi1kdXJhdGlvbicsIFwiI3tAbWF4RXRhICsgMX1zXCJcbiAgICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykud2lkdGgoJzEwMCUnKVxuICAgICAgLCA1MDBcblxuICByZW5kZXJKb2JEZXRhaWxzOiAoKSA9PlxuICAgIG1heEV0YSA9IG51bGxcbiAgICBmb3Igam9iIGluIEByZXBvcnRSZXN1bHRzLm1vZGVsc1xuICAgICAgaWYgam9iLmdldCgnZXRhU2Vjb25kcycpXG4gICAgICAgIGlmICFtYXhFdGEgb3Igam9iLmdldCgnZXRhU2Vjb25kcycpID4gbWF4RXRhXG4gICAgICAgICAgbWF4RXRhID0gam9iLmdldCgnZXRhU2Vjb25kcycpXG4gICAgaWYgbWF4RXRhXG4gICAgICBAbWF4RXRhID0gbWF4RXRhXG4gICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS53aWR0aCgnNSUnKVxuICAgICAgQHN0YXJ0RXRhQ291bnRkb3duKClcblxuICAgIEAkKCdbcmVsPWRldGFpbHNdJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJylcbiAgICBAJCgnW3JlbD1kZXRhaWxzXScpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAJCgnW3JlbD1kZXRhaWxzXScpLmhpZGUoKVxuICAgICAgQCQoJy5kZXRhaWxzJykuc2hvdygpXG4gICAgZm9yIGpvYiBpbiBAcmVwb3J0UmVzdWx0cy5tb2RlbHNcbiAgICAgIGl0ZW0gPSBuZXcgSm9iSXRlbShqb2IpXG4gICAgICBpdGVtLnJlbmRlcigpXG4gICAgICBAJCgnLmRldGFpbHMnKS5hcHBlbmQgaXRlbS5lbFxuXG4gIGdldFJlc3VsdDogKGlkKSAtPlxuICAgIHJlc3VsdHMgPSBAZ2V0UmVzdWx0cygpXG4gICAgcmVzdWx0ID0gXy5maW5kIHJlc3VsdHMsIChyKSAtPiByLnBhcmFtTmFtZSBpcyBpZFxuICAgIHVubGVzcyByZXN1bHQ/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHJlc3VsdCB3aXRoIGlkICcgKyBpZClcbiAgICByZXN1bHQudmFsdWVcblxuICBnZXRGaXJzdFJlc3VsdDogKHBhcmFtLCBpZCkgLT5cbiAgICByZXN1bHQgPSBAZ2V0UmVzdWx0KHBhcmFtKVxuICAgIHRyeVxuICAgICAgcmV0dXJuIHJlc3VsdFswXS5mZWF0dXJlc1swXS5hdHRyaWJ1dGVzW2lkXVxuICAgIGNhdGNoIGVcbiAgICAgIHRocm93IFwiRXJyb3IgZmluZGluZyAje3BhcmFtfToje2lkfSBpbiBncCByZXN1bHRzXCJcblxuICBnZXRSZXN1bHRzOiAoKSAtPlxuICAgIHJlc3VsdHMgPSBAcmVwb3J0UmVzdWx0cy5tYXAoKHJlc3VsdCkgLT4gcmVzdWx0LmdldCgncmVzdWx0JykucmVzdWx0cylcbiAgICB1bmxlc3MgcmVzdWx0cz8ubGVuZ3RoXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGdwIHJlc3VsdHMnKVxuICAgIF8uZmlsdGVyIHJlc3VsdHMsIChyZXN1bHQpIC0+XG4gICAgICByZXN1bHQucGFyYW1OYW1lIG5vdCBpbiBbJ1Jlc3VsdENvZGUnLCAnUmVzdWx0TXNnJ11cblxuICByZWNvcmRTZXQ6IChkZXBlbmRlbmN5LCBwYXJhbU5hbWUsIHNrZXRjaENsYXNzSWQ9ZmFsc2UpIC0+XG4gICAgdW5sZXNzIGRlcGVuZGVuY3kgaW4gQGRlcGVuZGVuY2llc1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVW5rbm93biBkZXBlbmRlbmN5ICN7ZGVwZW5kZW5jeX1cIlxuICAgIGRlcCA9IEByZXBvcnRSZXN1bHRzLmZpbmQgKHIpIC0+IHIuZ2V0KCdzZXJ2aWNlTmFtZScpIGlzIGRlcGVuZGVuY3lcbiAgICB1bmxlc3MgZGVwXG4gICAgICBjb25zb2xlLmxvZyBAcmVwb3J0UmVzdWx0cy5tb2RlbHNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNvdWxkIG5vdCBmaW5kIHJlc3VsdHMgZm9yICN7ZGVwZW5kZW5jeX0uXCJcbiAgICBwYXJhbSA9IF8uZmluZCBkZXAuZ2V0KCdyZXN1bHQnKS5yZXN1bHRzLCAocGFyYW0pIC0+XG4gICAgICBwYXJhbS5wYXJhbU5hbWUgaXMgcGFyYW1OYW1lXG4gICAgdW5sZXNzIHBhcmFtXG4gICAgICBjb25zb2xlLmxvZyBkZXAuZ2V0KCdkYXRhJykucmVzdWx0c1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ291bGQgbm90IGZpbmQgcGFyYW0gI3twYXJhbU5hbWV9IGluICN7ZGVwZW5kZW5jeX1cIlxuICAgIG5ldyBSZWNvcmRTZXQocGFyYW0sIEAsIHNrZXRjaENsYXNzSWQpXG5cbiAgZW5hYmxlVGFibGVQYWdpbmc6ICgpIC0+XG4gICAgQCQoJ1tkYXRhLXBhZ2luZ10nKS5lYWNoICgpIC0+XG4gICAgICAkdGFibGUgPSAkKEApXG4gICAgICBwYWdlU2l6ZSA9ICR0YWJsZS5kYXRhKCdwYWdpbmcnKVxuICAgICAgcm93cyA9ICR0YWJsZS5maW5kKCd0Ym9keSB0cicpLmxlbmd0aFxuICAgICAgcGFnZXMgPSBNYXRoLmNlaWwocm93cyAvIHBhZ2VTaXplKVxuICAgICAgaWYgcGFnZXMgPiAxXG4gICAgICAgICR0YWJsZS5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgPHRmb290PlxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICA8dGQgY29sc3Bhbj1cIiN7JHRhYmxlLmZpbmQoJ3RoZWFkIHRoJykubGVuZ3RofVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYWdpbmF0aW9uXCI+XG4gICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI1wiPlByZXY8L2E+PC9saT5cbiAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDwvdGZvb3Q+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICB1bCA9ICR0YWJsZS5maW5kKCd0Zm9vdCB1bCcpXG4gICAgICAgIGZvciBpIGluIF8ucmFuZ2UoMSwgcGFnZXMgKyAxKVxuICAgICAgICAgIHVsLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI1wiPiN7aX08L2E+PC9saT5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgdWwuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgIDxsaT48YSBocmVmPVwiI1wiPk5leHQ8L2E+PC9saT5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgICR0YWJsZS5maW5kKCdsaSBhJykuY2xpY2sgKGUpIC0+XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgJGEgPSAkKHRoaXMpXG4gICAgICAgICAgdGV4dCA9ICRhLnRleHQoKVxuICAgICAgICAgIGlmIHRleHQgaXMgJ05leHQnXG4gICAgICAgICAgICBhID0gJGEucGFyZW50KCkucGFyZW50KCkuZmluZCgnLmFjdGl2ZScpLm5leHQoKS5maW5kKCdhJylcbiAgICAgICAgICAgIHVubGVzcyBhLnRleHQoKSBpcyAnTmV4dCdcbiAgICAgICAgICAgICAgYS5jbGljaygpXG4gICAgICAgICAgZWxzZSBpZiB0ZXh0IGlzICdQcmV2J1xuICAgICAgICAgICAgYSA9ICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5wcmV2KCkuZmluZCgnYScpXG4gICAgICAgICAgICB1bmxlc3MgYS50ZXh0KCkgaXMgJ1ByZXYnXG4gICAgICAgICAgICAgIGEuY2xpY2soKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgJGEucGFyZW50KCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIG4gPSBwYXJzZUludCh0ZXh0KVxuICAgICAgICAgICAgJHRhYmxlLmZpbmQoJ3Rib2R5IHRyJykuaGlkZSgpXG4gICAgICAgICAgICBvZmZzZXQgPSBwYWdlU2l6ZSAqIChuIC0gMSlcbiAgICAgICAgICAgICR0YWJsZS5maW5kKFwidGJvZHkgdHJcIikuc2xpY2Uob2Zmc2V0LCBuKnBhZ2VTaXplKS5zaG93KClcbiAgICAgICAgJCgkdGFibGUuZmluZCgnbGkgYScpWzFdKS5jbGljaygpXG5cbiAgICAgIGlmIG5vUm93c01lc3NhZ2UgPSAkdGFibGUuZGF0YSgnbm8tcm93cycpXG4gICAgICAgIGlmIHJvd3MgaXMgMFxuICAgICAgICAgIHBhcmVudCA9ICR0YWJsZS5wYXJlbnQoKVxuICAgICAgICAgICR0YWJsZS5yZW1vdmUoKVxuICAgICAgICAgIHBhcmVudC5yZW1vdmVDbGFzcyAndGFibGVDb250YWluZXInXG4gICAgICAgICAgcGFyZW50LmFwcGVuZCBcIjxwPiN7bm9Sb3dzTWVzc2FnZX08L3A+XCJcblxuICBlbmFibGVMYXllclRvZ2dsZXJzOiAoKSAtPlxuICAgIGVuYWJsZUxheWVyVG9nZ2xlcnMoQCRlbClcblxuICBnZXRDaGlsZHJlbjogKHNrZXRjaENsYXNzSWQpIC0+XG4gICAgXy5maWx0ZXIgQGNoaWxkcmVuLCAoY2hpbGQpIC0+IGNoaWxkLmdldFNrZXRjaENsYXNzKCkuaWQgaXMgc2tldGNoQ2xhc3NJZFxuXG5cbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0VGFiXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIFxuICByb3VuZDogKG51bWJlciwgZGVjaW1hbFBsYWNlcykgLT5cbiAgICB1bmxlc3MgXy5pc051bWJlciBudW1iZXJcbiAgICAgIG51bWJlciA9IHBhcnNlRmxvYXQobnVtYmVyKVxuICAgIG11bHRpcGxpZXIgPSBNYXRoLnBvdyAxMCwgZGVjaW1hbFBsYWNlc1xuICAgIE1hdGgucm91bmQobnVtYmVyICogbXVsdGlwbGllcikgLyBtdWx0aXBsaWVyIiwidGhpc1tcIlRlbXBsYXRlc1wiXSA9IHRoaXNbXCJUZW1wbGF0ZXNcIl0gfHwge307XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL2F0dHJpYnV0ZXMvYXR0cmlidXRlSXRlbVwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8dHIgZGF0YS1hdHRyaWJ1dGUtaWQ9XFxcIlwiKTtfLmIoXy52KF8uZihcImlkXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiBkYXRhLWF0dHJpYnV0ZS1leHBvcnRpZD1cXFwiXCIpO18uYihfLnYoXy5mKFwiZXhwb3J0aWRcIixjLHAsMCkpKTtfLmIoXCJcXFwiIGRhdGEtYXR0cmlidXRlLXR5cGU9XFxcIlwiKTtfLmIoXy52KF8uZihcInR5cGVcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRkIGNsYXNzPVxcXCJuYW1lXFxcIj5cIik7Xy5iKF8udihfLmYoXCJuYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx0ZCBjbGFzcz1cXFwidmFsdWVcXFwiPlwiKTtfLmIoXy52KF8uZihcImZvcm1hdHRlZFZhbHVlXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L3RyPlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL2F0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjx0YWJsZSBjbGFzcz1cXFwiYXR0cmlidXRlc1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImF0dHJpYnV0ZXNcIixjLHAsMSksYyxwLDAsNDQsODEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihfLnJwKFwiYXR0cmlidXRlcy9hdHRyaWJ1dGVJdGVtXCIsYyxwLFwiICAgIFwiKSk7fSk7Yy5wb3AoKTt9Xy5iKFwiPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9nZW5lcmljQXR0cmlidXRlc1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5cIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiIEF0dHJpYnV0ZXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihfLnJwKFwiYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIixjLHAsXCIgICAgXCIpKTtfLmIoXCIgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvcmVwb3J0TG9hZGluZ1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRMb2FkaW5nXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwhLS0gPGRpdiBjbGFzcz1cXFwic3Bpbm5lclxcXCI+MzwvZGl2PiAtLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5SZXF1ZXN0aW5nIFJlcG9ydCBmcm9tIFNlcnZlcjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcyBwcm9ncmVzcy1zdHJpcGVkIGFjdGl2ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImJhclxcXCIgc3R5bGU9XFxcIndpZHRoOiAxMDAlO1xcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxhIGhyZWY9XFxcIiNcXFwiIHJlbD1cXFwiZGV0YWlsc1xcXCI+ZGV0YWlsczwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiZGV0YWlsc1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG5cbmlmKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB0aGlzW1wiVGVtcGxhdGVzXCJdO1xufSIsIlJlcG9ydEdyYXBoVGFiID0gcmVxdWlyZSAncmVwb3J0R3JhcGhUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmNsYXNzIEVuZXJneUNvbnN1bXB0aW9uVGFiIGV4dGVuZHMgUmVwb3J0R3JhcGhUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnRW5lcmd5IENvbnN1bXB0aW9uJ1xuICBjbGFzc05hbWU6ICdFbmVyZ3lDb25zdW1wdGlvbidcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMuZW5lcmd5Q29uc3VtcHRpb25cbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0VuZXJneVBsYW4nXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICB0cnlcbiAgICAgIFxuICAgICAgbXNnID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXN1bHRNc2dcIilcbiAgICAgIGNvbnNvbGUubG9nKFwibXNnIGlzIFwiLCBtc2cpXG5cbiAgICAgIGNvbUVDID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21FVVwiKS50b0FycmF5KClcbiAgICAgIHJlc0VDID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFVVwiKS50b0FycmF5KClcblxuXG4gICAgICBjb21fcGEgPSBAZ2V0TWFwKGNvbUVDLCBcIlBBXCIpXG4gICAgICBjb21fZGJscGEgPSBAZ2V0TWFwKGNvbUVDLCBcIkRibFBBXCIpXG4gICAgICBjb21fbm9wYSA9IEBnZXRNYXAoY29tRUMsIFwiTm9QQVwiKVxuICAgICAgXG4gICAgICBjb21fdXNlciA9IEBnZXRVc2VyTWFwKGNvbUVDLCBcIlVTRVJcIiwgY29tX25vcGEpXG5cbiAgICAgIGNvbV91c2VyX3NhdmluZ3MgPSBAZ2V0VXNlclNhdmluZ3MoY29tRUMsIGNvbV91c2VyLCBjb21fbm9wYSwgMSlcblxuICAgICAgc29ydGVkX2NvbW1fcmVzdWx0cyA9IFtjb21fbm9wYSwgY29tX3BhLCBjb21fZGJscGEsIGNvbV91c2VyXVxuXG4gICAgICByZXNfcGEgPSBAZ2V0TWFwKHJlc0VDLCBcIlBBXCIpXG4gICAgICByZXNfZGJscGEgPSBAZ2V0TWFwKHJlc0VDLCBcIkRibFBBXCIpXG4gICAgICByZXNfbm9wYSA9IEBnZXRNYXAocmVzRUMsIFwiTm9QQVwiKVxuICAgICAgXG4gICAgICByZXNfdXNlciA9IEBnZXRVc2VyTWFwKHJlc0VDLCBcIlVTRVJcIiwgcmVzX25vcGEpXG4gICAgICByZXNfdXNlcl9zYXZpbmdzID0gQGdldFVzZXJTYXZpbmdzKHJlc0VDLCByZXNfdXNlciwgcmVzX25vcGEsIDEpXG4gICAgICBzb3J0ZWRfcmVzX3Jlc3VsdHMgPSBbcmVzX25vcGEsIHJlc19wYSwgcmVzX2RibHBhLCByZXNfdXNlcl1cblxuXG4gICAgICBzY2VuYXJpb3MgPSBbJycsJ1BBIDI5NScsICdObyBQQSAyOTUnLCAnRG91YmxlIFBBIDI5NSddXG5cbiAgICAgIHJlc19zdW0gPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0VVU3VtXCIpLmZsb2F0KCdVU0VSX1NVTScsIDEpXG4gICAgICByZXNfcGEyOTVfdG90YWxfZWMgPSAgQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFVVN1bVwiKS5mbG9hdCgnUEFfU1VNJywgMSlcbiAgICAgIHJlc19ub19wYTI5NV90b3RhbF9lYyA9ICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0VVU3VtXCIpLmZsb2F0KCdOT1BBX1NVTScsIDEpXG4gICAgICByZXNfZGJsX3BhMjk1X3RvdGFsX2VjID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFVVN1bVwiKS5mbG9hdCgnREJMUEFfU1VNJywgMSlcblxuICAgICAgcmVzX3BhMjk1X2RpZmYgPSBNYXRoLnJvdW5kKChyZXNfcGEyOTVfdG90YWxfZWMgLSByZXNfc3VtKSwwKVxuXG4gICAgICByZXNfaGFzX3NhdmluZ3NfcGEyOTUgPSByZXNfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCByZXNfaGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgICAgcmVzX2hhc19zYXZpbmdzX3BhMjk1ID0gcmVzX2hhc19zYXZpbmdzX3BhMjk1Ki0xXG4gICAgICByZXNfcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgcmVzX3BhMjk1X2RpZmZcbiAgXG4gICAgICByZXNfbm9fcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKHJlc19ub19wYTI5NV90b3RhbF9lYyAtIHJlc19zdW0pLDApXG4gICAgICByZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTUgPSByZXNfbm9fcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCByZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcbiAgICAgICAgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1ID0gcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1Ki0xXG4gICAgICByZXNfbm9fcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgcmVzX25vX3BhMjk1X2RpZmZcblxuICAgICAgcmVzX2RibF9wYTI5NV9kaWZmID0gIE1hdGgucm91bmQoKHJlc19kYmxfcGEyOTVfdG90YWxfZWMgLSByZXNfc3VtKSwwKVxuICAgICAgcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NSA9IHJlc19kYmxfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgICAgcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NSA9IHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTUqLTFcbiAgICAgIHJlc19kYmxfcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgcmVzX2RibF9wYTI5NV9kaWZmXG5cbiAgICAgIGNvbW1fc3VtID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21FVVN1bVwiKS5mbG9hdCgnVVNFUl9TVU0nLCAxKVxuICAgICAgY29tbV9wYTI5NV90b3RhbF9lYyA9ICAgICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUVVU3VtXCIpLmZsb2F0KCdQQV9TVU0nLCAxKVxuICAgICAgY29tbV9ub19wYTI5NV90b3RhbF9lYyA9ICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUVVU3VtXCIpLmZsb2F0KCdOT1BBX1NVTScsIDEpXG4gICAgICBjb21tX2RibF9wYTI5NV90b3RhbF9lYyA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tRVVTdW1cIikuZmxvYXQoJ0RCTFBBX1NVTScsIDEpXG5cbiAgICAgIGNvbW1fcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKGNvbW1fcGEyOTVfdG90YWxfZWMgLSBjb21tX3N1bSksMClcbiAgICAgIFxuICAgICAgY29tbV9oYXNfc2F2aW5nc19wYTI5NSA9IGNvbW1fcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCBjb21tX2hhc19zYXZpbmdzX3BhMjk1XG4gICAgICAgIGNvbW1fcGEyOTVfZGlmZj1jb21tX3BhMjk1X2RpZmYqLTFcbiAgICAgIGNvbW1fcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgY29tbV9wYTI5NV9kaWZmXG5cbiAgICAgIGNvbW1fbm9fcGEyOTVfZGlmZiA9ICBNYXRoLnJvdW5kKChjb21tX25vX3BhMjk1X3RvdGFsX2VjIC0gY29tbV9zdW0pLDApXG4gICAgICBjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1ID0gY29tbV9ub19wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcbiAgICAgICAgY29tbV9ub19wYTI5NV9kaWZmID0gY29tbV9ub19wYTI5NV9kaWZmKi0xXG4gICAgICBjb21tX25vX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIGNvbW1fbm9fcGEyOTVfZGlmZlxuXG4gICAgICBjb21tX2RibF9wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgoY29tbV9kYmxfcGEyOTVfdG90YWxfZWMgLSBjb21tX3N1bSksMClcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1ID0gY29tbV9kYmxfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuICAgICAgICBjb21tX2RibF9wYTI5NV9kaWZmID0gY29tbV9kYmxfcGEyOTVfZGlmZiotMVxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgY29tbV9kYmxfcGEyOTVfZGlmZlxuXG4gICAgY2F0Y2ggZVxuICAgICAgY29uc29sZS5sb2coXCJlcnJvcjogXCIsIGUpXG5cbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG4gICAgICBjb21fdXNlcl9zYXZpbmdzOiBjb21fdXNlcl9zYXZpbmdzXG4gICAgICByZXNfdXNlcl9zYXZpbmdzOiByZXNfdXNlcl9zYXZpbmdzXG4gICAgICBzY2VuYXJpb3M6IHNjZW5hcmlvc1xuXG4gICAgICByZXNfcGEyOTVfZGlmZjogcmVzX3BhMjk1X2RpZmZcbiAgICAgIHJlc19oYXNfc2F2aW5nc19wYTI5NTogcmVzX2hhc19zYXZpbmdzX3BhMjk1XG5cbiAgICAgIHJlc19ub19wYTI5NV9kaWZmOiByZXNfbm9fcGEyOTVfZGlmZlxuICAgICAgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1OiByZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcblxuICAgICAgcmVzX2RibF9wYTI5NV9kaWZmOiByZXNfZGJsX3BhMjk1X2RpZmZcbiAgICAgIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTU6IHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcblxuICAgICAgY29tbV9wYTI5NV9kaWZmOiBjb21tX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfcGEyOTU6IGNvbW1faGFzX3NhdmluZ3NfcGEyOTVcblxuICAgICAgY29tbV9ub19wYTI5NV9kaWZmOiBjb21tX25vX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTU6IGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcblxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZjogY29tbV9kYmxfcGEyOTVfZGlmZlxuICAgICAgY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTU6IGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XG5cbiAgICAgIHJlc19zdW06IHJlc19zdW1cbiAgICAgIGNvbW1fc3VtOiBjb21tX3N1bVxuICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG4gICAgQCQoJy5jb21tLWNob3Nlbi1lYycpLmNob3Nlbih7ZGlzYWJsZV9zZWFyY2hfdGhyZXNob2xkOiAxMCwgd2lkdGg6JzIwMHB4J30pXG4gICAgQCQoJy5jb21tLWNob3Nlbi1lYycpLmNoYW5nZSAoKSA9PlxuICAgICAgQHJlbmRlckRpZmZzKCcuY29tbS1jaG9zZW4tZWMnLCAnY29tbScsICdlYycpXG5cbiAgICBAJCgnLnJlcy1jaG9zZW4tZWMnKS5jaG9zZW4oe2Rpc2FibGVfc2VhcmNoX3RocmVzaG9sZDogMTAsIHdpZHRoOicyMDBweCd9KVxuICAgIEAkKCcucmVzLWNob3Nlbi1lYycpLmNoYW5nZSAoKSA9PlxuICAgICAgQHJlbmRlckRpZmZzKCcucmVzLWNob3Nlbi1lYycsICdyZXMnLCAnZWMnKVxuXG5cbiAgICBpZiB3aW5kb3cuZDNcblxuICAgICAgaCA9IDMyMFxuICAgICAgdyA9IDM4MFxuICAgICAgbWFyZ2luID0ge2xlZnQ6NDAsIHRvcDo1LCByaWdodDo0MCwgYm90dG9tOiA0MCwgaW5uZXI6NX1cbiAgICAgIGhhbGZoID0gKGgrbWFyZ2luLnRvcCttYXJnaW4uYm90dG9tKVxuICAgICAgdG90YWxoID0gaGFsZmgqMlxuICAgICAgaGFsZncgPSAodyttYXJnaW4ubGVmdCttYXJnaW4ucmlnaHQpXG4gICAgICB0b3RhbHcgPSBoYWxmdyoyXG4gICAgICBcbiAgICAgIGNvbV9jaGFydCA9IEBkcmF3Q2hhcnQoJy5jb21tZXJjaWFsRW5lcmd5Q29uc3VtcHRpb24nKS54dmFyKDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC55dmFyKDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC54bGFiKFwiWWVhclwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueWxhYihcIlZhbHVlIChpbiBtaWxsaW9ucylcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmhlaWdodChoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAud2lkdGgodylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcmdpbihtYXJnaW4pXG5cbiAgICAgIGNoID0gZDMuc2VsZWN0KEAkKCcuY29tbWVyY2lhbEVuZXJneUNvbnN1bXB0aW9uJykpXG4gICAgICBjaC5kYXR1bShzb3J0ZWRfY29tbV9yZXN1bHRzKVxuICAgICAgICAuY2FsbChjb21fY2hhcnQpXG5cbiAgICAgIHJlc19jaGFydCA9IEBkcmF3Q2hhcnQoJy5yZXNpZGVudGlhbEVuZXJneUNvbnN1bXB0aW9uJykueHZhcigwKVxuICAgICAgICAgICAgICAgICAgICAgLnl2YXIoMSlcbiAgICAgICAgICAgICAgICAgICAgIC54bGFiKFwiWWVhclwiKVxuICAgICAgICAgICAgICAgICAgICAgLnlsYWIoXCJWYWx1ZSAoaW4gbWlsbGlvbnMpXCIpXG4gICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KGgpXG4gICAgICAgICAgICAgICAgICAgICAud2lkdGgodylcbiAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4obWFyZ2luKVxuXG4gICAgICBjaCA9IGQzLnNlbGVjdChAJCgnLnJlc2lkZW50aWFsRW5lcmd5Q29uc3VtcHRpb24nKSlcbiAgICAgIGNoLmRhdHVtKHNvcnRlZF9yZXNfcmVzdWx0cylcbiAgICAgICAgLmNhbGwocmVzX2NoYXJ0KVxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUubG9nKFwiTk8gRDMhISEhISEhXCIpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZXJneUNvbnN1bXB0aW9uVGFiIiwiUmVwb3J0R3JhcGhUYWIgPSByZXF1aXJlICdyZXBvcnRHcmFwaFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuY2xhc3MgRnVlbENvc3RzVGFiIGV4dGVuZHMgUmVwb3J0R3JhcGhUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnRnVlbCBDb3N0cydcbiAgY2xhc3NOYW1lOiAnZnVlbENvc3RzJ1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5mdWVsQ29zdHNcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0VuZXJneVBsYW4nXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuXG4gICAgdHJ5XG4gICAgICBzY2VuYXJpb3MgPSBbJ1BBIDI5NScsICdObyBQQSAyOTUnLCAnRG91YmxlIFBBIDI5NSddXG4gICAgICBjb21GQyA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tRUNcIikudG9BcnJheSgpXG4gICAgICByZXNGQyA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzRUNcIikudG9BcnJheSgpXG5cbiAgICAgIGNvbV9wYSA9IEBnZXRNYXAoY29tRkMsIFwiUEFcIilcbiAgICAgIGNvbV9kYmxwYSA9IEBnZXRNYXAoY29tRkMsIFwiRGJsUEFcIilcbiAgICAgIGNvbV9ub3BhID0gQGdldE1hcChjb21GQywgXCJOb1BBXCIpXG4gICAgICBcbiAgICAgIGNvbV91c2VyID0gQGdldFVzZXJNYXAoY29tRkMsIFwiVVNFUlwiLCBjb21fbm9wYSlcbiAgICAgIGNvbV91c2VyX3NhdmluZ3MgPSBAZ2V0VXNlclNhdmluZ3MoY29tRkMsIGNvbV91c2VyLCBjb21fbm9wYSwgMilcbiAgICAgIHNvcnRlZF9jb21tX3Jlc3VsdHMgPSBbY29tX25vcGEsIGNvbV9wYSwgY29tX2RibHBhLCBjb21fdXNlcl1cblxuICAgICAgcmVzX3BhID0gQGdldE1hcChyZXNGQywgXCJQQVwiKVxuICAgICAgcmVzX2RibHBhID0gQGdldE1hcChyZXNGQywgXCJEYmxQQVwiKVxuICAgICAgcmVzX25vcGEgPSBAZ2V0TWFwKHJlc0ZDLCBcIk5vUEFcIilcbiAgICAgIFxuICAgICAgcmVzX3VzZXIgPSBAZ2V0VXNlck1hcChyZXNGQywgXCJVU0VSXCIsIHJlc19ub3BhKVxuICAgICAgcmVzX3VzZXJfc2F2aW5ncyA9IEBnZXRVc2VyU2F2aW5ncyhyZXNGQywgcmVzX3VzZXIsIHJlc19ub3BhLCAyKVxuICAgICAgc29ydGVkX3Jlc19yZXN1bHRzID0gW3Jlc19ub3BhLCByZXNfcGEsIHJlc19kYmxwYSwgcmVzX3VzZXJdXG5cblxuICAgICAgcmVzX3N1bSA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzRUNTdW1cIikuZmxvYXQoJ1VTRVJfU1VNJywgMSlcbiAgICAgIHJlc19wYTI5NV90b3RhbF9mYyA9ICAgICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0VDU3VtXCIpLmZsb2F0KCdQQV9TVU0nLCAxKVxuICAgICAgcmVzX25vX3BhMjk1X3RvdGFsX2ZjID0gIEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzRUNTdW1cIikuZmxvYXQoJ05PUEFfU1VNJywgMSlcbiAgICAgIHJlc19kYmxfcGEyOTVfdG90YWxfZmMgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0VDU3VtXCIpLmZsb2F0KCdEQkxQQV9TVU0nLCAxKVxuXG4gICAgICByZXNfcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKHJlc19wYTI5NV90b3RhbF9mYyAtIHJlc19zdW0pLDApXG4gICAgICByZXNfaGFzX3NhdmluZ3NfcGEyOTUgPSByZXNfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCByZXNfaGFzX3NhdmluZ3NfcGEyOTVcbiAgICAgICAgcmVzX2hhc19zYXZpbmdzX3BhMjk1ID0gcmVzX2hhc19zYXZpbmdzX3BhMjk1Ki0xXG4gICAgICByZXNfcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgcmVzX3BhMjk1X2RpZmZcblxuICAgICAgcmVzX25vX3BhMjk1X2RpZmYgPSBNYXRoLnJvdW5kKChyZXNfbm9fcGEyOTVfdG90YWxfZmMgLSByZXNfc3VtKSwwKVxuICAgICAgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1ID0gcmVzX25vX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICAgIHJlc19oYXNfc2F2aW5nc19ub19wYTI5NSA9IHJlc19oYXNfc2F2aW5nc19ub19wYTI5NSotMVxuICAgICAgcmVzX25vX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIHJlc19ub19wYTI5NV9kaWZmXG5cbiAgICAgIHJlc19kYmxfcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKHJlc19kYmxfcGEyOTVfdG90YWxfZmMgLSByZXNfc3VtKSwwKVxuICAgICAgcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NSA9IHJlc19kYmxfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgICAgcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NSA9IHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTUqLTFcbiAgICAgIHJlc19kYmxfcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgcmVzX2RibF9wYTI5NV9kaWZmXG5cbiAgICAgIGNvbW1fc3VtID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21FQ1N1bVwiKS5mbG9hdCgnVVNFUl9TVU0nLCAxKVxuICAgICAgY29tbV9wYTI5NV90b3RhbF9mYyA9ICAgICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUVDU3VtXCIpLmZsb2F0KCdQQV9TVU0nLCAxKVxuICAgICAgY29tbV9ub19wYTI5NV90b3RhbF9mYyA9ICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUVDU3VtXCIpLmZsb2F0KCdOT1BBX1NVTScsIDEpXG4gICAgICBjb21tX2RibF9wYTI5NV90b3RhbF9mYyA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tRUNTdW1cIikuZmxvYXQoJ0RCTFBBX1NVTScsIDEpXG5cbiAgICAgIGNvbW1fcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKGNvbW1fcGEyOTVfdG90YWxfZmMgLSBjb21tX3N1bSksMClcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfcGEyOTUgPSBjb21tX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgY29tbV9oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgICBjb21tX3BhMjk1X2RpZmY9Y29tbV9wYTI5NV9kaWZmKi0xXG4gICAgICBjb21tX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIGNvbW1fcGEyOTVfZGlmZlxuXG4gICAgICBjb21tX25vX3BhMjk1X2RpZmYgPSBNYXRoLnJvdW5kKChjb21tX25vX3BhMjk1X3RvdGFsX2ZjIC0gY29tbV9zdW0pLDApXG4gICAgICBjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1ID0gY29tbV9ub19wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcbiAgICAgICAgY29tbV9ub19wYTI5NV9kaWZmID0gY29tbV9ub19wYTI5NV9kaWZmKi0xXG4gICAgICBjb21tX25vX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIGNvbW1fbm9fcGEyOTVfZGlmZlxuXG5cblxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKGNvbW1fZGJsX3BhMjk1X3RvdGFsX2ZjIC0gY29tbV9zdW0pLDApXG4gICAgICBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NSA9IGNvbW1fZGJsX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcbiAgICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZiA9IGNvbW1fZGJsX3BhMjk1X2RpZmYqLTFcbiAgICAgIGNvbW1fZGJsX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIGNvbW1fZGJsX3BhMjk1X2RpZmZcblxuICAgIGNhdGNoIGVcbiAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3IuLi4uLi4uLi4uLi4uLi4uLi4uLjogXCIsIGUpXG5cbiAgICBjb250ZXh0ID1cbiAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuXG4gICAgICBzY2VuYXJpb3M6IHNjZW5hcmlvc1xuICAgICAgY29tX3VzZXJfc2F2aW5nczogY29tX3VzZXJfc2F2aW5nc1xuICAgICAgcmVzX3VzZXJfc2F2aW5nczogcmVzX3VzZXJfc2F2aW5nc1xuICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG5cbiAgICAgIHJlc19wYTI5NV9kaWZmOiByZXNfcGEyOTVfZGlmZlxuICAgICAgcmVzX2hhc19zYXZpbmdzX3BhMjk1OiByZXNfaGFzX3NhdmluZ3NfcGEyOTVcblxuICAgICAgcmVzX25vX3BhMjk1X2RpZmY6IHJlc19ub19wYTI5NV9kaWZmXG4gICAgICByZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTU6IHJlc19oYXNfc2F2aW5nc19ub19wYTI5NVxuXG4gICAgICByZXNfZGJsX3BhMjk1X2RpZmY6IHJlc19kYmxfcGEyOTVfZGlmZlxuICAgICAgcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NTogcmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuXG4gICAgICBjb21tX3BhMjk1X2RpZmY6IGNvbW1fcGEyOTVfZGlmZlxuICAgICAgY29tbV9oYXNfc2F2aW5nc19wYTI5NTogY29tbV9oYXNfc2F2aW5nc19wYTI5NVxuXG4gICAgICBjb21tX25vX3BhMjk1X2RpZmY6IGNvbW1fbm9fcGEyOTVfZGlmZlxuICAgICAgY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NTogY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NVxuXG4gICAgICBjb21tX2RibF9wYTI5NV9kaWZmOiBjb21tX2RibF9wYTI5NV9kaWZmXG4gICAgICBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NTogY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcblxuICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUucmVuZGVyKGNvbnRleHQsIHBhcnRpYWxzKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcblxuICAgIEAkKCcuY29tbS1jaG9zZW4tZmMnKS5jaG9zZW4oe2Rpc2FibGVfc2VhcmNoX3RocmVzaG9sZDogMTAsIHdpZHRoOicyMjBweCd9KVxuICAgIEAkKCcuY29tbS1jaG9zZW4tZmMnKS5jaGFuZ2UgKCkgPT5cbiAgICAgIEByZW5kZXJEaWZmcygnLmNvbW0tY2hvc2VuLWZjJywgJ2NvbW0nLCAnZmMnKVxuXG4gICAgQCQoJy5yZXMtY2hvc2VuLWZjJykuY2hvc2VuKHtkaXNhYmxlX3NlYXJjaF90aHJlc2hvbGQ6IDEwLCB3aWR0aDonMjIwcHgnfSlcbiAgICBAJCgnLnJlcy1jaG9zZW4tZmMnKS5jaGFuZ2UgKCkgPT5cbiAgICAgIEByZW5kZXJEaWZmcygnLnJlcy1jaG9zZW4tZmMnLCAncmVzJywgJ2ZjJylcblxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgaCA9IDMyMFxuICAgICAgdyA9IDM4MFxuICAgICAgbWFyZ2luID0ge2xlZnQ6NDAsIHRvcDo1LCByaWdodDo0MCwgYm90dG9tOiA0MCwgaW5uZXI6NX1cbiAgICAgIGhhbGZoID0gKGgrbWFyZ2luLnRvcCttYXJnaW4uYm90dG9tKVxuICAgICAgdG90YWxoID0gaGFsZmgqMlxuICAgICAgaGFsZncgPSAodyttYXJnaW4ubGVmdCttYXJnaW4ucmlnaHQpXG4gICAgICB0b3RhbHcgPSBoYWxmdyoyXG4gICAgICBcbiAgICAgIGNvbV9jaGFydCA9IEBkcmF3Q2hhcnQoJy5jb21tZXJjaWFsRnVlbENvc3RzJykueHZhcigwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueXZhcigxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueGxhYihcIlllYXJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnlsYWIoXCJWYWx1ZSAoaW4gbWlsbGlvbiAkKVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC53aWR0aCh3KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFyZ2luKG1hcmdpbilcblxuICAgICAgY2ggPSBkMy5zZWxlY3QoQCQoJy5jb21tZXJjaWFsRnVlbENvc3RzJykpXG4gICAgICBjaC5kYXR1bShzb3J0ZWRfY29tbV9yZXN1bHRzKVxuICAgICAgICAuY2FsbChjb21fY2hhcnQpXG5cbiAgICAgIHJlc19jaGFydCA9IEBkcmF3Q2hhcnQoJy5yZXNpZGVudGlhbEZ1ZWxDb3N0cycpLnh2YXIoMClcbiAgICAgICAgICAgICAgICAgICAgIC55dmFyKDEpXG4gICAgICAgICAgICAgICAgICAgICAueGxhYihcIlllYXJcIilcbiAgICAgICAgICAgICAgICAgICAgIC55bGFiKFwiVmFsdWUgKGluIG1pbGxpb24gJClcIilcbiAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoaClcbiAgICAgICAgICAgICAgICAgICAgIC53aWR0aCh3KVxuICAgICAgICAgICAgICAgICAgICAgLm1hcmdpbihtYXJnaW4pXG5cbiAgICAgIGNoID0gZDMuc2VsZWN0KEAkKCcucmVzaWRlbnRpYWxGdWVsQ29zdHMnKSlcbiAgICAgIGNoLmRhdHVtKHNvcnRlZF9yZXNfcmVzdWx0cylcbiAgICAgICAgLmNhbGwocmVzX2NoYXJ0KVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRnVlbENvc3RzVGFiIiwiUmVwb3J0R3JhcGhUYWIgPSByZXF1aXJlICdyZXBvcnRHcmFwaFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuXG5jbGFzcyBHcmVlbmhvdXNlR2FzZXNUYWIgZXh0ZW5kcyBSZXBvcnRHcmFwaFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdHcmVlbmhvdXNlIEdhc2VzJ1xuICBjbGFzc05hbWU6ICdncmVlbmhvdXNlR2FzZXMnXG4gIHRpbWVvdXQ6IDEyMDAwMFxuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLmdyZWVuaG91c2VHYXNlc1xuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnRW5lcmd5UGxhbidcbiAgXVxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGQzSXNQcmVzZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGQzSXNQcmVzZW50ID0gZmFsc2VcbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuXG4gICAgdHJ5XG4gICAgICBjb21HSEcgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUdIR1wiKS50b0FycmF5KClcbiAgICAgIHJlc0dIRyA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzR0hHXCIpLnRvQXJyYXkoKVxuXG4gICAgICBjb21fcGEgPSBAZ2V0TWFwKGNvbUdIRywgXCJQQVwiKVxuICAgICAgY29tX2RibHBhID0gQGdldE1hcChjb21HSEcsIFwiRGJsUEFcIilcbiAgICAgIGNvbV9ub3BhID0gQGdldE1hcChjb21HSEcsIFwiTm9QQVwiKVxuICAgICAgXG4gICAgICBjb21fdXNlciA9IEBnZXRVc2VyTWFwKGNvbUdIRywgXCJVU0VSXCIsIGNvbV9ub3BhKVxuICAgICAgY29tX3VzZXJfc2F2aW5ncyA9IEBnZXRVc2VyU2F2aW5ncyhjb21HSEcsIGNvbV91c2VyLGNvbV9ub3BhLCAxKVxuICAgICAgc29ydGVkX2NvbW1fcmVzdWx0cyA9IFtjb21fbm9wYSwgY29tX3BhLCBjb21fZGJscGEsIGNvbV91c2VyXVxuXG4gICAgICByZXNfcGEgPSBAZ2V0TWFwKHJlc0dIRywgXCJQQVwiKVxuICAgICAgcmVzX2RibHBhID0gQGdldE1hcChyZXNHSEcsIFwiRGJsUEFcIilcbiAgICAgIHJlc19ub3BhID0gQGdldE1hcChyZXNHSEcsIFwiTm9QQVwiKVxuICAgICAgXG4gICAgICByZXNfdXNlciA9IEBnZXRVc2VyTWFwKHJlc0dIRywgXCJVU0VSXCIsIHJlc19ub3BhKVxuICAgICAgcmVzX3VzZXJfc2F2aW5ncyA9IEBnZXRVc2VyU2F2aW5ncyhyZXNHSEcsIHJlc191c2VyLHJlc19ub3BhLCAxKVxuICAgICAgc29ydGVkX3Jlc19yZXN1bHRzID0gW3Jlc19ub3BhLCByZXNfcGEsIHJlc19kYmxwYSwgcmVzX3VzZXJdXG5cbiAgICAgIHNjZW5hcmlvcyA9IFsnUEEgMjk1JywgJ05vIFBBIDI5NScsICdEb3VibGUgUEEgMjk1J11cblxuICAgICAgcmVzX3N1bSA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzR0hHU3VtXCIpLmZsb2F0KCdVU0VSX1NVTScsIDEpXG4gICAgICByZXNfcGEyOTVfdG90YWxfZ2hnID0gICAgIEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiUmVzR0hHU3VtXCIpLmZsb2F0KCdQQV9TVU0nLCAxKVxuICAgICAgcmVzX25vX3BhMjk1X3RvdGFsX2doZyA9ICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0dIR1N1bVwiKS5mbG9hdCgnTk9QQV9TVU0nLCAxKVxuICAgICAgcmVzX2RibF9wYTI5NV90b3RhbF9naGcgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc0dIR1N1bVwiKS5mbG9hdCgnREJMUEFfU1VNJywgMSlcblxuICAgICAgcmVzX3BhMjk1X2RpZmYgPSBNYXRoLnJvdW5kKChyZXNfcGEyOTVfdG90YWxfZ2hnIC0gcmVzX3N1bSksMClcbiAgICAgIHJlc19oYXNfc2F2aW5nc19wYTI5NSA9IHJlc19wYTI5NV9kaWZmID4gMFxuICAgICAgaWYgbm90IHJlc19oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgICByZXNfaGFzX3NhdmluZ3NfcGEyOTUgPSByZXNfaGFzX3NhdmluZ3NfcGEyOTUqLTFcbiAgICAgIHJlc19wYTI5NV9kaWZmID0gQGFkZENvbW1hcyByZXNfcGEyOTVfZGlmZlxuXG4gICAgICByZXNfbm9fcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKHJlc19ub19wYTI5NV90b3RhbF9naGcgLSByZXNfc3VtKSwwKVxuICAgICAgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1ID0gcmVzX25vX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICAgIHJlc19oYXNfc2F2aW5nc19ub19wYTI5NSA9IHJlc19oYXNfc2F2aW5nc19ub19wYTI5NSotMVxuICAgICAgcmVzX25vX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIHJlc19ub19wYTI5NV9kaWZmXG5cbiAgICAgIHJlc19kYmxfcGEyOTVfZGlmZiA9IE1hdGgucm91bmQoKHJlc19kYmxfcGEyOTVfdG90YWxfZ2hnIC0gcmVzX3N1bSksMClcbiAgICAgIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTUgPSByZXNfZGJsX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1XG4gICAgICAgIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTUgPSByZXNfaGFzX3NhdmluZ3NfZGJsX3BhMjk1Ki0xXG4gICAgICByZXNfZGJsX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIHJlc19kYmxfcGEyOTVfZGlmZlxuXG4gICAgICBjb21tX3N1bSA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tR0hHU3VtXCIpLmZsb2F0KCdVU0VSX1NVTScsIDEpXG4gICAgICBjb21tX3BhMjk1X3RvdGFsX2doZyA9ICAgICBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUdIR1N1bVwiKS5mbG9hdCgnUEFfU1VNJywgMSlcbiAgICAgIGNvbW1fbm9fcGEyOTVfdG90YWxfZ2hnID0gIEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tR0hHU3VtXCIpLmZsb2F0KCdOT1BBX1NVTScsIDEpXG4gICAgICBjb21tX2RibF9wYTI5NV90b3RhbF9naGcgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUdIR1N1bVwiKS5mbG9hdCgnREJMUEFfU1VNJywgMSlcblxuICAgICAgY29tbV9wYTI5NV9kaWZmID0gTWF0aC5yb3VuZCgoY29tbV9wYTI5NV90b3RhbF9naGcgLSBjb21tX3N1bSksMClcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfcGEyOTUgPSBjb21tX3BhMjk1X2RpZmYgPiAwXG4gICAgICBpZiBub3QgY29tbV9oYXNfc2F2aW5nc19wYTI5NVxuICAgICAgICBjb21tX3BhMjk1X2RpZmY9Y29tbV9wYTI5NV9kaWZmKi0xXG4gICAgICBjb21tX3BhMjk1X2RpZmYgPSBAYWRkQ29tbWFzIGNvbW1fcGEyOTVfZGlmZlxuXG4gICAgICBjb21tX25vX3BhMjk1X2RpZmYgPSBNYXRoLnJvdW5kKChjb21tX25vX3BhMjk1X3RvdGFsX2doZyAtIGNvbW1fc3VtKSwwKVxuICAgICAgY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NSA9IGNvbW1fbm9fcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCBjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XG4gICAgICAgIGNvbW1fbm9fcGEyOTVfZGlmZiA9IGNvbW1fbm9fcGEyOTVfZGlmZiotMVxuICAgICAgY29tbV9ub19wYTI5NV9kaWZmID0gQGFkZENvbW1hcyBjb21tX25vX3BhMjk1X2RpZmZcblxuXG5cbiAgICAgIGNvbW1fZGJsX3BhMjk1X2RpZmYgPSBNYXRoLnJvdW5kKChjb21tX2RibF9wYTI5NV90b3RhbF9naGcgLSBjb21tX3N1bSksMClcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1ID0gY29tbV9kYmxfcGEyOTVfZGlmZiA+IDBcbiAgICAgIGlmIG5vdCBjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVxuICAgICAgICBjb21tX2RibF9wYTI5NV9kaWZmID0gY29tbV9kYmxfcGEyOTVfZGlmZiotMVxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZiA9IEBhZGRDb21tYXMgY29tbV9kYmxfcGEyOTVfZGlmZlxuXG4gICAgY2F0Y2ggZVxuICAgICAgY29uc29sZS5sb2coXCJlcnJvcjogXCIsIGUpXG5cbiAgICBjb250ZXh0ID1cbiAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuICAgICAgY29tX3VzZXJfc2F2aW5nczogY29tX3VzZXJfc2F2aW5nc1xuICAgICAgcmVzX3VzZXJfc2F2aW5nczogcmVzX3VzZXJfc2F2aW5nc1xuICAgICAgZDNJc1ByZXNlbnQ6IGQzSXNQcmVzZW50XG5cbiAgICAgIHNjZW5hcmlvczogc2NlbmFyaW9zXG4gICAgICByZXNfcGEyOTVfZGlmZjogcmVzX3BhMjk1X2RpZmZcbiAgICAgIHJlc19oYXNfc2F2aW5nc19wYTI5NTogcmVzX2hhc19zYXZpbmdzX3BhMjk1XG5cbiAgICAgIHJlc19ub19wYTI5NV9kaWZmOiByZXNfbm9fcGEyOTVfZGlmZlxuICAgICAgcmVzX2hhc19zYXZpbmdzX25vX3BhMjk1OiByZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcblxuICAgICAgcmVzX2RibF9wYTI5NV9kaWZmOiByZXNfZGJsX3BhMjk1X2RpZmZcbiAgICAgIHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTU6IHJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcblxuICAgICAgY29tbV9wYTI5NV9kaWZmOiBjb21tX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3NfcGEyOTU6IGNvbW1faGFzX3NhdmluZ3NfcGEyOTVcblxuICAgICAgY29tbV9ub19wYTI5NV9kaWZmOiBjb21tX25vX3BhMjk1X2RpZmZcbiAgICAgIGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTU6IGNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcblxuICAgICAgY29tbV9kYmxfcGEyOTVfZGlmZjogY29tbV9kYmxfcGEyOTVfZGlmZlxuICAgICAgY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTU6IGNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XG5cbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcbiAgICBAZW5hYmxlTGF5ZXJUb2dnbGVycygpXG5cbiAgICBAJCgnLmNvbW0tY2hvc2VuLWdoZycpLmNob3Nlbih7ZGlzYWJsZV9zZWFyY2hfdGhyZXNob2xkOiAxMCwgd2lkdGg6JzIwMHB4J30pXG4gICAgQCQoJy5jb21tLWNob3Nlbi1naGcnKS5jaGFuZ2UgKCkgPT5cbiAgICAgIEByZW5kZXJEaWZmcygnLmNvbW0tY2hvc2VuLWdoZycsICdjb21tJywgJ2doZycpXG5cbiAgICBAJCgnLnJlcy1jaG9zZW4tZ2hnJykuY2hvc2VuKHtkaXNhYmxlX3NlYXJjaF90aHJlc2hvbGQ6IDEwLCB3aWR0aDonMjAwcHgnfSlcbiAgICBAJCgnLnJlcy1jaG9zZW4tZ2hnJykuY2hhbmdlICgpID0+XG4gICAgICBAcmVuZGVyRGlmZnMoJy5yZXMtY2hvc2VuLWdoZycsICdyZXMnLCAnZ2hnJylcblxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgaCA9IDMyMFxuICAgICAgdyA9IDM4MFxuICAgICAgbWFyZ2luID0ge2xlZnQ6NDAsIHRvcDo1LCByaWdodDo0MCwgYm90dG9tOiA0MCwgaW5uZXI6NX1cbiAgICAgIGhhbGZoID0gKGgrbWFyZ2luLnRvcCttYXJnaW4uYm90dG9tKVxuICAgICAgdG90YWxoID0gaGFsZmgqMlxuICAgICAgaGFsZncgPSAodyttYXJnaW4ubGVmdCttYXJnaW4ucmlnaHQpXG4gICAgICB0b3RhbHcgPSBoYWxmdyoyXG4gICAgICBcblxuICAgICAgY29tX2NoYXJ0ID0gQGRyYXdDaGFydCgnLmNvbW1lcmNpYWxHcmVlbmhvdXNlR2FzZXMnKS54dmFyKDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC55dmFyKDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC54bGFiKFwiWWVhclwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueWxhYihcIlZhbHVlXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLndpZHRoKHcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4obWFyZ2luKVxuXG4gICAgICBjaCA9IGQzLnNlbGVjdChAJCgnLmNvbW1lcmNpYWxHcmVlbmhvdXNlR2FzZXMnKSlcbiAgICAgIGNoLmRhdHVtKHNvcnRlZF9jb21tX3Jlc3VsdHMpXG4gICAgICAgIC5jYWxsKGNvbV9jaGFydClcblxuICAgICAgcmVzX2NoYXJ0ID0gQGRyYXdDaGFydCgnLnJlc2lkZW50aWFsR3JlZW5ob3VzZUdhc2VzJykueHZhcigwKVxuICAgICAgICAgICAgICAgICAgICAgLnl2YXIoMSlcbiAgICAgICAgICAgICAgICAgICAgIC54bGFiKFwiWWVhclwiKVxuICAgICAgICAgICAgICAgICAgICAgLnlsYWIoXCJWYWx1ZVwiKVxuICAgICAgICAgICAgICAgICAgICAgLmhlaWdodChoKVxuICAgICAgICAgICAgICAgICAgICAgLndpZHRoKHcpXG4gICAgICAgICAgICAgICAgICAgICAubWFyZ2luKG1hcmdpbilcblxuICAgICAgY2ggPSBkMy5zZWxlY3QoQCQoJy5yZXNpZGVudGlhbEdyZWVuaG91c2VHYXNlcycpKVxuICAgICAgY2guZGF0dW0oc29ydGVkX3Jlc19yZXN1bHRzKVxuICAgICAgICAuY2FsbChyZXNfY2hhcnQpXG5cbm1vZHVsZS5leHBvcnRzID0gR3JlZW5ob3VzZUdhc2VzVGFiIiwiRW5lcmd5Q29uc3VtcHRpb25UYWIgPSByZXF1aXJlICcuL2VuZXJneUNvbnN1bXB0aW9uLmNvZmZlZSdcbkZ1ZWxDb3N0c1RhYiA9IHJlcXVpcmUgJy4vZnVlbENvc3RzLmNvZmZlZSdcbkdyZWVuaG91c2VHYXNlc1RhYiA9IHJlcXVpcmUgJy4vZ3JlZW5ob3VzZUdhc2VzLmNvZmZlZSdcblxud2luZG93LmFwcC5yZWdpc3RlclJlcG9ydCAocmVwb3J0KSAtPlxuICByZXBvcnQudGFicyBbRW5lcmd5Q29uc3VtcHRpb25UYWIsIEZ1ZWxDb3N0c1RhYiwgR3JlZW5ob3VzZUdhc2VzVGFiXVxuICAjIHBhdGggbXVzdCBiZSByZWxhdGl2ZSB0byBkaXN0L1xuICByZXBvcnQuc3R5bGVzaGVldHMgWycuL3JlcG9ydC5jc3MnXVxuXG5cbiIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuY2xhc3MgUmVwb3J0R3JhcGhUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcblxuICBuYW1lOiAnUmVwb3J0R3JhcGgnXG4gIGNsYXNzTmFtZTogJ1JlcG9ydEdyYXBoJ1xuICB0aW1lb3V0OiAxMjAwMDBcblxuICByZW5kZXJEaWZmczogKHdoaWNoX2Nob3NlbiwgY2UsIHRhYikgLT4gXG5cblxuICAgIG5hbWUgPSBAJCh3aGljaF9jaG9zZW4pLnZhbCgpXG4gICAgQCQoJy5kZWZhdWx0LWNob3Nlbi1zZWxlY3Rpb24nKydfJyt0YWIpLmhpZGUoKVxuXG4gICAgaWYgbmFtZSA9PSBcIk5vIFBBIDI5NVwiXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5ub19wYTI5NScsIGNlLCB0YWIpKS5zaG93KClcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLnBhMjk1JyxjZSx0YWIpKS5oaWRlKClcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLmRibF9wYTI5NScsY2UsdGFiKSkuaGlkZSgpXG4gICAgZWxzZSBpZiBuYW1lID09IFwiUEEgMjk1XCJcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLm5vX3BhMjk1JyxjZSx0YWIpKS5oaWRlKClcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLnBhMjk1JywgY2UsIHRhYikpLnNob3coKVxuICAgICAgQCQoQGdldEVsZW1OYW1lKCcuZGJsX3BhMjk1JyxjZSx0YWIpKS5oaWRlKClcbiAgICBlbHNlXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5ub19wYTI5NScsY2UsdGFiKSkuaGlkZSgpXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5wYTI5NScsY2UsdGFiKSkuaGlkZSgpXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5kYmxfcGEyOTUnLGNlLHRhYikpLnNob3coKVxuXG4gIGdldEVsZW1OYW1lOiAobmFtZSwgY29tbV9vcl9lYywgdGFiKSAtPlxuICAgIHJldHVybiBuYW1lK1wiX1wiK2NvbW1fb3JfZWMrXCJfXCIrdGFiXG5cbiAgZ2V0VXNlclNhdmluZ3M6IChyZWNTZXQsIHVzZXJfc3RhcnRfdmFsdWVzLCBiYXNlX3ZhbHVlcywgZGVjcykgLT5cblxuICAgIHNhdmluZ3MgPSAwXG4gICAgdHJ5XG4gICAgICBmb3IgdmFsLCBkZXggaW4gYmFzZV92YWx1ZXNcbiAgICAgICAgdXNlcl92YWwgPSB1c2VyX3N0YXJ0X3ZhbHVlc1tkZXhdLlZBTFVFXG4gICAgICAgIGJhc2VfdmFsID0gdmFsLlZBTFVFXG4gICAgICAgIHNhdmluZ3MgKz0gKGJhc2VfdmFsIC0gdXNlcl92YWwpXG4gICAgICByZXR1cm4gTWF0aC5yb3VuZChzYXZpbmdzLCBkZWNzKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICByZXR1cm4gMC4wXG5cbiAgZ2V0VXNlck1hcDogKHJlY1NldCwgdXNlcl90YWcsIGJhc2VfdmFsdWVzKSAtPlxuICAgIHVzZXJfc3RhcnRfdmFsdWVzID0gW11cbiAgICBmb3IgcmVjIGluIHJlY1NldFxuICAgICAgaWYgcmVjIGFuZCByZWMuVFlQRSA9PSB1c2VyX3RhZ1xuICAgICAgICB1c2VyX3N0YXJ0X3ZhbHVlcy5wdXNoKHJlYylcbiAgICB1c2VyX3N0YXJ0X3ZhbHVlcyA9IF8uc29ydEJ5IHVzZXJfc3RhcnRfdmFsdWVzLCAocm93KSAtPiByb3dbJ1lFQVInXVxuICAgIHJldHVybiB1c2VyX3N0YXJ0X3ZhbHVlc1xuXG5cbiAgZ2V0TWFwOiAocmVjU2V0LCBzY2VuYXJpbykgLT5cbiAgICBzY2VuYXJpb192YWx1ZXMgPSBbXVxuICAgIGZvciByZWMgaW4gcmVjU2V0XG4gICAgICBpZiByZWMgYW5kIHJlYy5UWVBFID09IHNjZW5hcmlvXG4gICAgICAgIHNjZW5hcmlvX3ZhbHVlcy5wdXNoKHJlYylcblxuICAgIHJldHVybiBfLnNvcnRCeSBzY2VuYXJpb192YWx1ZXMsIChyb3cpIC0+IHJvd1snWUVBUiddXG4gIFxuICBhZGRDb21tYXM6IChudW1fc3RyKSA9PlxuICAgIG51bV9zdHIgKz0gJydcbiAgICB4ID0gbnVtX3N0ci5zcGxpdCgnLicpXG4gICAgeDEgPSB4WzBdXG4gICAgeDIgPSBpZiB4Lmxlbmd0aCA+IDEgdGhlbiAnLicgKyB4WzFdIGVsc2UgJydcbiAgICByZ3ggPSAvKFxcZCspKFxcZHszfSkvXG4gICAgd2hpbGUgcmd4LnRlc3QoeDEpXG4gICAgICB4MSA9IHgxLnJlcGxhY2Uocmd4LCAnJDEnICsgJywnICsgJyQyJylcbiAgICByZXR1cm4geDEgKyB4MlxuXG4gIGRyYXdDaGFydDogKHdoaWNoQ2hhcnQpID0+XG4gICAgdmlldyA9IEBcbiAgICB3aWR0aCA9IDM2MFxuICAgIGhlaWdodCA9IDUwMFxuICAgIG1hcmdpbiA9IHtsZWZ0OjQwLCB0b3A6NSwgcmlnaHQ6MjAsIGJvdHRvbTogNDAsIGlubmVyOjEwfVxuICAgIGF4aXNwb3MgPSB7eHRpdGxlOjUsIHl0aXRsZTozMCwgeGxhYmVsOjUsIHlsYWJlbDoxNX1cbiAgICB4bGltID0gbnVsbFxuICAgIHlsaW0gPSBudWxsXG4gICAgbnh0aWNrcyA9IDVcbiAgICB4dGlja3MgPSBudWxsXG4gICAgbnl0aWNrcyA9IDVcbiAgICB5dGlja3MgPSBudWxsXG5cbiAgICByZWN0Y29sb3IgPSBcIiNkYmU0ZWVcIlxuICAgIHRpY2tjb2xvciA9IFwiI2RiZTRmZlwiXG4gICAgY29uc29sZS5sb2coXCJkcmF3aW5nIGNoYXJ0IG5vdy4uLlwiKVxuXG4gICAgcG9pbnRzaXplID0gMSAjIGRlZmF1bHQgPSBubyB2aXNpYmxlIHBvaW50cyBhdCBtYXJrZXJzXG4gICAgeGxhYiA9IFwiWFwiXG4gICAgeWxhYiA9IFwiWSBzY29yZVwiXG4gICAgeXNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcbiAgICB4c2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXG4gICAgbGVnZW5kaGVpZ2h0ID0gMzAwXG4gICAgcG9pbnRzU2VsZWN0ID0gbnVsbFxuICAgIGxhYmVsc1NlbGVjdCA9IG51bGxcbiAgICBsZWdlbmRTZWxlY3QgPSBudWxsXG4gICAgIyMgdGhlIG1haW4gZnVuY3Rpb25cbiAgICBjaGFydCA9IChzZWxlY3Rpb24pIC0+XG4gICAgICBzZWxlY3Rpb24uZWFjaCAoZGF0YSkgLT5cbiAgICAgICAgeSA9IFtdXG4gICAgICAgIHggPSBbMjAxMiwgMjAxNSwgMjAyMCwgMjAyNSwgMjAzMCwgMjAzNV1cbiAgICAgICBcbiAgICAgICAgZm9yIHNjZW4gaW4gZGF0YVxuICAgICAgICAgIGZvciBkIGluIHNjZW5cbiAgICAgICAgICAgIHkucHVzaChkLlZBTFVFLzEwMDAwMDApXG5cblxuICAgICAgICAjeCA9IGRhdGEubWFwIChkKSAtPiBwYXJzZUZsb2F0KGQuWUVBUilcbiAgICAgICAgI3kgPSBkYXRhLm1hcCAoZCkgLT4gcGFyc2VGbG9hdChkLlZBTFVFKVxuXG5cbiAgICAgICAgcGFuZWxvZmZzZXQgPSAxMFxuICAgICAgICBwYW5lbHdpZHRoID0gd2lkdGhcblxuICAgICAgICBwYW5lbGhlaWdodCA9IGhlaWdodFxuXG4gICAgICAgIHhsaW0gPSBbZDMubWluKHgpLTEsIHBhcnNlRmxvYXQoZDMubWF4KHgpKzEpXSBpZiAhKHhsaW0/KVxuXG4gICAgICAgIHlsaW0gPSBbZDMubWluKHkpLCBwYXJzZUZsb2F0KGQzLm1heCh5KSldIGlmICEoeWxpbT8pXG5cblxuICAgICAgICBjdXJyZWxlbSA9IGQzLnNlbGVjdCh2aWV3LiQod2hpY2hDaGFydClbMF0pXG4gICAgICAgIHN2ZyA9IGQzLnNlbGVjdCh2aWV3LiQod2hpY2hDaGFydClbMF0pLmFwcGVuZChcInN2Z1wiKS5kYXRhKFtkYXRhXSlcbiAgICAgICAgc3ZnLmFwcGVuZChcImdcIilcblxuICAgICAgICAjIFVwZGF0ZSB0aGUgb3V0ZXIgZGltZW5zaW9ucy5cbiAgICAgICAgc3ZnLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCttYXJnaW4ubGVmdCttYXJnaW4ucmlnaHQpXG4gICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCttYXJnaW4udG9wK21hcmdpbi5ib3R0b20rZGF0YS5sZW5ndGgqMzUpXG5cbiAgICAgICAgZyA9IHN2Zy5zZWxlY3QoXCJnXCIpXG5cbiAgICAgICAgIyBib3hcbiAgICAgICAgZy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAuYXR0cihcInhcIiwgcGFuZWxvZmZzZXQrbWFyZ2luLmxlZnQpXG4gICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLnRvcClcbiAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHBhbmVsaGVpZ2h0KVxuICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBwYW5lbHdpZHRoKVxuICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwid2hpdGVcIilcbiAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwibm9uZVwiKVxuXG5cbiAgICAgICAgIyBzaW1wbGUgc2NhbGVzIChpZ25vcmUgTkEgYnVzaW5lc3MpXG4gICAgICAgIHhyYW5nZSA9IFttYXJnaW4ubGVmdCtwYW5lbG9mZnNldCttYXJnaW4uaW5uZXIsIG1hcmdpbi5sZWZ0K3BhbmVsb2Zmc2V0K3BhbmVsd2lkdGgtbWFyZ2luLmlubmVyXVxuICAgICAgICB5cmFuZ2UgPSBbbWFyZ2luLnRvcCtwYW5lbGhlaWdodC1tYXJnaW4uaW5uZXIsIG1hcmdpbi50b3ArbWFyZ2luLmlubmVyXVxuICAgICAgICB4c2NhbGUuZG9tYWluKHhsaW0pLnJhbmdlKHhyYW5nZSlcbiAgICAgICAgeXNjYWxlLmRvbWFpbih5bGltKS5yYW5nZSh5cmFuZ2UpXG4gICAgICAgIHhzID0gZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKHhsaW0pLnJhbmdlKHhyYW5nZSlcbiAgICAgICAgeXMgPSBkMy5zY2FsZS5saW5lYXIoKS5kb21haW4oeWxpbSkucmFuZ2UoeXJhbmdlKVxuXG5cbiAgICAgICAgIyBpZiB5dGlja3Mgbm90IHByb3ZpZGVkLCB1c2Ugbnl0aWNrcyB0byBjaG9vc2UgcHJldHR5IG9uZXNcbiAgICAgICAgeXRpY2tzID0geXMudGlja3Mobnl0aWNrcykgaWYgISh5dGlja3M/KVxuICAgICAgICB4dGlja3MgPSB4cy50aWNrcyhueHRpY2tzKSBpZiAhKHh0aWNrcz8pXG5cbiAgICAgICAgIyB4LWF4aXNcbiAgICAgICAgeGF4aXMgPSBnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwieCBheGlzXCIpXG4gICAgICAgIHhheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoeHRpY2tzKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAuYXR0cihcIngxXCIsIChkKSAtPiB4c2NhbGUoZCkpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCAoZCkgLT4geHNjYWxlKGQpKVxuICAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgbWFyZ2luLnRvcCtoZWlnaHQtNSlcbiAgICAgICAgICAgICAuYXR0cihcInkyXCIsIG1hcmdpbi50b3AraGVpZ2h0KVxuICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpXG4gICAgICAgICAgICAgLnN0eWxlKFwicG9pbnRlci1ldmVudHNcIiwgXCJub25lXCIpXG4gICAgICAgICN0aGUgeCBheGlzIHllYXIgbGFiZWxzXG4gICAgICAgIHhheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoeHRpY2tzKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAuYXR0cihcInhcIiwgKGQpIC0+IHhzY2FsZShkKS0xNClcbiAgICAgICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLnRvcCtoZWlnaHQrYXhpc3Bvcy54bGFiZWwrMTApXG4gICAgICAgICAgICAgLnRleHQoKGQpIC0+IGZvcm1hdEF4aXMoeHRpY2tzKShkKSlcbiAgICAgICAgI3RoZSB4IGF4aXMgdGl0bGVcbiAgICAgICAgeGF4aXMuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ4YXhpcy10aXRsZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBtYXJnaW4ubGVmdCt3aWR0aC8yKVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wK2hlaWdodCtheGlzcG9zLnh0aXRsZSszMClcbiAgICAgICAgICAgICAudGV4dCh4bGFiKVxuXG4gICAgICAgICNkcmF3IHRoZSBsZWdlbmRcbiAgICAgICAgZm9yIHNjZW5hcmlvLCBjbnQgaW4gZGF0YVxuICAgICAgICAgIGxpbmVfY29sb3IgPSBnZXRTdHJva2VDb2xvcihzY2VuYXJpbylcbiAgICAgICAgICB4YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKFtzY2VuYXJpb1swXV0pXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwibGluZVwiKVxuXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCAoZCxpKSAtPiByZXR1cm4gbWFyZ2luLmxlZnQpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCAoZCxpKSAtPiByZXR1cm4gbWFyZ2luLmxlZnQrMTApXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCAoZCxpKSAtPiBtYXJnaW4udG9wK2hlaWdodCtheGlzcG9zLnh0aXRsZSsoKGNudCsxKSozMCkrNilcbiAgICAgICAgICAgICAuYXR0cihcInkyXCIsIChkLGkpIC0+IG1hcmdpbi50b3AraGVpZ2h0K2F4aXNwb3MueHRpdGxlKygoY250KzEpKjMwKSs2KVxuICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJjaGFydC1saW5lXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgKGQsaSkgLT4gbGluZV9jb2xvcilcbiAgICAgICAgICAgICAuYXR0cihcImNvbG9yXCIsIChkLGkpIC0+IGxpbmVfY29sb3IpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMylcblxuICAgICAgICAjYW5kIHRoZSBsZWdlbmQgdGV4dFxuICAgICAgICBmb3Igc2NlbmFyaW8sIGNudCBpbiBkYXRhICAgICAgICAgIFxuICAgICAgICAgIHhheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoW3NjZW5hcmlvWzBdXSlcbiAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxlZ2VuZC10ZXh0XCIpXG4gICAgICAgICAgIC5hdHRyKFwieFwiLCAoZCxpKSAtPlxuICAgICAgICAgICAgICByZXR1cm4gKG1hcmdpbi5sZWZ0KzE3KSlcbiAgICAgICAgICAgLmF0dHIoXCJ5XCIsIChkLGkpIC0+XG4gICAgICAgICAgICAgIG1hcmdpbi50b3AraGVpZ2h0KzEwK2F4aXNwb3MueHRpdGxlKygoY250KzEpKjMwKSlcbiAgICAgICAgICAgLnRleHQoKGQsaSkgLT4gcmV0dXJuIGdldFNjZW5hcmlvTmFtZShbZF0pKVxuXG4gICAgICAgICMgeS1heGlzXG4gICAgICAgIHlheGlzID0gZy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInkgYXhpc1wiKVxuICAgICAgICB5YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKHl0aWNrcylcbiAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgIC5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCAoZCkgLT4geXNjYWxlKGQpKVxuICAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgKGQpIC0+IHlzY2FsZShkKSlcbiAgICAgICAgICAgICAuYXR0cihcIngxXCIsIG1hcmdpbi5sZWZ0KzEwKVxuICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgbWFyZ2luLmxlZnQrMTUpXG4gICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxuICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCB0aWNrY29sb3IpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSlcbiAgICAgICAgICAgICAuc3R5bGUoXCJwb2ludGVyLWV2ZW50c1wiLCBcIm5vbmVcIilcbiAgICAgICAgeWF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YSh5dGlja3MpXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCAoZCkgLT4geXNjYWxlKGQpKzMpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIG1hcmdpbi5sZWZ0KzMtYXhpc3Bvcy55bGFiZWwpXG4gICAgICAgICAgICAgLnRleHQoKGQpIC0+IGZvcm1hdEF4aXMoeXRpY2tzKShkKSlcbiAgICAgICAgeWF4aXMuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ0aXRsZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wKzM1K2hlaWdodC8yKVxuICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBtYXJnaW4ubGVmdCs4LWF4aXNwb3MueXRpdGxlKVxuICAgICAgICAgICAgIC50ZXh0KHlsYWIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoMjcwLCN7bWFyZ2luLmxlZnQrOC1heGlzcG9zLnl0aXRsZX0sI3ttYXJnaW4udG9wKzM1K2hlaWdodC8yfSlcIilcblxuICAgICAgICBwb2ludHMgPSBnLmFwcGVuZChcImdcIikuYXR0cihcImlkXCIsIFwicG9pbnRzXCIpXG5cbiAgICAgICAgZm9yIHNjZW5hcmlvIGluIGRhdGFcbiAgICAgICAgICBsaW5lX2NvbG9yID0gZ2V0U3Ryb2tlQ29sb3Ioc2NlbmFyaW8pXG4gICAgICAgICAgIyMjXG4gICAgICAgICAgcG9pbnRzU2VsZWN0ID1cbiAgICAgICAgICAgIHBvaW50cy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgICAgICAgLmRhdGEoc2NlbmFyaW8pXG4gICAgICAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImNpcmNsZVwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjeFwiLCAoZCxpKSAtPiB4c2NhbGUoZC5ZRUFSKSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY3lcIiwgKGQsaSkgLT4geXNjYWxlKGQuVkFMVUUvMTAwMDAwMCkpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIChkLGkpIC0+IFwicHQje2l9XCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInJcIiwgcG9pbnRzaXplKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIChkLGkpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbCA9IGxpbmVfY29sb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgKGQsIGkpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gTWF0aC5mbG9vcihpLzE3KSAlIDVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2wgPSBsaW5lX2NvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwiMVwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJvcGFjaXR5XCIsIChkLGkpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxIGlmICh4W2ldPyBvciB4TkEuaGFuZGxlKSBhbmQgKHlbaV0/IG9yIHlOQS5oYW5kbGUpXG4gICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwKVxuICAgICAgICAgICMjI1xuICAgICAgICBsaW5lID0gZDMuc3ZnLmxpbmUoZClcbiAgICAgICAgICAgIC5pbnRlcnBvbGF0ZShcImJhc2lzXCIpXG4gICAgICAgICAgICAueCggKGQpIC0+IHhzY2FsZShwYXJzZUludChkLllFQVIpKSlcbiAgICAgICAgICAgIC55KCAoZCkgLT4geXNjYWxlKGQuVkFMVUUvMTAwMDAwMCkpXG5cblxuICAgICAgICBwb2ludHMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZChcInBhdGhcIilcbiAgICAgICAgICAuYXR0cihcImRcIiwgKGQpIC0+IGxpbmUgZClcbiAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCAoZCkgLT4gZ2V0U3Ryb2tlQ29sb3IoZCkpXG4gICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMylcbiAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG5cbiAgICAgICAgIyBib3hcbiAgICAgICAgZy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgICAgICAuYXR0cihcInhcIiwgbWFyZ2luLmxlZnQrcGFuZWxvZmZzZXQpXG4gICAgICAgICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLnRvcClcbiAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHBhbmVsaGVpZ2h0KVxuICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBwYW5lbHdpZHRoKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJibGFja1wiKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgXCJub25lXCIpXG5cblxuXG4gICAgIyMgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzXG5cblxuICAgIGNoYXJ0LndpZHRoID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHdpZHRoIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB3aWR0aCA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQuaGVpZ2h0ID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIGhlaWdodCBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgaGVpZ2h0ID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5tYXJnaW4gPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gbWFyZ2luIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBtYXJnaW4gPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LmF4aXNwb3MgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gYXhpc3BvcyBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgYXhpc3BvcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueGxpbSA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB4bGltIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB4bGltID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5ueHRpY2tzID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIG54dGlja3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIG54dGlja3MgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lnh0aWNrcyA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB4dGlja3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHh0aWNrcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueWxpbSA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB5bGltIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB5bGltID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5ueXRpY2tzID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIG55dGlja3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIG55dGlja3MgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lnl0aWNrcyA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB5dGlja3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHl0aWNrcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQucmVjdGNvbG9yID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHJlY3Rjb2xvciBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgcmVjdGNvbG9yID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5wb2ludGNvbG9yID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHBvaW50Y29sb3IgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHBvaW50Y29sb3IgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnBvaW50c2l6ZSA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBwb2ludHNpemUgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHBvaW50c2l6ZSA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQucG9pbnRzdHJva2UgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gcG9pbnRzdHJva2UgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHBvaW50c3Ryb2tlID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC54bGFiID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHhsYWIgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHhsYWIgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnlsYWIgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geWxhYiBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeWxhYiA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueHZhciA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB4dmFyIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB4dmFyID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC55dmFyID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHl2YXIgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHl2YXIgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnlzY2FsZSA9ICgpIC0+XG4gICAgICByZXR1cm4geXNjYWxlXG5cbiAgICBjaGFydC54c2NhbGUgPSAoKSAtPlxuICAgICAgcmV0dXJuIHhzY2FsZVxuXG4gICAgY2hhcnQucG9pbnRzU2VsZWN0ID0gKCkgLT5cbiAgICAgIHJldHVybiBwb2ludHNTZWxlY3RcblxuICAgIGNoYXJ0LmxhYmVsc1NlbGVjdCA9ICgpIC0+XG4gICAgICByZXR1cm4gbGFiZWxzU2VsZWN0XG5cbiAgICBjaGFydC5sZWdlbmRTZWxlY3QgPSAoKSAtPlxuICAgICAgcmV0dXJuIGxlZ2VuZFNlbGVjdFxuXG4gICAgIyByZXR1cm4gdGhlIGNoYXJ0IGZ1bmN0aW9uXG4gICAgY2hhcnRcblxuICBnZXRTY2VuYXJpb05hbWUgPSAoc2NlbmFyaW8pIC0+XG4gICAgZm9yIGQgaW4gc2NlbmFyaW9cbiAgICAgIGlmIGQgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgcmV0dXJuIFwiVXNlciBTY2VuYXJpbyAod2l0aCBlcnJvcnMpXCJcbiAgICAgIGlmIGQuVFlQRSA9PSBcIlBBXCJcbiAgICAgICAgcmV0dXJuIFwiUEEgMjk1XCJcbiAgICAgIGVsc2UgaWYgZC5UWVBFID09IFwiTm9QQVwiXG4gICAgICAgIHJldHVybiBcIk5vIFBBIDI5NVwiXG4gICAgICBlbHNlIGlmIGQuVFlQRSA9PSBcIkRibFBBXCJcbiAgICAgICAgcmV0dXJuIFwiRG91YmxlIFBBIDI5NVwiXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBcIlVzZXIgU2NlbmFyaW9cIlxuXG4gIGdldFN0cm9rZUNvbG9yID0gKHNjZW5hcmlvKSAtPlxuICAgIHBhY29sb3IgPSBcIiM5YWJhOGNcIlxuICAgIG5vcGFjb2xvciA9IFwiI2U1Y2FjZVwiXG4gICAgZGJscGFjb2xvciA9IFwiI2IzY2ZhN1wiXG4gICAgZm9yIGQgaW4gc2NlbmFyaW9cbiAgICAgIGlmIGQuVFlQRSA9PSBcIlBBXCJcbiAgICAgICAgcmV0dXJuICBwYWNvbG9yXG4gICAgICBlbHNlIGlmIGQuVFlQRSA9PSBcIk5vUEFcIlxuICAgICAgICByZXR1cm4gbm9wYWNvbG9yXG4gICAgICBlbHNlIGlmIGQuVFlQRSA9PSBcIkRibFBBXCJcbiAgICAgICAgcmV0dXJuIGRibHBhY29sb3JcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIFwiZ3JheVwiXG5cblxuICAjIGZ1bmN0aW9uIHRvIGRldGVybWluZSByb3VuZGluZyBvZiBheGlzIGxhYmVsc1xuICBmb3JtYXRBeGlzID0gKGQpIC0+XG4gICAgZCA9IGRbMV0gLSBkWzBdXG4gICAgbmRpZyA9IE1hdGguZmxvb3IoIE1hdGgubG9nKGQgJSAxMCkgLyBNYXRoLmxvZygxMCkgKVxuICAgIG5kaWcgPSAwIGlmIG5kaWcgPiAwXG4gICAgbmRpZyA9IE1hdGguYWJzKG5kaWcpXG4gICAgZDMuZm9ybWF0KFwiLiN7bmRpZ31mXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0R3JhcGhUYWIiLCJ0aGlzW1wiVGVtcGxhdGVzXCJdID0gdGhpc1tcIlRlbXBsYXRlc1wiXSB8fCB7fTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJlbmVyZ3lDb25zdW1wdGlvblwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0SW4gT2N0b2JlciAyMDA4LCBNaWNoaWdhbiBlbmFjdGVkIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmxlZ2lzbGF0dXJlLm1pLmdvdi8oUyhxNGViNGp6aXIyZzNoYXpoemhsMXRkNDUpKS9taWxlZy5hc3B4P3BhZ2U9Z2V0b2JqZWN0Jm9iamVjdE5hbWU9bWNsLWFjdC0yOTUtb2YtMjAwOFxcXCI+Q2xlYW4sIFJlbmV3YWJsZSwgYW5kIEVmZmljaWVudCBFbmVyZ3kgQWN0LCBQdWJsaWMgQWN0IDI5NTwvYT4gPHN0cm9uZz4oUEEgMjk1KTwvc3Ryb25nPiBBIGRlc2NyaXB0aW9uIG9mIGVhY2ggc2NlbmFyaW8gaXMgcHJvdmlkZWQgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZS4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+Q29tbWVyY2lhbCBFbmVyZ3kgQ29uc3VtcHRpb24gLS0gTU1CVFUgRXF1aXZhbGVudDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJjaG9vc2VyLWRpdlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInNlbC1sYWJlbFxcXCI+Q29tcGFyZSB5b3VyIHBsYW4gdG8gc2NlbmFyaW86PC9kaXY+PHNlbGVjdCBjbGFzcz1cXFwiY29tbS1jaG9zZW4tZWNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCw2NTYsNzA4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIlwiKTtfLmIoXy52KF8uZChcIi5cIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZChcIi5cIixjLHAsMCkpKTtfLmIoXCI8L29wdGlvbj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwicGEyOTVfY29tbV9lY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMCw4NTQsODU4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTQVZFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO18uYihfLnYoXy5mKFwiY29tbV9wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG1vcmUgTU1CVFUgZXF1aXZhbGVudCBlbmVyZ3kgdGhhbiB0aGUgPHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcIm5vX3BhMjk1X2NvbW1fZWNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvICA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwwLDExOTYsMTIwMCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiU0FWRVwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlVTRVwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtfLmIoXy52KF8uZihcImNvbW1fbm9fcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBtb3JlIE1NQlRVIGVxdWl2YWxlbnQgZW5lcmd5IHRoYW4gdGhlIDxzdHJvbmc+Tm8gUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfY29tbV9lY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDAsMTU1NCwxNTU4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTQVZFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlVTRVwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtfLmIoXy52KF8uZihcImNvbW1fZGJsX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gbW9yZSBNTUJUVSBlcXVpdmFsZW50IGVuZXJneSB0aGFuIHRoZSA8c3Ryb25nPkRvdWJsZSBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgIGlkPVxcXCJjb21tZXJjaWFsRW5lcmd5Q29uc3VtcHRpb25cXFwiIGNsYXNzPVxcXCJjb21tZXJjaWFsRW5lcmd5Q29uc3VtcHRpb25cXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVzaWRlbnRpYWwgRW5lcmd5IENvbnN1bXB0aW9uIC0tIE1NQlRVIEVxdWl2YWxlbnQ8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJjaG9vc2VyLWRpdlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwic2VsLWxhYmVsXFxcIj5Db21wYXJlIHlvdXIgcGxhbiB0byBzY2VuYXJpbzo8L2Rpdj48c2VsZWN0IGNsYXNzPVxcXCJyZXMtY2hvc2VuLWVjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCwyMjI3LDIyODMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiPC9vcHRpb24+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJwYTI5NV9yZXNfZWNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIDxzdHJvbmc+XCIpO2lmKF8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDAsMjQyOCwyNDMyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTQVZFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJVU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKF8udihfLmYoXCJyZXNfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBtb3JlIE1NQlRVIGVxdWl2YWxlbnQgZW5lcmd5IHRoYW4gdGhlIDxzdHJvbmc+UEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSByZXNpZGVudGlhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibm9fcGEyOTVfcmVzX2VjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byAgPHN0cm9uZz5cIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMCwyNzYyLDI3NjYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNBVkVcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlVTRVwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtfLmIoXy52KF8uZihcInJlc19ub19wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG1vcmUgTU1CVFUgZXF1aXZhbGVudCBlbmVyZ3kgdGhhbiB0aGUgPHN0cm9uZz5ObyBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfcmVzX2VjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byA8c3Ryb25nPlwiKTtpZihfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMCwzMTEyLDMxMTYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNBVkVcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJVU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKF8udihfLmYoXCJyZXNfZGJsX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gbW9yZSBNTUJUVSBlcXVpdmFsZW50IGVuZXJneSB0aGFuIHRoZSA8c3Ryb25nPkRvdWJsZSBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiAgaWQ9XFxcInJlc2lkZW50aWFsRW5lcmd5Q29uc3VtcHRpb25cXFwiIGNsYXNzPVxcXCJyZXNpZGVudGlhbEVuZXJneUNvbnN1bXB0aW9uXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8cD5UaGUgcmVwb3J0cyBzaG93IGVuZXJneSBjb25zdW1wdGlvbiBpbiB0aGUgZm9sbG93aW5nIHNjZW5hcmlvczpcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPk5PIFBBIDI5NTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgaGF2aW5nIG5vIEVuZXJneSBFZmZpY2llbmN5IFJlc291cmNlIGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGNvbnRpbnVlcyB0byBpbmNyZWFzZSB3aXRoIHBvcHVsYXRpb24gYW5kIGVtcGxveW1lbnRcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiAtIE1pY2hpZ2FuJ3MgY3VycmVudCBFbmVyZ3kgRWZmaWNpZW5jeSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDElIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgIGNvbnN1bXB0aW9uLCBhbmQgMTAlIG9mIGVsZWN0cmljaXR5IGRlbWFuZCBjb21lcyBmcm9tIHJlbmV3YWJsZSBlbmVyZ3kgc291cmNlc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+UEEgMjk1IERvdWJsZTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgZG91YmxpbmcgTWljaGlnYW4ncyBFbmVyZ3kgRWZmaWNpZW5jeSBSZXNvdXJjZSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDIlIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgY29uc3VtcHRpb24sIGFuZCAyMCUgb2YgZWxlY3RyaWNpdHkgZGVtYW5kIGNvbWVzIGZyb20gcmVuZXdhYmxlIGVuZXJneSBzb3VyY2VzLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZnVlbENvc3RzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiSW4gT2N0b2JlciAyMDA4LCBNaWNoaWdhbiBlbmFjdGVkIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmxlZ2lzbGF0dXJlLm1pLmdvdi8oUyhxNGViNGp6aXIyZzNoYXpoemhsMXRkNDUpKS9taWxlZy5hc3B4P3BhZ2U9Z2V0b2JqZWN0Jm9iamVjdE5hbWU9bWNsLWFjdC0yOTUtb2YtMjAwOFxcXCI+Q2xlYW4sIFJlbmV3YWJsZSwgYW5kIEVmZmljaWVudCBFbmVyZ3kgQWN0LCBQdWJsaWMgQWN0IDI5NTwvYT4gPHN0cm9uZz4oUEEgMjk1KTwvc3Ryb25nPi4gQSBkZXNjcmlwdGlvbiBvZiBlYWNoIHNjZW5hcmlvIGlzIHByb3ZpZGVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHBhZ2UuIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5Db21tZXJjaWFsIEZ1ZWwgQ29zdHMgLS0gMjAxMiBEb2xsYXJzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiY2hvb3Nlci1kaXZcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInNlbC1sYWJlbFxcXCI+Q29tcGFyZSB5b3VyIHBsYW4gdG8gc2NlbmFyaW86PC9kaXY+PHNlbGVjdCBjbGFzcz1cXFwiY29tbS1jaG9zZW4tZmNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPG9wdGlvbiBjbGFzcz1cXFwiZGVmYXVsdC1jaG9zZW4tc2VsZWN0aW9uXFxcIiBsYWJlbD1cXFwiUEEgMjk1XFxcIj48L29wdGlvbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2NlbmFyaW9zXCIsYyxwLDEpLGMscCwwLDY1MSw3MDcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiPC9vcHRpb24+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwicGEyOTVfY29tbV9mY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gaGF2ZSBmdWVsIGNvc3RzIHRoYXQgYXJlIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAkXCIpO18uYihfLnYoXy5mKFwiY29tbV9wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMCw5MDQsOTA5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJMT1dFUlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIkhJR0hFUlwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPiB0aGFuIHRoZSA8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgY29tbWVyY2lhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibm9fcGEyOTVfY29tbV9mY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gaGF2ZSBmdWVsIGNvc3RzIHRoYXQgYXJlPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICRcIik7Xy5iKF8udihfLmYoXCJjb21tX25vX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwwLDEyNTEsMTI1NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTE9XRVJcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJISUdIRVJcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz4gIHRoYW4gdGhlIDxzdHJvbmc+Tm8gUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfY29tbV9mY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gaGF2ZSBmdWVsIGNvc3RzIHRoYXQgYXJlIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAkXCIpO18uYihfLnYoXy5mKFwiY29tbV9kYmxfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XCIsYyxwLDEpLGMscCwwLDE2MTUsMTYyMCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTE9XRVJcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSElHSEVSXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+dGhhbiB0aGUgPHN0cm9uZz5Eb3VibGUgUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2ICBpZD1cXFwiY29tbWVyY2lhbEZ1ZWxDb3N0c1xcXCIgY2xhc3M9XFxcImNvbW1lcmNpYWxGdWVsQ29zdHNcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVzaWRlbnRpYWwgRnVlbCBDb3N0cyAtLSAyMDEyIERvbGxhcnM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwiY2hvb3Nlci1kaXZcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJzZWwtbGFiZWxcXFwiPkNvbXBhcmUgeW91ciBwbGFuIHRvIHNjZW5hcmlvOjwvZGl2PjxzZWxlY3QgY2xhc3M9XFxcInJlcy1jaG9zZW4tZmNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCwyMjAzLDIyNTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIDwvc2VsZWN0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwicGEyOTVfcmVzX2ZjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byBoYXZlIGZ1ZWwgY29zdHMgdGhhdCBhcmUgPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICRcIik7Xy5iKF8udihfLmYoXCJyZXNfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMCwyNDQ1LDI0NTAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkxPV0VSXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJISUdIRVJcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz4gdGhhbiB0aGUgPHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJub19wYTI5NV9yZXNfZmNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIGhhdmUgZnVlbCBjb3N0cyB0aGF0IGFyZTxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAkXCIpO18uYihfLnYoXy5mKFwicmVzX25vX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDAsMjc4NywyNzkyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJMT1dFUlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSElHSEVSXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+ICB0aGFuIHRoZSA8c3Ryb25nPk5vIFBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgcmVzaWRlbnRpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcImRibF9wYTI5NV9yZXNfZmNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIGhhdmUgZnVlbCBjb3N0cyB0aGF0IGFyZSA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgJFwiKTtfLmIoXy52KF8uZihcInJlc19kYmxfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDAsMzE0NiwzMTUxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJMT1dFUlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIkhJR0hFUlwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPnRoYW4gdGhlIDxzdHJvbmc+RG91YmxlIFBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgcmVzaWRlbnRpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgIGlkPVxcXCJyZXNpZGVudGlhbEZ1ZWxDb3N0c1xcXCIgY2xhc3M9XFxcInJlc2lkZW50aWFsRnVlbENvc3RzXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8cD5UaGUgcmVwb3J0cyBzaG93IGZ1ZWwgY29zdHMgaW4gdGhlIGZvbGxvd2luZyBzY2VuYXJpb3M6XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5OTyBQQSAyOTU8L3N0cm9uZz4gLSBUaGUgcmVzdWx0IG9mIGhhdmluZyBubyBFbmVyZ3kgRWZmaWNpZW5jeSBSZXNvdXJjZSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBjb250aW51ZXMgdG8gaW5jcmVhc2Ugd2l0aCBwb3B1bGF0aW9uIGFuZCBlbXBsb3ltZW50XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gLSBNaWNoaWdhbidzIGN1cnJlbnQgRW5lcmd5IEVmZmljaWVuY3kgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gaXMgcmVkdWNlZCwgZWFjaCB5ZWFyLCBieSAxJSBvZiB0aGUgcHJldmlvdXMgeWVhcidzIHRvdGFsICBjb25zdW1wdGlvbiwgYW5kIDEwJSBvZiBlbGVjdHJpY2l0eSBkZW1hbmQgY29tZXMgZnJvbSByZW5ld2FibGUgZW5lcmd5IHNvdXJjZXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPlBBIDI5NSBEb3VibGU8L3N0cm9uZz4gLSBUaGUgcmVzdWx0IG9mIGRvdWJsaW5nIE1pY2hpZ2FuJ3MgRW5lcmd5IEVmZmljaWVuY3kgUmVzb3VyY2UgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gaXMgcmVkdWNlZCwgZWFjaCB5ZWFyLCBieSAyJSBvZiB0aGUgcHJldmlvdXMgeWVhcidzIHRvdGFsIGNvbnN1bXB0aW9uLCBhbmQgMjAlIG9mIGVsZWN0cmljaXR5IGRlbWFuZCBjb21lcyBmcm9tIHJlbmV3YWJsZSBlbmVyZ3kgc291cmNlcy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L3A+XCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImdyZWVuaG91c2VHYXNlc1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJJbiBPY3RvYmVyIDIwMDgsIE1pY2hpZ2FuIGVuYWN0ZWQgdGhlIDxhIGhyZWY9XFxcImh0dHA6Ly93d3cubGVnaXNsYXR1cmUubWkuZ292LyhTKHE0ZWI0anppcjJnM2hhemh6aGwxdGQ0NSkpL21pbGVnLmFzcHg/cGFnZT1nZXRvYmplY3Qmb2JqZWN0TmFtZT1tY2wtYWN0LTI5NS1vZi0yMDA4XFxcIj5DbGVhbiwgUmVuZXdhYmxlLCBhbmQgRWZmaWNpZW50IEVuZXJneSBBY3QsIFB1YmxpYyBBY3QgMjk1PC9hPiA8c3Ryb25nPihQQSAyOTUpPC9zdHJvbmc+LiBBIGRlc2NyaXB0aW9uIG9mIGVhY2ggc2NlbmFyaW8gaXMgcHJvdmlkZWQgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZS4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkNvbW1lcmNpYWwgR0hHJ3MgLS0gQ088c3ViPjI8L3N1Yj4tZSBFcXVpdmFsZW50PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiY2hvb3Nlci1kaXZcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInNlbC1sYWJlbFxcXCI+Q29tcGFyZSB5b3VyIHBsYW4gdG8gc2NlbmFyaW86PC9kaXY+PHNlbGVjdCBjbGFzcz1cXFwiY29tbS1jaG9zZW4tZ2hnXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCw2NjEsNzE3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgPC9zZWxlY3Q+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcInBhMjk1X2NvbW1fZ2hnXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0bzxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDAsODY2LDg3MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiUkVEVUNFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSU5DUkVBU0UgXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+IEdIR3MgYnkgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb21tX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gQ08yLWUgY29tcGFyZWQgdG8gdGhlIDxzdHJvbmc+UEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJub19wYTI5NV9jb21tX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwwLDEyMjksMTIzNSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiUkVEVUNFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSU5DUkVBU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz4gR0hHcyBieSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvbW1fbm9fcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBDTzItZSBjb21wYXJlZCB0byB0aGUgPHN0cm9uZz5ObyBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcImRibF9wYTI5NV9jb21tX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDAsMTYwOSwxNjE1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJSRURVQ0VcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSU5DUkVBU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz5HSEdzIGJ5IDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwiY29tbV9kYmxfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBDTzItZSBjb21wYXJlZCB0byB0aGUgPHN0cm9uZz5Eb3VibGUgUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiAgaWQ9XFxcImNvbW1lcmNpYWxHcmVlbmhvdXNlR2FzZXNcXFwiIGNsYXNzPVxcXCJjb21tZXJjaWFsR3JlZW5ob3VzZUdhc2VzXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlJlc2lkZW50aWFsIEdIRydzIC0tIENPPHN1Yj4yPC9zdWI+LWUgRXF1aXZhbGVudDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImNob29zZXItZGl2XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJzZWwtbGFiZWxcXFwiPkNvbXBhcmUgeW91ciBwbGFuIHRvIHNjZW5hcmlvOjwvZGl2PjxzZWxlY3QgY2xhc3M9XFxcInJlcy1jaG9zZW4tZ2hnXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCwyMjkyLDIzNDgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiPC9vcHRpb24+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwicGEyOTVfcmVzX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG88c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMCwyNDk4LDI1MDQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlJFRFVDRVwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSU5DUkVBU0UgXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+IEdIR3MgYnkgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJyZXNfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBDTzItZSBjb21wYXJlZCB0byB0aGUgPHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJub19wYTI5NV9yZXNfZ2hnXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDAsMjg1MywyODU5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJSRURVQ0VcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIklOQ1JFQVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+IEdIR3MgYnkgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJyZXNfbm9fcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBDTzItZSBjb21wYXJlZCB0byB0aGUgPHN0cm9uZz5ObyBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfcmVzX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMCwzMjI4LDMyMzQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlJFRFVDRVwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIklOQ1JFQVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+R0hHcyBieSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInJlc19kYmxfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBDTzItZSBjb21wYXJlZCB0byB0aGUgPHN0cm9uZz5Eb3VibGUgUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSByZXNpZGVudGlhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBpZD1cXFwicmVzaWRlbnRpYWxHcmVlbmhvdXNlR2FzZXNcXFwiIGNsYXNzPVxcXCJyZXNpZGVudGlhbEdyZWVuaG91c2VHYXNlc1xcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPHA+VGhlIHJlcG9ydHMgc2hvdyBncmVlbmhvdXNlIGdhcyBlbWlzc2lvbnMgaW4gdGhlIGZvbGxvd2luZyBzY2VuYXJpb3M6XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5OTyBQQSAyOTU8L3N0cm9uZz4gLSBUaGUgcmVzdWx0IG9mIGhhdmluZyBubyBFbmVyZ3kgRWZmaWNpZW5jeSBSZXNvdXJjZSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBjb250aW51ZXMgdG8gaW5jcmVhc2Ugd2l0aCBwb3B1bGF0aW9uIGFuZCBlbXBsb3ltZW50XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gLSBNaWNoaWdhbidzIGN1cnJlbnQgRW5lcmd5IEVmZmljaWVuY3kgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gaXMgcmVkdWNlZCwgZWFjaCB5ZWFyLCBieSAxJSBvZiB0aGUgcHJldmlvdXMgeWVhcidzIHRvdGFsICBjb25zdW1wdGlvbiwgYW5kIDEwJSBvZiBlbGVjdHJpY2l0eSBkZW1hbmQgY29tZXMgZnJvbSByZW5ld2FibGUgZW5lcmd5IHNvdXJjZXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPlBBIDI5NSBEb3VibGU8L3N0cm9uZz4gLSBUaGUgcmVzdWx0IG9mIGRvdWJsaW5nIE1pY2hpZ2FuJ3MgRW5lcmd5IEVmZmljaWVuY3kgUmVzb3VyY2UgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gaXMgcmVkdWNlZCwgZWFjaCB5ZWFyLCBieSAyJSBvZiB0aGUgcHJldmlvdXMgeWVhcidzIHRvdGFsIGNvbnN1bXB0aW9uLCBhbmQgMjAlIG9mIGVsZWN0cmljaXR5IGRlbWFuZCBjb21lcyBmcm9tIHJlbmV3YWJsZSBlbmVyZ3kgc291cmNlcy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L3A+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcblxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHRoaXNbXCJUZW1wbGF0ZXNcIl07XG59Il19
