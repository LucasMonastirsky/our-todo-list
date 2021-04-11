class Navigation {
  private static _current_layout: Navigation.LayoutName = 'Lists'
  static get current_layout() { return Navigation._current_layout }
  static onChangeLayout = (layout: Navigation.LayoutName) => {}
  static goTo = (layout: Navigation.LayoutName) => {
    Navigation._current_layout = layout
    Navigation.onChangeLayout(layout)
  }
}

module Navigation {
  export type LayoutName = 'Lists' | 'Profile' | 'Options'
}

export default Navigation