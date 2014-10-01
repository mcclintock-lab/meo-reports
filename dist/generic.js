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
var GenericAttributesTab, ReportTab, key, partials, templates, val, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ReportTab = require('./reportTab.coffee');

templates = require('api/templates');

partials = [];

for (key in templates) {
  val = templates[key];
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val;
}

GenericAttributesTab = (function(_super) {
  __extends(GenericAttributesTab, _super);

  function GenericAttributesTab() {
    _ref = GenericAttributesTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  GenericAttributesTab.prototype.name = 'Attributes';

  GenericAttributesTab.prototype.className = 'genericAttributes';

  GenericAttributesTab.prototype.template = templates['node_modules/seasketch-reporting-api/genericAttributes'];

  GenericAttributesTab.prototype.render = function() {
    var context;
    context = {
      sketch: this.model.forTemplate(),
      sketchClass: this.sketchClass.forTemplate(),
      attributes: this.model.getAttributes(),
      admin: this.project.isAdmin(window.user)
    };
    return this.$el.html(this.template.render(context, partials));
  };

  return GenericAttributesTab;

})(ReportTab);

module.exports = GenericAttributesTab;


},{"./reportTab.coffee":"a21iR2","api/templates":"CNqB+b"}],4:[function(require,module,exports){
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


},{}],5:[function(require,module,exports){
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


},{"../templates/templates.js":"CNqB+b","./enableLayerTogglers.coffee":2,"./jobItem.coffee":4,"./reportResults.coffee":5,"./utils.coffee":"+VosKh","views/collectionView":1}],"api/utils":[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
var GenericAttributesTab;

GenericAttributesTab = require('../node_modules/seasketch-reporting-api/scripts/genericAttributesTab.coffee');

window.app.registerReport(function(report) {
  report.tabs([GenericAttributesTab]);
  return report.stylesheets(['./main.css']);
});


},{"../node_modules/seasketch-reporting-api/scripts/genericAttributesTab.coffee":3}],"reportGraphTab":[function(require,module,exports){
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


},{"../node_modules/seasketch-reporting-api/templates/templates.js":"CNqB+b","../templates/templates.js":15,"reportTab":"a21iR2"}],15:[function(require,module,exports){
this["Templates"] = this["Templates"] || {};
this["Templates"]["energyConsumption"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("\n" + i);_.b("<p>");_.b("\n" + i);_.b("	In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong> A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial Energy Consumption -- MMBTU Equivalent</h4>");_.b("\n" + i);_.b("  <div class=\"chooser-div\">");_.b("\n" + i);_.b("    <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"comm-chosen-ec\">");_.b("\n" + i);_.b("      <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,656,708,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("    </select>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <p class=\"pa295_comm_ec\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,0,854,858,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("comm_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_comm_ec\">By 2035, your energy plan is estimated to  <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,0,1196,1200,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("comm_no_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>No PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_comm_ec\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,0,1554,1558,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("comm_dbl_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>Double PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div  id=\"commercialEnergyConsumption\" class=\"commercialEnergyConsumption\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential Energy Consumption -- MMBTU Equivalent</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"res-chosen-ec\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,2227,2283,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("\n" + i);_.b("  <p class=\"pa295_res_ec\">By 2035, your energy plan is estimated to <strong>");if(_.s(_.f("res_has_savings_pa295",c,p,1),c,p,0,2428,2432,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("res_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_res_ec\">By 2035, your energy plan is estimated to  <strong>");if(_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,0,2762,2766,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("res_no_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>No PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_res_ec\">By 2035, your energy plan is estimated to <strong>");if(_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,0,3112,3116,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("SAVE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("USE");};_.b(" ");_.b("\n" + i);_.b("  ");_.b(_.v(_.f("res_dbl_pa295_diff",c,p,0)));_.b("</strong> more MMBTU equivalent energy than the <strong>Double PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"residentialEnergyConsumption\" class=\"residentialEnergyConsumption\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show energy consumption in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("\n");return _.fl();;});
this["Templates"]["fuelCosts"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("\n" + i);_.b("<p>");_.b("\n" + i);_.b("In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong>. A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial Fuel Costs -- 2012 Dollars</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"comm-chosen-fc\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,651,707,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  <p class=\"pa295_comm_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("comm_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,0,904,909,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong> than the <strong>PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_comm_fc\">By 2035, your energy plan is estimated to have fuel costs that are<strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("comm_no_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,0,1251,1256,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>  than the <strong>No PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_comm_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("comm_dbl_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,0,1615,1620,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>than the <strong>Double PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div  id=\"commercialFuelCosts\" class=\"commercialFuelCosts\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential Fuel Costs -- 2012 Dollars</h4>");_.b("\n" + i);_.b("  <div class=\"chooser-div\">");_.b("\n" + i);_.b("    <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"res-chosen-fc\">");_.b("\n" + i);_.b("      <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,2203,2255,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("        <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("    </select>");_.b("\n" + i);_.b("  </div>");_.b("\n" + i);_.b("  <p class=\"pa295_res_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("res_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_pa295",c,p,1),c,p,0,2445,2450,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong> than the <strong>PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_res_fc\">By 2035, your energy plan is estimated to have fuel costs that are<strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("res_no_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,0,2787,2792,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>  than the <strong>No PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_res_fc\">By 2035, your energy plan is estimated to have fuel costs that are <strong>");_.b("\n" + i);_.b("  $");_.b(_.v(_.f("res_dbl_pa295_diff",c,p,0)));_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,0,3146,3151,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("LOWER");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("HIGHER");};_.b(" ");_.b("\n" + i);_.b("  </strong>than the <strong>Double PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div  id=\"residentialFuelCosts\" class=\"residentialFuelCosts\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show fuel costs in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");return _.fl();;});
this["Templates"]["greenhouseGases"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<p>");_.b("\n" + i);_.b("In October 2008, Michigan enacted the <a href=\"http://www.legislature.mi.gov/(S(q4eb4jzir2g3hazhzhl1td45))/mileg.aspx?page=getobject&objectName=mcl-act-295-of-2008\">Clean, Renewable, and Efficient Energy Act, Public Act 295</a> <strong>(PA 295)</strong>. A description of each scenario is provided at the bottom of the page. ");_.b("\n" + i);_.b("</p>");_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Commercial GHG's -- CO<sub>2</sub>-e Equivalent</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"comm-chosen-ghg\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,661,717,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  <p class=\"pa295_comm_ghg\">By 2035, your energy plan is estimated to<strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,0,866,872,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE ");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("comm_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_comm_ghg\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,0,1229,1235,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("comm_no_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>No PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_comm_ghg\">By 2035, your energy plan is estimated to  <strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,0,1609,1615,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("comm_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong>GHGs by <strong>");_.b(_.v(_.f("comm_dbl_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>Double PA 295</strong> scenario in the commercial sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("    <div  id=\"commercialGreenhouseGases\" class=\"commercialGreenhouseGases\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("\n" + i);_.b("<div class=\"reportSection tableContainer\">");_.b("\n" + i);_.b("  <h4>Residential GHG's -- CO<sub>2</sub>-e Equivalent</h4>");_.b("\n" + i);_.b("    <div class=\"chooser-div\">");_.b("\n" + i);_.b("      <div class=\"sel-label\">Compare your plan to scenario:</div><select class=\"res-chosen-ghg\">");_.b("\n" + i);_.b("        <option class=\"default-chosen-selection\" label=\"PA 295\"></option>");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,2292,2348,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("          <option value=\"");_.b(_.v(_.d(".",c,p,0)));_.b("\">");_.b(_.v(_.d(".",c,p,0)));_.b("</option>");_.b("\n");});c.pop();}_.b("      </select>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  <p class=\"pa295_res_ghg\">By 2035, your energy plan is estimated to<strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_pa295",c,p,1),c,p,0,2498,2504,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE ");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("res_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"no_pa295_res_ghg\">By 2035, your energy plan is estimated to <strong>");_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,0,2853,2859,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_no_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong> GHGs by <strong>");_.b(_.v(_.f("res_no_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>No PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("  <p class=\"dbl_pa295_res_ghg\">By 2035, your energy plan is estimated to  <strong>");_.b("\n" + i);_.b("  ");_.b("\n" + i);_.b("  ");if(_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,0,3228,3234,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("REDUCE");});c.pop();}_.b("\n" + i);_.b("  ");if(!_.s(_.f("res_has_savings_dbl_pa295",c,p,1),c,p,1,0,0,"")){_.b("INCREASE");};_.b(" ");_.b("\n" + i);_.b("  </strong>GHGs by <strong>");_.b(_.v(_.f("res_dbl_pa295_diff",c,p,0)));_.b("</strong> CO2-e compared to the <strong>Double PA 295</strong> scenario in the residential sector.");_.b("\n" + i);_.b("  </p>");_.b("\n" + i);_.b("\n" + i);_.b("    <div id=\"residentialGreenhouseGases\" class=\"residentialGreenhouseGases\"></div>");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<p>The reports show greenhouse gas emissions in the following scenarios:");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>NO PA 295</strong> - The result of having no Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption continues to increase with population and employment");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295</strong> - Michigan's current Energy Efficiency and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 1% of the previous year's total  consumption, and 10% of electricity demand comes from renewable energy sources");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("	<p>");_.b("\n" + i);_.b("		<strong>PA 295 Double</strong> - The result of doubling Michigan's Energy Efficiency Resource and Renewable Portfolio Standards. Energy consumption is reduced, each year, by 2% of the previous year's total consumption, and 20% of electricity demand comes from renewable energy sources.");_.b("\n" + i);_.b("	</p>");_.b("\n" + i);_.b("</p>");_.b("\n");return _.fl();;});

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = this["Templates"];
}
},{}]},{},[12])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL2VuYWJsZUxheWVyVG9nZ2xlcnMuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9tZW8tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy9nZW5lcmljQXR0cmlidXRlc1RhYi5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL2pvYkl0ZW0uY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9tZW8tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvc2NyaXB0cy9yZXBvcnRSZXN1bHRzLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvcmVwb3J0VGFiLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3NjcmlwdHMvdXRpbHMuY29mZmVlIiwiL1VzZXJzL2Rhbl95b2N1bS9EZXNrdG9wL2dpdGh1Yi9tZW8tcmVwb3J0cy9ub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvc2NyaXB0cy9nZW5lcmljLmNvZmZlZSIsIi9Vc2Vycy9kYW5feW9jdW0vRGVza3RvcC9naXRodWIvbWVvLXJlcG9ydHMvc2NyaXB0cy9yZXBvcnRHcmFwaFRhYi5jb2ZmZWUiLCIvVXNlcnMvZGFuX3lvY3VtL0Rlc2t0b3AvZ2l0aHViL21lby1yZXBvcnRzL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQSxDQUFPLENBQVUsQ0FBQSxHQUFYLENBQU4sRUFBa0I7Q0FDaEIsS0FBQSwyRUFBQTtDQUFBLENBQUEsQ0FBQTtDQUFBLENBQ0EsQ0FBQSxHQUFZO0NBRFosQ0FFQSxDQUFBLEdBQU07QUFDQyxDQUFQLENBQUEsQ0FBQSxDQUFBO0NBQ0UsRUFBQSxDQUFBLEdBQU8scUJBQVA7Q0FDQSxTQUFBO0lBTEY7Q0FBQSxDQU1BLENBQVcsQ0FBQSxJQUFYLGFBQVc7Q0FFWDtDQUFBLE1BQUEsb0NBQUE7d0JBQUE7Q0FDRSxFQUFXLENBQVgsR0FBVyxDQUFYO0NBQUEsRUFDUyxDQUFULEVBQUEsRUFBaUIsS0FBUjtDQUNUO0NBQ0UsRUFBTyxDQUFQLEVBQUEsVUFBTztDQUFQLEVBQ08sQ0FBUCxDQURBLENBQ0E7QUFDK0IsQ0FGL0IsQ0FFOEIsQ0FBRSxDQUFoQyxFQUFBLEVBQVEsQ0FBd0IsS0FBaEM7Q0FGQSxDQUd5QixFQUF6QixFQUFBLEVBQVEsQ0FBUjtNQUpGO0NBTUUsS0FESTtDQUNKLENBQWdDLEVBQWhDLEVBQUEsRUFBUSxRQUFSO01BVEo7Q0FB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N2FiOztDQUYyQjs7QUFzYjdCLENBOWJBLEVBOGJpQixHQUFYLENBQU4sT0E5YkE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLG51bGwsIm1vZHVsZS5leHBvcnRzID0gKGVsKSAtPlxuICAkZWwgPSAkIGVsXG4gIGFwcCA9IHdpbmRvdy5hcHBcbiAgdG9jID0gYXBwLmdldFRvYygpXG4gIHVubGVzcyB0b2NcbiAgICBjb25zb2xlLmxvZyAnTm8gdGFibGUgb2YgY29udGVudHMgZm91bmQnXG4gICAgcmV0dXJuXG4gIHRvZ2dsZXJzID0gJGVsLmZpbmQoJ2FbZGF0YS10b2dnbGUtbm9kZV0nKVxuICAjIFNldCBpbml0aWFsIHN0YXRlXG4gIGZvciB0b2dnbGVyIGluIHRvZ2dsZXJzLnRvQXJyYXkoKVxuICAgICR0b2dnbGVyID0gJCh0b2dnbGVyKVxuICAgIG5vZGVpZCA9ICR0b2dnbGVyLmRhdGEoJ3RvZ2dsZS1ub2RlJylcbiAgICB0cnlcbiAgICAgIHZpZXcgPSB0b2MuZ2V0Q2hpbGRWaWV3QnlJZCBub2RlaWRcbiAgICAgIG5vZGUgPSB2aWV3Lm1vZGVsXG4gICAgICAkdG9nZ2xlci5hdHRyICdkYXRhLXZpc2libGUnLCAhIW5vZGUuZ2V0KCd2aXNpYmxlJylcbiAgICAgICR0b2dnbGVyLmRhdGEgJ3RvY0l0ZW0nLCB2aWV3XG4gICAgY2F0Y2ggZVxuICAgICAgJHRvZ2dsZXIuYXR0ciAnZGF0YS1ub3QtZm91bmQnLCAndHJ1ZSdcblxuICB0b2dnbGVycy5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAkZWwgPSAkKGUudGFyZ2V0KVxuICAgIHZpZXcgPSAkZWwuZGF0YSgndG9jSXRlbScpXG4gICAgaWYgdmlld1xuICAgICAgdmlldy50b2dnbGVWaXNpYmlsaXR5KGUpXG4gICAgICAkZWwuYXR0ciAnZGF0YS12aXNpYmxlJywgISF2aWV3Lm1vZGVsLmdldCgndmlzaWJsZScpXG4gICAgZWxzZVxuICAgICAgYWxlcnQgXCJMYXllciBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgVGFibGUgb2YgQ29udGVudHMuIFxcbkV4cGVjdGVkIG5vZGVpZCAjeyRlbC5kYXRhKCd0b2dnbGUtbm9kZScpfVwiXG4iLCJSZXBvcnRUYWIgPSByZXF1aXJlICcuL3JlcG9ydFRhYi5jb2ZmZWUnXG50ZW1wbGF0ZXMgPSByZXF1aXJlICdhcGkvdGVtcGxhdGVzJ1xucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIHRlbXBsYXRlc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuY2xhc3MgR2VuZXJpY0F0dHJpYnV0ZXNUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcbiAgbmFtZTogJ0F0dHJpYnV0ZXMnXG4gIGNsYXNzTmFtZTogJ2dlbmVyaWNBdHRyaWJ1dGVzJ1xuICB0ZW1wbGF0ZTogdGVtcGxhdGVzWydub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvZ2VuZXJpY0F0dHJpYnV0ZXMnXVxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICBjb250ZXh0ID1cbiAgICAgIHNrZXRjaDogQG1vZGVsLmZvclRlbXBsYXRlKClcbiAgICAgIHNrZXRjaENsYXNzOiBAc2tldGNoQ2xhc3MuZm9yVGVtcGxhdGUoKVxuICAgICAgYXR0cmlidXRlczogQG1vZGVsLmdldEF0dHJpYnV0ZXMoKVxuICAgICAgYWRtaW46IEBwcm9qZWN0LmlzQWRtaW4gd2luZG93LnVzZXJcbiAgICBAJGVsLmh0bWwgQHRlbXBsYXRlLnJlbmRlcihjb250ZXh0LCBwYXJ0aWFscylcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEdlbmVyaWNBdHRyaWJ1dGVzVGFiIiwiY2xhc3MgSm9iSXRlbSBleHRlbmRzIEJhY2tib25lLlZpZXdcbiAgY2xhc3NOYW1lOiAncmVwb3J0UmVzdWx0J1xuICBldmVudHM6IHt9XG4gIGJpbmRpbmdzOlxuICAgIFwiaDYgYVwiOlxuICAgICAgb2JzZXJ2ZTogXCJzZXJ2aWNlTmFtZVwiXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICBuYW1lOiAnaHJlZidcbiAgICAgICAgb2JzZXJ2ZTogJ3NlcnZpY2VVcmwnXG4gICAgICB9XVxuICAgIFwiLnN0YXJ0ZWRBdFwiOlxuICAgICAgb2JzZXJ2ZTogW1wic3RhcnRlZEF0XCIsIFwic3RhdHVzXCJdXG4gICAgICB2aXNpYmxlOiAoKSAtPlxuICAgICAgICBAbW9kZWwuZ2V0KCdzdGF0dXMnKSBub3QgaW4gWydjb21wbGV0ZScsICdlcnJvciddXG4gICAgICB1cGRhdGVWaWV3OiB0cnVlXG4gICAgICBvbkdldDogKCkgLT5cbiAgICAgICAgaWYgQG1vZGVsLmdldCgnc3RhcnRlZEF0JylcbiAgICAgICAgICByZXR1cm4gXCJTdGFydGVkIFwiICsgbW9tZW50KEBtb2RlbC5nZXQoJ3N0YXJ0ZWRBdCcpKS5mcm9tTm93KCkgKyBcIi4gXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiXCJcbiAgICBcIi5zdGF0dXNcIjogICAgICBcbiAgICAgIG9ic2VydmU6IFwic3RhdHVzXCJcbiAgICAgIG9uR2V0OiAocykgLT5cbiAgICAgICAgc3dpdGNoIHNcbiAgICAgICAgICB3aGVuICdwZW5kaW5nJ1xuICAgICAgICAgICAgXCJ3YWl0aW5nIGluIGxpbmVcIlxuICAgICAgICAgIHdoZW4gJ3J1bm5pbmcnXG4gICAgICAgICAgICBcInJ1bm5pbmcgYW5hbHl0aWNhbCBzZXJ2aWNlXCJcbiAgICAgICAgICB3aGVuICdjb21wbGV0ZSdcbiAgICAgICAgICAgIFwiY29tcGxldGVkXCJcbiAgICAgICAgICB3aGVuICdlcnJvcidcbiAgICAgICAgICAgIFwiYW4gZXJyb3Igb2NjdXJyZWRcIlxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNcbiAgICBcIi5xdWV1ZUxlbmd0aFwiOiBcbiAgICAgIG9ic2VydmU6IFwicXVldWVMZW5ndGhcIlxuICAgICAgb25HZXQ6ICh2KSAtPlxuICAgICAgICBzID0gXCJXYWl0aW5nIGJlaGluZCAje3Z9IGpvYlwiXG4gICAgICAgIGlmIHYubGVuZ3RoID4gMVxuICAgICAgICAgIHMgKz0gJ3MnXG4gICAgICAgIHJldHVybiBzICsgXCIuIFwiXG4gICAgICB2aXNpYmxlOiAodikgLT5cbiAgICAgICAgdj8gYW5kIHBhcnNlSW50KHYpID4gMFxuICAgIFwiLmVycm9yc1wiOlxuICAgICAgb2JzZXJ2ZTogJ2Vycm9yJ1xuICAgICAgdXBkYXRlVmlldzogdHJ1ZVxuICAgICAgdmlzaWJsZTogKHYpIC0+XG4gICAgICAgIHY/Lmxlbmd0aCA+IDJcbiAgICAgIG9uR2V0OiAodikgLT5cbiAgICAgICAgaWYgdj9cbiAgICAgICAgICBKU09OLnN0cmluZ2lmeSh2LCBudWxsLCAnICAnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQG1vZGVsKSAtPlxuICAgIHN1cGVyKClcblxuICByZW5kZXI6ICgpIC0+XG4gICAgQCRlbC5odG1sIFwiXCJcIlxuICAgICAgPGg2PjxhIGhyZWY9XCIjXCIgdGFyZ2V0PVwiX2JsYW5rXCI+PC9hPjxzcGFuIGNsYXNzPVwic3RhdHVzXCI+PC9zcGFuPjwvaDY+XG4gICAgICA8ZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz1cInN0YXJ0ZWRBdFwiPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJxdWV1ZUxlbmd0aFwiPjwvc3Bhbj5cbiAgICAgICAgPHByZSBjbGFzcz1cImVycm9yc1wiPjwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgQHN0aWNraXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEpvYkl0ZW0iLCJjbGFzcyBSZXBvcnRSZXN1bHRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXG4gIGRlZmF1bHRQb2xsaW5nSW50ZXJ2YWw6IDMwMDBcblxuICBjb25zdHJ1Y3RvcjogKEBza2V0Y2gsIEBkZXBzKSAtPlxuICAgIEB1cmwgPSB1cmwgPSBcIi9yZXBvcnRzLyN7QHNrZXRjaC5pZH0vI3tAZGVwcy5qb2luKCcsJyl9XCJcbiAgICBzdXBlcigpXG5cbiAgcG9sbDogKCkgPT5cbiAgICBAZmV0Y2gge1xuICAgICAgc3VjY2VzczogKCkgPT5cbiAgICAgICAgQHRyaWdnZXIgJ2pvYnMnXG4gICAgICAgIGZvciByZXN1bHQgaW4gQG1vZGVsc1xuICAgICAgICAgIGlmIHJlc3VsdC5nZXQoJ3N0YXR1cycpIG5vdCBpbiBbJ2NvbXBsZXRlJywgJ2Vycm9yJ11cbiAgICAgICAgICAgIHVubGVzcyBAaW50ZXJ2YWxcbiAgICAgICAgICAgICAgQGludGVydmFsID0gc2V0SW50ZXJ2YWwgQHBvbGwsIEBkZWZhdWx0UG9sbGluZ0ludGVydmFsXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBjb25zb2xlLmxvZyBAbW9kZWxzWzBdLmdldCgncGF5bG9hZFNpemVCeXRlcycpXG4gICAgICAgICAgcGF5bG9hZFNpemUgPSBNYXRoLnJvdW5kKCgoQG1vZGVsc1swXS5nZXQoJ3BheWxvYWRTaXplQnl0ZXMnKSBvciAwKSAvIDEwMjQpICogMTAwKSAvIDEwMFxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRmVhdHVyZVNldCBzZW50IHRvIEdQIHdlaWdoZWQgaW4gYXQgI3twYXlsb2FkU2l6ZX1rYlwiXG4gICAgICAgICMgYWxsIGNvbXBsZXRlIHRoZW5cbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGludGVydmFsKSBpZiBAaW50ZXJ2YWxcbiAgICAgICAgaWYgcHJvYmxlbSA9IF8uZmluZChAbW9kZWxzLCAocikgLT4gci5nZXQoJ2Vycm9yJyk/KVxuICAgICAgICAgIEB0cmlnZ2VyICdlcnJvcicsIFwiUHJvYmxlbSB3aXRoICN7cHJvYmxlbS5nZXQoJ3NlcnZpY2VOYW1lJyl9IGpvYlwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdHJpZ2dlciAnZmluaXNoZWQnXG4gICAgICBlcnJvcjogKGUsIHJlcywgYSwgYikgPT5cbiAgICAgICAgdW5sZXNzIHJlcy5zdGF0dXMgaXMgMFxuICAgICAgICAgIGlmIHJlcy5yZXNwb25zZVRleHQ/Lmxlbmd0aFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgIGpzb24gPSBKU09OLnBhcnNlKHJlcy5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgICAjIGRvIG5vdGhpbmdcbiAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAaW50ZXJ2YWwpIGlmIEBpbnRlcnZhbFxuICAgICAgICAgIEB0cmlnZ2VyICdlcnJvcicsIGpzb24/LmVycm9yPy5tZXNzYWdlIG9yXG4gICAgICAgICAgICAnUHJvYmxlbSBjb250YWN0aW5nIHRoZSBTZWFTa2V0Y2ggc2VydmVyJ1xuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRSZXN1bHRzXG4iLCJlbmFibGVMYXllclRvZ2dsZXJzID0gcmVxdWlyZSAnLi9lbmFibGVMYXllclRvZ2dsZXJzLmNvZmZlZSdcbnJvdW5kID0gcmVxdWlyZSgnLi91dGlscy5jb2ZmZWUnKS5yb3VuZFxuUmVwb3J0UmVzdWx0cyA9IHJlcXVpcmUgJy4vcmVwb3J0UmVzdWx0cy5jb2ZmZWUnXG50ID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3RlbXBsYXRlcy5qcycpXG50ZW1wbGF0ZXMgPVxuICByZXBvcnRMb2FkaW5nOiB0Wydub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvcmVwb3J0TG9hZGluZyddXG5Kb2JJdGVtID0gcmVxdWlyZSAnLi9qb2JJdGVtLmNvZmZlZSdcbkNvbGxlY3Rpb25WaWV3ID0gcmVxdWlyZSgndmlld3MvY29sbGVjdGlvblZpZXcnKVxuXG5jbGFzcyBSZWNvcmRTZXRcblxuICBjb25zdHJ1Y3RvcjogKEBkYXRhLCBAdGFiLCBAc2tldGNoQ2xhc3NJZCkgLT5cblxuICB0b0FycmF5OiAoKSAtPlxuICAgIGlmIEBza2V0Y2hDbGFzc0lkXG4gICAgICBkYXRhID0gXy5maW5kIEBkYXRhLnZhbHVlLCAodikgPT5cbiAgICAgICAgdi5mZWF0dXJlcz9bMF0/LmF0dHJpYnV0ZXM/WydTQ19JRCddIGlzIEBza2V0Y2hDbGFzc0lkXG4gICAgICB1bmxlc3MgZGF0YVxuICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGRhdGEgZm9yIHNrZXRjaENsYXNzICN7QHNrZXRjaENsYXNzSWR9XCJcbiAgICBlbHNlXG4gICAgICBpZiBfLmlzQXJyYXkgQGRhdGEudmFsdWVcbiAgICAgICAgZGF0YSA9IEBkYXRhLnZhbHVlWzBdXG4gICAgICBlbHNlXG4gICAgICAgIGRhdGEgPSBAZGF0YS52YWx1ZVxuICAgIF8ubWFwIGRhdGEuZmVhdHVyZXMsIChmZWF0dXJlKSAtPlxuICAgICAgZmVhdHVyZS5hdHRyaWJ1dGVzXG5cbiAgcmF3OiAoYXR0cikgLT5cbiAgICBhdHRycyA9IF8ubWFwIEB0b0FycmF5KCksIChyb3cpIC0+XG4gICAgICByb3dbYXR0cl1cbiAgICBhdHRycyA9IF8uZmlsdGVyIGF0dHJzLCAoYXR0cikgLT4gYXR0ciAhPSB1bmRlZmluZWRcbiAgICBpZiBhdHRycy5sZW5ndGggaXMgMFxuICAgICAgY29uc29sZS5sb2cgQGRhdGFcbiAgICAgIEB0YWIucmVwb3J0RXJyb3IgXCJDb3VsZCBub3QgZ2V0IGF0dHJpYnV0ZSAje2F0dHJ9IGZyb20gcmVzdWx0c1wiXG4gICAgICB0aHJvdyBcIkNvdWxkIG5vdCBnZXQgYXR0cmlidXRlICN7YXR0cn1cIlxuICAgIGVsc2UgaWYgYXR0cnMubGVuZ3RoIGlzIDFcbiAgICAgIHJldHVybiBhdHRyc1swXVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBhdHRyc1xuXG4gIGludDogKGF0dHIpIC0+XG4gICAgcmF3ID0gQHJhdyhhdHRyKVxuICAgIGlmIF8uaXNBcnJheShyYXcpXG4gICAgICBfLm1hcCByYXcsIHBhcnNlSW50XG4gICAgZWxzZVxuICAgICAgcGFyc2VJbnQocmF3KVxuXG4gIGZsb2F0OiAoYXR0ciwgZGVjaW1hbFBsYWNlcz0yKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCAodmFsKSAtPiByb3VuZCh2YWwsIGRlY2ltYWxQbGFjZXMpXG4gICAgZWxzZVxuICAgICAgcm91bmQocmF3LCBkZWNpbWFsUGxhY2VzKVxuXG4gIGJvb2w6IChhdHRyKSAtPlxuICAgIHJhdyA9IEByYXcoYXR0cilcbiAgICBpZiBfLmlzQXJyYXkocmF3KVxuICAgICAgXy5tYXAgcmF3LCAodmFsKSAtPiB2YWwudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpIGlzICd0cnVlJ1xuICAgIGVsc2VcbiAgICAgIHJhdy50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgaXMgJ3RydWUnXG5cbmNsYXNzIFJlcG9ydFRhYiBleHRlbmRzIEJhY2tib25lLlZpZXdcbiAgbmFtZTogJ0luZm9ybWF0aW9uJ1xuICBkZXBlbmRlbmNpZXM6IFtdXG5cbiAgaW5pdGlhbGl6ZTogKEBtb2RlbCwgQG9wdGlvbnMpIC0+XG4gICAgIyBXaWxsIGJlIGluaXRpYWxpemVkIGJ5IFNlYVNrZXRjaCB3aXRoIHRoZSBmb2xsb3dpbmcgYXJndW1lbnRzOlxuICAgICMgICAqIG1vZGVsIC0gVGhlIHNrZXRjaCBiZWluZyByZXBvcnRlZCBvblxuICAgICMgICAqIG9wdGlvbnNcbiAgICAjICAgICAtIC5wYXJlbnQgLSB0aGUgcGFyZW50IHJlcG9ydCB2aWV3XG4gICAgIyAgICAgICAgY2FsbCBAb3B0aW9ucy5wYXJlbnQuZGVzdHJveSgpIHRvIGNsb3NlIHRoZSB3aG9sZSByZXBvcnQgd2luZG93XG4gICAgQGFwcCA9IHdpbmRvdy5hcHBcbiAgICBfLmV4dGVuZCBALCBAb3B0aW9uc1xuICAgIEByZXBvcnRSZXN1bHRzID0gbmV3IFJlcG9ydFJlc3VsdHMoQG1vZGVsLCBAZGVwZW5kZW5jaWVzKVxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdlcnJvcicsIEByZXBvcnRFcnJvclxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdqb2JzJywgQHJlbmRlckpvYkRldGFpbHNcbiAgICBAbGlzdGVuVG9PbmNlIEByZXBvcnRSZXN1bHRzLCAnam9icycsIEByZXBvcnRKb2JzXG4gICAgQGxpc3RlblRvIEByZXBvcnRSZXN1bHRzLCAnZmluaXNoZWQnLCBfLmJpbmQgQHJlbmRlciwgQFxuICAgIEBsaXN0ZW5Ub09uY2UgQHJlcG9ydFJlc3VsdHMsICdyZXF1ZXN0JywgQHJlcG9ydFJlcXVlc3RlZFxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICB0aHJvdyAncmVuZGVyIG1ldGhvZCBtdXN0IGJlIG92ZXJpZGRlbidcblxuICBzaG93OiAoKSAtPlxuICAgIEAkZWwuc2hvdygpXG4gICAgQHZpc2libGUgPSB0cnVlXG4gICAgaWYgQGRlcGVuZGVuY2llcz8ubGVuZ3RoIGFuZCAhQHJlcG9ydFJlc3VsdHMubW9kZWxzLmxlbmd0aFxuICAgICAgQHJlcG9ydFJlc3VsdHMucG9sbCgpXG4gICAgZWxzZSBpZiAhQGRlcGVuZGVuY2llcz8ubGVuZ3RoXG4gICAgICBAcmVuZGVyKClcbiAgICAgIEAkKCdbZGF0YS1hdHRyaWJ1dGUtdHlwZT1VcmxGaWVsZF0gLnZhbHVlLCBbZGF0YS1hdHRyaWJ1dGUtdHlwZT1VcGxvYWRGaWVsZF0gLnZhbHVlJykuZWFjaCAoKSAtPlxuICAgICAgICB0ZXh0ID0gJChAKS50ZXh0KClcbiAgICAgICAgaHRtbCA9IFtdXG4gICAgICAgIGZvciB1cmwgaW4gdGV4dC5zcGxpdCgnLCcpXG4gICAgICAgICAgaWYgdXJsLmxlbmd0aFxuICAgICAgICAgICAgbmFtZSA9IF8ubGFzdCh1cmwuc3BsaXQoJy8nKSlcbiAgICAgICAgICAgIGh0bWwucHVzaCBcIlwiXCI8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiI3t1cmx9XCI+I3tuYW1lfTwvYT5cIlwiXCJcbiAgICAgICAgJChAKS5odG1sIGh0bWwuam9pbignLCAnKVxuXG5cbiAgaGlkZTogKCkgLT5cbiAgICBAJGVsLmhpZGUoKVxuICAgIEB2aXNpYmxlID0gZmFsc2VcblxuICByZW1vdmU6ICgpID0+XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwgQGV0YUludGVydmFsXG4gICAgQHN0b3BMaXN0ZW5pbmcoKVxuICAgIHN1cGVyKClcblxuICByZXBvcnRSZXF1ZXN0ZWQ6ICgpID0+XG4gICAgQCRlbC5odG1sIHRlbXBsYXRlcy5yZXBvcnRMb2FkaW5nLnJlbmRlcih7fSlcblxuICByZXBvcnRFcnJvcjogKG1zZywgY2FuY2VsbGVkUmVxdWVzdCkgPT5cbiAgICB1bmxlc3MgY2FuY2VsbGVkUmVxdWVzdFxuICAgICAgaWYgbXNnIGlzICdKT0JfRVJST1InXG4gICAgICAgIEBzaG93RXJyb3IgJ0Vycm9yIHdpdGggc3BlY2lmaWMgam9iJ1xuICAgICAgZWxzZVxuICAgICAgICBAc2hvd0Vycm9yIG1zZ1xuXG4gIHNob3dFcnJvcjogKG1zZykgPT5cbiAgICBAJCgnLnByb2dyZXNzJykucmVtb3ZlKClcbiAgICBAJCgncC5lcnJvcicpLnJlbW92ZSgpXG4gICAgQCQoJ2g0JykudGV4dChcIkFuIEVycm9yIE9jY3VycmVkXCIpLmFmdGVyIFwiXCJcIlxuICAgICAgPHAgY2xhc3M9XCJlcnJvclwiIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+I3ttc2d9PC9wPlxuICAgIFwiXCJcIlxuXG4gIHJlcG9ydEpvYnM6ICgpID0+XG4gICAgdW5sZXNzIEBtYXhFdGFcbiAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCcxMDAlJylcbiAgICBAJCgnaDQnKS50ZXh0IFwiQW5hbHl6aW5nIERlc2lnbnNcIlxuXG4gIHN0YXJ0RXRhQ291bnRkb3duOiAoKSA9PlxuICAgIGlmIEBtYXhFdGFcbiAgICAgIF8uZGVsYXkgKCkgPT5cbiAgICAgICAgQHJlcG9ydFJlc3VsdHMucG9sbCgpXG4gICAgICAsIChAbWF4RXRhICsgMSkgKiAxMDAwXG4gICAgICBfLmRlbGF5ICgpID0+XG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLmNzcyAndHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb24nLCAnbGluZWFyJ1xuICAgICAgICBAJCgnLnByb2dyZXNzIC5iYXInKS5jc3MgJ3RyYW5zaXRpb24tZHVyYXRpb24nLCBcIiN7QG1heEV0YSArIDF9c1wiXG4gICAgICAgIEAkKCcucHJvZ3Jlc3MgLmJhcicpLndpZHRoKCcxMDAlJylcbiAgICAgICwgNTAwXG5cbiAgcmVuZGVySm9iRGV0YWlsczogKCkgPT5cbiAgICBtYXhFdGEgPSBudWxsXG4gICAgZm9yIGpvYiBpbiBAcmVwb3J0UmVzdWx0cy5tb2RlbHNcbiAgICAgIGlmIGpvYi5nZXQoJ2V0YVNlY29uZHMnKVxuICAgICAgICBpZiAhbWF4RXRhIG9yIGpvYi5nZXQoJ2V0YVNlY29uZHMnKSA+IG1heEV0YVxuICAgICAgICAgIG1heEV0YSA9IGpvYi5nZXQoJ2V0YVNlY29uZHMnKVxuICAgIGlmIG1heEV0YVxuICAgICAgQG1heEV0YSA9IG1heEV0YVxuICAgICAgQCQoJy5wcm9ncmVzcyAuYmFyJykud2lkdGgoJzUlJylcbiAgICAgIEBzdGFydEV0YUNvdW50ZG93bigpXG5cbiAgICBAJCgnW3JlbD1kZXRhaWxzXScpLmNzcygnZGlzcGxheScsICdibG9jaycpXG4gICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5jbGljayAoZSkgPT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgQCQoJ1tyZWw9ZGV0YWlsc10nKS5oaWRlKClcbiAgICAgIEAkKCcuZGV0YWlscycpLnNob3coKVxuICAgIGZvciBqb2IgaW4gQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICBpdGVtID0gbmV3IEpvYkl0ZW0oam9iKVxuICAgICAgaXRlbS5yZW5kZXIoKVxuICAgICAgQCQoJy5kZXRhaWxzJykuYXBwZW5kIGl0ZW0uZWxcblxuICBnZXRSZXN1bHQ6IChpZCkgLT5cbiAgICByZXN1bHRzID0gQGdldFJlc3VsdHMoKVxuICAgIHJlc3VsdCA9IF8uZmluZCByZXN1bHRzLCAocikgLT4gci5wYXJhbU5hbWUgaXMgaWRcbiAgICB1bmxlc3MgcmVzdWx0P1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyByZXN1bHQgd2l0aCBpZCAnICsgaWQpXG4gICAgcmVzdWx0LnZhbHVlXG5cbiAgZ2V0Rmlyc3RSZXN1bHQ6IChwYXJhbSwgaWQpIC0+XG4gICAgcmVzdWx0ID0gQGdldFJlc3VsdChwYXJhbSlcbiAgICB0cnlcbiAgICAgIHJldHVybiByZXN1bHRbMF0uZmVhdHVyZXNbMF0uYXR0cmlidXRlc1tpZF1cbiAgICBjYXRjaCBlXG4gICAgICB0aHJvdyBcIkVycm9yIGZpbmRpbmcgI3twYXJhbX06I3tpZH0gaW4gZ3AgcmVzdWx0c1wiXG5cbiAgZ2V0UmVzdWx0czogKCkgLT5cbiAgICByZXN1bHRzID0gQHJlcG9ydFJlc3VsdHMubWFwKChyZXN1bHQpIC0+IHJlc3VsdC5nZXQoJ3Jlc3VsdCcpLnJlc3VsdHMpXG4gICAgdW5sZXNzIHJlc3VsdHM/Lmxlbmd0aFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBncCByZXN1bHRzJylcbiAgICBfLmZpbHRlciByZXN1bHRzLCAocmVzdWx0KSAtPlxuICAgICAgcmVzdWx0LnBhcmFtTmFtZSBub3QgaW4gWydSZXN1bHRDb2RlJywgJ1Jlc3VsdE1zZyddXG5cbiAgcmVjb3JkU2V0OiAoZGVwZW5kZW5jeSwgcGFyYW1OYW1lLCBza2V0Y2hDbGFzc0lkPWZhbHNlKSAtPlxuICAgIHVubGVzcyBkZXBlbmRlbmN5IGluIEBkZXBlbmRlbmNpZXNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlVua25vd24gZGVwZW5kZW5jeSAje2RlcGVuZGVuY3l9XCJcbiAgICBkZXAgPSBAcmVwb3J0UmVzdWx0cy5maW5kIChyKSAtPiByLmdldCgnc2VydmljZU5hbWUnKSBpcyBkZXBlbmRlbmN5XG4gICAgdW5sZXNzIGRlcFxuICAgICAgY29uc29sZS5sb2cgQHJlcG9ydFJlc3VsdHMubW9kZWxzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJDb3VsZCBub3QgZmluZCByZXN1bHRzIGZvciAje2RlcGVuZGVuY3l9LlwiXG4gICAgcGFyYW0gPSBfLmZpbmQgZGVwLmdldCgncmVzdWx0JykucmVzdWx0cywgKHBhcmFtKSAtPlxuICAgICAgcGFyYW0ucGFyYW1OYW1lIGlzIHBhcmFtTmFtZVxuICAgIHVubGVzcyBwYXJhbVxuICAgICAgY29uc29sZS5sb2cgZGVwLmdldCgnZGF0YScpLnJlc3VsdHNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkNvdWxkIG5vdCBmaW5kIHBhcmFtICN7cGFyYW1OYW1lfSBpbiAje2RlcGVuZGVuY3l9XCJcbiAgICBuZXcgUmVjb3JkU2V0KHBhcmFtLCBALCBza2V0Y2hDbGFzc0lkKVxuXG4gIGVuYWJsZVRhYmxlUGFnaW5nOiAoKSAtPlxuICAgIEAkKCdbZGF0YS1wYWdpbmddJykuZWFjaCAoKSAtPlxuICAgICAgJHRhYmxlID0gJChAKVxuICAgICAgcGFnZVNpemUgPSAkdGFibGUuZGF0YSgncGFnaW5nJylcbiAgICAgIHJvd3MgPSAkdGFibGUuZmluZCgndGJvZHkgdHInKS5sZW5ndGhcbiAgICAgIHBhZ2VzID0gTWF0aC5jZWlsKHJvd3MgLyBwYWdlU2l6ZSlcbiAgICAgIGlmIHBhZ2VzID4gMVxuICAgICAgICAkdGFibGUuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgIDx0Zm9vdD5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgPHRkIGNvbHNwYW49XCIjeyR0YWJsZS5maW5kKCd0aGVhZCB0aCcpLmxlbmd0aH1cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFnaW5hdGlvblwiPlxuICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5QcmV2PC9hPjwvbGk+XG4gICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3Rmb290PlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgdWwgPSAkdGFibGUuZmluZCgndGZvb3QgdWwnKVxuICAgICAgICBmb3IgaSBpbiBfLnJhbmdlKDEsIHBhZ2VzICsgMSlcbiAgICAgICAgICB1bC5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj4je2l9PC9hPjwvbGk+XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHVsLmFwcGVuZCBcIlwiXCJcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIj5OZXh0PC9hPjwvbGk+XG4gICAgICAgIFwiXCJcIlxuICAgICAgICAkdGFibGUuZmluZCgnbGkgYScpLmNsaWNrIChlKSAtPlxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICRhID0gJCh0aGlzKVxuICAgICAgICAgIHRleHQgPSAkYS50ZXh0KClcbiAgICAgICAgICBpZiB0ZXh0IGlzICdOZXh0J1xuICAgICAgICAgICAgYSA9ICRhLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5uZXh0KCkuZmluZCgnYScpXG4gICAgICAgICAgICB1bmxlc3MgYS50ZXh0KCkgaXMgJ05leHQnXG4gICAgICAgICAgICAgIGEuY2xpY2soKVxuICAgICAgICAgIGVsc2UgaWYgdGV4dCBpcyAnUHJldidcbiAgICAgICAgICAgIGEgPSAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucHJldigpLmZpbmQoJ2EnKVxuICAgICAgICAgICAgdW5sZXNzIGEudGV4dCgpIGlzICdQcmV2J1xuICAgICAgICAgICAgICBhLmNsaWNrKClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAkYS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICRhLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBuID0gcGFyc2VJbnQodGV4dClcbiAgICAgICAgICAgICR0YWJsZS5maW5kKCd0Ym9keSB0cicpLmhpZGUoKVxuICAgICAgICAgICAgb2Zmc2V0ID0gcGFnZVNpemUgKiAobiAtIDEpXG4gICAgICAgICAgICAkdGFibGUuZmluZChcInRib2R5IHRyXCIpLnNsaWNlKG9mZnNldCwgbipwYWdlU2l6ZSkuc2hvdygpXG4gICAgICAgICQoJHRhYmxlLmZpbmQoJ2xpIGEnKVsxXSkuY2xpY2soKVxuXG4gICAgICBpZiBub1Jvd3NNZXNzYWdlID0gJHRhYmxlLmRhdGEoJ25vLXJvd3MnKVxuICAgICAgICBpZiByb3dzIGlzIDBcbiAgICAgICAgICBwYXJlbnQgPSAkdGFibGUucGFyZW50KClcbiAgICAgICAgICAkdGFibGUucmVtb3ZlKClcbiAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2xhc3MgJ3RhYmxlQ29udGFpbmVyJ1xuICAgICAgICAgIHBhcmVudC5hcHBlbmQgXCI8cD4je25vUm93c01lc3NhZ2V9PC9wPlwiXG5cbiAgZW5hYmxlTGF5ZXJUb2dnbGVyczogKCkgLT5cbiAgICBlbmFibGVMYXllclRvZ2dsZXJzKEAkZWwpXG5cbiAgZ2V0Q2hpbGRyZW46IChza2V0Y2hDbGFzc0lkKSAtPlxuICAgIF8uZmlsdGVyIEBjaGlsZHJlbiwgKGNoaWxkKSAtPiBjaGlsZC5nZXRTa2V0Y2hDbGFzcygpLmlkIGlzIHNrZXRjaENsYXNzSWRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydFRhYlxuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBcbiAgcm91bmQ6IChudW1iZXIsIGRlY2ltYWxQbGFjZXMpIC0+XG4gICAgdW5sZXNzIF8uaXNOdW1iZXIgbnVtYmVyXG4gICAgICBudW1iZXIgPSBwYXJzZUZsb2F0KG51bWJlcilcbiAgICBtdWx0aXBsaWVyID0gTWF0aC5wb3cgMTAsIGRlY2ltYWxQbGFjZXNcbiAgICBNYXRoLnJvdW5kKG51bWJlciAqIG11bHRpcGxpZXIpIC8gbXVsdGlwbGllciIsInRoaXNbXCJUZW1wbGF0ZXNcIl0gPSB0aGlzW1wiVGVtcGxhdGVzXCJdIHx8IHt9O1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9hdHRyaWJ1dGVzL2F0dHJpYnV0ZUl0ZW1cIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPHRyIGRhdGEtYXR0cmlidXRlLWlkPVxcXCJcIik7Xy5iKF8udihfLmYoXCJpZFwiLGMscCwwKSkpO18uYihcIlxcXCIgZGF0YS1hdHRyaWJ1dGUtZXhwb3J0aWQ9XFxcIlwiKTtfLmIoXy52KF8uZihcImV4cG9ydGlkXCIsYyxwLDApKSk7Xy5iKFwiXFxcIiBkYXRhLWF0dHJpYnV0ZS10eXBlPVxcXCJcIik7Xy5iKF8udihfLmYoXCJ0eXBlXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDx0ZCBjbGFzcz1cXFwibmFtZVxcXCI+XCIpO18uYihfLnYoXy5mKFwibmFtZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8dGQgY2xhc3M9XFxcInZhbHVlXFxcIj5cIik7Xy5iKF8udihfLmYoXCJmb3JtYXR0ZWRWYWx1ZVwiLGMscCwwKSkpO18uYihcIjwvdGQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC90cj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcIm5vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9hdHRyaWJ1dGVzL2F0dHJpYnV0ZXNUYWJsZVwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8dGFibGUgY2xhc3M9XFxcImF0dHJpYnV0ZXNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO2lmKF8ucyhfLmYoXCJhdHRyaWJ1dGVzXCIsYyxwLDEpLGMscCwwLDQ0LDgxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlSXRlbVwiLGMscCxcIiAgICBcIikpO30pO2MucG9wKCk7fV8uYihcIjwvdGFibGU+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJub2RlX21vZHVsZXMvc2Vhc2tldGNoLXJlcG9ydGluZy1hcGkvZ2VuZXJpY0F0dHJpYnV0ZXNcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7aWYoXy5zKF8uZChcInNrZXRjaENsYXNzLmRlbGV0ZWRcIixjLHAsMSksYyxwLDAsMjQsMjcwLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC13YXJuXFxcIiBzdHlsZT1cXFwibWFyZ2luLWJvdHRvbToxMHB4O1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBUaGlzIHNrZXRjaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgXFxcIlwiKTtfLmIoXy52KF8uZChcInNrZXRjaENsYXNzLm5hbWVcIixjLHAsMCkpKTtfLmIoXCJcXFwiIHRlbXBsYXRlLCB3aGljaCBpc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgbm8gbG9uZ2VyIGF2YWlsYWJsZS4gWW91IHdpbGwgbm90IGJlIGFibGUgdG8gY29weSB0aGlzIHNrZXRjaCBvciBtYWtlIG5ld1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgc2tldGNoZXMgb2YgdGhpcyB0eXBlLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvblxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+XCIpO18uYihfLnYoXy5kKFwic2tldGNoQ2xhc3MubmFtZVwiLGMscCwwKSkpO18uYihcIiBBdHRyaWJ1dGVzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXy5ycChcImF0dHJpYnV0ZXMvYXR0cmlidXRlc1RhYmxlXCIsYyxwLFwiICAgIFwiKSk7Xy5iKFwiICA8L3RhYmxlPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wibm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpL3JlcG9ydExvYWRpbmdcIl0gPSBuZXcgSG9nYW4uVGVtcGxhdGUoZnVuY3Rpb24oYyxwLGkpe3ZhciBfPXRoaXM7Xy5iKGk9aXx8XCJcIik7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0TG9hZGluZ1xcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8IS0tIDxkaXYgY2xhc3M9XFxcInNwaW5uZXJcXFwiPjM8L2Rpdj4gLS0+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVxdWVzdGluZyBSZXBvcnQgZnJvbSBTZXJ2ZXI8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MgcHJvZ3Jlc3Mtc3RyaXBlZCBhY3RpdmVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJiYXJcXFwiIHN0eWxlPVxcXCJ3aWR0aDogMTAwJTtcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8YSBocmVmPVxcXCIjXFxcIiByZWw9XFxcImRldGFpbHNcXFwiPmRldGFpbHM8L2E+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImRldGFpbHNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO1xuXG5pZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gdGhpc1tcIlRlbXBsYXRlc1wiXTtcbn0iLCJHZW5lcmljQXR0cmlidXRlc1RhYiA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS9zY3JpcHRzL2dlbmVyaWNBdHRyaWJ1dGVzVGFiLmNvZmZlZSdcblxud2luZG93LmFwcC5yZWdpc3RlclJlcG9ydCAocmVwb3J0KSAtPlxuICByZXBvcnQudGFicyBbR2VuZXJpY0F0dHJpYnV0ZXNUYWJdXG4gICMgcGF0aCBtdXN0IGJlIHJlbGF0aXZlIHRvIGRpc3QvXG4gIHJlcG9ydC5zdHlsZXNoZWV0cyBbJy4vbWFpbi5jc3MnXSIsIlJlcG9ydFRhYiA9IHJlcXVpcmUgJ3JlcG9ydFRhYidcbnRlbXBsYXRlcyA9IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy90ZW1wbGF0ZXMuanMnXG5cbl9wYXJ0aWFscyA9IHJlcXVpcmUgJy4uL25vZGVfbW9kdWxlcy9zZWFza2V0Y2gtcmVwb3J0aW5nLWFwaS90ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzJ1xucGFydGlhbHMgPSBbXVxuZm9yIGtleSwgdmFsIG9mIF9wYXJ0aWFsc1xuICBwYXJ0aWFsc1trZXkucmVwbGFjZSgnbm9kZV9tb2R1bGVzL3NlYXNrZXRjaC1yZXBvcnRpbmctYXBpLycsICcnKV0gPSB2YWxcblxuY2xhc3MgUmVwb3J0R3JhcGhUYWIgZXh0ZW5kcyBSZXBvcnRUYWJcblxuICBuYW1lOiAnUmVwb3J0R3JhcGgnXG4gIGNsYXNzTmFtZTogJ1JlcG9ydEdyYXBoJ1xuICB0aW1lb3V0OiAxMjAwMDBcblxuICByZW5kZXJEaWZmczogKHdoaWNoX2Nob3NlbiwgY2UsIHRhYikgLT4gXG5cblxuICAgIG5hbWUgPSBAJCh3aGljaF9jaG9zZW4pLnZhbCgpXG4gICAgQCQoJy5kZWZhdWx0LWNob3Nlbi1zZWxlY3Rpb24nKydfJyt0YWIpLmhpZGUoKVxuXG4gICAgaWYgbmFtZSA9PSBcIk5vIFBBIDI5NVwiXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5ub19wYTI5NScsIGNlLCB0YWIpKS5zaG93KClcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLnBhMjk1JyxjZSx0YWIpKS5oaWRlKClcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLmRibF9wYTI5NScsY2UsdGFiKSkuaGlkZSgpXG4gICAgZWxzZSBpZiBuYW1lID09IFwiUEEgMjk1XCJcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLm5vX3BhMjk1JyxjZSx0YWIpKS5oaWRlKClcbiAgICAgIEAkKEBnZXRFbGVtTmFtZSgnLnBhMjk1JywgY2UsIHRhYikpLnNob3coKVxuICAgICAgQCQoQGdldEVsZW1OYW1lKCcuZGJsX3BhMjk1JyxjZSx0YWIpKS5oaWRlKClcbiAgICBlbHNlXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5ub19wYTI5NScsY2UsdGFiKSkuaGlkZSgpXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5wYTI5NScsY2UsdGFiKSkuaGlkZSgpXG4gICAgICBAJChAZ2V0RWxlbU5hbWUoJy5kYmxfcGEyOTUnLGNlLHRhYikpLnNob3coKVxuXG4gIGdldEVsZW1OYW1lOiAobmFtZSwgY29tbV9vcl9lYywgdGFiKSAtPlxuICAgIHJldHVybiBuYW1lK1wiX1wiK2NvbW1fb3JfZWMrXCJfXCIrdGFiXG5cbiAgZ2V0VXNlclNhdmluZ3M6IChyZWNTZXQsIHVzZXJfc3RhcnRfdmFsdWVzLCBiYXNlX3ZhbHVlcywgZGVjcykgLT5cblxuICAgIHNhdmluZ3MgPSAwXG4gICAgdHJ5XG4gICAgICBmb3IgdmFsLCBkZXggaW4gYmFzZV92YWx1ZXNcbiAgICAgICAgdXNlcl92YWwgPSB1c2VyX3N0YXJ0X3ZhbHVlc1tkZXhdLlZBTFVFXG4gICAgICAgIGJhc2VfdmFsID0gdmFsLlZBTFVFXG4gICAgICAgIHNhdmluZ3MgKz0gKGJhc2VfdmFsIC0gdXNlcl92YWwpXG4gICAgICByZXR1cm4gTWF0aC5yb3VuZChzYXZpbmdzLCBkZWNzKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICByZXR1cm4gMC4wXG5cbiAgZ2V0VXNlck1hcDogKHJlY1NldCwgdXNlcl90YWcsIGJhc2VfdmFsdWVzKSAtPlxuICAgIHVzZXJfc3RhcnRfdmFsdWVzID0gW11cbiAgICBmb3IgcmVjIGluIHJlY1NldFxuICAgICAgaWYgcmVjIGFuZCByZWMuVFlQRSA9PSB1c2VyX3RhZ1xuICAgICAgICB1c2VyX3N0YXJ0X3ZhbHVlcy5wdXNoKHJlYylcbiAgICB1c2VyX3N0YXJ0X3ZhbHVlcyA9IF8uc29ydEJ5IHVzZXJfc3RhcnRfdmFsdWVzLCAocm93KSAtPiByb3dbJ1lFQVInXVxuICAgIHJldHVybiB1c2VyX3N0YXJ0X3ZhbHVlc1xuXG5cbiAgZ2V0TWFwOiAocmVjU2V0LCBzY2VuYXJpbykgLT5cbiAgICBzY2VuYXJpb192YWx1ZXMgPSBbXVxuICAgIGZvciByZWMgaW4gcmVjU2V0XG4gICAgICBpZiByZWMgYW5kIHJlYy5UWVBFID09IHNjZW5hcmlvXG4gICAgICAgIHNjZW5hcmlvX3ZhbHVlcy5wdXNoKHJlYylcblxuICAgIHJldHVybiBfLnNvcnRCeSBzY2VuYXJpb192YWx1ZXMsIChyb3cpIC0+IHJvd1snWUVBUiddXG4gIFxuICBhZGRDb21tYXM6IChudW1fc3RyKSA9PlxuICAgIG51bV9zdHIgKz0gJydcbiAgICB4ID0gbnVtX3N0ci5zcGxpdCgnLicpXG4gICAgeDEgPSB4WzBdXG4gICAgeDIgPSBpZiB4Lmxlbmd0aCA+IDEgdGhlbiAnLicgKyB4WzFdIGVsc2UgJydcbiAgICByZ3ggPSAvKFxcZCspKFxcZHszfSkvXG4gICAgd2hpbGUgcmd4LnRlc3QoeDEpXG4gICAgICB4MSA9IHgxLnJlcGxhY2Uocmd4LCAnJDEnICsgJywnICsgJyQyJylcbiAgICByZXR1cm4geDEgKyB4MlxuXG4gIGRyYXdDaGFydDogKHdoaWNoQ2hhcnQpID0+XG4gICAgdmlldyA9IEBcbiAgICB3aWR0aCA9IDM2MFxuICAgIGhlaWdodCA9IDUwMFxuICAgIG1hcmdpbiA9IHtsZWZ0OjQwLCB0b3A6NSwgcmlnaHQ6MjAsIGJvdHRvbTogNDAsIGlubmVyOjEwfVxuICAgIGF4aXNwb3MgPSB7eHRpdGxlOjUsIHl0aXRsZTozMCwgeGxhYmVsOjUsIHlsYWJlbDoxNX1cbiAgICB4bGltID0gbnVsbFxuICAgIHlsaW0gPSBudWxsXG4gICAgbnh0aWNrcyA9IDVcbiAgICB4dGlja3MgPSBudWxsXG4gICAgbnl0aWNrcyA9IDVcbiAgICB5dGlja3MgPSBudWxsXG5cbiAgICByZWN0Y29sb3IgPSBcIiNkYmU0ZWVcIlxuICAgIHRpY2tjb2xvciA9IFwiI2RiZTRmZlwiXG4gICAgY29uc29sZS5sb2coXCJkcmF3aW5nIGNoYXJ0IG5vdy4uLlwiKVxuXG4gICAgcG9pbnRzaXplID0gMSAjIGRlZmF1bHQgPSBubyB2aXNpYmxlIHBvaW50cyBhdCBtYXJrZXJzXG4gICAgeGxhYiA9IFwiWFwiXG4gICAgeWxhYiA9IFwiWSBzY29yZVwiXG4gICAgeXNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcbiAgICB4c2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXG4gICAgbGVnZW5kaGVpZ2h0ID0gMzAwXG4gICAgcG9pbnRzU2VsZWN0ID0gbnVsbFxuICAgIGxhYmVsc1NlbGVjdCA9IG51bGxcbiAgICBsZWdlbmRTZWxlY3QgPSBudWxsXG4gICAgIyMgdGhlIG1haW4gZnVuY3Rpb25cbiAgICBjaGFydCA9IChzZWxlY3Rpb24pIC0+XG4gICAgICBzZWxlY3Rpb24uZWFjaCAoZGF0YSkgLT5cbiAgICAgICAgeSA9IFtdXG4gICAgICAgIHggPSBbMjAxMiwgMjAxNSwgMjAyMCwgMjAyNSwgMjAzMCwgMjAzNV1cbiAgICAgICBcbiAgICAgICAgZm9yIHNjZW4gaW4gZGF0YVxuICAgICAgICAgIGZvciBkIGluIHNjZW5cbiAgICAgICAgICAgIHkucHVzaChkLlZBTFVFLzEwMDAwMDApXG5cblxuICAgICAgICAjeCA9IGRhdGEubWFwIChkKSAtPiBwYXJzZUZsb2F0KGQuWUVBUilcbiAgICAgICAgI3kgPSBkYXRhLm1hcCAoZCkgLT4gcGFyc2VGbG9hdChkLlZBTFVFKVxuXG5cbiAgICAgICAgcGFuZWxvZmZzZXQgPSAxMFxuICAgICAgICBwYW5lbHdpZHRoID0gd2lkdGhcblxuICAgICAgICBwYW5lbGhlaWdodCA9IGhlaWdodFxuXG4gICAgICAgIHhsaW0gPSBbZDMubWluKHgpLTEsIHBhcnNlRmxvYXQoZDMubWF4KHgpKzEpXSBpZiAhKHhsaW0/KVxuXG4gICAgICAgIHlsaW0gPSBbZDMubWluKHkpLCBwYXJzZUZsb2F0KGQzLm1heCh5KSldIGlmICEoeWxpbT8pXG5cblxuICAgICAgICBjdXJyZWxlbSA9IGQzLnNlbGVjdCh2aWV3LiQod2hpY2hDaGFydClbMF0pXG4gICAgICAgIHN2ZyA9IGQzLnNlbGVjdCh2aWV3LiQod2hpY2hDaGFydClbMF0pLmFwcGVuZChcInN2Z1wiKS5kYXRhKFtkYXRhXSlcbiAgICAgICAgc3ZnLmFwcGVuZChcImdcIilcblxuICAgICAgICAjIFVwZGF0ZSB0aGUgb3V0ZXIgZGltZW5zaW9ucy5cbiAgICAgICAgc3ZnLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCttYXJnaW4ubGVmdCttYXJnaW4ucmlnaHQpXG4gICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCttYXJnaW4udG9wK21hcmdpbi5ib3R0b20rZGF0YS5sZW5ndGgqMzUpXG5cbiAgICAgICAgZyA9IHN2Zy5zZWxlY3QoXCJnXCIpXG5cbiAgICAgICAgIyBib3hcbiAgICAgICAgZy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAuYXR0cihcInhcIiwgcGFuZWxvZmZzZXQrbWFyZ2luLmxlZnQpXG4gICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLnRvcClcbiAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHBhbmVsaGVpZ2h0KVxuICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBwYW5lbHdpZHRoKVxuICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwid2hpdGVcIilcbiAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwibm9uZVwiKVxuXG5cbiAgICAgICAgIyBzaW1wbGUgc2NhbGVzIChpZ25vcmUgTkEgYnVzaW5lc3MpXG4gICAgICAgIHhyYW5nZSA9IFttYXJnaW4ubGVmdCtwYW5lbG9mZnNldCttYXJnaW4uaW5uZXIsIG1hcmdpbi5sZWZ0K3BhbmVsb2Zmc2V0K3BhbmVsd2lkdGgtbWFyZ2luLmlubmVyXVxuICAgICAgICB5cmFuZ2UgPSBbbWFyZ2luLnRvcCtwYW5lbGhlaWdodC1tYXJnaW4uaW5uZXIsIG1hcmdpbi50b3ArbWFyZ2luLmlubmVyXVxuICAgICAgICB4c2NhbGUuZG9tYWluKHhsaW0pLnJhbmdlKHhyYW5nZSlcbiAgICAgICAgeXNjYWxlLmRvbWFpbih5bGltKS5yYW5nZSh5cmFuZ2UpXG4gICAgICAgIHhzID0gZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKHhsaW0pLnJhbmdlKHhyYW5nZSlcbiAgICAgICAgeXMgPSBkMy5zY2FsZS5saW5lYXIoKS5kb21haW4oeWxpbSkucmFuZ2UoeXJhbmdlKVxuXG5cbiAgICAgICAgIyBpZiB5dGlja3Mgbm90IHByb3ZpZGVkLCB1c2Ugbnl0aWNrcyB0byBjaG9vc2UgcHJldHR5IG9uZXNcbiAgICAgICAgeXRpY2tzID0geXMudGlja3Mobnl0aWNrcykgaWYgISh5dGlja3M/KVxuICAgICAgICB4dGlja3MgPSB4cy50aWNrcyhueHRpY2tzKSBpZiAhKHh0aWNrcz8pXG5cbiAgICAgICAgIyB4LWF4aXNcbiAgICAgICAgeGF4aXMgPSBnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwieCBheGlzXCIpXG4gICAgICAgIHhheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoeHRpY2tzKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAuYXR0cihcIngxXCIsIChkKSAtPiB4c2NhbGUoZCkpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCAoZCkgLT4geHNjYWxlKGQpKVxuICAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgbWFyZ2luLnRvcCtoZWlnaHQtNSlcbiAgICAgICAgICAgICAuYXR0cihcInkyXCIsIG1hcmdpbi50b3AraGVpZ2h0KVxuICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpXG4gICAgICAgICAgICAgLnN0eWxlKFwicG9pbnRlci1ldmVudHNcIiwgXCJub25lXCIpXG4gICAgICAgICN0aGUgeCBheGlzIHllYXIgbGFiZWxzXG4gICAgICAgIHhheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoeHRpY2tzKVxuICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAuYXR0cihcInhcIiwgKGQpIC0+IHhzY2FsZShkKS0xNClcbiAgICAgICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLnRvcCtoZWlnaHQrYXhpc3Bvcy54bGFiZWwrMTApXG4gICAgICAgICAgICAgLnRleHQoKGQpIC0+IGZvcm1hdEF4aXMoeHRpY2tzKShkKSlcbiAgICAgICAgI3RoZSB4IGF4aXMgdGl0bGVcbiAgICAgICAgeGF4aXMuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ4YXhpcy10aXRsZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBtYXJnaW4ubGVmdCt3aWR0aC8yKVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wK2hlaWdodCtheGlzcG9zLnh0aXRsZSszMClcbiAgICAgICAgICAgICAudGV4dCh4bGFiKVxuXG4gICAgICAgICNkcmF3IHRoZSBsZWdlbmRcbiAgICAgICAgZm9yIHNjZW5hcmlvLCBjbnQgaW4gZGF0YVxuICAgICAgICAgIGxpbmVfY29sb3IgPSBnZXRTdHJva2VDb2xvcihzY2VuYXJpbylcbiAgICAgICAgICB4YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKFtzY2VuYXJpb1swXV0pXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwibGluZVwiKVxuXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCAoZCxpKSAtPiByZXR1cm4gbWFyZ2luLmxlZnQpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCAoZCxpKSAtPiByZXR1cm4gbWFyZ2luLmxlZnQrMTApXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCAoZCxpKSAtPiBtYXJnaW4udG9wK2hlaWdodCtheGlzcG9zLnh0aXRsZSsoKGNudCsxKSozMCkrNilcbiAgICAgICAgICAgICAuYXR0cihcInkyXCIsIChkLGkpIC0+IG1hcmdpbi50b3AraGVpZ2h0K2F4aXNwb3MueHRpdGxlKygoY250KzEpKjMwKSs2KVxuICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJjaGFydC1saW5lXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgKGQsaSkgLT4gbGluZV9jb2xvcilcbiAgICAgICAgICAgICAuYXR0cihcImNvbG9yXCIsIChkLGkpIC0+IGxpbmVfY29sb3IpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMylcblxuICAgICAgICAjYW5kIHRoZSBsZWdlbmQgdGV4dFxuICAgICAgICBmb3Igc2NlbmFyaW8sIGNudCBpbiBkYXRhICAgICAgICAgIFxuICAgICAgICAgIHhheGlzLnNlbGVjdEFsbChcImVtcHR5XCIpXG4gICAgICAgICAgICAgLmRhdGEoW3NjZW5hcmlvWzBdXSlcbiAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxlZ2VuZC10ZXh0XCIpXG4gICAgICAgICAgIC5hdHRyKFwieFwiLCAoZCxpKSAtPlxuICAgICAgICAgICAgICByZXR1cm4gKG1hcmdpbi5sZWZ0KzE3KSlcbiAgICAgICAgICAgLmF0dHIoXCJ5XCIsIChkLGkpIC0+XG4gICAgICAgICAgICAgIG1hcmdpbi50b3AraGVpZ2h0KzEwK2F4aXNwb3MueHRpdGxlKygoY250KzEpKjMwKSlcbiAgICAgICAgICAgLnRleHQoKGQsaSkgLT4gcmV0dXJuIGdldFNjZW5hcmlvTmFtZShbZF0pKVxuXG4gICAgICAgICMgeS1heGlzXG4gICAgICAgIHlheGlzID0gZy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInkgYXhpc1wiKVxuICAgICAgICB5YXhpcy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgIC5kYXRhKHl0aWNrcylcbiAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgIC5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCAoZCkgLT4geXNjYWxlKGQpKVxuICAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgKGQpIC0+IHlzY2FsZShkKSlcbiAgICAgICAgICAgICAuYXR0cihcIngxXCIsIG1hcmdpbi5sZWZ0KzEwKVxuICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgbWFyZ2luLmxlZnQrMTUpXG4gICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxuICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCB0aWNrY29sb3IpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSlcbiAgICAgICAgICAgICAuc3R5bGUoXCJwb2ludGVyLWV2ZW50c1wiLCBcIm5vbmVcIilcbiAgICAgICAgeWF4aXMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAgICAuZGF0YSh5dGlja3MpXG4gICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCAoZCkgLT4geXNjYWxlKGQpKzMpXG4gICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIG1hcmdpbi5sZWZ0KzMtYXhpc3Bvcy55bGFiZWwpXG4gICAgICAgICAgICAgLnRleHQoKGQpIC0+IGZvcm1hdEF4aXMoeXRpY2tzKShkKSlcbiAgICAgICAgeWF4aXMuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ0aXRsZVwiKVxuICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBtYXJnaW4udG9wKzM1K2hlaWdodC8yKVxuICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBtYXJnaW4ubGVmdCs4LWF4aXNwb3MueXRpdGxlKVxuICAgICAgICAgICAgIC50ZXh0KHlsYWIpXG4gICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoMjcwLCN7bWFyZ2luLmxlZnQrOC1heGlzcG9zLnl0aXRsZX0sI3ttYXJnaW4udG9wKzM1K2hlaWdodC8yfSlcIilcblxuICAgICAgICBwb2ludHMgPSBnLmFwcGVuZChcImdcIikuYXR0cihcImlkXCIsIFwicG9pbnRzXCIpXG5cbiAgICAgICAgZm9yIHNjZW5hcmlvIGluIGRhdGFcbiAgICAgICAgICBsaW5lX2NvbG9yID0gZ2V0U3Ryb2tlQ29sb3Ioc2NlbmFyaW8pXG4gICAgICAgICAgIyMjXG4gICAgICAgICAgcG9pbnRzU2VsZWN0ID1cbiAgICAgICAgICAgIHBvaW50cy5zZWxlY3RBbGwoXCJlbXB0eVwiKVxuICAgICAgICAgICAgICAgICAgLmRhdGEoc2NlbmFyaW8pXG4gICAgICAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImNpcmNsZVwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjeFwiLCAoZCxpKSAtPiB4c2NhbGUoZC5ZRUFSKSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY3lcIiwgKGQsaSkgLT4geXNjYWxlKGQuVkFMVUUvMTAwMDAwMCkpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIChkLGkpIC0+IFwicHQje2l9XCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInJcIiwgcG9pbnRzaXplKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIChkLGkpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbCA9IGxpbmVfY29sb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgKGQsIGkpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gTWF0aC5mbG9vcihpLzE3KSAlIDVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2wgPSBsaW5lX2NvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwiMVwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJvcGFjaXR5XCIsIChkLGkpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxIGlmICh4W2ldPyBvciB4TkEuaGFuZGxlKSBhbmQgKHlbaV0/IG9yIHlOQS5oYW5kbGUpXG4gICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwKVxuICAgICAgICAgICMjI1xuICAgICAgICBsaW5lID0gZDMuc3ZnLmxpbmUoZClcbiAgICAgICAgICAgIC5pbnRlcnBvbGF0ZShcImJhc2lzXCIpXG4gICAgICAgICAgICAueCggKGQpIC0+IHhzY2FsZShwYXJzZUludChkLllFQVIpKSlcbiAgICAgICAgICAgIC55KCAoZCkgLT4geXNjYWxlKGQuVkFMVUUvMTAwMDAwMCkpXG5cblxuICAgICAgICBwb2ludHMuc2VsZWN0QWxsKFwiZW1wdHlcIilcbiAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZChcInBhdGhcIilcbiAgICAgICAgICAuYXR0cihcImRcIiwgKGQpIC0+IGxpbmUgZClcbiAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCAoZCkgLT4gZ2V0U3Ryb2tlQ29sb3IoZCkpXG4gICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMylcbiAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG5cbiAgICAgICAgIyBib3hcbiAgICAgICAgZy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgICAgICAuYXR0cihcInhcIiwgbWFyZ2luLmxlZnQrcGFuZWxvZmZzZXQpXG4gICAgICAgICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLnRvcClcbiAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHBhbmVsaGVpZ2h0KVxuICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBwYW5lbHdpZHRoKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJibGFja1wiKVxuICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgXCJub25lXCIpXG5cblxuXG4gICAgIyMgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzXG5cblxuICAgIGNoYXJ0LndpZHRoID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHdpZHRoIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB3aWR0aCA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQuaGVpZ2h0ID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIGhlaWdodCBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgaGVpZ2h0ID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5tYXJnaW4gPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gbWFyZ2luIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICBtYXJnaW4gPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LmF4aXNwb3MgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gYXhpc3BvcyBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgYXhpc3BvcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueGxpbSA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB4bGltIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB4bGltID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5ueHRpY2tzID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIG54dGlja3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIG54dGlja3MgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lnh0aWNrcyA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB4dGlja3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHh0aWNrcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueWxpbSA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB5bGltIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB5bGltID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5ueXRpY2tzID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIG55dGlja3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIG55dGlja3MgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0Lnl0aWNrcyA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB5dGlja3MgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHl0aWNrcyA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQucmVjdGNvbG9yID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHJlY3Rjb2xvciBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgcmVjdGNvbG9yID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC5wb2ludGNvbG9yID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHBvaW50Y29sb3IgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHBvaW50Y29sb3IgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnBvaW50c2l6ZSA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiBwb2ludHNpemUgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHBvaW50c2l6ZSA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQucG9pbnRzdHJva2UgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4gcG9pbnRzdHJva2UgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHBvaW50c3Ryb2tlID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC54bGFiID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHhsYWIgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHhsYWIgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnlsYWIgPSAodmFsdWUpIC0+XG4gICAgICByZXR1cm4geWxhYiBpZiAhYXJndW1lbnRzLmxlbmd0aFxuICAgICAgeWxhYiA9IHZhbHVlXG4gICAgICBjaGFydFxuXG4gICAgY2hhcnQueHZhciA9ICh2YWx1ZSkgLT5cbiAgICAgIHJldHVybiB4dmFyIGlmICFhcmd1bWVudHMubGVuZ3RoXG4gICAgICB4dmFyID0gdmFsdWVcbiAgICAgIGNoYXJ0XG5cbiAgICBjaGFydC55dmFyID0gKHZhbHVlKSAtPlxuICAgICAgcmV0dXJuIHl2YXIgaWYgIWFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHl2YXIgPSB2YWx1ZVxuICAgICAgY2hhcnRcblxuICAgIGNoYXJ0LnlzY2FsZSA9ICgpIC0+XG4gICAgICByZXR1cm4geXNjYWxlXG5cbiAgICBjaGFydC54c2NhbGUgPSAoKSAtPlxuICAgICAgcmV0dXJuIHhzY2FsZVxuXG4gICAgY2hhcnQucG9pbnRzU2VsZWN0ID0gKCkgLT5cbiAgICAgIHJldHVybiBwb2ludHNTZWxlY3RcblxuICAgIGNoYXJ0LmxhYmVsc1NlbGVjdCA9ICgpIC0+XG4gICAgICByZXR1cm4gbGFiZWxzU2VsZWN0XG5cbiAgICBjaGFydC5sZWdlbmRTZWxlY3QgPSAoKSAtPlxuICAgICAgcmV0dXJuIGxlZ2VuZFNlbGVjdFxuXG4gICAgIyByZXR1cm4gdGhlIGNoYXJ0IGZ1bmN0aW9uXG4gICAgY2hhcnRcblxuICBnZXRTY2VuYXJpb05hbWUgPSAoc2NlbmFyaW8pIC0+XG4gICAgZm9yIGQgaW4gc2NlbmFyaW9cbiAgICAgIGlmIGQgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgcmV0dXJuIFwiVXNlciBTY2VuYXJpbyAod2l0aCBlcnJvcnMpXCJcbiAgICAgIGlmIGQuVFlQRSA9PSBcIlBBXCJcbiAgICAgICAgcmV0dXJuIFwiUEEgMjk1XCJcbiAgICAgIGVsc2UgaWYgZC5UWVBFID09IFwiTm9QQVwiXG4gICAgICAgIHJldHVybiBcIk5vIFBBIDI5NVwiXG4gICAgICBlbHNlIGlmIGQuVFlQRSA9PSBcIkRibFBBXCJcbiAgICAgICAgcmV0dXJuIFwiRG91YmxlIFBBIDI5NVwiXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBcIlVzZXIgU2NlbmFyaW9cIlxuXG4gIGdldFN0cm9rZUNvbG9yID0gKHNjZW5hcmlvKSAtPlxuICAgIHBhY29sb3IgPSBcIiM5YWJhOGNcIlxuICAgIG5vcGFjb2xvciA9IFwiI2U1Y2FjZVwiXG4gICAgZGJscGFjb2xvciA9IFwiI2IzY2ZhN1wiXG4gICAgZm9yIGQgaW4gc2NlbmFyaW9cbiAgICAgIGlmIGQuVFlQRSA9PSBcIlBBXCJcbiAgICAgICAgcmV0dXJuICBwYWNvbG9yXG4gICAgICBlbHNlIGlmIGQuVFlQRSA9PSBcIk5vUEFcIlxuICAgICAgICByZXR1cm4gbm9wYWNvbG9yXG4gICAgICBlbHNlIGlmIGQuVFlQRSA9PSBcIkRibFBBXCJcbiAgICAgICAgcmV0dXJuIGRibHBhY29sb3JcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIFwiZ3JheVwiXG5cblxuICAjIGZ1bmN0aW9uIHRvIGRldGVybWluZSByb3VuZGluZyBvZiBheGlzIGxhYmVsc1xuICBmb3JtYXRBeGlzID0gKGQpIC0+XG4gICAgZCA9IGRbMV0gLSBkWzBdXG4gICAgbmRpZyA9IE1hdGguZmxvb3IoIE1hdGgubG9nKGQgJSAxMCkgLyBNYXRoLmxvZygxMCkgKVxuICAgIG5kaWcgPSAwIGlmIG5kaWcgPiAwXG4gICAgbmRpZyA9IE1hdGguYWJzKG5kaWcpXG4gICAgZDMuZm9ybWF0KFwiLiN7bmRpZ31mXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0R3JhcGhUYWIiLCJ0aGlzW1wiVGVtcGxhdGVzXCJdID0gdGhpc1tcIlRlbXBsYXRlc1wiXSB8fCB7fTtcbnRoaXNbXCJUZW1wbGF0ZXNcIl1bXCJlbmVyZ3lDb25zdW1wdGlvblwiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0SW4gT2N0b2JlciAyMDA4LCBNaWNoaWdhbiBlbmFjdGVkIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmxlZ2lzbGF0dXJlLm1pLmdvdi8oUyhxNGViNGp6aXIyZzNoYXpoemhsMXRkNDUpKS9taWxlZy5hc3B4P3BhZ2U9Z2V0b2JqZWN0Jm9iamVjdE5hbWU9bWNsLWFjdC0yOTUtb2YtMjAwOFxcXCI+Q2xlYW4sIFJlbmV3YWJsZSwgYW5kIEVmZmljaWVudCBFbmVyZ3kgQWN0LCBQdWJsaWMgQWN0IDI5NTwvYT4gPHN0cm9uZz4oUEEgMjk1KTwvc3Ryb25nPiBBIGRlc2NyaXB0aW9uIG9mIGVhY2ggc2NlbmFyaW8gaXMgcHJvdmlkZWQgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZS4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+Q29tbWVyY2lhbCBFbmVyZ3kgQ29uc3VtcHRpb24gLS0gTU1CVFUgRXF1aXZhbGVudDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8ZGl2IGNsYXNzPVxcXCJjaG9vc2VyLWRpdlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInNlbC1sYWJlbFxcXCI+Q29tcGFyZSB5b3VyIHBsYW4gdG8gc2NlbmFyaW86PC9kaXY+PHNlbGVjdCBjbGFzcz1cXFwiY29tbS1jaG9zZW4tZWNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCw2NTYsNzA4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIlwiKTtfLmIoXy52KF8uZChcIi5cIixjLHAsMCkpKTtfLmIoXCJcXFwiPlwiKTtfLmIoXy52KF8uZChcIi5cIixjLHAsMCkpKTtfLmIoXCI8L29wdGlvbj5cIik7Xy5iKFwiXFxuXCIpO30pO2MucG9wKCk7fV8uYihcIiAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwicGEyOTVfY29tbV9lY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMCw4NTQsODU4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTQVZFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiVVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO18uYihfLnYoXy5mKFwiY29tbV9wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG1vcmUgTU1CVFUgZXF1aXZhbGVudCBlbmVyZ3kgdGhhbiB0aGUgPHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcIm5vX3BhMjk1X2NvbW1fZWNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvICA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwwLDExOTYsMTIwMCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiU0FWRVwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlVTRVwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtfLmIoXy52KF8uZihcImNvbW1fbm9fcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBtb3JlIE1NQlRVIGVxdWl2YWxlbnQgZW5lcmd5IHRoYW4gdGhlIDxzdHJvbmc+Tm8gUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfY29tbV9lY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDAsMTU1NCwxNTU4LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTQVZFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlVTRVwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtfLmIoXy52KF8uZihcImNvbW1fZGJsX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gbW9yZSBNTUJUVSBlcXVpdmFsZW50IGVuZXJneSB0aGFuIHRoZSA8c3Ryb25nPkRvdWJsZSBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgIGlkPVxcXCJjb21tZXJjaWFsRW5lcmd5Q29uc3VtcHRpb25cXFwiIGNsYXNzPVxcXCJjb21tZXJjaWFsRW5lcmd5Q29uc3VtcHRpb25cXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVzaWRlbnRpYWwgRW5lcmd5IENvbnN1bXB0aW9uIC0tIE1NQlRVIEVxdWl2YWxlbnQ8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJjaG9vc2VyLWRpdlxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPGRpdiBjbGFzcz1cXFwic2VsLWxhYmVsXFxcIj5Db21wYXJlIHlvdXIgcGxhbiB0byBzY2VuYXJpbzo8L2Rpdj48c2VsZWN0IGNsYXNzPVxcXCJyZXMtY2hvc2VuLWVjXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCwyMjI3LDIyODMsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiPC9vcHRpb24+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJwYTI5NV9yZXNfZWNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIDxzdHJvbmc+XCIpO2lmKF8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDAsMjQyOCwyNDMyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJTQVZFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJVU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKF8udihfLmYoXCJyZXNfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBtb3JlIE1NQlRVIGVxdWl2YWxlbnQgZW5lcmd5IHRoYW4gdGhlIDxzdHJvbmc+UEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSByZXNpZGVudGlhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibm9fcGEyOTVfcmVzX2VjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byAgPHN0cm9uZz5cIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMCwyNzYyLDI3NjYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNBVkVcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIlVTRVwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtfLmIoXy52KF8uZihcInJlc19ub19wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiPC9zdHJvbmc+IG1vcmUgTU1CVFUgZXF1aXZhbGVudCBlbmVyZ3kgdGhhbiB0aGUgPHN0cm9uZz5ObyBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfcmVzX2VjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byA8c3Ryb25nPlwiKTtpZihfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMCwzMTEyLDMxMTYsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlNBVkVcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJVU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKF8udihfLmYoXCJyZXNfZGJsX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gbW9yZSBNTUJUVSBlcXVpdmFsZW50IGVuZXJneSB0aGFuIHRoZSA8c3Ryb25nPkRvdWJsZSBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiAgaWQ9XFxcInJlc2lkZW50aWFsRW5lcmd5Q29uc3VtcHRpb25cXFwiIGNsYXNzPVxcXCJyZXNpZGVudGlhbEVuZXJneUNvbnN1bXB0aW9uXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8cD5UaGUgcmVwb3J0cyBzaG93IGVuZXJneSBjb25zdW1wdGlvbiBpbiB0aGUgZm9sbG93aW5nIHNjZW5hcmlvczpcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPk5PIFBBIDI5NTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgaGF2aW5nIG5vIEVuZXJneSBFZmZpY2llbmN5IFJlc291cmNlIGFuZCBSZW5ld2FibGUgUG9ydGZvbGlvIFN0YW5kYXJkcy4gRW5lcmd5IGNvbnN1bXB0aW9uIGNvbnRpbnVlcyB0byBpbmNyZWFzZSB3aXRoIHBvcHVsYXRpb24gYW5kIGVtcGxveW1lbnRcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiAtIE1pY2hpZ2FuJ3MgY3VycmVudCBFbmVyZ3kgRWZmaWNpZW5jeSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDElIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgIGNvbnN1bXB0aW9uLCBhbmQgMTAlIG9mIGVsZWN0cmljaXR5IGRlbWFuZCBjb21lcyBmcm9tIHJlbmV3YWJsZSBlbmVyZ3kgc291cmNlc1wiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHRcdDxzdHJvbmc+UEEgMjk1IERvdWJsZTwvc3Ryb25nPiAtIFRoZSByZXN1bHQgb2YgZG91YmxpbmcgTWljaGlnYW4ncyBFbmVyZ3kgRWZmaWNpZW5jeSBSZXNvdXJjZSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBpcyByZWR1Y2VkLCBlYWNoIHllYXIsIGJ5IDIlIG9mIHRoZSBwcmV2aW91cyB5ZWFyJ3MgdG90YWwgY29uc3VtcHRpb24sIGFuZCAyMCUgb2YgZWxlY3RyaWNpdHkgZGVtYW5kIGNvbWVzIGZyb20gcmVuZXdhYmxlIGVuZXJneSBzb3VyY2VzLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0PC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIik7cmV0dXJuIF8uZmwoKTs7fSk7XG50aGlzW1wiVGVtcGxhdGVzXCJdW1wiZnVlbENvc3RzXCJdID0gbmV3IEhvZ2FuLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiSW4gT2N0b2JlciAyMDA4LCBNaWNoaWdhbiBlbmFjdGVkIHRoZSA8YSBocmVmPVxcXCJodHRwOi8vd3d3LmxlZ2lzbGF0dXJlLm1pLmdvdi8oUyhxNGViNGp6aXIyZzNoYXpoemhsMXRkNDUpKS9taWxlZy5hc3B4P3BhZ2U9Z2V0b2JqZWN0Jm9iamVjdE5hbWU9bWNsLWFjdC0yOTUtb2YtMjAwOFxcXCI+Q2xlYW4sIFJlbmV3YWJsZSwgYW5kIEVmZmljaWVudCBFbmVyZ3kgQWN0LCBQdWJsaWMgQWN0IDI5NTwvYT4gPHN0cm9uZz4oUEEgMjk1KTwvc3Ryb25nPi4gQSBkZXNjcmlwdGlvbiBvZiBlYWNoIHNjZW5hcmlvIGlzIHByb3ZpZGVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHBhZ2UuIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJyZXBvcnRTZWN0aW9uIHRhYmxlQ29udGFpbmVyXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxoND5Db21tZXJjaWFsIEZ1ZWwgQ29zdHMgLS0gMjAxMiBEb2xsYXJzPC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiY2hvb3Nlci1kaXZcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInNlbC1sYWJlbFxcXCI+Q29tcGFyZSB5b3VyIHBsYW4gdG8gc2NlbmFyaW86PC9kaXY+PHNlbGVjdCBjbGFzcz1cXFwiY29tbS1jaG9zZW4tZmNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPG9wdGlvbiBjbGFzcz1cXFwiZGVmYXVsdC1jaG9zZW4tc2VsZWN0aW9uXFxcIiBsYWJlbD1cXFwiUEEgMjk1XFxcIj48L29wdGlvbj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtpZihfLnMoXy5mKFwic2NlbmFyaW9zXCIsYyxwLDEpLGMscCwwLDY1MSw3MDcsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiPC9vcHRpb24+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwicGEyOTVfY29tbV9mY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gaGF2ZSBmdWVsIGNvc3RzIHRoYXQgYXJlIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAkXCIpO18uYihfLnYoXy5mKFwiY29tbV9wYTI5NV9kaWZmXCIsYyxwLDApKSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMCw5MDQsOTA5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJMT1dFUlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIkhJR0hFUlwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPiB0aGFuIHRoZSA8c3Ryb25nPlBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgY29tbWVyY2lhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwibm9fcGEyOTVfY29tbV9mY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gaGF2ZSBmdWVsIGNvc3RzIHRoYXQgYXJlPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICRcIik7Xy5iKF8udihfLmYoXCJjb21tX25vX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwwLDEyNTEsMTI1NixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTE9XRVJcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJISUdIRVJcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz4gIHRoYW4gdGhlIDxzdHJvbmc+Tm8gUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfY29tbV9mY1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gaGF2ZSBmdWVsIGNvc3RzIHRoYXQgYXJlIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAkXCIpO18uYihfLnYoXy5mKFwiY29tbV9kYmxfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XCIsYyxwLDEpLGMscCwwLDE2MTUsMTYyMCxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiTE9XRVJcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSElHSEVSXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+dGhhbiB0aGUgPHN0cm9uZz5Eb3VibGUgUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2ICBpZD1cXFwiY29tbWVyY2lhbEZ1ZWxDb3N0c1xcXCIgY2xhc3M9XFxcImNvbW1lcmNpYWxGdWVsQ29zdHNcXFwiPjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPGRpdiBjbGFzcz1cXFwicmVwb3J0U2VjdGlvbiB0YWJsZUNvbnRhaW5lclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aDQ+UmVzaWRlbnRpYWwgRnVlbCBDb3N0cyAtLSAyMDEyIERvbGxhcnM8L2g0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGRpdiBjbGFzcz1cXFwiY2hvb3Nlci1kaXZcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJzZWwtbGFiZWxcXFwiPkNvbXBhcmUgeW91ciBwbGFuIHRvIHNjZW5hcmlvOjwvZGl2PjxzZWxlY3QgY2xhc3M9XFxcInJlcy1jaG9zZW4tZmNcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCwyMjAzLDIyNTUsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgIDwvc2VsZWN0PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwicGEyOTVfcmVzX2ZjXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byBoYXZlIGZ1ZWwgY29zdHMgdGhhdCBhcmUgPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICRcIik7Xy5iKF8udihfLmYoXCJyZXNfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMCwyNDQ1LDI0NTAsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIkxPV0VSXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDEsMCwwLFwiXCIpKXtfLmIoXCJISUdIRVJcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz4gdGhhbiB0aGUgPHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJub19wYTI5NV9yZXNfZmNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIGhhdmUgZnVlbCBjb3N0cyB0aGF0IGFyZTxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAkXCIpO18uYihfLnYoXy5mKFwicmVzX25vX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDAsMjc4NywyNzkyLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJMT1dFUlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSElHSEVSXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+ICB0aGFuIHRoZSA8c3Ryb25nPk5vIFBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgcmVzaWRlbnRpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcImRibF9wYTI5NV9yZXNfZmNcXFwiPkJ5IDIwMzUsIHlvdXIgZW5lcmd5IHBsYW4gaXMgZXN0aW1hdGVkIHRvIGhhdmUgZnVlbCBjb3N0cyB0aGF0IGFyZSA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgJFwiKTtfLmIoXy52KF8uZihcInJlc19kYmxfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDAsMzE0NiwzMTUxLFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJMT1dFUlwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIkhJR0hFUlwiKTt9O18uYihcIiBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvc3Ryb25nPnRoYW4gdGhlIDxzdHJvbmc+RG91YmxlIFBBIDI5NTwvc3Ryb25nPiBzY2VuYXJpbyBpbiB0aGUgcmVzaWRlbnRpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgIGlkPVxcXCJyZXNpZGVudGlhbEZ1ZWxDb3N0c1xcXCIgY2xhc3M9XFxcInJlc2lkZW50aWFsRnVlbENvc3RzXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8cD5UaGUgcmVwb3J0cyBzaG93IGZ1ZWwgY29zdHMgaW4gdGhlIGZvbGxvd2luZyBzY2VuYXJpb3M6XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5OTyBQQSAyOTU8L3N0cm9uZz4gLSBUaGUgcmVzdWx0IG9mIGhhdmluZyBubyBFbmVyZ3kgRWZmaWNpZW5jeSBSZXNvdXJjZSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBjb250aW51ZXMgdG8gaW5jcmVhc2Ugd2l0aCBwb3B1bGF0aW9uIGFuZCBlbXBsb3ltZW50XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gLSBNaWNoaWdhbidzIGN1cnJlbnQgRW5lcmd5IEVmZmljaWVuY3kgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gaXMgcmVkdWNlZCwgZWFjaCB5ZWFyLCBieSAxJSBvZiB0aGUgcHJldmlvdXMgeWVhcidzIHRvdGFsICBjb25zdW1wdGlvbiwgYW5kIDEwJSBvZiBlbGVjdHJpY2l0eSBkZW1hbmQgY29tZXMgZnJvbSByZW5ld2FibGUgZW5lcmd5IHNvdXJjZXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPlBBIDI5NSBEb3VibGU8L3N0cm9uZz4gLSBUaGUgcmVzdWx0IG9mIGRvdWJsaW5nIE1pY2hpZ2FuJ3MgRW5lcmd5IEVmZmljaWVuY3kgUmVzb3VyY2UgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gaXMgcmVkdWNlZCwgZWFjaCB5ZWFyLCBieSAyJSBvZiB0aGUgcHJldmlvdXMgeWVhcidzIHRvdGFsIGNvbnN1bXB0aW9uLCBhbmQgMjAlIG9mIGVsZWN0cmljaXR5IGRlbWFuZCBjb21lcyBmcm9tIHJlbmV3YWJsZSBlbmVyZ3kgc291cmNlcy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L3A+XCIpO3JldHVybiBfLmZsKCk7O30pO1xudGhpc1tcIlRlbXBsYXRlc1wiXVtcImdyZWVuaG91c2VHYXNlc1wiXSA9IG5ldyBIb2dhbi5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJJbiBPY3RvYmVyIDIwMDgsIE1pY2hpZ2FuIGVuYWN0ZWQgdGhlIDxhIGhyZWY9XFxcImh0dHA6Ly93d3cubGVnaXNsYXR1cmUubWkuZ292LyhTKHE0ZWI0anppcjJnM2hhemh6aGwxdGQ0NSkpL21pbGVnLmFzcHg/cGFnZT1nZXRvYmplY3Qmb2JqZWN0TmFtZT1tY2wtYWN0LTI5NS1vZi0yMDA4XFxcIj5DbGVhbiwgUmVuZXdhYmxlLCBhbmQgRWZmaWNpZW50IEVuZXJneSBBY3QsIFB1YmxpYyBBY3QgMjk1PC9hPiA8c3Ryb25nPihQQSAyOTUpPC9zdHJvbmc+LiBBIGRlc2NyaXB0aW9uIG9mIGVhY2ggc2NlbmFyaW8gaXMgcHJvdmlkZWQgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZS4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PkNvbW1lcmNpYWwgR0hHJ3MgLS0gQ088c3ViPjI8L3N1Yj4tZSBFcXVpdmFsZW50PC9oND5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBjbGFzcz1cXFwiY2hvb3Nlci1kaXZcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcInNlbC1sYWJlbFxcXCI+Q29tcGFyZSB5b3VyIHBsYW4gdG8gc2NlbmFyaW86PC9kaXY+PHNlbGVjdCBjbGFzcz1cXFwiY29tbS1jaG9zZW4tZ2hnXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCw2NjEsNzE3LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCIgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIlxcXCI+XCIpO18uYihfLnYoXy5kKFwiLlwiLGMscCwwKSkpO18uYihcIjwvb3B0aW9uPlwiKTtfLmIoXCJcXG5cIik7fSk7Yy5wb3AoKTt9Xy5iKFwiICAgICAgPC9zZWxlY3Q+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcInBhMjk1X2NvbW1fZ2hnXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0bzxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfcGEyOTVcIixjLHAsMSksYyxwLDAsODY2LDg3MixcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiUkVEVUNFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSU5DUkVBU0UgXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+IEdIR3MgYnkgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJjb21tX3BhMjk1X2RpZmZcIixjLHAsMCkpKTtfLmIoXCI8L3N0cm9uZz4gQ08yLWUgY29tcGFyZWQgdG8gdGhlIDxzdHJvbmc+UEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJub19wYTI5NV9jb21tX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gPHN0cm9uZz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwwLDEyMjksMTIzNSxcInt7IH19XCIpKXtfLnJzKGMscCxmdW5jdGlvbihjLHAsXyl7Xy5iKFwiUkVEVUNFXCIpO30pO2MucG9wKCk7fV8uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoIV8ucyhfLmYoXCJjb21tX2hhc19zYXZpbmdzX25vX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSU5DUkVBU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz4gR0hHcyBieSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcImNvbW1fbm9fcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBDTzItZSBjb21wYXJlZCB0byB0aGUgPHN0cm9uZz5ObyBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIGNvbW1lcmNpYWwgc2VjdG9yLlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPHAgY2xhc3M9XFxcImRibF9wYTI5NV9jb21tX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwiY29tbV9oYXNfc2F2aW5nc19kYmxfcGEyOTVcIixjLHAsMSksYyxwLDAsMTYwOSwxNjE1LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJSRURVQ0VcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcImNvbW1faGFzX3NhdmluZ3NfZGJsX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSU5DUkVBU0VcIik7fTtfLmIoXCIgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3N0cm9uZz5HSEdzIGJ5IDxzdHJvbmc+XCIpO18uYihfLnYoXy5mKFwiY29tbV9kYmxfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBDTzItZSBjb21wYXJlZCB0byB0aGUgPHN0cm9uZz5Eb3VibGUgUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSBjb21tZXJjaWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiAgaWQ9XFxcImNvbW1lcmNpYWxHcmVlbmhvdXNlR2FzZXNcXFwiIGNsYXNzPVxcXCJjb21tZXJjaWFsR3JlZW5ob3VzZUdhc2VzXFxcIj48L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIjxkaXYgY2xhc3M9XFxcInJlcG9ydFNlY3Rpb24gdGFibGVDb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGg0PlJlc2lkZW50aWFsIEdIRydzIC0tIENPPHN1Yj4yPC9zdWI+LWUgRXF1aXZhbGVudDwvaDQ+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcImNob29zZXItZGl2XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJzZWwtbGFiZWxcXFwiPkNvbXBhcmUgeW91ciBwbGFuIHRvIHNjZW5hcmlvOjwvZGl2PjxzZWxlY3QgY2xhc3M9XFxcInJlcy1jaG9zZW4tZ2hnXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxvcHRpb24gY2xhc3M9XFxcImRlZmF1bHQtY2hvc2VuLXNlbGVjdGlvblxcXCIgbGFiZWw9XFxcIlBBIDI5NVxcXCI+PC9vcHRpb24+XCIpO18uYihcIlxcblwiICsgaSk7aWYoXy5zKF8uZihcInNjZW5hcmlvc1wiLGMscCwxKSxjLHAsMCwyMjkyLDIzNDgsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiXFxcIj5cIik7Xy5iKF8udihfLmQoXCIuXCIsYyxwLDApKSk7Xy5iKFwiPC9vcHRpb24+XCIpO18uYihcIlxcblwiKTt9KTtjLnBvcCgpO31fLmIoXCIgICAgICA8L3NlbGVjdD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8cCBjbGFzcz1cXFwicGEyOTVfcmVzX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG88c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7aWYoXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19wYTI5NVwiLGMscCwxKSxjLHAsMCwyNDk4LDI1MDQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlJFRFVDRVwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX3BhMjk1XCIsYyxwLDEpLGMscCwxLDAsMCxcIlwiKSl7Xy5iKFwiSU5DUkVBU0UgXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+IEdIR3MgYnkgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJyZXNfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBDTzItZSBjb21wYXJlZCB0byB0aGUgPHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJub19wYTI5NV9yZXNfZ2hnXFxcIj5CeSAyMDM1LCB5b3VyIGVuZXJneSBwbGFuIGlzIGVzdGltYXRlZCB0byA8c3Ryb25nPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKF8ucyhfLmYoXCJyZXNfaGFzX3NhdmluZ3Nfbm9fcGEyOTVcIixjLHAsMSksYyxwLDAsMjg1MywyODU5LFwie3sgfX1cIikpe18ucnMoYyxwLGZ1bmN0aW9uKGMscCxfKXtfLmIoXCJSRURVQ0VcIik7fSk7Yy5wb3AoKTt9Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZighXy5zKF8uZihcInJlc19oYXNfc2F2aW5nc19ub19wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIklOQ1JFQVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+IEdIR3MgYnkgPHN0cm9uZz5cIik7Xy5iKF8udihfLmYoXCJyZXNfbm9fcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBDTzItZSBjb21wYXJlZCB0byB0aGUgPHN0cm9uZz5ObyBQQSAyOTU8L3N0cm9uZz4gc2NlbmFyaW8gaW4gdGhlIHJlc2lkZW50aWFsIHNlY3Rvci5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxwIGNsYXNzPVxcXCJkYmxfcGEyOTVfcmVzX2doZ1xcXCI+QnkgMjAzNSwgeW91ciBlbmVyZ3kgcGxhbiBpcyBlc3RpbWF0ZWQgdG8gIDxzdHJvbmc+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICBcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIFwiKTtpZihfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMCwzMjI4LDMyMzQsXCJ7eyB9fVwiKSl7Xy5ycyhjLHAsZnVuY3Rpb24oYyxwLF8pe18uYihcIlJFRFVDRVwiKTt9KTtjLnBvcCgpO31fLmIoXCJcXG5cIiArIGkpO18uYihcIiAgXCIpO2lmKCFfLnMoXy5mKFwicmVzX2hhc19zYXZpbmdzX2RibF9wYTI5NVwiLGMscCwxKSxjLHAsMSwwLDAsXCJcIikpe18uYihcIklOQ1JFQVNFXCIpO307Xy5iKFwiIFwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9zdHJvbmc+R0hHcyBieSA8c3Ryb25nPlwiKTtfLmIoXy52KF8uZihcInJlc19kYmxfcGEyOTVfZGlmZlwiLGMscCwwKSkpO18uYihcIjwvc3Ryb25nPiBDTzItZSBjb21wYXJlZCB0byB0aGUgPHN0cm9uZz5Eb3VibGUgUEEgMjk1PC9zdHJvbmc+IHNjZW5hcmlvIGluIHRoZSByZXNpZGVudGlhbCBzZWN0b3IuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPGRpdiBpZD1cXFwicmVzaWRlbnRpYWxHcmVlbmhvdXNlR2FzZXNcXFwiIGNsYXNzPVxcXCJyZXNpZGVudGlhbEdyZWVuaG91c2VHYXNlc1xcXCI+PC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPHA+VGhlIHJlcG9ydHMgc2hvdyBncmVlbmhvdXNlIGdhcyBlbWlzc2lvbnMgaW4gdGhlIGZvbGxvd2luZyBzY2VuYXJpb3M6XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5OTyBQQSAyOTU8L3N0cm9uZz4gLSBUaGUgcmVzdWx0IG9mIGhhdmluZyBubyBFbmVyZ3kgRWZmaWNpZW5jeSBSZXNvdXJjZSBhbmQgUmVuZXdhYmxlIFBvcnRmb2xpbyBTdGFuZGFyZHMuIEVuZXJneSBjb25zdW1wdGlvbiBjb250aW51ZXMgdG8gaW5jcmVhc2Ugd2l0aCBwb3B1bGF0aW9uIGFuZCBlbXBsb3ltZW50XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiXHQ8cD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdFx0PHN0cm9uZz5QQSAyOTU8L3N0cm9uZz4gLSBNaWNoaWdhbidzIGN1cnJlbnQgRW5lcmd5IEVmZmljaWVuY3kgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gaXMgcmVkdWNlZCwgZWFjaCB5ZWFyLCBieSAxJSBvZiB0aGUgcHJldmlvdXMgeWVhcidzIHRvdGFsICBjb25zdW1wdGlvbiwgYW5kIDEwJSBvZiBlbGVjdHJpY2l0eSBkZW1hbmQgY29tZXMgZnJvbSByZW5ld2FibGUgZW5lcmd5IHNvdXJjZXNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDxwPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIlx0XHQ8c3Ryb25nPlBBIDI5NSBEb3VibGU8L3N0cm9uZz4gLSBUaGUgcmVzdWx0IG9mIGRvdWJsaW5nIE1pY2hpZ2FuJ3MgRW5lcmd5IEVmZmljaWVuY3kgUmVzb3VyY2UgYW5kIFJlbmV3YWJsZSBQb3J0Zm9saW8gU3RhbmRhcmRzLiBFbmVyZ3kgY29uc3VtcHRpb24gaXMgcmVkdWNlZCwgZWFjaCB5ZWFyLCBieSAyJSBvZiB0aGUgcHJldmlvdXMgeWVhcidzIHRvdGFsIGNvbnN1bXB0aW9uLCBhbmQgMjAlIG9mIGVsZWN0cmljaXR5IGRlbWFuZCBjb21lcyBmcm9tIHJlbmV3YWJsZSBlbmVyZ3kgc291cmNlcy5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCJcdDwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L3A+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTtcblxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHRoaXNbXCJUZW1wbGF0ZXNcIl07XG59Il19
