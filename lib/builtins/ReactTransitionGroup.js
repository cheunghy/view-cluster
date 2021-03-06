// This is a patch
// TODO: Fix this bug on react side
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactTransitionGroup
 */

'use strict';

var React = require('react');
var ReactTransitionChildMapping = require('react/lib/ReactTransitionChildMapping');

var assign = require('object-assign');
var emptyFunction = require('fbjs/lib/emptyFunction');

var map = require('lodash/map');

var ReactTransitionGroup = React.createClass({
  displayName: 'ReactTransitionGroup',

  propTypes: {
    component: React.PropTypes.any,
    childFactory: React.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      component: 'span',
      childFactory: emptyFunction.thatReturnsArgument
    };
  },

  getInitialState: function getInitialState() {
    return {
      children: ReactTransitionChildMapping.getChildMapping(this.props.children)
    };
  },

  componentWillMount: function componentWillMount() {
    this.currentlyTransitioningKeys = {};
    this.keysToEnter = [];
    this.keysToLeave = [];
  },

  componentDidMount: function componentDidMount() {
    var initialChildMapping = this.state.children;
    for (var key in initialChildMapping) {
      if (initialChildMapping[key]) {
        this.performAppear(key);
      }
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var nextChildMapping = ReactTransitionChildMapping.getChildMapping(nextProps.children);
    var prevChildMapping = this.state.children;

    this.setState({
      children: ReactTransitionChildMapping.mergeChildMappings(prevChildMapping, nextChildMapping)
    });

    var key;

    for (key in nextChildMapping) {
      var hasPrev = prevChildMapping && prevChildMapping.hasOwnProperty(key);
      if (nextChildMapping[key] && !hasPrev && !this.currentlyTransitioningKeys[key]) {
        this.keysToEnter.push(key);
      }
    }

    for (key in prevChildMapping) {
      var hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(key);
      if (prevChildMapping[key] && !hasNext && !this.currentlyTransitioningKeys[key]) {
        this.keysToLeave.push(key);
      }
    }

    // If we want to someday check for reordering, we could do it here.
  },

  componentDidUpdate: function componentDidUpdate() {
    var keysToEnter = this.keysToEnter;
    this.keysToEnter = [];
    keysToEnter.forEach(this.performEnter);

    var keysToLeave = this.keysToLeave;
    this.keysToLeave = [];
    keysToLeave.forEach(this.performLeave);
  },

  performAppear: function performAppear(key) {
    this.currentlyTransitioningKeys[key] = true;

    var component = this.lefs[key];

    if (component.componentWillAppear) {
      component.componentWillAppear(this._handleDoneAppearing.bind(this, key));
    } else {
      this._handleDoneAppearing(key);
    }
  },

  _handleDoneAppearing: function _handleDoneAppearing(key) {
    var component = this.lefs[key];
    if (component.componentDidAppear) {
      component.componentDidAppear();
    }

    delete this.currentlyTransitioningKeys[key];

    var currentChildMapping = ReactTransitionChildMapping.getChildMapping(this.props.children);

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully appeared. Remove it.
      this.performLeave(key);
    }
  },

  performEnter: function performEnter(key) {
    this.currentlyTransitioningKeys[key] = true;

    var component = this.lefs[key];

    if (component.componentWillEnter) {
      component.componentWillEnter(this._handleDoneEntering.bind(this, key));
    } else {
      this._handleDoneEntering(key);
    }
  },

  _handleDoneEntering: function _handleDoneEntering(key) {
    var component = this.lefs[key];
    if (component.componentDidEnter) {
      component.componentDidEnter();
    }

    delete this.currentlyTransitioningKeys[key];

    var currentChildMapping = ReactTransitionChildMapping.getChildMapping(this.props.children);

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully entered. Remove it.
      this.performLeave(key);
    }
  },

  performLeave: function performLeave(key) {
    this.currentlyTransitioningKeys[key] = true;

    var component = this.lefs[key];

    if (component.componentWillLeave) {
      component.componentWillLeave(this._handleDoneLeaving.bind(this, key));
    } else {
      // Note that this is somewhat dangerous b/c it calls setState()
      // again, effectively mutating the component before all the work
      // is done.
      this._handleDoneLeaving(key);
    }
  },

  _handleDoneLeaving: function _handleDoneLeaving(key) {
    var component = this.lefs[key];

    if (component.componentDidLeave) {
      component.componentDidLeave();
    }

    delete this.currentlyTransitioningKeys[key];

    var currentChildMapping = ReactTransitionChildMapping.getChildMapping(this.props.children);

    if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
      // This entered again before it fully left. Add it again.
      this.performEnter(key);
    } else {
      this.setState(function (state) {
        var newChildren = assign({}, state.children);
        delete newChildren[key];
        return { children: newChildren };
      });
    }
  },

  render: function render() {
    var _this = this;

    // TODO: we could get rid of the need for the wrapper node
    // by cloning a single child
    var childrenToRender = [];
    map(this.state.children, function (_, key, __) {
      var child = _this.state.children[key];
      if (child) {
        // You may need to apply reactive updates to a child as it is leaving.
        // The normal React way to do it won't work since the child will have
        // already been removed. In case you need this behavior you can provide
        // a childFactory function to wrap every child, even the ones that are
        // leaving.
        var this2 = _this;
        var cref = child.ref;
        var ref = function ref(r) {
          if (this2.lefs === undefined) {
            this2.lefs = {};
          };
          if (r) {
            this2.lefs[key] = r;
            if (typeof cref === 'function') {
              cref(r);
            }
          }
        };
        childrenToRender.push(React.cloneElement(_this.props.childFactory(child), { ref: ref, key: key }));
      }
    });

    return React.createElement(this.props.component, this.props, childrenToRender);
  }
});

module.exports = ReactTransitionGroup;