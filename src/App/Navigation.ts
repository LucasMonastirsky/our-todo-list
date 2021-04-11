import React from "react"

class Navigation {
  private static _current_layout: Navigation.LayoutName = 'Lists'
  static get current_layout() { return Navigation._current_layout }
  static onChangeLayout = (layout: Navigation.LayoutName) => {}
  static goTo = (layout: Navigation.LayoutName) => {
    Navigation._current_layout = layout
    Navigation.onChangeLayout(layout)
  }

  private static _header: ()=>JSX.Element
  static get header() { return Navigation._header }
  static set header(value: ()=>JSX.Element) {
    Navigation._header = value
    Navigation.onChangeHeader(value)
  }
  static onChangeHeader = (header: ()=>JSX.Element) => {}
}

module Navigation {
  export type LayoutName = 'Lists' | 'Profile' | 'Options'
}

export default Navigation