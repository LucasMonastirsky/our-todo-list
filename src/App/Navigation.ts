class Navigation {
  // static update_listeners: (()=>void)[] = []
  // static addUpdateListener = (callback: ()=>void) => Navigation.update_listeners.push(callback)
  // static update = () => Navigation.update_listeners.forEach(callback => {callback()})

  static current_layout: Navigation.LayoutName = 'Lists'
  static onChangeLayout = (layout: Navigation.LayoutName) => {}
  static goTo = (layout: Navigation.LayoutName) => {
    Navigation.current_layout = layout
    Navigation.onChangeLayout(layout)
  }
}

module Navigation {
  export type LayoutName = 'Lists' | 'Profile' | 'Options'
}

export default Navigation