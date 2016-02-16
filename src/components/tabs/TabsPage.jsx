import React from 'react';
import Page from './../Page';
import TabBar from './TabBar';
import TabView from './TabView';
import TabBarItem from './TabBarItem.jsx';

import omit from 'lodash/omit';
import difference from 'lodash/difference';
import pick from 'lodash/pick';
import map from 'lodash/map';

Page.prototype.beyondTabBar = function() {
  return false;
};

export default class TabsPage extends Page {

  static propTypes = {
    childPages: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        key: React.PropTypes.string.isRequired,
        title: React.PropTypes.string.isRequired,
        selected: React.PropTypes.bool.isRequired,
        icon: React.PropTypes.string.isRequired,
        selectedIcon: React.PropTypes.string.isRequired,
        page: React.PropTypes.string.isRequired,
        props: React.PropTypes.object
      })
    )
  };

  constructor(props, context) {
    super(props, context);
    this.noLazyLoading();
  }

  renderPage() {
    return <div className="tabs-page">
      {
        this.props.childPages.map((t) => {
          return <TabView key={t.key} selected={t.selected}>
            {this.pageRender(t)}
          </TabView>
        })
      }
      <TabBar>
        {
          this.props.childPages.map((t) => {
            return <TabBarItem {...omit(t, 'page', 'props')} />
          })
        }
      </TabBar>
    </div>
  }

  getSelectedPage() {
    return this.pages[this.getSelectedPageKey()];
  }

  getSelectedPageKey(props = this.props) {
    return find(props.tabs, (t) => t.selected === true).key;
  }

  componentDidMount() {
    super.componentDidMount();
  }

  componentWillUpdate(nextProps, nextState) {
    super.componentWillUpdate(nextProps, nextState);
    //let newPageKeys = nextProps.tabs.map((t) => t.key);
    //let currentPageKeys = this.props.tabs.map((t) => t.key);
    //let keysToAdd = difference(newPageKeys, currentPageKeys);
    //let keysToRemove = difference(currentPageKeys, newPageKeys);
    //map(pick(this.pages, keysToRemove), (p) => p.pageWillDisappear());
    let currentSelectedKey = this.getSelectedPageKey();
    let nextSelectedKey = this.getSelectedPageKey(nextProps);
    if (nextSelectedKey !== currentSelectedKey) {
      this.getSelectedPage().pageWillDisappear();
      if (this.pages[nextSelectedKey]) {
        this.pages[nextSelectedKey].pageWillAppear();
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    super.componentDidUpdate(prevProps, prevState);
    //let oldPageKeys = prevProps.tabs.map((t) => t.key);
    //let currentPageKeys = this.props.tabs.map((t) => t.key);
    //let keysAdded = difference(currentPageKeys, oldPageKeys);
    //let keysRemoved = difference(oldPageKeys, currentPageKeys);
    //map(keysRemoved, (k) => delete this.page[k]);
    let currentSelectedKey = this.getSelectedPageKey();
    let previousSelectedKey = this.getSelectedPageKey(prevProps);
    if (currentSelectedKey !== previousSelectedKey) {
      this.getSelectedPage().pageDidAppear();
      if (this.pages[previousSelectedKey]) {
        this.pages[previousSelectedKey].pageDidDisappear();
      }
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }

  pageWillAppear() {
    super.pageWillAppear();
    this.getSelectedPage().pageWillAppear();
  }

  pageDidAppear() {
    super.pageDidAppear();
    this.getSelectedPage().pageDidAppear();
  }

  pageWillDisappear() {
    super.pageWillDisappear();
    this.getSelectedPage().pageDidAppear();
  }

  pageDidDisappear() {
    super.pageDidDisappear();
    this.getSelectedPage().pageDidDisappear();
  }
}