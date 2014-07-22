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


},{"../templates/templates.js":"CNqB+b","./enableLayerTogglers.coffee":2,"./jobItem.coffee":3,"./reportResults.coffee":4,"./utils.coffee":"+VosKh","views/collectionView":1}],"reportTab":[function(require,module,exports){
module.exports=require('a21iR2');
},{}],"api/utils":[function(require,module,exports){
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


},{}],"api/templates":[function(require,module,exports){
module.exports=require('CNqB+b');
},{}],"CNqB+b":[function(require,module,exports){
this["Templates"] = this["Templates"] || {};
this["Templates"]["node_modules/seasketch-reporting-api/attributes/attributeItem"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<tr data-attribute-id=\"");_.b(_.v(_.f("id",c,p,0)));_.b("\" data-attribute-exportid=\"");_.b(_.v(_.f("exportid",c,p,0)));_.b("\" data-attribute-type=\"");_.b(_.v(_.f("type",c,p,0)));_.b("\">");_.b("\n" + i);_.b("  <td class=\"name\">");_.b(_.v(_.f("name",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("  <td class=\"value\">");_.b(_.v(_.f("formattedValue",c,p,0)));_.b("</td>");_.b("\n" + i);_.b("</tr>");_.b("\n");return _.fl();;});
this["Templates"]["node_modules/seasketch-reporting-api/attributes/attributesTable"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<table class=\"attributes\">");_.b("\n" + i);if(_.s(_.f("attributes",c,p,1),c,p,0,44,81,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(_.rp("attributes/attributeItem",c,p,"    "));});c.pop();}_.b("</table>");_.b("\n");return _.fl();;});
this["Templates"]["node_modules/seasketch-reporting-api/genericAttributes"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");if(_.s(_.d("sketchClass.deleted",c,p,1),c,p,0,24,270,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("<div class=\"alert alert-warn\" style=\"margin-bottom:10px;\">");_.b("\n" + i);_.b("  This sketch was created using the \"");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b("\" template, which is");_.b("\n" + i);_.b("  no longer available. You will not be able to copy this sketch or make new");_.b("\n" + i);_.b("  sketches of this type.");_.b("\n" + i);_.b("</div>");_.b("\n");});c.pop();}_.b("<div class=\"reportSection\">");_.b("\n" + i);_.b("  <h4>");_.b(_.v(_.d("sketchClass.name",c,p,0)));_.b(" Attributes</h4>");_.b("\n" + i);_.b(_.rp("attributes/attributesTable",c,p,"    "));_.b("  </table>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});
this["Templates"]["node_modules/seasketch-reporting-api/reportLoading"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"reportLoading\">");_.b("\n" + i);_.b("  <!-- <div class=\"spinner\">3</div> -->");_.b("\n" + i);_.b("  <h4>Requesting Report from Server</h4>");_.b("\n" + i);_.b("  <div class=\"progress progress-striped active\">");_.b("\n" + i);_.b("    <div class=\"bar\" style=\"width: 100%;\"></div>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <a href=\"#\" rel=\"details\">details</a>");_.b("\n" + i);_.b("    <div class=\"details\">");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}],11:[function(require,module,exports){
var EnergyConsumptionTab, ReportTab, key, partials, templates, val, _partials, _ref,
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

EnergyConsumptionTab = (function(_super) {
  var formatAxis, getScenarioName, getStrokeColor;

  __extends(EnergyConsumptionTab, _super);

  function EnergyConsumptionTab() {
    this.drawChart = __bind(this.drawChart, this);
    _ref = EnergyConsumptionTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  EnergyConsumptionTab.prototype.name = 'Energy Consumption';

  EnergyConsumptionTab.prototype.className = 'EnergyConsumption';

  EnergyConsumptionTab.prototype.timeout = 120000;

  EnergyConsumptionTab.prototype.template = templates.energyConsumption;

  EnergyConsumptionTab.prototype.dependencies = ['EnergyPlan'];

  EnergyConsumptionTab.prototype.render = function() {
    var attributes, ch, comEC, com_chart, com_dblpa, com_nopa, com_pa, com_user, context, d3IsPresent, e, h, halfh, halfw, margin, outmsg, resEC, res_chart, res_dblpa, res_nopa, res_pa, res_user, sorted_comm_results, sorted_res_results, totalh, totalw, w;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    attributes = this.model.getAttributes();
    outmsg = this.recordSet("EnergyPlan", "ResultMsg");
    try {
      comEC = this.recordSet("EnergyPlan", "ComEU").toArray();
      com_pa = this.getMap(comEC, "PA");
      com_dblpa = this.getMap(comEC, "DblPA");
      com_nopa = this.getMap(comEC, "NoPA");
      com_user = this.getMap(comEC, "USER");
      console.log("user values are ......... ", com_user);
      sorted_comm_results = [com_nopa, com_pa, com_dblpa];
      resEC = this.recordSet("EnergyPlan", "ResEU").toArray();
      res_pa = this.getMap(resEC, "PA");
      res_dblpa = this.getMap(resEC, "DblPA");
      res_nopa = this.getMap(resEC, "NoPA");
      res_user = this.getMap(resEC, "USER");
      console.log("user values are ......... ", res_user);
      sorted_res_results = [res_nopa, res_pa, res_dblpa];
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
      d3IsPresent: d3IsPresent
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
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
    }
  };

  EnergyConsumptionTab.prototype.getMap = function(recSet, scenario) {
    var rec, scenario_values, _i, _len;
    scenario_values = [];
    for (_i = 0, _len = recSet.length; _i < _len; _i++) {
      rec = recSet[_i];
      if (rec.TYPE === scenario) {
        scenario_values.push(rec);
      }
    }
    return _.sortBy(scenario_values, function(row) {
      return row['YEAR'];
    });
  };

  EnergyConsumptionTab.prototype.drawChart = function(whichChart) {
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

  return EnergyConsumptionTab;

})(ReportTab);

module.exports = EnergyConsumptionTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":15,"reportTab":"a21iR2"}],12:[function(require,module,exports){
var FuelCostsTab, ReportTab, key, partials, templates, val, _partials, _ref,
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

FuelCostsTab = (function(_super) {
  var formatAxis, getScenarioName, getStrokeColor;

  __extends(FuelCostsTab, _super);

  function FuelCostsTab() {
    this.drawChart = __bind(this.drawChart, this);
    _ref = FuelCostsTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FuelCostsTab.prototype.name = 'Fuel Costs';

  FuelCostsTab.prototype.className = 'fuelCosts';

  FuelCostsTab.prototype.timeout = 120000;

  FuelCostsTab.prototype.template = templates.fuelCosts;

  FuelCostsTab.prototype.dependencies = ['EnergyPlan'];

  FuelCostsTab.prototype.render = function() {
    var attributes, ch, comFC, com_chart, com_dblpa, com_nopa, com_pa, com_user, context, d3IsPresent, e, h, halfh, halfw, margin, resFC, res_chart, res_dblpa, res_nopa, res_pa, res_user, sorted_comm_results, sorted_res_results, totalh, totalw, w;
    if (window.d3) {
      d3IsPresent = true;
    } else {
      d3IsPresent = false;
    }
    attributes = this.model.getAttributes();
    try {
      comFC = this.getMap(this.recordSet("EnergyPlan", "ComEC").toArray());
      resFC = this.getMap(this.recordSet("EnergyPlan", "ResEC").toArray());
      comFC = this.recordSet("EnergyPlan", "ComEC").toArray();
      com_pa = this.getMap(comFC, "PA");
      com_dblpa = this.getMap(comFC, "DblPA");
      com_nopa = this.getMap(comFC, "NoPA");
      com_user = this.getMap(comFC, "USER");
      sorted_comm_results = [com_nopa, com_pa, com_dblpa];
      resFC = this.recordSet("EnergyPlan", "ResEU").toArray();
      res_pa = this.getMap(resFC, "PA");
      res_dblpa = this.getMap(resFC, "DblPA");
      res_nopa = this.getMap(resFC, "NoPA");
      res_user = this.getMap(resFC, "USER");
      sorted_res_results = [res_nopa, res_pa, res_dblpa];
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
      d3IsPresent: d3IsPresent
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
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

  FuelCostsTab.prototype.getMap = function(recSet, scenario) {
    var rec, scenario_values, _i, _len;
    scenario_values = [];
    for (_i = 0, _len = recSet.length; _i < _len; _i++) {
      rec = recSet[_i];
      if (rec.TYPE === scenario) {
        scenario_values.push(rec);
      }
    }
    return _.sortBy(scenario_values, function(row) {
      return row['YEAR'];
    });
  };

  FuelCostsTab.prototype.drawChart = function(whichChart) {
    var axispos, chart, height, labelsSelect, legendSelect, legendheight, margin, nxticks, nyticks, pointsSelect, pointsize, rectcolor, tickcolor, view, width, xlab, xlim, xscale, xticks, yaxis_scaler, ylab, ylim, yscale, yticks;
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
    yaxis_scaler = 1000000;
    rectcolor = "#dbe4ee";
    tickcolor = "#dbe4ff";
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
        var cnt, currelem, d, g, line, line_color, panelheight, paneloffset, panelwidth, points, scen, scenario, svg, x, xaxis, xrange, xs, y, yaxis, yrange, ys, _i, _j, _k, _l, _len, _len1, _len2, _len3;
        y = [];
        x = [2012, 2015, 2020, 2025, 2030, 2035];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          scen = data[_i];
          for (_j = 0, _len1 = scen.length; _j < _len1; _j++) {
            d = scen[_j];
            y.push(d.VALUE / yaxis_scaler);
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
        line = d3.svg.line(d).interpolate("basis").x(function(d) {
          return xscale(parseInt(d.YEAR));
        }).y(function(d) {
          return yscale(d.VALUE / yaxis_scaler);
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

  return FuelCostsTab;

})(ReportTab);

module.exports = FuelCostsTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":15,"reportTab":"a21iR2"}],13:[function(require,module,exports){
var GreenhouseGasesTab, ReportTab, key, partials, templates, val, _partials, _ref,
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

GreenhouseGasesTab = (function(_super) {
  var formatAxis, getScenarioName, getStrokeColor;

  __extends(GreenhouseGasesTab, _super);

  function GreenhouseGasesTab() {
    this.drawChart = __bind(this.drawChart, this);
    _ref = GreenhouseGasesTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  GreenhouseGasesTab.prototype.name = 'Greenhouse Gases';

  GreenhouseGasesTab.prototype.className = 'greenhouseGases';

  GreenhouseGasesTab.prototype.timeout = 120000;

  GreenhouseGasesTab.prototype.template = templates.greenhouseGases;

  GreenhouseGasesTab.prototype.dependencies = ['EnergyPlan'];

  GreenhouseGasesTab.prototype.render = function() {
    var attributes, ch, comGHG, com_chart, com_dblpa, com_nopa, com_pa, com_user, context, d3IsPresent, e, h, halfh, halfw, margin, resGHG, res_chart, res_dblpa, res_nopa, res_pa, res_user, sorted_comm_results, sorted_res_results, totalh, totalw, w;
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
      com_user = this.getMap(comGHG, "USER");
      sorted_comm_results = [com_nopa, com_pa, com_dblpa];
      res_pa = this.getMap(resGHG, "PA");
      res_dblpa = this.getMap(resGHG, "DblPA");
      res_nopa = this.getMap(resGHG, "NoPA");
      res_user = this.getMap(resGHG, "USER");
      sorted_res_results = [res_nopa, res_pa, res_dblpa];
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
      d3IsPresent: d3IsPresent
    };
    this.$el.html(this.template.render(context, partials));
    this.enableLayerTogglers();
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

  GreenhouseGasesTab.prototype.getMap = function(recSet, scenario) {
    var rec, scenario_values, _i, _len;
    scenario_values = [];
    for (_i = 0, _len = recSet.length; _i < _len; _i++) {
      rec = recSet[_i];
      if (rec.TYPE === scenario) {
        scenario_values.push(rec);
      }
    }
    return _.sortBy(scenario_values, function(row) {
      return row['YEAR'];
    });
  };

  GreenhouseGasesTab.prototype.drawChart = function(whichChart) {
    var axispos, chart, height, labelsSelect, legendSelect, legendheight, margin, nxticks, nyticks, pointsSelect, pointsize, rectcolor, tickcolor, view, width, xlab, xlim, xscale, xticks, yaxis_scaler, ylab, ylim, yscale, yticks;
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
    yaxis_scaler = 100000;
    rectcolor = "#dbe4ee";
    tickcolor = "#dbe4ff";
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
        var cnt, currelem, d, g, line, line_color, panelheight, paneloffset, panelwidth, points, scen, scenario, svg, x, xaxis, xrange, xs, y, yaxis, yrange, ys, _i, _j, _k, _l, _len, _len1, _len2, _len3;
        y = [];
        x = [2012, 2015, 2020, 2025, 2030, 2035];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          scen = data[_i];
          for (_j = 0, _len1 = scen.length; _j < _len1; _j++) {
            d = scen[_j];
            y.push(d.VALUE / yaxis_scaler);
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
        line = d3.svg.line(d).interpolate("basis").x(function(d) {
          return xscale(parseInt(d.YEAR));
        }).y(function(d) {
          return yscale(d.VALUE / yaxis_scaler);
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

  return GreenhouseGasesTab;

})(ReportTab);

module.exports = GreenhouseGasesTab;


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":15,"reportTab":"a21iR2"}],14:[function(require,module,exports){
var EnergyConsumptionTab, FuelCostsTab, GreenhouseGasesTab;

EnergyConsumptionTab = require('./energyConsumption.coffee');

FuelCostsTab = require('./fuelCosts.coffee');

GreenhouseGasesTab = require('./greenhouseGases.coffee');

window.app.registerReport(function(report) {
  report.tabs([EnergyConsumptionTab, FuelCostsTab, GreenhouseGasesTab]);
  return report.stylesheets(['./report.css']);
});


},{"./energyConsumption.coffee":11,"./fuelCosts.coffee":12,"./greenhouseGases.coffee":13}],15:[function(require,module,exports){
this["Templates"] = this["Templates"] || {};
this["Templates"]["energyConsumption"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("\n" + i);_.b("<p>");_.b("\n" + i);_.b("	In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong> A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial Energy Consumption -- MMBTU Equivalent</h4>");_.b("\n" + i);_.b("  <p class=\"small ttip-tip\">");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"commercialEnergyConsumption\" class=\"commercialEnergyConsumption\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential Energy Consumption -- MMBTU Equivalent</h4>");_.b("\n" + i);_.b("  <p class=\"small ttip-tip\">");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"residentialEnergyConsumption\" class=\"residentialEnergyConsumption\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show energy consumption in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");return _.fl();;});
this["Templates"]["fuelCosts"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("\n" + i);_.b("<p>");_.b("\n" + i);_.b("In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong>. A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial Fuel Costs -- 2012 Dollars</h4>");_.b("\n" + i);_.b("  <p class=\"small ttip-tip\">");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"commercialFuelCosts\" class=\"commercialFuelCosts\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential Fuel Costs -- 2012 Dollars</h4>");_.b("\n" + i);_.b("  <p class=\"small ttip-tip\">");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"residentialFuelCosts\" class=\"residentialFuelCosts\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show fuel costs in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");return _.fl();;});
this["Templates"]["greenhouseGases"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<p>");_.b("\n" + i);_.b("In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong>. A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial GHG's -- CO<sub>2</sub>-e Equivalent</h4>");_.b("\n" + i);_.b("  <p class=\"small ttip-tip\">");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"commercialGreenhouseGases\" class=\"commercialGreenhouseGases\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential GHG's -- CO<sub>2</sub>-e Equivalent</h4>");_.b("\n" + i);_.b("  <p class=\"small ttip-tip\">");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"residentialGreenhouseGases\" class=\"residentialGreenhouseGases\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show greenhouse gas emissions in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");_.b("\n");return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[14])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvc2Vhc2tldGNoL0Rlc2t0b3AvR2l0SHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2Vhc2tldGNoL0Rlc2t0b3AvR2l0SHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvc2Vhc2tldGNoL0Rlc2t0b3AvR2l0SHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL2VuYWJsZUxheWVyVG9nZ2xlcnMuY29mZmVlIiwiL1VzZXJzL3NlYXNrZXRjaC9EZXNrdG9wL0dpdEh1Yi9tZW8tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy9qb2JJdGVtLmNvZmZlZSIsIi9Vc2Vycy9zZWFza2V0Y2gvRGVza3RvcC9HaXRIdWIvbWVvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0UmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvc2Vhc2tldGNoL0Rlc2t0b3AvR2l0SHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL3JlcG9ydFRhYi5jb2ZmZWUiLCIvVXNlcnMvc2Vhc2tldGNoL0Rlc2t0b3AvR2l0SHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL3V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9zZWFza2V0Y2gvRGVza3RvcC9HaXRIdWIvbWVvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiLCIvVXNlcnMvc2Vhc2tldGNoL0Rlc2t0b3AvR2l0SHViL21lby1yZXBvcnRzL3NjcmlwdHMvZW5lcmd5Q29uc3VtcHRpb24uY29mZmVlIiwiL1VzZXJzL3NlYXNrZXRjaC9EZXNrdG9wL0dpdEh1Yi9tZW8tcmVwb3J0cy9zY3JpcHRzL2Z1ZWxDb3N0cy5jb2ZmZWUiLCIvVXNlcnMvc2Vhc2tldGNoL0Rlc2t0b3AvR2l0SHViL21lby1yZXBvcnRzL3NjcmlwdHMvZ3JlZW5ob3VzZUdhc2VzLmNvZmZlZSIsIi9Vc2Vycy9zZWFza2V0Y2gvRGVza3RvcC9HaXRIdWIvbWVvLXJlcG9ydHMvc2NyaXB0cy9yZXBvcnQuY29mZmVlIiwiL1VzZXJzL3NlYXNrZXRjaC9EZXNrdG9wL0dpdEh1Yi9tZW8tcmVwb3J0cy90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FDQUEsQ0FBTyxDQUFVLENBQUEsR0FBWCxDQUFOLEVBQWtCO0NBQ2hCLEtBQUEsMkVBQUE7Q0FBQSxDQUFBLENBQUE7Q0FBQSxDQUNBLENBQUEsR0FBWTtDQURaLENBRUEsQ0FBQSxHQUFNO0FBQ0MsQ0FBUCxDQUFBLENBQUEsQ0FBQTtDQUNFLEVBQUEsQ0FBQSxHQUFPLHFCQUFQO0NBQ0EsU0FBQTtJQUxGO0NBQUEsQ0FNQSxDQUFXLENBQUEsSUFBWCxhQUFXO0NBRVg7Q0FBQSxNQUFBLG9DQUFBO3dCQUFBO0NBQ0UsRUFBVyxDQUFYLEdBQVcsQ0FBWDtDQUFBLEVBQ1MsQ0FBVCxFQUFBLEVBQWlCLEtBQVI7Q0FDVDtDQUNFLEVBQU8sQ0FBUCxFQUFBLFVBQU87Q0FBUCxFQUNPLENBQVAsQ0FEQSxDQUNBO0FBQytCLENBRi9CLENBRThCLENBQUUsQ0FBaEMsRUFBQSxFQUFRLENBQXdCLEtBQWhDO0NBRkEsQ0FHeUIsRUFBekIsRUFBQSxFQUFRLENBQVI7TUFKRjtDQU1FLEtBREk7Q0FDSixDQUFn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QSxFQUVxQixJQUFBLFdBQXJCLFFBQXFCOztBQUVyQixDQUpBLEVBSVUsR0FBSixHQUFxQixLQUEzQjtDQUNFLENBQUEsRUFBQSxFQUFNLE1BQU0sTUFBQSxFQUFBO0NBRUwsS0FBRCxHQUFOLEVBQUEsR0FBbUI7Q0FISzs7OztBQ0oxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLG51bGwsIm1vZHVsZS5leHBvcnRzID0gKGVsKSAtPlxuICAkZWwgPSAkIGVsXG4gIGFwcCA9IHdpbmRvdy5hcHBcbiAgdG9jID0gYXBwLmdldFRvYygpXG4gIHVubGVzcyB0b2NcbiAgICBjb25zb2xlLmxvZyAnTm8gdGFibGUgb2YgY29udGVudHMgZm91bmQnXG4gICAgcmV0dXJuXG4gIHRvZ2dsZXJzID0gJGVsLmZpbmQoJ2FbZGF0YS10b2dnbGUtbm9kZV0nKVxuICAjIFNldCBpbml0aWFsIHN0YXRlXG4gIGZvciB0b2dnbGVyIGluIHRvZ2dsZXJzLnRvQXJyYXkoKVxuICAgICR0b2dnbGVyID0gJCh0b2dnbGVyKVxuICAgIG5vZGVpZCA9ICR0b2dnbGVyLmRhdGEoJ3RvZ2dsZS1ub2RlJylcbiAgICB0cnlcbiAgICAgIHZpZXcgPSB0b2MuZ2V0Q2hpbGRWaWV3QnlJZCBub2RlaWRcbiAgICAgIG5vZGUgPSB2aWV3Lm1vZGVsXG4gICAgICAkdG9nZ2xlci5hdHRyICdkYXRhLXZpc2libGUnLCAhIW5vZGUuZ2V0KCd2aXNpYmxlJylcbiAgICAgICR0b2dnbGVyLmRhdGEgJ3RvY0l0ZW0nLCB2aWV3XG4gICAgY2F0Y2ggZVxuICAgICAgJHRvZ2dsZXIuYXR0ciAnZGF0YS1ub3QtZm91bmQnLCAndHJ1ZSdcblxuICB0b2dnbGVycy5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAkZWwgPSAkKGUudGFyZ2V0KVxuICAgIHZpZXcgPSAkZWwuZGF0YSgndG9jSXRlbScpXG4gICAgaWYgdmlld1xuICAgICAgdmlldy50b2dnbGVWaXNpYmlsaXR5KGUpXG4gICAgICAkZWwuYXR0ciAnZGF0YS12aXNpYmxlJywgISF2aWV3Lm1vZGVsLmdldCgndmlzaWJsZScpXG4gICAgZWxzZVxuICAgICAgYWxlcnQgXCJMYXllciBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgVGFibGUgb2YgQ29udGVudHMuIFxcbkV4cGVjdGVkIG5vZGVpZCAjeyRlbC5kYXRhKCd0b2dnbGUtbm9kZScpfVwiXG4iLCJjbGFzcyBKb2JJdGVtIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuICBjbGFzc05hbWU6ICdyZXBvcnRSZXN1bHQnXG4gIGV2ZW50czoge31cbiAgYmluZGluZ3M6XG4gICAgXCJoNiBhXCI6XG4gICAgICBvYnNlcnZlOiBcInNlcnZpY2VOYW1lXCJcbiAgICAgIHVwZGF0ZVZpZXc6IHRydWVcbiAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgIG5hbWU6ICdocmVmJ1xuICAgICAgICBvYnNlcnZlOiAnc2VydmljZVVybCdcbiAgICAgIH1dXG4gICAgXCIuc3RhcnRlZEF0XCI6XG4gICAgICBvYnNlcnZlOiBbXCJzdGFydGVkQXRcIiwgXCJzdGF0dXNcIl1cbiAgICAgIHZpc2libGU6ICgpIC0+XG4gICAgICAgIEBtb2RlbC5nZXQoJ3N0YXR1cycpIG5vdCBpbiBbJ2NvbXBsZXRlJywgJ2Vycm9yJ11cbiAgICAgIHVwZGF0ZVZpZXc6IHRydWVcbiAgICAgIG9uR2V0OiAoKSAtPlxuICAgICAgICBpZiBAbW9kZWwuZ2V0KCdzdGFydGVkQXQnKVxuICAgICAgICAgIHJldHVybiBcIlN0YXJ0ZWQgXCIgKyBtb21lbnQoQG1vZGVsLmdldCgnc3RhcnRlZEF0JykpLmZyb21Ob3coKSArIFwiLiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgXCJcIlxuICAgIFwiLnN0YXR1c1wiOiAgICAgIFxuICAgICAgb2JzZXJ2ZTogXCJzdGF0dXNcIlxuICAgICAgb25HZXQ6IChzKSAtPlxuICAgICAgICBzd2l0Y2ggc1xuICAgICAgICAgIHdoZW4gJ3BlbmRpbmcnXG4gICAgICAgICAgICBcIndhaXRpbmcgaW4gbGluZVwiXG4gICAgICAgICAgd2hlbiAncnVubmluZydcbiAgICAgICAgICAgIFwicnVubmluZyBhbmFseXRpY2FsIHNlcnZpY2VcIlxuICAgICAgICAgIHdoZW4gJ2NvbXBsZXRlJ1xuICAgICAgICAgICAgXCJjb21wbGV0ZWRcIlxuICAgICAgICAgIHdoZW4gJ2Vycm9yJ1xuICAgICAgICAgICAgXCJhbiBlcnJvciBvY2N1cnJlZFwiXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgc1xuICAgIFwiLnF1ZXVlTGVuZ3RoXCI6IFxuICAgICAgb2JzZXJ2ZTogXCJxdWV1ZUxlbmd0aFwiXG4gICAgICBvbkdldDogKHYpIC0+XG4gICAgICAgIHMgPSBcIldhaXRpbmcgYmVoaW5kICN7dn0gam9iXCJcbiAgICAgICAgaWYgdi5sZW5ndGggPiAxXG4gICAgICAgICAgcyArPSAncydcbiAgICAgICAgcmV0dXJuIHMgKyBcIi4gXCJcbiAgICAgIHZpc2libGU6ICh2KSAtPlxuICAgICAgICB2PyBhbmQgcGFyc2VJbnQodikgPiAwXG4gICAgXCIuZXJyb3JzXCI6XG4gICAgICBvYnNlcnZlOiAnZXJyb3InXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICB2aXNpYmxlOiAodikgLT5cbiAgICAgICAgdj8ubGVuZ3RoID4gMlxuICAgICAgb25HZXQ6ICh2KSAtPlxuICAgICAgICBpZiB2P1xuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHYsIG51bGwsICcgICcpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAbW9kZWwpIC0+XG4gICAgc3VwZXIoKVxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICBAJGVsLmh0bWwgXCJcIlwiXG4gICAgICA8aDY+PGEgaHJlZj1cIiNcIiB0YXJnZXQ9XCJfYmxhbmtcIj48L2E+PHNwYW4gY2xhc3M9XCJzdGF0dXNcIj48L3NwYW4+PC9oNj5cbiAgICAgIDxkaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwic3RhcnRlZEF0XCI+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInF1ZXVlTGVuZ3RoXCI+PC9zcGFuPlxuICAgICAgICA8cHJlIGNsYXNzPVwiZXJyb3JzXCI+PC9wcmU+XG4gICAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICBAc3RpY2tpdCgpXG5cbm1vZHVsZS5leHBvcnRzID0gSm9iSXRlbSIsImNsYXNzIFJlcG9ydFJlc3VsdHMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgZGVmYXVsdFBvbGxpbmdJbnRlcnZhbDogMzAwMFxuXG4gIGNvbnN0cnVjdG9yOiAoQHNrZXRjaCwgQGRlcHMpIC0+XG4gICAgQHVybCA9IHVybCA9IFwiL3JlcG9ydHMvI3tAc2tldGNoLmlkfS8je0BkZXBzLmpvaW4oJywnKX1cIlxuICAgIHN1cGVyKClcblxuICBwb2xsOiAoKSA9PlxuICAgIEBmZXRjaCB7XG4gICAgICBzdWNjZXNzOiAoKSA9PlxuICAgICAgICBAdHJpZ2dlciAnam9icydcbiAgICAgICAgZm9yIHJlc3VsdCBpbiBAbW9kZWxzXG4gICAgICAgICAgaWYgcmVzdWx0LmdldCgnc3RhdHVzJykgbm90IGluIFsnY29tcGxldGUnLCAnZXJyb3InXVxuICAgICAgICAgICAgdW5sZXNzIEBpbnRlcnZhbFxuICAgICAgICAgICAgICBAaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCBAcG9sbCwgQGRlZmF1bHRQb2xsaW5nSW50ZXJ2YWxcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIGNvbnNvbGUubG9nIEBtb2RlbHNbMF0uZ2V0KCdwYXlsb2FkU2l6ZUJ5dGVzJylcbiAgICAgICAgICBwYXlsb2FkU2l6ZSA9IE1hdGgucm91bmQoKChAbW9kZWxzWzBdLmdldCgncGF5bG9hZFNpemVCeXRlcycpIG9yIDApIC8gMTAyNCkgKiAxMDApIC8gMTAwXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJGZWF0dXJlU2V0IHNlbnQgdG8gR1Agd2VpZ2hlZCBpbiBhdCAje3BheWxvYWRTaXplfWtiXCJcbiAgICAgICAgIyBhbGwgY29tcGxldGUgdGhlblxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAaW50ZXJ2YWwpIGlmIEBpbnRlcnZhbFxuICAgICAgICBpZiBwcm9ibGVtID0gXy5maW5kKEBtb2RlbHMsIChyKSAtPiByLmdldCgnZXJyb3InKT8pXG4gICAgICAgICAgQHRyaWdnZXIgJ2Vycm9yJywgXCJQcm9ibGVtIHdpdGggI3twcm9ibGVtLmdldCgnc2VydmljZU5hbWUnKX0gam9iXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB0cmlnZ2VyICdmaW5pc2hlZCdcbiAgICAgIGVycm9yOiAoZSwgcmVzLCBhLCBiKSA9PlxuICAgICAgICB1bmxlc3MgcmVzLnN0YXR1cyBpcyAwXG4gICAgICAgICAgaWYgcmVzLnJlc3BvbnNlVGV4dD8ubGVuZ3RoXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UocmVzLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICMgZG8gbm90aGluZ1xuICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBpbnRlcnZhbCkgaWYgQGludGVydmFsXG4gICAgICAgICAgQHRyaWdnZXIgJ2Vycm9yJywganNvbj8uZXJyb3I/Lm1lc3NhZ2Ugb3JcbiAgICAgICAgICAgICdQcm9ibGVtIGNvbnRhY3RpbmcgdGhlIFNlYVNrZXRjaCBzZXJ2ZXInXG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydFJlc3VsdHNcbiIsImVuYWJsZUxheWVyVG9nZ2xlcnMgPSByZXF1aXJlICcuL2VuYWJsZUxheWVyVG9nZ2xlcnMuY29mZmVlJ1xucm91bmQgPSByZXF1aXJlKCcuL3V0aWxzLmNvZmZlZScpLnJvdW5kXG5SZXBvcnRSZXN1bHRzID0gcmVxdWlyZSAnLi9yZXBvcnRSZXN1bHRzLmNvZmZlZSdcbnQgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJylcbnRlbXBsYXRlcyA9XG4gIHJlcG9ydExvYWRpbmc6IHRbJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9yZXBvcnRMb2FkaW5nJ11cbkpvYkl0ZW0gPSByZXF1aXJlICcuL2pvYkl0ZW0uY29mZmVlJ1xuQ29sbGVjdGlvblZpZXcgPSByZXF1aXJlKCd2aWV3cy9jb2xsZWN0aW9uVmlldycpXG5cbmNsYXNzIFJlY29yZFNldFxuXG4gIGNvbnN0cnVjdG9yOiAoQGRhdGEsIEB0YWIsIEBza2V0Y2hDbGFzc0lkKSAtPlxuXG4gIHRvQXJyYXk6ICgpIC0+XG4gICAgaWYgQHNrZXRjaENsYXNzSWRcbiAgICAgIGRhdGEgPSBfLmZpbmQgQGRhdGEudmFsdWUsICh2KSA9PlxuICAgICAgICB2LmZlYXR1cmVzP1swXT8uYXR0cmlidXRlcz9bJ1NDX0lEJ10gaXMgQHNrZXRjaENsYXNzSWRcbiAgICAgIHVubGVzcyBkYXRhXG4gICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgZGF0YSBmb3Igc2tldGNoQ2xhc3MgI3tAc2tldGNoQ2xhc3NJZH1cIlxuICAgIGVsc2VcbiAgICAgIGlmIF8uaXNBcnJheSBAZGF0YS52YWx1ZVxuICAgICAgICBkYXRhID0gQGRhdGEudmFsdWVbMF1cbiAgICAgIGVsc2VcbiAgICAgICAgZGF0YSA9IEBkYXRhLnZhbHVlXG4gICAgXy5tYXAgZGF0YS5mZWF0dXJlcywgKGZlYXR1cmUpIC0+XG4gICAgICBmZWF0dXJlLmF0dHJpYnV0ZXNcblxuICByYXc6IChhdHRyKSAtPlxuICAgIGF0dHJzID0gXy5tYXAgQHRvQXJyYXkoKSwgKHJvdykgLT5cbiAgICAgIHJvd1thdHRyXVxuICAgIGF0dHJzID0gXy5maWx0ZXIgYXR0cnMsIChhdHRyKSAtPiBhdHRyICE9IHVuZGVmaW5lZFxuICAgIGlmIGF0dHJzLmxlbmd0aCBpcyAwXG4gICAgICBjb25zb2xlLmxvZyBAZGF0YVxuICAgICAgQHRhYi5yZXBvcnRFcnJvciBcIkNvdWxkIG5vdCBnZXQgYXR0cmlidXRlICN7YXR0cn0gZnJvbSByZXN1bHRzXCJcbiAgICAgIHRocm93IFwiQ291bGQgbm90IGdldCBhdHRyaWJ1dGUgI3thdHRyfVwiXG4gICAgZWxzZSBpZiBhdHRycy5sZW5ndGggaXMgMVxuICAgICAgcmV0dXJuIGF0dHJzWzBdXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGF0dHJzXG5cbiAgaW50OiAoYXR0cikgLT5cbiAgICByYXcgPSBAcmF3KGF0dHIpXG4gICAgaWYgXy5pc0FycmF5KHJhdylcbiAgICAgIF8ubWFwIHJhdywgcGFyc2VJbnRcbiAgICBlbHNlXG4gICAgICBwYXJzZUludChyYXcpXG5cbiAgZmxvYXQ6IChhdHRyLCBkZWNpbWFsUGxhY2VzPTIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsICh2YWwpIC0+IHJvdW5kKHZhbCwgZGVjaW1hbFBsYWNlcylcbiAgICBlbHNlXG4gICAgICByb3VuZChyYXcsIGRlY2ltYWxQbGFjZXMpXG5cbiAgYm9vbDogKGF0dHIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsICh2YWwpIC0+IHZhbC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgaXMgJ3RydWUnXG4gICAgZWxzZVxuICAgICAgcmF3LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSBpcyAndHJ1ZSdcblxuY2xhc3MgUmVwb3J0VGFiIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuICBuYW1lOiAnSW5mb3JtYXRpb24nXG4gIGRlcGVuZGVuY2llczogW11cblxuICBpbml0aWFsaXplOiAoQG1vZGVsLCBAb3B0aW9ucykgLT5cbiAgICAjIFdpbGwgYmUgaW5pdGlhbGl6ZWQgYnkgU2VhU2tldGNoIHdpdGggdGhlIGZvbGxvd2luZyBhcmd1bWVudHM6XG4gICAgIyAgICogbW9kZWwgLSBUaGUgc2tldGNoIGJlaW5nIHJlcG9ydGVkIG9uXG4gICAgIyAgICogb3B0aW9uc1xuICAgICMgICAgIC0gLnBhcmVudCAtIHRoZSBwYXJlbnQgcmVwb3J0IHZpZXdcbiAgICAjICAgICAgICBjYWxsIEBvcHRpb25zLnBhcmVudC5kZXN0cm95KCkgdG8gY2xvc2UgdGhlIHdob2xlIHJlcG9ydCB3aW5kb3dcbiAgICBAYXBwID0gd2luZG93LmFwcFxuICAgIF8uZXh0ZW5kIEAsIEBvcHRpb25zXG4gICAgQHJlcG9ydFJlc3VsdHMgPSBuZXcgUmVwb3J0UmVzdWx0cyhAbW9kZWwsIEBkZXBlbmRlbmNpZXMpXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ2Vycm9yJywgQHJlcG9ydEVycm9yXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ2pvYnMnLCBAcmVuZGVySm9iRGV0YWlsc1xuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdqb2JzJywgQHJlcG9ydEpvYnNcbiAgICBAbGlzdGVuVG8gQHJlcG9ydFJlc3VsdHMsICdmaW5pc2hlZCcsIF8uYmluZCBAcmVuZGVyLCBAXG4gICAgQGxpc3RlblRvT25jZSBAcmVwb3J0UmVzdWx0cywgJ3JlcXVlc3QnLCBAcmVwb3J0UmVxdWVzdGVkXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgIHRocm93ICdyZW5kZXIgbWV0aG9kIG11c3QgYmUgb3ZlcmlkZGVuJ1xuXG4gIHNob3c6ICgpIC0+XG4gICAgQCRlbC5zaG93KClcbiAgICBAdmlzaWJsZSA9IHRydWVcbiAgICBpZiBAZGVwZW5kZW5jaWVzPy5sZW5ndGggYW5kICFAcmVwb3J0UmVzdWx0cy5tb2RlbHMubGVuZ3RoXG4gICAgICBAcmVwb3J0UmVzdWx0cy5wb2xsKClcbiAgICBlbHNlIGlmICFAZGVwZW5kZW5jaWVzPy5sZW5ndGhcbiAgICAgIEByZW5kZXIoKVxuICAgICAgQCQoJ1tkYXRhLWF0dHJpYnV0ZS10eXBlPVVybEZpZWxkXSAudmFsdWUsIFtkYXRhLWF0dHJpYnV0ZS10eXBlPVVwbG9hZEZpZWxkXSAudmFsdWUnKS5lYWNoICgpIC0+XG4gICAgICAgIHRleHQgPSAkKEApLnRleHQoKVxuICAgICAgICBodG1sID0gW11cbiAgICAgICAgZm9yIHVybCBpbiB0ZXh0LnNwbGl0KCcsJylcbiAgICAgICAgICBpZiB1cmwubGVuZ3RoXG4gICAgICAgICAgICBuYW1lID0gXy5sYXN0KHVybC5zcGxpdCgnLycpKVxuICAgICAgICAgICAgaHRtbC5wdXNoIFwiXCJcIjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIje3VybH1cIj4je25hbWV9PC9hPlwiXCJcIlxuICAgICAgICAkKEApLmh0bWwgaHRtbC5qb2luKCcsICcpXG5cblxuICBoaWRlOiAoKSAtPlxuICAgIEAkZWwuaGlkZSgpXG4gICAgQHZpc2libGUgPSBmYWxzZVxuXG4gIHJlbW92ZTogKCkgPT5cbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCBAZXRhSW50ZXJ2YWxcbiAgICBAc3RvcExpc3RlbmluZygpXG4gICAgc3VwZXIoKVxuXG4gIHJlcG9ydFJlcXVlc3RlZDogKCkgPT5cbiAgICBAJGVsLmh0bWwgdGVtcGxhdGVzLnJlcG9ydExvYWRpbmcucmVuZGVyKHt9KVxuXG4gIHJlcG9ydEVycm9yOiAobXNnLCBjYW5jZWxsZWRSZXF1ZXN0KSA9PlxuICAgIHVubGVzcyBjYW5jZWxsZWRSZXF1ZXN0XG4gICAgICBpZiBtc2cgaXMgJ0pPQl9FUlJPUidcbiAgICAgICAgQHNob3dFcnJvciAnRXJyb3Igd2l0aCBzcGVjaWZpYyBqb2InXG4gICAgICBlbHNlXG4gICAgICAgIEBzaG93RXJyb3IgbXNnXG5cbiAgc2hvd0Vycm9yOiAobXNnKSA9PlxuICAgIEAkKCcucHJvZ3Jlc3MnKS5yZW1vdmUoKVxuICAgIEAkKCdwLmVycm9yJykucmVtb3ZlKClcbiAgICBAJCgnaDQnKS50ZXh0KFwiQW4gRXJyb3IgT2NjdXJyZWRcIikuYWZ0ZXIgXCJcIlwiXG4gICAgICA8cCBjbGFzcz1cImVycm9yXCIgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj4je21zZ308L3A+XG4gICAgXCJcIlwiXG5cbiAgcmVwb3J0Sm9iczogKCkgPT5cbiAgICB1bmxlc3MgQG1heEV0YVxuICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykud2lkdGgoJzEwMCUnKVxuICAgIEAkKCdoNCcpLnRleHQgXCJBbmFseXppbmcgRGVzaWduc1wiXG5cbiAgc3RhcnRFdGFDb3VudGRvd246ICgpID0+XG4gICAgaWYgQG1heEV0YVxuICAgICAgXy5kZWxheSAoKSA9PlxuICAgICAgICBAcmVwb3J0UmVzdWx0cy5wb2xsKClcbiAgICAgICwgKEBtYXhFdGEgKyAxKSAqIDEwMDBcbiAgICAgIF8uZGVsYXkgKCkgPT5cbiAgICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykuY3NzICd0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbicsICdsaW5lYXInXG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLmNzcyAndHJhbnNpdGlvbi1kdXJhdGlvbicsIFwiI3tAbWF4RXRhICsgMX1zXCJcbiAgICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykud2lkdGgoJzEwMCUnKVxuICAgICAgLCA1MDBcblxuICByZW5kZXJKb2JEZXRhaWxzOiAoKSA9PlxuICAgIG1heEV0YSA9IG51bGxcbiAgICBmb3Igam9iIGluIEByZXBvcnRSZXN1bHRzLm1vZGVsc1xuICAgICAgaWYgam9iLmdldCgnZXRhU2Vjb25kcycpXG4gICAgICAgIGlmICFtYXhFdGEgb3Igam9iLmdldCgnZXRhU2Vjb25kcycpID4gbWF4RXRhXG4gICAgICAgICAgbWF4RXRhID0gam9iLmdldCgnZXRhU2Vjb25kcycpXG4gICAgaWYgbWF4RXRhXG4gICAgICBAbWF4RXRhID0gbWF4RXRhXG4gICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS53aWR0aCgnNSUnKVxuICAgICAgQHN0YXJ0RXRhQ291bnRkb3duKClcblxuICAgIEAkKCdbcmVsPWRldGFpbHNdJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJylcbiAgICBAJCgnW3JlbD1kZXRhaWxzXScpLmNsaWNrIChlKSA9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBAJCgnW3JlbD1kZXRhaWxzXScpLmhpZGUoKVxuICAgICAgQCQoJy5kZXRhaWxzJykuc2hvdygpXG4gICAgZm9yIGpvYiBpbiBAcmVwb3J0UmVzdWx0cy5tb2RlbHNcbiAgICAgIGl0ZW0gPSBuZXcgSm9iSXRlbShqb2IpXG4gICAgICBpdGVtLnJlbmRlcigpXG4gICAgICBAJCgnLmRldGFpbHMnKS5hcHBlbmQgaXRlbS5lbFxuXG4gIGdldFJlc3VsdDogKGlkKSAtPlxuICAgIHJlc3VsdHMgPSBAZ2V0UmVzdWx0cygpXG4gICAgcmVzdWx0ID0gXy5maW5kIHJlc3VsdHMsIChyKSAtPiByLnBhcmFtTmFtZSBpcyBpZFxuICAgIHVubGVzcyByZXN1bHQ/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHJlc3VsdCB3aXRoIGlkICcgKyBpZClcbiAgICByZXN1bHQudmFsdWVcblxuICBnZXRGaXJzdFJlc3VsdDogKHBhcmFtLCBpZCkgLT5cbiAgICByZXN1bHQgPSBAZ2V0UmVzdWx0KHBhcmFtKVxuICAgIHRyeVxuICAgICAgcmV0dXJuIHJlc3VsdFswXS5mZWF0dXJlc1swXS5hdHRyaWJ1dGVzW2lkXVxuICAgIGNhdGNoIGVcbiAgICAgIHRocm93IFwiRXJyb3IgZmluZGluZyAje3BhcmFtfToje2lkfSBpbiBncCByZXN1bHRzXCJcblxuICBnZXRSZXN1bHRzOiAoKSAtPlxuICAgIHJlc3VsdHMgPSBAcmVwb3J0UmVzdWx0cy5tYXAoKHJlc3VsdCkgLT4gcmVzdWx0LmdldCgncmVzdWx0JykucmVzdWx0cylcbiAgICB1bmxlc3MgcmVzdWx0cz8ubGVuZ3RoXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGdwIHJlc3VsdHMnKVxuICAgIF8uZmlsdGVyIHJlc3VsdHMsIChyZXN1bHQpIC0+XG4gICAgICByZXN1bHQucGFyYW1OYW1lIG5vdCBpbiBbJ1Jlc3VsdENvZGUnLCAnUmVzdWx0TXNnJ11cblxuICByZWNvcmRTZXQ6IChkZXBlbmRlbmN5LCBwYXJhbU5hbWUsIHNrZXRjaENsYXNzSWQ9ZmFsc2UpIC0+XG4gICAgdW5sZXNzIGRlcGVuZGVuY3kgaW4gQGRlcGVuZGVuY2llc1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVW5rbm93biBkZXBlbmRlbmN5ICN7ZGVwZW5kZW5jeX1cIlxuICAgIGRlcCA9IEByZXBvcnRSZXN1bHRzLmZpbmQgKHIpIC0+IHIuZ2V0KCdzZXJ2aWNlTmFtZScpIGlzIGRlcGVuZGVuY3lcbiAgICB1bmxlc3MgZGVwXG4gICAgICBjb25zb2xlLmxvZyBAcmVwb3J0UmVzdWx0cy5tb2RlbHNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNvdWxkIG5vdCBmaW5kIHJlc3VsdHMgZm9yICN7ZGVwZW5kZW5jeX0uXCJcbiAgICBwYXJhbSA9IF8uZmluZCBkZXAuZ2V0KCdyZXN1bHQnKS5yZXN1bHRzLCAocGFyYW0pIC0+XG4gICAgICBwYXJhbS5wYXJhbU5hbWUgaXMgcGFyYW1OYW1lXG4gICAgdW5sZXNzIHBhcmFtXG4gICAgICBjb25zb2xlLmxvZyBkZXAuZ2V0KCdkYXRhJykucmVzdWx0c1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQ291bGQgbm90IGZpbmQgcGFyYW0gI3twYXJhbU5hbWV9IGluICN7ZGVwZW5kZW5jeX1cIlxuICAgIG5ldyBSZWNvcmRTZXQocGFyYW0sIEAsIHNrZXRjaENsYXNzSWQpXG5cbiAgZW5hYmxlVGFibGVQYWdpbmc6ICgpIC0+XG4gICAgQCQoJ1tkYXRhLXBhZ2luZ10nKS5lYWNoICgpIC0+XG4gICAgICAkdGFibGUgPSAkKEApXG4gICAgICBwYWdlU2l6ZSA9ICR0YWJsZS5kYXRhKCdwYWdpbmcnKVxuICAgICAgcm93cyA9ICR0YWJsZS5maW5kKCd0Ym9keSB0cicpLmxlbmd0aFxuICAgICAgcGFnZXMgPSBNYXRoLmNlaWwocm93cyAvIHBhZ2VTaXplKVxuICAgICAgaWYgcGFnZXMgPiAxXG4gICAgICAgICR0YWJsZS5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgPHRmb290PlxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICA8dGQgY29sc3Bhbj1cIiN7JHRhYmxlLmZpbmQoJ3RoZWFkIHRoJykubGVuZ3RofVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYWdpbmF0aW9uXCI+XG4gICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI1wiPlByZXY8L2E+PC9saT5cbiAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDwvdGZvb3Q+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICB1bCA9ICR0YWJsZS5maW5kKCd0Zm9vdCB1bCcpXG4gICAgICAgIGZvciBpIGluIF8ucmFuZ2UoMSwgcGFnZXMgKyAxKVxuICAgICAgICAgIHVsLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI1wiPiN7aX08L2E+PC9saT5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgdWwuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgIDxsaT48YSBocmVmPVwiI1wiPk5leHQ8L2E+PC9saT5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgICR0YWJsZS5maW5kKCdsaSBhJykuY2xpY2sgKGUpIC0+XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgJGEgPSAkKHRoaXMpXG4gICAgICAgICAgdGV4dCA9ICRhLnRleHQoKVxuICAgICAgICAgIGlmIHRleHQgaXMgJ05leHQnXG4gICAgICAgICAgICBhID0gJGEucGFyZW50KCkucGFyZW50KCkuZmluZCgnLmFjdGl2ZScpLm5leHQoKS5maW5kKCdhJylcbiAgICAgICAgICAgIHVubGVzcyBhLnRleHQoKSBpcyAnTmV4dCdcbiAgICAgICAgICAgICAgYS5jbGljaygpXG4gICAgICAgICAgZWxzZSBpZiB0ZXh0IGlzICdQcmV2J1xuICAgICAgICAgICAgYSA9ICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5wcmV2KCkuZmluZCgnYScpXG4gICAgICAgICAgICB1bmxlc3MgYS50ZXh0KCkgaXMgJ1ByZXYnXG4gICAgICAgICAgICAgIGEuY2xpY2soKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgJGEucGFyZW50KCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIG4gPSBwYXJzZUludCh0ZXh0KVxuICAgICAgICAgICAgJHRhYmxlLmZpbmQoJ3Rib2R5IHRyJykuaGlkZSgpXG4gICAgICAgICAgICBvZmZzZXQgPSBwYWdlU2l6ZSAqIChuIC0gMSlcbiAgICAgICAgICAgICR0YWJsZS5maW5kKFwidGJvZHkgdHJcIikuc2xpY2Uob2Zmc2V0LCBuKnBhZ2VTaXplKS5zaG93KClcbiAgICAgICAgJCgkdGFibGUuZmluZCgnbGkgYScpWzFdKS5jbGljaygpXG5cbiAgICAgIGlmIG5vUm93c01lc3NhZ2UgPSAkdGFibGUuZGF0YSgnbm8tcm93cycpXG4gICAgICAgIGlmIHJvd3MgaXMgMFxuICAgICAgICAgIHBhcmVudCA9ICR0YWJsZS5wYXJlbnQoKVxuICAgICAgICAgICR0YWJsZS5yZW1vdmUoKVxuICAgICAgICAgIHBhcmVudC5yZW1vdmVDbGFzcyAndGFibGVDb250YWluZXInXG4gICAgICAgICAgcGFyZW50LmFwcGVuZCBcIjxwPiN7bm9Sb3dzTWVzc2FnZX08L3A+XCJcblxuICBlbmFibGVMYXllclRvZ2dsZXJzOiAoKSAtPlxuICAgIGVuYWJsZUxheWVyVG9nZ2xlcnMoQCRlbClcblxuICBnZXRDaGlsZHJlbjogKHNrZXRjaENsYXNzSWQpIC0+XG4gICAgXy5maWx0ZXIgQGNoaWxkcmVuLCAoY2hpbGQpIC0+IGNoaWxkLmdldFNrZXRjaENsYXNzKCkuaWQgaXMgc2tldGNoQ2xhc3NJZFxuXG5cbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0VGFiXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIFxuICByb3VuZDogKG51bWJlciwgZGVjaW1hbFBsYWNlcykgLT5cbiAgICB1bmxlc3MgXy5pc051bWJlciBudW1iZXJcbiAgICAgIG51bWJlciA9IHBhcnNlRmxvYXQobnVtYmVyKVxuICAgIG11bHRpcGxpZXIgPSBNYXRoLnBvdyAxMCwgZGVjaW1hbFBsYWNlc1xuICAgIE1hdGgucm91bmQobnVtYmVyICogbXVsdGlwbGllcikgLyBtdWx0aXBsaWVyIiwidGhpc1tcIlRlbXBsYXRlc1wiXSA9IHRoaXNbXCJUZW1wbGF0ZXNcIl0gfHwge307XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL2F0dHJpYnV0ZXMvYXR0cmlidXRlSXRlbVwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8dHIgZGF0YS1hdHRyaWJ1dGUtaWQ9XFxcIlwiKTtfLmIoXy52KF8uZihcImlkXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiBkYXRhLWF0dHJpYnV0ZS1leHBvcnRpZD1cXFwiXCIpO18uYihfLnYoXy5mKFwiZXhwb3J0aWRcIixjLHAsMCkpKTtfLmIoXCJcXFwiIGRhdGEtYXR0cmlidXRlLXR5cGU9XFxcIlwiKTtfLmIoXy52KF8uZihcInR5cGVcIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHRkIGNsYXNzPVxcXCJuYW1lXFxcIj5cIik7Xy5iKF8udihfLmYoXCJuYW1lXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx0ZCBjbGFzcz1cXFwidmFsdWVcXFwiPlwiKTtfLmIoXy52KF8uZihcImZvcm1hdHRlZFZhbHVlXCIsYyxwLDApKSk7Xy5iKFwiPC90ZD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L3RyPlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL2F0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjx0YWJsZSBjbGFzcz1cXFwiYXR0cmlidXRlc1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcImF0dHJpYnV0ZXNcIixjLHAsMSksYyxwLDAsNDQsODEsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihfLnJwKFwiYXR0cmlidXRlcy9hdHRyaWJ1dGVJdGVtXCIsYyxwLFwiICAgIFwiKSk7fSk7Yy5wb3AoKTt9Xy5iKFwiPC90YWJsZT5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9nZW5lcmljQXR0cmlidXRlc1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtpZihfLnMoXy5kKFwic2tldGNoQ2xhc3MuZGVsZXRlZFwiLGMscCwxKSxjLHAsMCwyNCwyNzAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LXdhcm5cXFwiIHN0eWxlPVxcXCJtYXJnaW4tYm90dG9tOjEwcHg7XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFRoaXMgc2tldGNoIHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBcXFwiXCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIlxcXCIgdGVtcGxhdGUsIHdoaWNoIGlzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBubyBsb25nZXIgYXZhaWxhYmxlLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byBjb3B5IHRoaXMgc2tldGNoIG9yIG1ha2UgbmV3XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBza2V0Y2hlcyBvZiB0aGlzIHR5cGUuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5cIik7Xy5iKF8udihfLmQoXCJza2V0Y2hDbGFzcy5uYW1lXCIsYyxwLDApKSk7Xy5iKFwiIEF0dHJpYnV0ZXM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihfLnJwKFwiYXR0cmlidXRlcy9hdHRyaWJ1dGVzVGFibGVcIixjLHAsXCIgICAgXCIpKTtfLmIoXCIgIDwvdGFibGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvcmVwb3J0TG9hZGluZ1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRMb2FkaW5nXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwhLS0gPGRpdiBjbGFzcz1cXFwic3Bpbm5lclxcXCI+MzwvZGl2PiAtLT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5SZXF1ZXN0aW5nIFJlcG9ydCBmcm9tIFNlcnZlcjwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcyBwcm9ncmVzcy1zdHJpcGVkIGFjdGl2ZVxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImJhclxcXCIgc3R5bGU9XFxcIndpZHRoOiAxMDAlO1xcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxhIGhyZWY9XFxcIiNcXFwiIHJlbD1cXFwiZGV0YWlsc1xcXCI+ZGV0YWlsczwvYT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiZGV0YWlsc1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG5cbmlmKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB0aGlzW1wiVGVtcGxhdGVzXCJdO1xufSIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuY2xhc3MgRW5lcmd5Q29uc3VtcHRpb25UYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnRW5lcmd5IENvbnN1bXB0aW9uJ1xuICBjbGFzc05hbWU6ICdFbmVyZ3lDb25zdW1wdGlvbidcbiAgdGltZW91dDogMTIwMDAwXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZXMuZW5lcmd5Q29uc3VtcHRpb25cbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0VuZXJneVBsYW4nXG4gIF1cblxuXG5cbiAgcmVuZGVyOiAoKSAtPlxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgZDNJc1ByZXNlbnQgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgZDNJc1ByZXNlbnQgPSBmYWxzZVxuXG4gICAgYXR0cmlidXRlcyA9IEBtb2RlbC5nZXRBdHRyaWJ1dGVzKClcbiAgICBvdXRtc2cgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIlJlc3VsdE1zZ1wiKVxuICAgIFxuICAgIFxuICAgIHRyeVxuICAgICAgY29tRUMgPSBAcmVjb3JkU2V0KFwiRW5lcmd5UGxhblwiLCBcIkNvbUVVXCIpLnRvQXJyYXkoKVxuICAgICAgY29tX3BhID0gQGdldE1hcChjb21FQywgXCJQQVwiKVxuICAgICAgY29tX2RibHBhID0gQGdldE1hcChjb21FQywgXCJEYmxQQVwiKVxuICAgICAgY29tX25vcGEgPSBAZ2V0TWFwKGNvbUVDLCBcIk5vUEFcIilcbiAgICAgIGNvbV91c2VyID0gQGdldE1hcChjb21FQywgXCJVU0VSXCIpXG4gICAgICBjb25zb2xlLmxvZyhcInVzZXIgdmFsdWVzIGFyZSAuLi4uLi4uLi4gXCIsIGNvbV91c2VyKVxuICAgICAgc29ydGVkX2NvbW1fcmVzdWx0cyA9IFtjb21fbm9wYSwgY29tX3BhLCBjb21fZGJscGFdXG5cbiAgICAgIHJlc0VDID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFVVwiKS50b0FycmF5KClcbiAgICAgIHJlc19wYSA9IEBnZXRNYXAocmVzRUMsIFwiUEFcIilcbiAgICAgIHJlc19kYmxwYSA9IEBnZXRNYXAocmVzRUMsIFwiRGJsUEFcIilcbiAgICAgIHJlc19ub3BhID0gQGdldE1hcChyZXNFQywgXCJOb1BBXCIpXG4gICAgICByZXNfdXNlciA9IEBnZXRNYXAocmVzRUMsIFwiVVNFUlwiKVxuICAgICAgY29uc29sZS5sb2coXCJ1c2VyIHZhbHVlcyBhcmUgLi4uLi4uLi4uIFwiLCByZXNfdXNlcilcbiAgICAgIHNvcnRlZF9yZXNfcmVzdWx0cyA9IFtyZXNfbm9wYSwgcmVzX3BhLCByZXNfZGJscGFdXG4gICAgY2F0Y2ggZVxuICAgICAgY29uc29sZS5sb2coXCJlcnJvcjogXCIsIGUpXG5cbiAgICBjb250ZXh0ID1cbiAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcblxuICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUucmVuZGVyKGNvbnRleHQsIHBhcnRpYWxzKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcbiAgICBcbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGggPSAzMjBcbiAgICAgIHcgPSAzODBcbiAgICAgIG1hcmdpbiA9IHtsZWZ0OjQwLCB0b3A6NSwgcmlnaHQ6NDAsIGJvdHRvbTogNDAsIGlubmVyOjV9XG4gICAgICBoYWxmaCA9IChoK21hcmdpbi50b3ArbWFyZ2luLmJvdHRvbSlcbiAgICAgIHRvdGFsaCA9IGhhbGZoKjJcbiAgICAgIGhhbGZ3ID0gKHcrbWFyZ2luLmxlZnQrbWFyZ2luLnJpZ2h0KVxuICAgICAgdG90YWx3ID0gaGFsZncqMlxuICAgICAgXG4gICAgICBjb21fY2hhcnQgPSBAZHJhd0NoYXJ0KCcuY29tbWVyY2lhbEVuZXJneUNvbnN1bXB0aW9uJykueHZhcigwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueXZhcigxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueGxhYihcIlllYXJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnlsYWIoXCJWYWx1ZSAoaW4gbWlsbGlvbnMpXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLndpZHRoKHcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXJnaW4obWFyZ2luKVxuXG4gICAgICBjaCA9IGQzLnNlbGVjdChAJCgnLmNvbW1lcmNpYWxFbmVyZ3lDb25zdW1wdGlvbicpKVxuICAgICAgY2guZGF0dW0oc29ydGVkX2NvbW1fcmVzdWx0cylcbiAgICAgICAgLmNhbGwoY29tX2NoYXJ0KVxuXG4gICAgICByZXNfY2hhcnQgPSBAZHJhd0NoYXJ0KCcucmVzaWRlbnRpYWxFbmVyZ3lDb25zdW1wdGlvbicpLnh2YXIoMClcbiAgICAgICAgICAgICAgICAgICAgIC55dmFyKDEpXG4gICAgICAgICAgICAgICAgICAgICAueGxhYihcIlllYXJcIilcbiAgICAgICAgICAgICAgICAgICAgIC55bGFiKFwiVmFsdWUgKGluIG1pbGxpb25zKVwiKVxuICAgICAgICAgICAgICAgICAgICAgLmhlaWdodChoKVxuICAgICAgICAgICAgICAgICAgICAgLndpZHRoKHcpXG4gICAgICAgICAgICAgICAgICAgICAubWFyZ2luKG1hcmdpbilcblxuICAgICAgY2ggPSBkMy5zZWxlY3QoQCQoJy5yZXNpZGVudGlhbEVuZXJneUNvbnN1bXB0aW9uJykpXG4gICAgICBjaC5kYXR1bShzb3J0ZWRfcmVzX3Jlc3VsdHMpXG4gICAgICAgIC5jYWxsKHJlc19jaGFydClcblxuXG5cbiAgZ2V0TWFwOiAocmVjU2V0LCBzY2VuYXJpbykgLT5cbiAgICBzY2VuYXJpb192YWx1ZXMgPSBbXVxuICAgIGZvciByZWMgaW4gcmVjU2V0XG4gICAgICBpZiByZWMuVFlQRSA9PSBzY2VuYXJpb1xuICAgICAgICBzY2VuYXJpb192YWx1ZXMucHVzaChyZWMpXG5cbiAgICByZXR1cm4gXy5zb3J0Qnkgc2NlbmFyaW9fdmFsdWVzLCAocm93KSAtPiByb3dbJ1lFQVInXVxuXG4gIGRyYXdDaGFydDogKHdoaWNoQ2hhcnQpID0+XG4gICAgdmlldyA9IEBcbiAgICB3aWR0aCA9IDM2MFxuICAgIGhlaWdodCA9IDUwMFxuICAgIG1hcmdpbiA9IHtsZWZ0OjQwLCB0b3A6NSwgcmlnaHQ6MjAsIGJvdHRvbTogNDAsIGlubmVyOjEwfVxuICAgIGF4aXNwb3MgPSB7eHRpdGxlOjUsIHl0aXRsZTozMCwgeGxhYmVsOjUsIHlsYWJlbDoxNX1cbiAgICB4bGltID0gbnVsbFxuICAgIHlsaW0gPSBudWxsXG4gICAgbnh0aWNrcyA9IDVcbiAgICB4dGlja3MgPSBudWxsXG4gICAgbnl0aWNrcyA9IDVcbiAgICB5dGlja3MgPSBudWxsXG5cbiAgICByZWN0Y29sb3IgPSBcIiNkYmU0ZWVcIlxuICAgIHRpY2tjb2xvciA9IFwiI2RiZTRmZlwiXG5cblxuICAgIHBvaW50c2l6ZSA9IDEgIyBkZWZhdWx0ID0gbm8gdmlzaWJsZSBwb2ludHMgYXQgbWFya2Vyc1xuICAgIHhsYWIgPSBcIlhcIlxuICAgIHlsYWIgPSBcIlkgc2NvcmVcIlxuICAgIHlzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgeHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblxuICAgIGxlZ2VuZGhlaWdodCA9IDMwMFxuICAgIHBvaW50c1NlbGVjdCA9IG51bGxcbiAgICBsYWJlbHNTZWxlY3QgPSBudWxsXG4gICAgbGVnZW5kU2VsZWN0ID0gbnVsbFxuICAgICMjIHRoZSBtYWluIGZ1bmN0aW9uXG4gICAgY2hhcnQgPSAoc2VsZWN0aW9uKSAtPlxuICAgICAgc2VsZWN0aW9uLmVhY2ggKGRhdGEpIC0+XG4gICAgICAgIHkgPSBbXVxuICAgICAgICB4ID0gWzIwMTIsIDIwMTUsIDIwMjAsIDIwMjUsIDIwMzAsIDIwMzVdXG4gICAgICAgXG4gICAgICAgIGZvciBzY2VuIGluIGRhdGFcbiAgICAgICAgICBmb3IgZCBpbiBzY2VuXG4gICAgICAgICAgICB5LnB1c2goZC5WQUxVRS8xMDAwMDAwKVxuXG5cbiAgICAgICAgI3ggPSBkYXRhLm1hcCAoZCkgLT4gcGFyc2VGbG9hdChkLllFQVIpXG4gICAgICAgICN5ID0gZGF0YS5tYXAgKGQpIC0+IHBhcnNlRmxvYXQoZC5WQUxVRSlcblxuXG4gICAgICAgIHBhbmVsb2Zmc2V0ID0gMTBcbiAgICAgICAgcGFuZWx3aWR0aCA9IHdpZHRoXG5cbiAgICAgICAgcGFuZWxoZWlnaHQgPSBoZWlnaHRcblxuICAgICAgICB4bGltID0gW2QzLm1pbih4KS0xLCBwYXJzZUZsb2F0KGQzLm1heCh4KSsxKV0gaWYgISh4bGltPylcblxuICAgICAgICB5bGltID0gW2QzLm1pbih5KSwgcGFyc2VGbG9hdChkMy5tYXgoeSkpXSBpZiAhKHlsaW0/KVxuXG5cbiAgICAgICAgY3VycmVsZW0gPSBkMy5zZWxlY3Qodmlldy4kKHdoaWNoQ2hhcnQpWzBdKVxuICAgICAgICBzdmcgPSBkMy5zZWxlY3Qodmlldy4kKHdoaWNoQ2hhcnQpWzBdKS5hcHBlbmQoXCJzdmdcIikuZGF0YShbZGF0YV0pXG4gICAgICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG5cbiAgICAgICAgIyBVcGRhdGUgdGhlIG91dGVyIGRpbWVuc2lvbnMuXG4gICAgICAgIHN2Zy5hdHRyKFwid2lkdGhcIiwgd2lkdGgrbWFyZ2luLmxlZnQrbWFyZ2luLnJpZ2h0KVxuICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQrbWFyZ2luLnRvcCttYXJnaW4uYm90dG9tK2RhdGEubGVuZ3RoKjM1KVxuXG4gICAgICAgIGcgPSBzdmcuc2VsZWN0KFwiZ1wiKVxuXG4gICAgICAgICMgYm94XG4gICAgICAgIGcuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgLmF0dHIoXCJ4XCIsIHBhbmVsb2Zmc2V0K21hcmdpbi5sZWZ0KVxuICAgICAgICAgLmF0dHIoXCJ5XCIsIG1hcmdpbi50b3ApXG4gICAgICAgICAuYXR0cihcImhlaWdodFwiLCBwYW5lbGhlaWdodClcbiAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgcGFuZWx3aWR0aClcbiAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIndoaXRlXCIpXG4gICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcIm5vbmVcIilcblxuXG4gICAgICAgICMgc2ltcGxlIHNjYWxlcyAoaWdub3JlIE5BIGJ1c2luZXNzKVxuICAgICAgICB4cmFuZ2UgPSBbbWFyZ2luLmxlZnQrcGFuZWxvZmZzZXQrbWFyZ2luLmlubmVyLCBtYXJnaW4ubGVmdCtwYW5lbG9mZnNldCtwYW5lbHdpZHRoLW1hcmdpbi5pbm5lcl1cbiAgICAgICAgeXJhbmdlID0gW21hcmdpbi50b3ArcGFuZWxoZWlnaHQtbWFyZ2luLmlubmVyLCBtYXJnaW4udG9wK21hcmdpbi5pbm5lcl1cbiAgICAgICAgeHNjYWxlLmRvbWFpbih4bGltKS5yYW5nZSh4cmFuZ2UpXG4gICAgICAgIHlzY2FsZS5kb21haW4oeWxpbSkucmFuZ2UoeXJhbmdlKVxuICAgICAgICB4cyA9IGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbih4bGltKS5yYW5nZSh4cmFuZ2UpXG4gICAgICAgIHlzID0gZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKHlsaW0pLnJhbmdlKHlyYW5nZSlcblxuXG4gICAgICAgICMgaWYgeXRpY2tzIG5vdCBwcm92aWRlZCwgdXNlIG55dGlja3MgdG8gY2hvb3NlIHByZXR0eSBvbmVzXG4gICAgICAgIHl0aWNrcyA9IHlzLnRpY2tzKG55dGlja3MpIGlmICEoeXRpY2tzPylcbiAgICAgICAgeHRpY2tzID0geHMudGlja3Mobnh0aWNrcykgaWYgISh4dGlja3M/KVxuXG4gICAgICAgICMgeC1heGlzXG4gICAgICAgIHhheGlzID0gZy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInggYXhpc1wiKVxuICAgICAgICB4YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKHh0aWNrcylcbiAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgIC5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCAoZCkgLT4geHNjYWxlKGQpKVxuICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgKGQpIC0+IHhzY2FsZShkKSlcbiAgICAgICAgICAgICAuYXR0cihcInkxXCIsIG1hcmdpbi50b3AraGVpZ2h0LTUpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCBtYXJnaW4udG9wK2hlaWdodClcbiAgICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAxKVxuICAgICAgICAgICAgIC5zdHlsZShcInBvaW50ZXItZXZlbnRzXCIsIFwibm9uZVwiKVxuICAgICAgICAjdGhlIHggYXhpcyB5ZWFyIGxhYmVsc1xuICAgICAgICB4YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKHh0aWNrcylcbiAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIChkKSAtPiB4c2NhbGUoZCktMTQpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIG1hcmdpbi50b3AraGVpZ2h0K2F4aXNwb3MueGxhYmVsKzEwKVxuICAgICAgICAgICAgIC50ZXh0KChkKSAtPiBmb3JtYXRBeGlzKHh0aWNrcykoZCkpXG4gICAgICAgICN0aGUgeCBheGlzIHRpdGxlXG4gICAgICAgIHhheGlzLmFwcGVuZChcInRleHRcIikuYXR0cihcImNsYXNzXCIsIFwieGF4aXMtdGl0bGVcIilcbiAgICAgICAgICAgICAuYXR0cihcInhcIiwgbWFyZ2luLmxlZnQrd2lkdGgvMilcbiAgICAgICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLnRvcCtoZWlnaHQrYXhpc3Bvcy54dGl0bGUrMzApXG4gICAgICAgICAgICAgLnRleHQoeGxhYilcblxuICAgICAgICAjZHJhdyB0aGUgbGVnZW5kXG4gICAgICAgIGZvciBzY2VuYXJpbywgY250IGluIGRhdGFcbiAgICAgICAgICBsaW5lX2NvbG9yID0gZ2V0U3Ryb2tlQ29sb3Ioc2NlbmFyaW8pXG4gICAgICAgICAgeGF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YShbc2NlbmFyaW9bMF1dKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZChcImxpbmVcIilcblxuICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgKGQsaSkgLT4gcmV0dXJuIG1hcmdpbi5sZWZ0KVxuICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgKGQsaSkgLT4gcmV0dXJuIG1hcmdpbi5sZWZ0KzEwKVxuICAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgKGQsaSkgLT4gbWFyZ2luLnRvcCtoZWlnaHQrYXhpc3Bvcy54dGl0bGUrKChjbnQrMSkqMzApKzYpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCAoZCxpKSAtPiBtYXJnaW4udG9wK2hlaWdodCtheGlzcG9zLnh0aXRsZSsoKGNudCsxKSozMCkrNilcbiAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiY2hhcnQtbGluZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIChkLGkpIC0+IGxpbmVfY29sb3IpXG4gICAgICAgICAgICAgLmF0dHIoXCJjb2xvclwiLCAoZCxpKSAtPiBsaW5lX2NvbG9yKVxuICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDMpXG5cbiAgICAgICAgI2FuZCB0aGUgbGVnZW5kIHRleHRcbiAgICAgICAgZm9yIHNjZW5hcmlvLCBjbnQgaW4gZGF0YSAgICAgICAgICBcbiAgICAgICAgICB4YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKFtzY2VuYXJpb1swXV0pXG4gICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsZWdlbmQtdGV4dFwiKVxuICAgICAgICAgICAuYXR0cihcInhcIiwgKGQsaSkgLT5cbiAgICAgICAgICAgICAgcmV0dXJuIChtYXJnaW4ubGVmdCsxNykpXG4gICAgICAgICAgIC5hdHRyKFwieVwiLCAoZCxpKSAtPlxuICAgICAgICAgICAgICBtYXJnaW4udG9wK2hlaWdodCsxMCtheGlzcG9zLnh0aXRsZSsoKGNudCsxKSozMCkpXG4gICAgICAgICAgIC50ZXh0KChkLGkpIC0+IHJldHVybiBnZXRTY2VuYXJpb05hbWUoW2RdKSlcblxuICAgICAgICAjIHktYXhpc1xuICAgICAgICB5YXhpcyA9IGcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJ5IGF4aXNcIilcbiAgICAgICAgeWF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YSh5dGlja3MpXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwibGluZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgKGQpIC0+IHlzY2FsZShkKSlcbiAgICAgICAgICAgICAuYXR0cihcInkyXCIsIChkKSAtPiB5c2NhbGUoZCkpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCBtYXJnaW4ubGVmdCsxMClcbiAgICAgICAgICAgICAuYXR0cihcIngyXCIsIG1hcmdpbi5sZWZ0KzE1KVxuICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIilcbiAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgdGlja2NvbG9yKVxuICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpXG4gICAgICAgICAgICAgLnN0eWxlKFwicG9pbnRlci1ldmVudHNcIiwgXCJub25lXCIpXG4gICAgICAgIHlheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoeXRpY2tzKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAuYXR0cihcInlcIiwgKGQpIC0+IHlzY2FsZShkKSszKVxuICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBtYXJnaW4ubGVmdCszLWF4aXNwb3MueWxhYmVsKVxuICAgICAgICAgICAgIC50ZXh0KChkKSAtPiBmb3JtYXRBeGlzKHl0aWNrcykoZCkpXG4gICAgICAgIHlheGlzLmFwcGVuZChcInRleHRcIikuYXR0cihcImNsYXNzXCIsIFwidGl0bGVcIilcbiAgICAgICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLnRvcCszNStoZWlnaHQvMilcbiAgICAgICAgICAgICAuYXR0cihcInhcIiwgbWFyZ2luLmxlZnQrOC1heGlzcG9zLnl0aXRsZSlcbiAgICAgICAgICAgICAudGV4dCh5bGFiKVxuICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwicm90YXRlKDI3MCwje21hcmdpbi5sZWZ0KzgtYXhpc3Bvcy55dGl0bGV9LCN7bWFyZ2luLnRvcCszNStoZWlnaHQvMn0pXCIpXG5cbiAgICAgICAgcG9pbnRzID0gZy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJpZFwiLCBcInBvaW50c1wiKVxuXG4gICAgICAgIGZvciBzY2VuYXJpbyBpbiBkYXRhXG4gICAgICAgICAgbGluZV9jb2xvciA9IGdldFN0cm9rZUNvbG9yKHNjZW5hcmlvKVxuICAgICAgICAgICMjI1xuICAgICAgICAgIHBvaW50c1NlbGVjdCA9XG4gICAgICAgICAgICBwb2ludHMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAgICAgIC5kYXRhKHNjZW5hcmlvKVxuICAgICAgICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJjaXJjbGVcIilcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY3hcIiwgKGQsaSkgLT4geHNjYWxlKGQuWUVBUikpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImN5XCIsIChkLGkpIC0+IHlzY2FsZShkLlZBTFVFLzEwMDAwMDApKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCAoZCxpKSAtPiBcInB0I3tpfVwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJyXCIsIHBvaW50c2l6ZSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCAoZCxpKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IGlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2wgPSBsaW5lX2NvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIChkLCBpKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IE1hdGguZmxvb3IoaS8xNykgJSA1XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sID0gbGluZV9jb2xvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCBcIjFcIilcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwib3BhY2l0eVwiLCAoZCxpKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMSBpZiAoeFtpXT8gb3IgeE5BLmhhbmRsZSkgYW5kICh5W2ldPyBvciB5TkEuaGFuZGxlKVxuICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMClcbiAgICAgICAgICAjIyNcbiAgICAgICAgbGluZSA9IGQzLnN2Zy5saW5lKGQpXG4gICAgICAgICAgICAuaW50ZXJwb2xhdGUoXCJiYXNpc1wiKVxuICAgICAgICAgICAgLngoIChkKSAtPiB4c2NhbGUocGFyc2VJbnQoZC5ZRUFSKSkpXG4gICAgICAgICAgICAueSggKGQpIC0+IHlzY2FsZShkLlZBTFVFLzEwMDAwMDApKVxuXG5cbiAgICAgICAgcG9pbnRzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgIC5hcHBlbmQoXCJwYXRoXCIpXG4gICAgICAgICAgLmF0dHIoXCJkXCIsIChkKSAtPiBsaW5lIGQpXG4gICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgKGQpIC0+IGdldFN0cm9rZUNvbG9yKGQpKVxuICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDMpXG4gICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxuXG4gICAgICAgICMgYm94XG4gICAgICAgIGcuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIG1hcmdpbi5sZWZ0K3BhbmVsb2Zmc2V0KVxuICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIG1hcmdpbi50b3ApXG4gICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBwYW5lbGhlaWdodClcbiAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgcGFuZWx3aWR0aClcbiAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIilcbiAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwiYmxhY2tcIilcbiAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwibm9uZVwiKVxuXG5cblxuICAgICMjIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVyc1xuXG5cbiAgICBjaGFydC53aWR0aCA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB3aWR0aCBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgd2lkdGggPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LmhlaWdodCA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBoZWlnaHQgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIGhlaWdodCA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQubWFyZ2luID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIG1hcmdpbiBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgbWFyZ2luID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5heGlzcG9zID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIGF4aXNwb3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIGF4aXNwb3MgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnhsaW0gPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geGxpbSBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeGxpbSA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQubnh0aWNrcyA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBueHRpY2tzIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBueHRpY2tzID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC54dGlja3MgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geHRpY2tzIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB4dGlja3MgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnlsaW0gPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geWxpbSBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeWxpbSA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQubnl0aWNrcyA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBueXRpY2tzIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBueXRpY2tzID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC55dGlja3MgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geXRpY2tzIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB5dGlja3MgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnJlY3Rjb2xvciA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiByZWN0Y29sb3IgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHJlY3Rjb2xvciA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQucG9pbnRjb2xvciA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBwb2ludGNvbG9yIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBwb2ludGNvbG9yID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5wb2ludHNpemUgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gcG9pbnRzaXplIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBwb2ludHNpemUgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnBvaW50c3Ryb2tlID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHBvaW50c3Ryb2tlIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBwb2ludHN0cm9rZSA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueGxhYiA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB4bGFiIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB4bGFiID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC55bGFiID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHlsYWIgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHlsYWIgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lnh2YXIgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geHZhciBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeHZhciA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueXZhciA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB5dmFyIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB5dmFyID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC55c2NhbGUgPSAoKSAtPlxuICAgICAgcmV0dXJuIHlzY2FsZVxuXG4gICAgY2hhcnQueHNjYWxlID0gKCkgLT5cbiAgICAgIHJldHVybiB4c2NhbGVcblxuICAgIGNoYXJ0LnBvaW50c1NlbGVjdCA9ICgpIC0+XG4gICAgICByZXR1cm4gcG9pbnRzU2VsZWN0XG5cbiAgICBjaGFydC5sYWJlbHNTZWxlY3QgPSAoKSAtPlxuICAgICAgcmV0dXJuIGxhYmVsc1NlbGVjdFxuXG4gICAgY2hhcnQubGVnZW5kU2VsZWN0ID0gKCkgLT5cbiAgICAgIHJldHVybiBsZWdlbmRTZWxlY3RcblxuICAgICMgcmV0dXJuIHRoZSBjaGFydCBmdW5jdGlvblxuICAgIGNoYXJ0XG5cbiAgZ2V0U2NlbmFyaW9OYW1lID0gKHNjZW5hcmlvKSAtPlxuICAgIGZvciBkIGluIHNjZW5hcmlvXG4gICAgICBpZiBkLlRZUEUgPT0gXCJQQVwiXG4gICAgICAgIHJldHVybiBcIlBBIDI5NVwiXG4gICAgICBlbHNlIGlmIGQuVFlQRSA9PSBcIk5vUEFcIlxuICAgICAgICByZXR1cm4gXCJObyBQQSAyOTVcIlxuICAgICAgZWxzZSBpZiBkLlRZUEUgPT0gXCJEYmxQQVwiXG4gICAgICAgIHJldHVybiBcIkRvdWJsZSBQQSAyOTVcIlxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gXCJVc2VyIFNjZW5hcmlvXCJcblxuICBnZXRTdHJva2VDb2xvciA9IChzY2VuYXJpbykgLT5cbiAgICBwYWNvbG9yID0gXCIjOWFiYThjXCJcbiAgICBub3BhY29sb3IgPSBcIiNlNWNhY2VcIlxuICAgIGRibHBhY29sb3IgPSBcIiNiM2NmYTdcIlxuICAgIGZvciBkIGluIHNjZW5hcmlvXG4gICAgICBpZiBkLlRZUEUgPT0gXCJQQVwiXG4gICAgICAgIHJldHVybiAgcGFjb2xvclxuICAgICAgZWxzZSBpZiBkLlRZUEUgPT0gXCJOb1BBXCJcbiAgICAgICAgcmV0dXJuIG5vcGFjb2xvclxuICAgICAgZWxzZSBpZiBkLlRZUEUgPT0gXCJEYmxQQVwiXG4gICAgICAgIHJldHVybiBkYmxwYWNvbG9yXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBcImdyYXlcIlxuXG5cbiAgIyBmdW5jdGlvbiB0byBkZXRlcm1pbmUgcm91bmRpbmcgb2YgYXhpcyBsYWJlbHNcbiAgZm9ybWF0QXhpcyA9IChkKSAtPlxuICAgIGQgPSBkWzFdIC0gZFswXVxuICAgIG5kaWcgPSBNYXRoLmZsb29yKCBNYXRoLmxvZyhkICUgMTApIC8gTWF0aC5sb2coMTApIClcbiAgICBuZGlnID0gMCBpZiBuZGlnID4gMFxuICAgIG5kaWcgPSBNYXRoLmFicyhuZGlnKVxuICAgIGQzLmZvcm1hdChcIi4je25kaWd9ZlwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZXJneUNvbnN1bXB0aW9uVGFiIiwiUmVwb3J0VGFiID0gcmVxdWlyZSAncmVwb3J0VGFiJ1xudGVtcGxhdGVzID0gcmVxdWlyZSAnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcblxuX3BhcnRpYWxzID0gcmVxdWlyZSAnLi4vbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5wYXJ0aWFscyA9IFtdXG5mb3Iga2V5LCB2YWwgb2YgX3BhcnRpYWxzXG4gIHBhcnRpYWxzW2tleS5yZXBsYWNlKCdub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvJywgJycpXSA9IHZhbFxuXG5jbGFzcyBGdWVsQ29zdHNUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgIyB0aGlzIGlzIHRoZSBuYW1lIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFRhYlxuICBuYW1lOiAnRnVlbCBDb3N0cydcbiAgY2xhc3NOYW1lOiAnZnVlbENvc3RzJ1xuICB0aW1lb3V0OiAxMjAwMDBcbiAgdGVtcGxhdGU6IHRlbXBsYXRlcy5mdWVsQ29zdHNcbiAgZGVwZW5kZW5jaWVzOiBbXG4gICAgJ0VuZXJneVBsYW4nXG4gIF1cblxuICByZW5kZXI6ICgpIC0+XG4gICAgaWYgd2luZG93LmQzXG4gICAgICBkM0lzUHJlc2VudCA9IHRydWVcbiAgICBlbHNlXG4gICAgICBkM0lzUHJlc2VudCA9IGZhbHNlXG5cbiAgICBhdHRyaWJ1dGVzID0gQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuXG4gICAgdHJ5XG4gICAgICBjb21GQyA9IEBnZXRNYXAoQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21FQ1wiKS50b0FycmF5KCkpXG4gICAgICByZXNGQyA9IEBnZXRNYXAoQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFQ1wiKS50b0FycmF5KCkpXG5cbiAgICAgIGNvbUZDID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJDb21FQ1wiKS50b0FycmF5KClcbiAgICAgIGNvbV9wYSA9IEBnZXRNYXAoY29tRkMsIFwiUEFcIilcbiAgICAgIGNvbV9kYmxwYSA9IEBnZXRNYXAoY29tRkMsIFwiRGJsUEFcIilcbiAgICAgIGNvbV9ub3BhID0gQGdldE1hcChjb21GQywgXCJOb1BBXCIpXG4gICAgICBjb21fdXNlciA9IEBnZXRNYXAoY29tRkMsIFwiVVNFUlwiKVxuICAgICAgc29ydGVkX2NvbW1fcmVzdWx0cyA9IFtjb21fbm9wYSwgY29tX3BhLCBjb21fZGJscGFdXG5cbiAgICAgIHJlc0ZDID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNFVVwiKS50b0FycmF5KClcbiAgICAgIHJlc19wYSA9IEBnZXRNYXAocmVzRkMsIFwiUEFcIilcbiAgICAgIHJlc19kYmxwYSA9IEBnZXRNYXAocmVzRkMsIFwiRGJsUEFcIilcbiAgICAgIHJlc19ub3BhID0gQGdldE1hcChyZXNGQywgXCJOb1BBXCIpXG4gICAgICByZXNfdXNlciA9IEBnZXRNYXAocmVzRkMsIFwiVVNFUlwiKVxuICAgICAgc29ydGVkX3Jlc19yZXN1bHRzID0gW3Jlc19ub3BhLCByZXNfcGEsIHJlc19kYmxwYV1cbiAgICBjYXRjaCBlXG4gICAgICBjb25zb2xlLmxvZyhcImVycm9yOiBcIiwgZSlcblxuICAgIGNvbnRleHQgPVxuICAgICAgc2tldGNoOiBAbW9kZWwuZm9yVGVtcGxhdGUoKVxuICAgICAgc2tldGNoQ2xhc3M6IEBza2V0Y2hDbGFzcy5mb3JUZW1wbGF0ZSgpXG4gICAgICBhdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG4gICAgICBhbnlBdHRyaWJ1dGVzOiBAbW9kZWwuZ2V0QXR0cmlidXRlcygpLmxlbmd0aCA+IDBcbiAgICAgIGFkbWluOiBAcHJvamVjdC5pc0FkbWluIHdpbmRvdy51c2VyXG5cbiAgICAgIGQzSXNQcmVzZW50OiBkM0lzUHJlc2VudFxuXG4gICAgQCRlbC5odG1sIEB0ZW1wbGF0ZS5yZW5kZXIoY29udGV4dCwgcGFydGlhbHMpXG4gICAgQGVuYWJsZUxheWVyVG9nZ2xlcnMoKVxuICAgIGlmIHdpbmRvdy5kM1xuICAgICAgaCA9IDMyMFxuICAgICAgdyA9IDM4MFxuICAgICAgbWFyZ2luID0ge2xlZnQ6NDAsIHRvcDo1LCByaWdodDo0MCwgYm90dG9tOiA0MCwgaW5uZXI6NX1cbiAgICAgIGhhbGZoID0gKGgrbWFyZ2luLnRvcCttYXJnaW4uYm90dG9tKVxuICAgICAgdG90YWxoID0gaGFsZmgqMlxuICAgICAgaGFsZncgPSAodyttYXJnaW4ubGVmdCttYXJnaW4ucmlnaHQpXG4gICAgICB0b3RhbHcgPSBoYWxmdyoyXG4gICAgICBcbiAgICAgIGNvbV9jaGFydCA9IEBkcmF3Q2hhcnQoJy5jb21tZXJjaWFsRnVlbENvc3RzJykueHZhcigwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueXZhcigxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueGxhYihcIlllYXJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnlsYWIoXCJWYWx1ZSAoaW4gbWlsbGlvbiAkKVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC53aWR0aCh3KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFyZ2luKG1hcmdpbilcblxuICAgICAgY2ggPSBkMy5zZWxlY3QoQCQoJy5jb21tZXJjaWFsRnVlbENvc3RzJykpXG4gICAgICBjaC5kYXR1bShzb3J0ZWRfY29tbV9yZXN1bHRzKVxuICAgICAgICAuY2FsbChjb21fY2hhcnQpXG5cbiAgICAgIHJlc19jaGFydCA9IEBkcmF3Q2hhcnQoJy5yZXNpZGVudGlhbEZ1ZWxDb3N0cycpLnh2YXIoMClcbiAgICAgICAgICAgICAgICAgICAgIC55dmFyKDEpXG4gICAgICAgICAgICAgICAgICAgICAueGxhYihcIlllYXJcIilcbiAgICAgICAgICAgICAgICAgICAgIC55bGFiKFwiVmFsdWUgKGluIG1pbGxpb24gJClcIilcbiAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoaClcbiAgICAgICAgICAgICAgICAgICAgIC53aWR0aCh3KVxuICAgICAgICAgICAgICAgICAgICAgLm1hcmdpbihtYXJnaW4pXG5cbiAgICAgIGNoID0gZDMuc2VsZWN0KEAkKCcucmVzaWRlbnRpYWxGdWVsQ29zdHMnKSlcbiAgICAgIGNoLmRhdHVtKHNvcnRlZF9yZXNfcmVzdWx0cylcbiAgICAgICAgLmNhbGwocmVzX2NoYXJ0KVxuXG5cblxuICBnZXRNYXA6IChyZWNTZXQsIHNjZW5hcmlvKSAtPlxuICAgIHNjZW5hcmlvX3ZhbHVlcyA9IFtdXG4gICAgZm9yIHJlYyBpbiByZWNTZXRcbiAgICAgIGlmIHJlYy5UWVBFID09IHNjZW5hcmlvXG4gICAgICAgIHNjZW5hcmlvX3ZhbHVlcy5wdXNoKHJlYylcblxuICAgIHJldHVybiBfLnNvcnRCeSBzY2VuYXJpb192YWx1ZXMsIChyb3cpIC0+IHJvd1snWUVBUiddXG5cbiAgZHJhd0NoYXJ0OiAod2hpY2hDaGFydCkgPT5cbiAgICB2aWV3ID0gQFxuICAgIHdpZHRoID0gMzYwXG4gICAgaGVpZ2h0ID0gNTAwXG4gICAgbWFyZ2luID0ge2xlZnQ6NDAsIHRvcDo1LCByaWdodDoyMCwgYm90dG9tOiA0MCwgaW5uZXI6MTB9XG4gICAgYXhpc3BvcyA9IHt4dGl0bGU6NSwgeXRpdGxlOjMwLCB4bGFiZWw6NSwgeWxhYmVsOjE1fVxuICAgIHhsaW0gPSBudWxsXG4gICAgeWxpbSA9IG51bGxcbiAgICBueHRpY2tzID0gNVxuICAgIHh0aWNrcyA9IG51bGxcbiAgICBueXRpY2tzID0gNVxuICAgIHl0aWNrcyA9IG51bGxcbiAgICB5YXhpc19zY2FsZXIgPSAxMDAwMDAwXG5cbiAgICByZWN0Y29sb3IgPSBcIiNkYmU0ZWVcIlxuICAgIHRpY2tjb2xvciA9IFwiI2RiZTRmZlwiXG5cblxuICAgIHBvaW50c2l6ZSA9IDEgIyBkZWZhdWx0ID0gbm8gdmlzaWJsZSBwb2ludHMgYXQgbWFya2Vyc1xuICAgIHhsYWIgPSBcIlhcIlxuICAgIHlsYWIgPSBcIlkgc2NvcmVcIlxuICAgIHlzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgeHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblxuICAgIGxlZ2VuZGhlaWdodCA9IDMwMFxuICAgIHBvaW50c1NlbGVjdCA9IG51bGxcbiAgICBsYWJlbHNTZWxlY3QgPSBudWxsXG4gICAgbGVnZW5kU2VsZWN0ID0gbnVsbFxuICAgICMjIHRoZSBtYWluIGZ1bmN0aW9uXG4gICAgY2hhcnQgPSAoc2VsZWN0aW9uKSAtPlxuICAgICAgc2VsZWN0aW9uLmVhY2ggKGRhdGEpIC0+XG4gICAgICAgIHkgPSBbXVxuICAgICAgICB4ID0gWzIwMTIsIDIwMTUsIDIwMjAsIDIwMjUsIDIwMzAsIDIwMzVdXG4gICAgICAgXG4gICAgICAgIGZvciBzY2VuIGluIGRhdGFcbiAgICAgICAgICBmb3IgZCBpbiBzY2VuXG4gICAgICAgICAgICB5LnB1c2goZC5WQUxVRS95YXhpc19zY2FsZXIpXG5cblxuICAgICAgICAjeCA9IGRhdGEubWFwIChkKSAtPiBwYXJzZUZsb2F0KGQuWUVBUilcbiAgICAgICAgI3kgPSBkYXRhLm1hcCAoZCkgLT4gcGFyc2VGbG9hdChkLlZBTFVFKVxuXG5cbiAgICAgICAgcGFuZWxvZmZzZXQgPSAxMFxuICAgICAgICBwYW5lbHdpZHRoID0gd2lkdGhcblxuICAgICAgICBwYW5lbGhlaWdodCA9IGhlaWdodFxuXG4gICAgICAgIHhsaW0gPSBbZDMubWluKHgpLTEsIHBhcnNlRmxvYXQoZDMubWF4KHgpKzEpXSBpZiAhKHhsaW0/KVxuXG4gICAgICAgIHlsaW0gPSBbZDMubWluKHkpLCBwYXJzZUZsb2F0KGQzLm1heCh5KSldIGlmICEoeWxpbT8pXG5cblxuICAgICAgICBjdXJyZWxlbSA9IGQzLnNlbGVjdCh2aWV3LiQod2hpY2hDaGFydClbMF0pXG4gICAgICAgIHN2ZyA9IGQzLnNlbGVjdCh2aWV3LiQod2hpY2hDaGFydClbMF0pLmFwcGVuZChcInN2Z1wiKS5kYXRhKFtkYXRhXSlcbiAgICAgICAgc3ZnLmFwcGVuZChcImdcIilcblxuICAgICAgICAjIFVwZGF0ZSB0aGUgb3V0ZXIgZGltZW5zaW9ucy5cbiAgICAgICAgc3ZnLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCttYXJnaW4ubGVmdCttYXJnaW4ucmlnaHQpXG4gICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCttYXJnaW4udG9wK21hcmdpbi5ib3R0b20rZGF0YS5sZW5ndGgqMzUpXG5cbiAgICAgICAgZyA9IHN2Zy5zZWxlY3QoXCJnXCIpXG5cbiAgICAgICAgIyBib3hcbiAgICAgICAgZy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAuYXR0cihcInhcIiwgcGFuZWxvZmZzZXQrbWFyZ2luLmxlZnQpXG4gICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLnRvcClcbiAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHBhbmVsaGVpZ2h0KVxuICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBwYW5lbHdpZHRoKVxuICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwid2hpdGVcIilcbiAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwibm9uZVwiKVxuXG5cbiAgICAgICAgIyBzaW1wbGUgc2NhbGVzIChpZ25vcmUgTkEgYnVzaW5lc3MpXG4gICAgICAgIHhyYW5nZSA9IFttYXJnaW4ubGVmdCtwYW5lbG9mZnNldCttYXJnaW4uaW5uZXIsIG1hcmdpbi5sZWZ0K3BhbmVsb2Zmc2V0K3BhbmVsd2lkdGgtbWFyZ2luLmlubmVyXVxuICAgICAgICB5cmFuZ2UgPSBbbWFyZ2luLnRvcCtwYW5lbGhlaWdodC1tYXJnaW4uaW5uZXIsIG1hcmdpbi50b3ArbWFyZ2luLmlubmVyXVxuICAgICAgICB4c2NhbGUuZG9tYWluKHhsaW0pLnJhbmdlKHhyYW5nZSlcbiAgICAgICAgeXNjYWxlLmRvbWFpbih5bGltKS5yYW5nZSh5cmFuZ2UpXG4gICAgICAgIHhzID0gZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKHhsaW0pLnJhbmdlKHhyYW5nZSlcbiAgICAgICAgeXMgPSBkMy5zY2FsZS5saW5lYXIoKS5kb21haW4oeWxpbSkucmFuZ2UoeXJhbmdlKVxuXG5cbiAgICAgICAgIyBpZiB5dGlja3Mgbm90IHByb3ZpZGVkLCB1c2Ugbnl0aWNrcyB0byBjaG9vc2UgcHJldHR5IG9uZXNcbiAgICAgICAgeXRpY2tzID0geXMudGlja3Mobnl0aWNrcykgaWYgISh5dGlja3M/KVxuICAgICAgICB4dGlja3MgPSB4cy50aWNrcyhueHRpY2tzKSBpZiAhKHh0aWNrcz8pXG5cbiAgICAgICAgIyB4LWF4aXNcbiAgICAgICAgeGF4aXMgPSBnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwieCBheGlzXCIpXG4gICAgICAgIHhheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoeHRpY2tzKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAuYXR0cihcIngxXCIsIChkKSAtPiB4c2NhbGUoZCkpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCAoZCkgLT4geHNjYWxlKGQpKVxuICAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgbWFyZ2luLnRvcCtoZWlnaHQtNSlcbiAgICAgICAgICAgICAuYXR0cihcInkyXCIsIG1hcmdpbi50b3AraGVpZ2h0KVxuICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpXG4gICAgICAgICAgICAgLnN0eWxlKFwicG9pbnRlci1ldmVudHNcIiwgXCJub25lXCIpXG4gICAgICAgICN0aGUgeCBheGlzIHllYXIgbGFiZWxzXG4gICAgICAgIHhheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoeHRpY2tzKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAuYXR0cihcInhcIiwgKGQpIC0+IHhzY2FsZShkKS0xNClcbiAgICAgICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLnRvcCtoZWlnaHQrYXhpc3Bvcy54bGFiZWwrMTApXG4gICAgICAgICAgICAgLnRleHQoKGQpIC0+IGZvcm1hdEF4aXMoeHRpY2tzKShkKSlcbiAgICAgICAgI3RoZSB4IGF4aXMgdGl0bGVcbiAgICAgICAgeGF4aXMuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ4YXhpcy10aXRsZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBtYXJnaW4ubGVmdCt3aWR0aC8yKVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wK2hlaWdodCtheGlzcG9zLnh0aXRsZSszMClcbiAgICAgICAgICAgICAudGV4dCh4bGFiKVxuXG4gICAgICAgICNkcmF3IHRoZSBsZWdlbmRcbiAgICAgICAgZm9yIHNjZW5hcmlvLCBjbnQgaW4gZGF0YVxuICAgICAgICAgIGxpbmVfY29sb3IgPSBnZXRTdHJva2VDb2xvcihzY2VuYXJpbylcbiAgICAgICAgICB4YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKFtzY2VuYXJpb1swXV0pXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwibGluZVwiKVxuXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCAoZCxpKSAtPiByZXR1cm4gbWFyZ2luLmxlZnQpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCAoZCxpKSAtPiByZXR1cm4gbWFyZ2luLmxlZnQrMTApXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCAoZCxpKSAtPiBtYXJnaW4udG9wK2hlaWdodCtheGlzcG9zLnh0aXRsZSsoKGNudCsxKSozMCkrNilcbiAgICAgICAgICAgICAuYXR0cihcInkyXCIsIChkLGkpIC0+IG1hcmdpbi50b3AraGVpZ2h0K2F4aXNwb3MueHRpdGxlKygoY250KzEpKjMwKSs2KVxuICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJjaGFydC1saW5lXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgKGQsaSkgLT4gbGluZV9jb2xvcilcbiAgICAgICAgICAgICAuYXR0cihcImNvbG9yXCIsIChkLGkpIC0+IGxpbmVfY29sb3IpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMylcblxuICAgICAgICAjYW5kIHRoZSBsZWdlbmQgdGV4dFxuICAgICAgICBmb3Igc2NlbmFyaW8sIGNudCBpbiBkYXRhICAgICAgICAgIFxuICAgICAgICAgIHhheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoW3NjZW5hcmlvWzBdXSlcbiAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxlZ2VuZC10ZXh0XCIpXG4gICAgICAgICAgIC5hdHRyKFwieFwiLCAoZCxpKSAtPlxuICAgICAgICAgICAgICByZXR1cm4gKG1hcmdpbi5sZWZ0KzE3KSlcbiAgICAgICAgICAgLmF0dHIoXCJ5XCIsIChkLGkpIC0+XG4gICAgICAgICAgICAgIG1hcmdpbi50b3AraGVpZ2h0KzEwK2F4aXNwb3MueHRpdGxlKygoY250KzEpKjMwKSlcbiAgICAgICAgICAgLnRleHQoKGQsaSkgLT4gcmV0dXJuIGdldFNjZW5hcmlvTmFtZShbZF0pKVxuXG4gICAgICAgICMgeS1heGlzXG4gICAgICAgIHlheGlzID0gZy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInkgYXhpc1wiKVxuICAgICAgICB5YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKHl0aWNrcylcbiAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgIC5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCAoZCkgLT4geXNjYWxlKGQpKVxuICAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgKGQpIC0+IHlzY2FsZShkKSlcbiAgICAgICAgICAgICAuYXR0cihcIngxXCIsIG1hcmdpbi5sZWZ0KzEwKVxuICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgbWFyZ2luLmxlZnQrMTUpXG4gICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxuICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCB0aWNrY29sb3IpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSlcbiAgICAgICAgICAgICAuc3R5bGUoXCJwb2ludGVyLWV2ZW50c1wiLCBcIm5vbmVcIilcbiAgICAgICAgeWF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YSh5dGlja3MpXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCAoZCkgLT4geXNjYWxlKGQpKzMpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIG1hcmdpbi5sZWZ0KzMtYXhpc3Bvcy55bGFiZWwpXG4gICAgICAgICAgICAgLnRleHQoKGQpIC0+IGZvcm1hdEF4aXMoeXRpY2tzKShkKSlcbiAgICAgICAgeWF4aXMuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ0aXRsZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wKzM1K2hlaWdodC8yKVxuICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBtYXJnaW4ubGVmdCs4LWF4aXNwb3MueXRpdGxlKVxuICAgICAgICAgICAgIC50ZXh0KHlsYWIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoMjcwLCN7bWFyZ2luLmxlZnQrOC1heGlzcG9zLnl0aXRsZX0sI3ttYXJnaW4udG9wKzM1K2hlaWdodC8yfSlcIilcblxuICAgICAgICBwb2ludHMgPSBnLmFwcGVuZChcImdcIikuYXR0cihcImlkXCIsIFwicG9pbnRzXCIpXG5cblxuICAgICAgICBsaW5lID0gZDMuc3ZnLmxpbmUoZClcbiAgICAgICAgICAgIC5pbnRlcnBvbGF0ZShcImJhc2lzXCIpXG4gICAgICAgICAgICAueCggKGQpIC0+IHhzY2FsZShwYXJzZUludChkLllFQVIpKSlcbiAgICAgICAgICAgIC55KCAoZCkgLT4geXNjYWxlKGQuVkFMVUUveWF4aXNfc2NhbGVyKSlcblxuXG4gICAgICAgIHBvaW50cy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKFwicGF0aFwiKVxuICAgICAgICAgIC5hdHRyKFwiZFwiLCAoZCkgLT4gbGluZSBkKVxuICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIChkKSAtPiBnZXRTdHJva2VDb2xvcihkKSlcbiAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAzKVxuICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIilcblxuICAgICAgICAjIGJveFxuICAgICAgICBnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBtYXJnaW4ubGVmdCtwYW5lbG9mZnNldClcbiAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgcGFuZWxoZWlnaHQpXG4gICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHBhbmVsd2lkdGgpXG4gICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG4gICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcImJsYWNrXCIpXG4gICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCBcIm5vbmVcIilcblxuXG5cbiAgICAjIyBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnNcblxuXG4gICAgY2hhcnQud2lkdGggPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gd2lkdGggaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHdpZHRoID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5oZWlnaHQgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gaGVpZ2h0IGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBoZWlnaHQgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lm1hcmdpbiA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBtYXJnaW4gaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIG1hcmdpbiA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQuYXhpc3BvcyA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBheGlzcG9zIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBheGlzcG9zID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC54bGltID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHhsaW0gaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHhsaW0gPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lm54dGlja3MgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gbnh0aWNrcyBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgbnh0aWNrcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueHRpY2tzID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHh0aWNrcyBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeHRpY2tzID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC55bGltID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHlsaW0gaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHlsaW0gPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lm55dGlja3MgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gbnl0aWNrcyBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgbnl0aWNrcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueXRpY2tzID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHl0aWNrcyBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeXRpY2tzID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5yZWN0Y29sb3IgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gcmVjdGNvbG9yIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICByZWN0Y29sb3IgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnBvaW50Y29sb3IgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gcG9pbnRjb2xvciBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgcG9pbnRjb2xvciA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQucG9pbnRzaXplID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHBvaW50c2l6ZSBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgcG9pbnRzaXplID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5wb2ludHN0cm9rZSA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBwb2ludHN0cm9rZSBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgcG9pbnRzdHJva2UgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnhsYWIgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geGxhYiBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeGxhYiA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueWxhYiA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB5bGFiIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB5bGFiID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC54dmFyID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHh2YXIgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHh2YXIgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lnl2YXIgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geXZhciBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeXZhciA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueXNjYWxlID0gKCkgLT5cbiAgICAgIHJldHVybiB5c2NhbGVcblxuICAgIGNoYXJ0LnhzY2FsZSA9ICgpIC0+XG4gICAgICByZXR1cm4geHNjYWxlXG5cbiAgICBjaGFydC5wb2ludHNTZWxlY3QgPSAoKSAtPlxuICAgICAgcmV0dXJuIHBvaW50c1NlbGVjdFxuXG4gICAgY2hhcnQubGFiZWxzU2VsZWN0ID0gKCkgLT5cbiAgICAgIHJldHVybiBsYWJlbHNTZWxlY3RcblxuICAgIGNoYXJ0LmxlZ2VuZFNlbGVjdCA9ICgpIC0+XG4gICAgICByZXR1cm4gbGVnZW5kU2VsZWN0XG5cbiAgICAjIHJldHVybiB0aGUgY2hhcnQgZnVuY3Rpb25cbiAgICBjaGFydFxuXG4gIGdldFNjZW5hcmlvTmFtZSA9IChzY2VuYXJpbykgLT5cbiAgICBmb3IgZCBpbiBzY2VuYXJpb1xuICAgICAgaWYgZC5UWVBFID09IFwiUEFcIlxuICAgICAgICByZXR1cm4gXCJQQSAyOTVcIlxuICAgICAgZWxzZSBpZiBkLlRZUEUgPT0gXCJOb1BBXCJcbiAgICAgICAgcmV0dXJuIFwiTm8gUEEgMjk1XCJcbiAgICAgIGVsc2UgaWYgZC5UWVBFID09IFwiRGJsUEFcIlxuICAgICAgICByZXR1cm4gXCJEb3VibGUgUEEgMjk1XCJcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIFwiVXNlciBTY2VuYXJpb1wiXG5cbiAgZ2V0U3Ryb2tlQ29sb3IgPSAoc2NlbmFyaW8pIC0+XG4gICAgcGFjb2xvciA9IFwiIzlhYmE4Y1wiXG4gICAgbm9wYWNvbG9yID0gXCIjZTVjYWNlXCJcbiAgICBkYmxwYWNvbG9yID0gXCIjYjNjZmE3XCJcbiAgICBmb3IgZCBpbiBzY2VuYXJpb1xuICAgICAgaWYgZC5UWVBFID09IFwiUEFcIlxuICAgICAgICByZXR1cm4gIHBhY29sb3JcbiAgICAgIGVsc2UgaWYgZC5UWVBFID09IFwiTm9QQVwiXG4gICAgICAgIHJldHVybiBub3BhY29sb3JcbiAgICAgIGVsc2UgaWYgZC5UWVBFID09IFwiRGJsUEFcIlxuICAgICAgICByZXR1cm4gZGJscGFjb2xvclxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gXCJncmF5XCJcblxuXG4gICMgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIHJvdW5kaW5nIG9mIGF4aXMgbGFiZWxzXG4gIGZvcm1hdEF4aXMgPSAoZCkgLT5cbiAgICBkID0gZFsxXSAtIGRbMF1cbiAgICBuZGlnID0gTWF0aC5mbG9vciggTWF0aC5sb2coZCAlIDEwKSAvIE1hdGgubG9nKDEwKSApXG4gICAgbmRpZyA9IDAgaWYgbmRpZyA+IDBcbiAgICBuZGlnID0gTWF0aC5hYnMobmRpZylcbiAgICBkMy5mb3JtYXQoXCIuI3tuZGlnfWZcIilcblxubW9kdWxlLmV4cG9ydHMgPSBGdWVsQ29zdHNUYWIiLCJSZXBvcnRUYWIgPSByZXF1aXJlICdyZXBvcnRUYWInXG50ZW1wbGF0ZXMgPSByZXF1aXJlICcuLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xuXG5fcGFydGlhbHMgPSByZXF1aXJlICcuLi9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcydcbnBhcnRpYWxzID0gW11cbmZvciBrZXksIHZhbCBvZiBfcGFydGlhbHNcbiAgcGFydGlhbHNba2V5LnJlcGxhY2UoJ25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS8nLCAnJyldID0gdmFsXG5cbmNsYXNzIEdyZWVuaG91c2VHYXNlc1RhYiBleHRlbmRzIFJlcG9ydFRhYlxuICAjIHRoaXMgaXMgdGhlIG5hbWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgVGFiXG4gIG5hbWU6ICdHcmVlbmhvdXNlIEdhc2VzJ1xuICBjbGFzc05hbWU6ICdncmVlbmhvdXNlR2FzZXMnXG4gIHRpbWVvdXQ6IDEyMDAwMFxuICB0ZW1wbGF0ZTogdGVtcGxhdGVzLmdyZWVuaG91c2VHYXNlc1xuICBkZXBlbmRlbmNpZXM6IFtcbiAgICAnRW5lcmd5UGxhbidcbiAgXVxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGQzSXNQcmVzZW50ID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGQzSXNQcmVzZW50ID0gZmFsc2VcblxuICAgIGF0dHJpYnV0ZXMgPSBAbW9kZWwuZ2V0QXR0cmlidXRlcygpXG5cbiAgICB0cnlcbiAgICAgIGNvbUdIRyA9IEByZWNvcmRTZXQoXCJFbmVyZ3lQbGFuXCIsIFwiQ29tR0hHXCIpLnRvQXJyYXkoKVxuICAgICAgcmVzR0hHID0gQHJlY29yZFNldChcIkVuZXJneVBsYW5cIiwgXCJSZXNHSEdcIikudG9BcnJheSgpXG5cbiAgICAgIGNvbV9wYSA9IEBnZXRNYXAoY29tR0hHLCBcIlBBXCIpXG4gICAgICBjb21fZGJscGEgPSBAZ2V0TWFwKGNvbUdIRywgXCJEYmxQQVwiKVxuICAgICAgY29tX25vcGEgPSBAZ2V0TWFwKGNvbUdIRywgXCJOb1BBXCIpXG4gICAgICBjb21fdXNlciA9IEBnZXRNYXAoY29tR0hHLCBcIlVTRVJcIilcbiAgICAgIHNvcnRlZF9jb21tX3Jlc3VsdHMgPSBbY29tX25vcGEsIGNvbV9wYSwgY29tX2RibHBhXVxuXG4gICAgICByZXNfcGEgPSBAZ2V0TWFwKHJlc0dIRywgXCJQQVwiKVxuICAgICAgcmVzX2RibHBhID0gQGdldE1hcChyZXNHSEcsIFwiRGJsUEFcIilcbiAgICAgIHJlc19ub3BhID0gQGdldE1hcChyZXNHSEcsIFwiTm9QQVwiKVxuICAgICAgcmVzX3VzZXIgPSBAZ2V0TWFwKHJlc0dIRywgXCJVU0VSXCIpXG4gICAgICBzb3J0ZWRfcmVzX3Jlc3VsdHMgPSBbcmVzX25vcGEsIHJlc19wYSwgcmVzX2RibHBhXVxuXG4gICAgY2F0Y2ggZVxuICAgICAgY29uc29sZS5sb2coXCJlcnJvcjogXCIsIGUpXG5cbiAgICBjb250ZXh0ID1cbiAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgYW55QXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKS5sZW5ndGggPiAwXG4gICAgICBhZG1pbjogQHByb2plY3QuaXNBZG1pbiB3aW5kb3cudXNlclxuXG4gICAgICBkM0lzUHJlc2VudDogZDNJc1ByZXNlbnRcblxuICAgIEAkZWwuaHRtbCBAdGVtcGxhdGUucmVuZGVyKGNvbnRleHQsIHBhcnRpYWxzKVxuICAgIEBlbmFibGVMYXllclRvZ2dsZXJzKClcbiAgICBpZiB3aW5kb3cuZDNcbiAgICAgIGggPSAzMjBcbiAgICAgIHcgPSAzODBcbiAgICAgIG1hcmdpbiA9IHtsZWZ0OjQwLCB0b3A6NSwgcmlnaHQ6NDAsIGJvdHRvbTogNDAsIGlubmVyOjV9XG4gICAgICBoYWxmaCA9IChoK21hcmdpbi50b3ArbWFyZ2luLmJvdHRvbSlcbiAgICAgIHRvdGFsaCA9IGhhbGZoKjJcbiAgICAgIGhhbGZ3ID0gKHcrbWFyZ2luLmxlZnQrbWFyZ2luLnJpZ2h0KVxuICAgICAgdG90YWx3ID0gaGFsZncqMlxuICAgICAgXG5cbiAgICAgIGNvbV9jaGFydCA9IEBkcmF3Q2hhcnQoJy5jb21tZXJjaWFsR3JlZW5ob3VzZUdhc2VzJykueHZhcigwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueXZhcigxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAueGxhYihcIlllYXJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnlsYWIoXCJWYWx1ZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC53aWR0aCh3KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFyZ2luKG1hcmdpbilcblxuICAgICAgY2ggPSBkMy5zZWxlY3QoQCQoJy5jb21tZXJjaWFsR3JlZW5ob3VzZUdhc2VzJykpXG4gICAgICBjaC5kYXR1bShzb3J0ZWRfY29tbV9yZXN1bHRzKVxuICAgICAgICAuY2FsbChjb21fY2hhcnQpXG5cbiAgICAgIHJlc19jaGFydCA9IEBkcmF3Q2hhcnQoJy5yZXNpZGVudGlhbEdyZWVuaG91c2VHYXNlcycpLnh2YXIoMClcbiAgICAgICAgICAgICAgICAgICAgIC55dmFyKDEpXG4gICAgICAgICAgICAgICAgICAgICAueGxhYihcIlllYXJcIilcbiAgICAgICAgICAgICAgICAgICAgIC55bGFiKFwiVmFsdWVcIilcbiAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoaClcbiAgICAgICAgICAgICAgICAgICAgIC53aWR0aCh3KVxuICAgICAgICAgICAgICAgICAgICAgLm1hcmdpbihtYXJnaW4pXG5cbiAgICAgIGNoID0gZDMuc2VsZWN0KEAkKCcucmVzaWRlbnRpYWxHcmVlbmhvdXNlR2FzZXMnKSlcbiAgICAgIGNoLmRhdHVtKHNvcnRlZF9yZXNfcmVzdWx0cylcbiAgICAgICAgLmNhbGwocmVzX2NoYXJ0KVxuXG5cblxuICBnZXRNYXA6IChyZWNTZXQsIHNjZW5hcmlvKSAtPlxuICAgIHNjZW5hcmlvX3ZhbHVlcyA9IFtdXG4gICAgZm9yIHJlYyBpbiByZWNTZXRcbiAgICAgIGlmIHJlYy5UWVBFID09IHNjZW5hcmlvXG4gICAgICAgIHNjZW5hcmlvX3ZhbHVlcy5wdXNoKHJlYylcblxuICAgIHJldHVybiBfLnNvcnRCeSBzY2VuYXJpb192YWx1ZXMsIChyb3cpIC0+IHJvd1snWUVBUiddXG5cbiAgZHJhd0NoYXJ0OiAod2hpY2hDaGFydCkgPT5cbiAgICB2aWV3ID0gQFxuICAgIHdpZHRoID0gMzYwXG4gICAgaGVpZ2h0ID0gNTAwXG4gICAgbWFyZ2luID0ge2xlZnQ6NDAsIHRvcDo1LCByaWdodDoyMCwgYm90dG9tOiA0MCwgaW5uZXI6MTB9XG4gICAgYXhpc3BvcyA9IHt4dGl0bGU6NSwgeXRpdGxlOjMwLCB4bGFiZWw6NSwgeWxhYmVsOjE1fVxuICAgIHhsaW0gPSBudWxsXG4gICAgeWxpbSA9IG51bGxcbiAgICBueHRpY2tzID0gNVxuICAgIHh0aWNrcyA9IG51bGxcbiAgICBueXRpY2tzID0gNVxuICAgIHl0aWNrcyA9IG51bGxcbiAgICB5YXhpc19zY2FsZXIgPSAxMDAwMDBcblxuICAgIHJlY3Rjb2xvciA9IFwiI2RiZTRlZVwiXG4gICAgdGlja2NvbG9yID0gXCIjZGJlNGZmXCJcblxuXG4gICAgcG9pbnRzaXplID0gMSAjIGRlZmF1bHQgPSBubyB2aXNpYmxlIHBvaW50cyBhdCBtYXJrZXJzXG4gICAgeGxhYiA9IFwiWFwiXG4gICAgeWxhYiA9IFwiWSBzY29yZVwiXG4gICAgeXNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcbiAgICB4c2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXG4gICAgbGVnZW5kaGVpZ2h0ID0gMzAwXG4gICAgcG9pbnRzU2VsZWN0ID0gbnVsbFxuICAgIGxhYmVsc1NlbGVjdCA9IG51bGxcbiAgICBsZWdlbmRTZWxlY3QgPSBudWxsXG4gICAgIyMgdGhlIG1haW4gZnVuY3Rpb25cbiAgICBjaGFydCA9IChzZWxlY3Rpb24pIC0+XG4gICAgICBzZWxlY3Rpb24uZWFjaCAoZGF0YSkgLT5cbiAgICAgICAgeSA9IFtdXG4gICAgICAgIHggPSBbMjAxMiwgMjAxNSwgMjAyMCwgMjAyNSwgMjAzMCwgMjAzNV1cbiAgICAgICBcbiAgICAgICAgZm9yIHNjZW4gaW4gZGF0YVxuICAgICAgICAgIGZvciBkIGluIHNjZW5cbiAgICAgICAgICAgIHkucHVzaChkLlZBTFVFL3lheGlzX3NjYWxlcilcblxuXG4gICAgICAgICN4ID0gZGF0YS5tYXAgKGQpIC0+IHBhcnNlRmxvYXQoZC5ZRUFSKVxuICAgICAgICAjeSA9IGRhdGEubWFwIChkKSAtPiBwYXJzZUZsb2F0KGQuVkFMVUUpXG5cblxuICAgICAgICBwYW5lbG9mZnNldCA9IDEwXG4gICAgICAgIHBhbmVsd2lkdGggPSB3aWR0aFxuXG4gICAgICAgIHBhbmVsaGVpZ2h0ID0gaGVpZ2h0XG5cbiAgICAgICAgeGxpbSA9IFtkMy5taW4oeCktMSwgcGFyc2VGbG9hdChkMy5tYXgoeCkrMSldIGlmICEoeGxpbT8pXG5cbiAgICAgICAgeWxpbSA9IFtkMy5taW4oeSksIHBhcnNlRmxvYXQoZDMubWF4KHkpKV0gaWYgISh5bGltPylcblxuXG4gICAgICAgIGN1cnJlbGVtID0gZDMuc2VsZWN0KHZpZXcuJCh3aGljaENoYXJ0KVswXSlcbiAgICAgICAgc3ZnID0gZDMuc2VsZWN0KHZpZXcuJCh3aGljaENoYXJ0KVswXSkuYXBwZW5kKFwic3ZnXCIpLmRhdGEoW2RhdGFdKVxuICAgICAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuXG4gICAgICAgICMgVXBkYXRlIHRoZSBvdXRlciBkaW1lbnNpb25zLlxuICAgICAgICBzdmcuYXR0cihcIndpZHRoXCIsIHdpZHRoK21hcmdpbi5sZWZ0K21hcmdpbi5yaWdodClcbiAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0K21hcmdpbi50b3ArbWFyZ2luLmJvdHRvbStkYXRhLmxlbmd0aCozNSlcblxuICAgICAgICBnID0gc3ZnLnNlbGVjdChcImdcIilcblxuICAgICAgICAjIGJveFxuICAgICAgICBnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgIC5hdHRyKFwieFwiLCBwYW5lbG9mZnNldCttYXJnaW4ubGVmdClcbiAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wKVxuICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgcGFuZWxoZWlnaHQpXG4gICAgICAgICAuYXR0cihcIndpZHRoXCIsIHBhbmVsd2lkdGgpXG4gICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKVxuICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJub25lXCIpXG5cblxuICAgICAgICAjIHNpbXBsZSBzY2FsZXMgKGlnbm9yZSBOQSBidXNpbmVzcylcbiAgICAgICAgeHJhbmdlID0gW21hcmdpbi5sZWZ0K3BhbmVsb2Zmc2V0K21hcmdpbi5pbm5lciwgbWFyZ2luLmxlZnQrcGFuZWxvZmZzZXQrcGFuZWx3aWR0aC1tYXJnaW4uaW5uZXJdXG4gICAgICAgIHlyYW5nZSA9IFttYXJnaW4udG9wK3BhbmVsaGVpZ2h0LW1hcmdpbi5pbm5lciwgbWFyZ2luLnRvcCttYXJnaW4uaW5uZXJdXG4gICAgICAgIHhzY2FsZS5kb21haW4oeGxpbSkucmFuZ2UoeHJhbmdlKVxuICAgICAgICB5c2NhbGUuZG9tYWluKHlsaW0pLnJhbmdlKHlyYW5nZSlcbiAgICAgICAgeHMgPSBkMy5zY2FsZS5saW5lYXIoKS5kb21haW4oeGxpbSkucmFuZ2UoeHJhbmdlKVxuICAgICAgICB5cyA9IGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbih5bGltKS5yYW5nZSh5cmFuZ2UpXG5cblxuICAgICAgICAjIGlmIHl0aWNrcyBub3QgcHJvdmlkZWQsIHVzZSBueXRpY2tzIHRvIGNob29zZSBwcmV0dHkgb25lc1xuICAgICAgICB5dGlja3MgPSB5cy50aWNrcyhueXRpY2tzKSBpZiAhKHl0aWNrcz8pXG4gICAgICAgIHh0aWNrcyA9IHhzLnRpY2tzKG54dGlja3MpIGlmICEoeHRpY2tzPylcblxuICAgICAgICAjIHgtYXhpc1xuICAgICAgICB4YXhpcyA9IGcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJ4IGF4aXNcIilcbiAgICAgICAgeGF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YSh4dGlja3MpXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwibGluZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgKGQpIC0+IHhzY2FsZShkKSlcbiAgICAgICAgICAgICAuYXR0cihcIngyXCIsIChkKSAtPiB4c2NhbGUoZCkpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCBtYXJnaW4udG9wK2hlaWdodC01KVxuICAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgbWFyZ2luLnRvcCtoZWlnaHQpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSlcbiAgICAgICAgICAgICAuc3R5bGUoXCJwb2ludGVyLWV2ZW50c1wiLCBcIm5vbmVcIilcbiAgICAgICAgI3RoZSB4IGF4aXMgeWVhciBsYWJlbHNcbiAgICAgICAgeGF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YSh4dGlja3MpXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieFwiLCAoZCkgLT4geHNjYWxlKGQpLTE0KVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wK2hlaWdodCtheGlzcG9zLnhsYWJlbCsxMClcbiAgICAgICAgICAgICAudGV4dCgoZCkgLT4gZm9ybWF0QXhpcyh4dGlja3MpKGQpKVxuICAgICAgICAjdGhlIHggYXhpcyB0aXRsZVxuICAgICAgICB4YXhpcy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcInhheGlzLXRpdGxlXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIG1hcmdpbi5sZWZ0K3dpZHRoLzIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIG1hcmdpbi50b3AraGVpZ2h0K2F4aXNwb3MueHRpdGxlKzMwKVxuICAgICAgICAgICAgIC50ZXh0KHhsYWIpXG5cbiAgICAgICAgI2RyYXcgdGhlIGxlZ2VuZFxuICAgICAgICBmb3Igc2NlbmFyaW8sIGNudCBpbiBkYXRhXG4gICAgICAgICAgbGluZV9jb2xvciA9IGdldFN0cm9rZUNvbG9yKHNjZW5hcmlvKVxuICAgICAgICAgIHhheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoW3NjZW5hcmlvWzBdXSlcbiAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgIC5hcHBlbmQoXCJsaW5lXCIpXG5cbiAgICAgICAgICAgICAuYXR0cihcIngxXCIsIChkLGkpIC0+IHJldHVybiBtYXJnaW4ubGVmdClcbiAgICAgICAgICAgICAuYXR0cihcIngyXCIsIChkLGkpIC0+IHJldHVybiBtYXJnaW4ubGVmdCsxMClcbiAgICAgICAgICAgICAuYXR0cihcInkxXCIsIChkLGkpIC0+IG1hcmdpbi50b3AraGVpZ2h0K2F4aXNwb3MueHRpdGxlKygoY250KzEpKjMwKSs2KVxuICAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgKGQsaSkgLT4gbWFyZ2luLnRvcCtoZWlnaHQrYXhpc3Bvcy54dGl0bGUrKChjbnQrMSkqMzApKzYpXG4gICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImNoYXJ0LWxpbmVcIilcbiAgICAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCAoZCxpKSAtPiBsaW5lX2NvbG9yKVxuICAgICAgICAgICAgIC5hdHRyKFwiY29sb3JcIiwgKGQsaSkgLT4gbGluZV9jb2xvcilcbiAgICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAzKVxuXG4gICAgICAgICNhbmQgdGhlIGxlZ2VuZCB0ZXh0XG4gICAgICAgIGZvciBzY2VuYXJpbywgY250IGluIGRhdGEgICAgICAgICAgXG4gICAgICAgICAgeGF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YShbc2NlbmFyaW9bMF1dKVxuICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwibGVnZW5kLXRleHRcIilcbiAgICAgICAgICAgLmF0dHIoXCJ4XCIsIChkLGkpIC0+XG4gICAgICAgICAgICAgIHJldHVybiAobWFyZ2luLmxlZnQrMTcpKVxuICAgICAgICAgICAuYXR0cihcInlcIiwgKGQsaSkgLT5cbiAgICAgICAgICAgICAgbWFyZ2luLnRvcCtoZWlnaHQrMTArYXhpc3Bvcy54dGl0bGUrKChjbnQrMSkqMzApKVxuICAgICAgICAgICAudGV4dCgoZCxpKSAtPiByZXR1cm4gZ2V0U2NlbmFyaW9OYW1lKFtkXSkpXG5cbiAgICAgICAgIyB5LWF4aXNcbiAgICAgICAgeWF4aXMgPSBnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwieSBheGlzXCIpXG4gICAgICAgIHlheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoeXRpY2tzKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAuYXR0cihcInkxXCIsIChkKSAtPiB5c2NhbGUoZCkpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCAoZCkgLT4geXNjYWxlKGQpKVxuICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgbWFyZ2luLmxlZnQrMTApXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCBtYXJnaW4ubGVmdCsxNSlcbiAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG4gICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIHRpY2tjb2xvcilcbiAgICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAxKVxuICAgICAgICAgICAgIC5zdHlsZShcInBvaW50ZXItZXZlbnRzXCIsIFwibm9uZVwiKVxuICAgICAgICB5YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKHl0aWNrcylcbiAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIChkKSAtPiB5c2NhbGUoZCkrMylcbiAgICAgICAgICAgICAuYXR0cihcInhcIiwgbWFyZ2luLmxlZnQrMy1heGlzcG9zLnlsYWJlbClcbiAgICAgICAgICAgICAudGV4dCgoZCkgLT4gZm9ybWF0QXhpcyh5dGlja3MpKGQpKVxuICAgICAgICB5YXhpcy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcInRpdGxlXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIG1hcmdpbi50b3ArMzUraGVpZ2h0LzIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIG1hcmdpbi5sZWZ0KzgtYXhpc3Bvcy55dGl0bGUpXG4gICAgICAgICAgICAgLnRleHQoeWxhYilcbiAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInJvdGF0ZSgyNzAsI3ttYXJnaW4ubGVmdCs4LWF4aXNwb3MueXRpdGxlfSwje21hcmdpbi50b3ArMzUraGVpZ2h0LzJ9KVwiKVxuXG4gICAgICAgIHBvaW50cyA9IGcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiaWRcIiwgXCJwb2ludHNcIilcblxuXG4gICAgICAgIGxpbmUgPSBkMy5zdmcubGluZShkKVxuICAgICAgICAgICAgLmludGVycG9sYXRlKFwiYmFzaXNcIilcbiAgICAgICAgICAgIC54KCAoZCkgLT4geHNjYWxlKHBhcnNlSW50KGQuWUVBUikpKVxuICAgICAgICAgICAgLnkoIChkKSAtPiB5c2NhbGUoZC5WQUxVRS95YXhpc19zY2FsZXIpKVxuXG5cbiAgICAgICAgcG9pbnRzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgIC5hcHBlbmQoXCJwYXRoXCIpXG4gICAgICAgICAgLmF0dHIoXCJkXCIsIChkKSAtPiBsaW5lIGQpXG4gICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgKGQpIC0+IGdldFN0cm9rZUNvbG9yKGQpKVxuICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDMpXG4gICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxuXG4gICAgICAgICMgYm94XG4gICAgICAgIGcuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIG1hcmdpbi5sZWZ0K3BhbmVsb2Zmc2V0KVxuICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIG1hcmdpbi50b3ApXG4gICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBwYW5lbGhlaWdodClcbiAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgcGFuZWx3aWR0aClcbiAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIilcbiAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwiYmxhY2tcIilcbiAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwibm9uZVwiKVxuXG5cblxuICAgICMjIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVyc1xuXG5cbiAgICBjaGFydC53aWR0aCA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB3aWR0aCBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgd2lkdGggPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LmhlaWdodCA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBoZWlnaHQgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIGhlaWdodCA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQubWFyZ2luID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIG1hcmdpbiBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgbWFyZ2luID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5heGlzcG9zID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIGF4aXNwb3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIGF4aXNwb3MgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnhsaW0gPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geGxpbSBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeGxpbSA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQubnh0aWNrcyA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBueHRpY2tzIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBueHRpY2tzID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC54dGlja3MgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geHRpY2tzIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB4dGlja3MgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnlsaW0gPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geWxpbSBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeWxpbSA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQubnl0aWNrcyA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBueXRpY2tzIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBueXRpY2tzID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC55dGlja3MgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geXRpY2tzIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB5dGlja3MgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnJlY3Rjb2xvciA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiByZWN0Y29sb3IgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHJlY3Rjb2xvciA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQucG9pbnRjb2xvciA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBwb2ludGNvbG9yIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBwb2ludGNvbG9yID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5wb2ludHNpemUgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gcG9pbnRzaXplIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBwb2ludHNpemUgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnBvaW50c3Ryb2tlID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHBvaW50c3Ryb2tlIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBwb2ludHN0cm9rZSA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueGxhYiA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB4bGFiIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB4bGFiID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC55bGFiID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHlsYWIgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHlsYWIgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lnh2YXIgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geHZhciBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeHZhciA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueXZhciA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB5dmFyIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB5dmFyID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC55c2NhbGUgPSAoKSAtPlxuICAgICAgcmV0dXJuIHlzY2FsZVxuXG4gICAgY2hhcnQueHNjYWxlID0gKCkgLT5cbiAgICAgIHJldHVybiB4c2NhbGVcblxuICAgIGNoYXJ0LnBvaW50c1NlbGVjdCA9ICgpIC0+XG4gICAgICByZXR1cm4gcG9pbnRzU2VsZWN0XG5cbiAgICBjaGFydC5sYWJlbHNTZWxlY3QgPSAoKSAtPlxuICAgICAgcmV0dXJuIGxhYmVsc1NlbGVjdFxuXG4gICAgY2hhcnQubGVnZW5kU2VsZWN0ID0gKCkgLT5cbiAgICAgIHJldHVybiBsZWdlbmRTZWxlY3RcblxuICAgICMgcmV0dXJuIHRoZSBjaGFydCBmdW5jdGlvblxuICAgIGNoYXJ0XG5cbiAgZ2V0U2NlbmFyaW9OYW1lID0gKHNjZW5hcmlvKSAtPlxuICAgIGZvciBkIGluIHNjZW5hcmlvXG4gICAgICBpZiBkLlRZUEUgPT0gXCJQQVwiXG4gICAgICAgIHJldHVybiBcIlBBIDI5NVwiXG4gICAgICBlbHNlIGlmIGQuVFlQRSA9PSBcIk5vUEFcIlxuICAgICAgICByZXR1cm4gXCJObyBQQSAyOTVcIlxuICAgICAgZWxzZSBpZiBkLlRZUEUgPT0gXCJEYmxQQVwiXG4gICAgICAgIHJldHVybiBcIkRvdWJsZSBQQSAyOTVcIlxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gXCJVc2VyIFNjZW5hcmlvXCJcblxuICBnZXRTdHJva2VDb2xvciA9IChzY2VuYXJpbykgLT5cbiAgICBwYWNvbG9yID0gXCIjOWFiYThjXCJcbiAgICBub3BhY29sb3IgPSBcIiNlNWNhY2VcIlxuICAgIGRibHBhY29sb3IgPSBcIiNiM2NmYTdcIlxuICAgIGZvciBkIGluIHNjZW5hcmlvXG4gICAgICBpZiBkLlRZUEUgPT0gXCJQQVwiXG4gICAgICAgIHJldHVybiAgcGFjb2xvclxuICAgICAgZWxzZSBpZiBkLlRZUEUgPT0gXCJOb1BBXCJcbiAgICAgICAgcmV0dXJuIG5vcGFjb2xvclxuICAgICAgZWxzZSBpZiBkLlRZUEUgPT0gXCJEYmxQQVwiXG4gICAgICAgIHJldHVybiBkYmxwYWNvbG9yXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBcImdyYXlcIlxuXG5cbiAgIyBmdW5jdGlvbiB0byBkZXRlcm1pbmUgcm91bmRpbmcgb2YgYXhpcyBsYWJlbHNcbiAgZm9ybWF0QXhpcyA9IChkKSAtPlxuICAgIGQgPSBkWzFdIC0gZFswXVxuICAgIG5kaWcgPSBNYXRoLmZsb29yKCBNYXRoLmxvZyhkICUgMTApIC8gTWF0aC5sb2coMTApIClcbiAgICBuZGlnID0gMCBpZiBuZGlnID4gMFxuICAgIG5kaWcgPSBNYXRoLmFicyhuZGlnKVxuICAgIGQzLmZvcm1hdChcIi4je25kaWd9ZlwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdyZWVuaG91c2VHYXNlc1RhYiIsIkVuZXJneUNvbnN1bXB0aW9uVGFiID0gcmVxdWlyZSAnLi9lbmVyZ3lDb25zdW1wdGlvbi5jb2ZmZWUnXG5GdWVsQ29zdHNUYWIgPSByZXF1aXJlICcuL2Z1ZWxDb3N0cy5jb2ZmZWUnXG5HcmVlbmhvdXNlR2FzZXNUYWIgPSByZXF1aXJlICcuL2dyZWVuaG91c2VHYXNlcy5jb2ZmZWUnXG5cbndpbmRvdy5hcHAucmVnaXN0ZXJSZXBvcnQgKHJlcG9ydCkgLT5cbiAgcmVwb3J0LnRhYnMgW0VuZXJneUNvbnN1bXB0aW9uVGFiLCBGdWVsQ29zdHNUYWIsIEdyZWVuaG91c2VHYXNlc1RhYl1cbiAgIyBwYXRoIG11c3QgYmUgcmVsYXRpdmUgdG8gZGlzdC9cbiAgcmVwb3J0LnN0eWxlc2hlZXRzIFsnLi9yZXBvcnQuY3NzJ11cblxuXG4iLCJ0aGlzW1wiVGVtcGxhdGVzXCJdID0gdGhpc1tcIlRlbXBsYXRlc1wiXSB8fCB7fTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJlbmVyZ3lDb25zdW1wdGlvblwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0SW4gT2N0b2JlciAyMDA4LCBNaWNoaWdhbiBlbmFjdGVkIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmxlZ2lzbGF0dXJlLm1pLmdvdi8oUyhxNGViNGp6aXIyZzNoYXpoemhsMXRkNDUpKS9taWxlZy5hc3B4P3BhZ2U9Z2V0b2JqZWN0Jm9iamVjdE5hbWU9bWNsLWFjdC0yOTUtb2YtMjAwOFxcXCI+Q2xlYW4sIFJlbmV3YWJsZSwgYW5kIEVmZmljaWVudCBFbmVyZ3kgQWN0LCBQdWJsaWMgQWN0IDI5NTwvYT4gPHN0cm9uZz4oUEEgMjk1KTwvc3Ryb25nPiBBIGRlc2NyaXB0aW9uIG9mIGVhY2ggc2NlbmFyaW8gaXMgcHJvdmlkZWQgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZS4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkNvbW1lcmNpYWwgRW5lcmd5IENvbnN1bXB0aW9uIC0tIE1NQlRVIEVxdWl2YWxlbnQ8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcInNtYWxsIHR0aXAtdGlwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiAgaWQ9XFxcImNvbW1lcmNpYWxFbmVyZ3lDb25zdW1wdGlvblxcXCIgY2xhc3M9XFxcImNvbW1lcmNpYWxFbmVyZ3lDb25zdW1wdGlvblxcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVzaWRlbnRpYWwgRW5lcmd5IENvbnN1bXB0aW9uIC0tIE1NQlRVIEVxdWl2YWxlbnQ8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcInNtYWxsIHR0aXAtdGlwXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiAgaWQ9XFxcInJlc2lkZW50aWFsRW5lcmd5Q29uc3VtcHRpb25cXFwiIGNsYXNzPVxcXCJyZXNpZGVudGlhbEVuZXJneUNvbnN1bXB0aW9uXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8cD5UaGUgcmVwb3J0cyBzaG93IGVuZXJneSBjb25zdW1wdGlvbiBpbiB0aGUgZm9sbG93aW5nIHNjZW5hcmlvczpcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPk5PIFBBIDI5NTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgaGF2aW5nIG5vIEVuZXJneSBFZmZpY2llbmN5IFJlc291cmNlIGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGNvbnRpbnVlcyB0byBpbmNyZWFzZSB3aXRoIHBvcHVsYXRpb24gYW5kIGVtcGxveW1lbnRcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiAtIE1pY2hpZ2FuJ3MgY3VycmVudCBFbmVyZ3kgRWZmaWNpZW5jeSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDElIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgIGNvbnN1bXB0aW9uLCBhbmQgMTAlIG9mIGVsZWN0cmljaXR5IGRlbWFuZCBjb21lcyBmcm9tIHJlbmV3YWJsZSBlbmVyZ3kgc291cmNlc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+UEEgMjk1IERvdWJsZTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgZG91YmxpbmcgTWljaGlnYW4ncyBFbmVyZ3kgRWZmaWNpZW5jeSBSZXNvdXJjZSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDIlIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgY29uc3VtcHRpb24sIGFuZCAyMCUgb2YgZWxlY3RyaWNpdHkgZGVtYW5kIGNvbWVzIGZyb20gcmVuZXdhYmxlIGVuZXJneSBzb3VyY2VzLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZnVlbENvc3RzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiSW4gT2N0b2JlciAyMDA4LCBNaWNoaWdhbiBlbmFjdGVkIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmxlZ2lzbGF0dXJlLm1pLmdvdi8oUyhxNGViNGp6aXIyZzNoYXpoemhsMXRkNDUpKS9taWxlZy5hc3B4P3BhZ2U9Z2V0b2JqZWN0Jm9iamVjdE5hbWU9bWNsLWFjdC0yOTUtb2YtMjAwOFxcXCI+Q2xlYW4sIFJlbmV3YWJsZSwgYW5kIEVmZmljaWVudCBFbmVyZ3kgQWN0LCBQdWJsaWMgQWN0IDI5NTwvYT4gPHN0cm9uZz4oUEEgMjk1KTwvc3Ryb25nPi4gQSBkZXNjcmlwdGlvbiBvZiBlYWNoIHNjZW5hcmlvIGlzIHByb3ZpZGVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHBhZ2UuIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5Db21tZXJjaWFsIEZ1ZWwgQ29zdHMgLS0gMjAxMiBEb2xsYXJzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJzbWFsbCB0dGlwLXRpcFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgIGlkPVxcXCJjb21tZXJjaWFsRnVlbENvc3RzXFxcIiBjbGFzcz1cXFwiY29tbWVyY2lhbEZ1ZWxDb3N0c1xcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5SZXNpZGVudGlhbCBGdWVsIENvc3RzIC0tIDIwMTIgRG9sbGFyczwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwic21hbGwgdHRpcC10aXBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2ICBpZD1cXFwicmVzaWRlbnRpYWxGdWVsQ29zdHNcXFwiIGNsYXNzPVxcXCJyZXNpZGVudGlhbEZ1ZWxDb3N0c1xcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPHA+VGhlIHJlcG9ydHMgc2hvdyBmdWVsIGNvc3RzIGluIHRoZSBmb2xsb3dpbmcgc2NlbmFyaW9zOlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+Tk8gUEEgMjk1PC9zdHJvbmc+IC0gVGhlIHJlc3VsdCBvZiBoYXZpbmcgbm8gRW5lcmd5IEVmZmljaWVuY3kgUmVzb3VyY2UgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gY29udGludWVzIHRvIGluY3JlYXNlIHdpdGggcG9wdWxhdGlvbiBhbmQgZW1wbG95bWVudFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+UEEgMjk1PC9zdHJvbmc+IC0gTWljaGlnYW4ncyBjdXJyZW50IEVuZXJneSBFZmZpY2llbmN5IGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGlzIHJlZHVjZWQsIGVhY2ggeWVhciwgYnkgMSUgb2YgdGhlIHByZXZpb3VzIHllYXIncyB0b3RhbCAgY29uc3VtcHRpb24sIGFuZCAxMCUgb2YgZWxlY3RyaWNpdHkgZGVtYW5kIGNvbWVzIGZyb20gcmVuZXdhYmxlIGVuZXJneSBzb3VyY2VzXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5QQSAyOTUgRG91YmxlPC9zdHJvbmc+IC0gVGhlIHJlc3VsdCBvZiBkb3VibGluZyBNaWNoaWdhbidzIEVuZXJneSBFZmZpY2llbmN5IFJlc291cmNlIGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGlzIHJlZHVjZWQsIGVhY2ggeWVhciwgYnkgMiUgb2YgdGhlIHByZXZpb3VzIHllYXIncyB0b3RhbCBjb25zdW1wdGlvbiwgYW5kIDIwJSBvZiBlbGVjdHJpY2l0eSBkZW1hbmQgY29tZXMgZnJvbSByZW5ld2FibGUgZW5lcmd5IHNvdXJjZXMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9wPlwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJncmVlbmhvdXNlR2FzZXNcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiSW4gT2N0b2JlciAyMDA4LCBNaWNoaWdhbiBlbmFjdGVkIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmxlZ2lzbGF0dXJlLm1pLmdvdi8oUyhxNGViNGp6aXIyZzNoYXpoemhsMXRkNDUpKS9taWxlZy5hc3B4P3BhZ2U9Z2V0b2JqZWN0Jm9iamVjdE5hbWU9bWNsLWFjdC0yOTUtb2YtMjAwOFxcXCI+Q2xlYW4sIFJlbmV3YWJsZSwgYW5kIEVmZmljaWVudCBFbmVyZ3kgQWN0LCBQdWJsaWMgQWN0IDI5NTwvYT4gPHN0cm9uZz4oUEEgMjk1KTwvc3Ryb25nPi4gQSBkZXNjcmlwdGlvbiBvZiBlYWNoIHNjZW5hcmlvIGlzIHByb3ZpZGVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHBhZ2UuIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5Db21tZXJjaWFsIEdIRydzIC0tIENPPHN1Yj4yPC9zdWI+LWUgRXF1aXZhbGVudDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwic21hbGwgdHRpcC10aXBcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2ICBpZD1cXFwiY29tbWVyY2lhbEdyZWVuaG91c2VHYXNlc1xcXCIgY2xhc3M9XFxcImNvbW1lcmNpYWxHcmVlbmhvdXNlR2FzZXNcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVzaWRlbnRpYWwgR0hHJ3MgLS0gQ088c3ViPjI8L3N1Yj4tZSBFcXVpdmFsZW50PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJzbWFsbCB0dGlwLXRpcFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgIGlkPVxcXCJyZXNpZGVudGlhbEdyZWVuaG91c2VHYXNlc1xcXCIgY2xhc3M9XFxcInJlc2lkZW50aWFsR3JlZW5ob3VzZUdhc2VzXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8cD5UaGUgcmVwb3J0cyBzaG93IGdyZWVuaG91c2UgZ2FzIGVtaXNzaW9ucyBpbiB0aGUgZm9sbG93aW5nIHNjZW5hcmlvczpcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPk5PIFBBIDI5NTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgaGF2aW5nIG5vIEVuZXJneSBFZmZpY2llbmN5IFJlc291cmNlIGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGNvbnRpbnVlcyB0byBpbmNyZWFzZSB3aXRoIHBvcHVsYXRpb24gYW5kIGVtcGxveW1lbnRcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiAtIE1pY2hpZ2FuJ3MgY3VycmVudCBFbmVyZ3kgRWZmaWNpZW5jeSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDElIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgIGNvbnN1bXB0aW9uLCBhbmQgMTAlIG9mIGVsZWN0cmljaXR5IGRlbWFuZCBjb21lcyBmcm9tIHJlbmV3YWJsZSBlbmVyZ3kgc291cmNlc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+UEEgMjk1IERvdWJsZTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgZG91YmxpbmcgTWljaGlnYW4ncyBFbmVyZ3kgRWZmaWNpZW5jeSBSZXNvdXJjZSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDIlIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgY29uc3VtcHRpb24sIGFuZCAyMCUgb2YgZWxlY3RyaWNpdHkgZGVtYW5kIGNvbWVzIGZyb20gcmVuZXdhYmxlIGVuZXJneSBzb3VyY2VzLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xuXG5pZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gdGhpc1tcIlRlbXBsYXRlc1wiXTtcbn0iXX0=
