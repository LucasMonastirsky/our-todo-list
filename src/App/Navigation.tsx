import { LoginLayout } from "../Layouts"

const INITIAL_LAYOUT = LoginLayout

class Navigation {
  private static _current_layout = INITIAL_LAYOUT
  static get current_layout() { return Navigation._current_layout }
  static onChangeLayout = (layout: ()=>JSX.Element) => {}
  static goTo = (layout: ()=>JSX.Element) => {
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

  static reset() {
    Navigation._current_layout = INITIAL_LAYOUT
  }
}

export default Navigation