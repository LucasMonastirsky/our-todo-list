import { ComponentType } from "react"
import { ListLayout } from "../Layouts"
import { Layout } from "../Layouts/types"

const INITIAL_LAYOUT: Layout = ListLayout

class Navigation {
  private static _current_layout = INITIAL_LAYOUT
  static get current_layout() { return Navigation._current_layout }
  static onChangeLayout = (layout: Layout) => {}
  static goTo = (layout: Layout) => {  
    Navigation._current_layout = layout
    Navigation.onChangeLayout(layout)
  }

  private static _header: ComponentType
  static get header() { return Navigation._header }
  static set header(value: ComponentType) {
    Navigation._header = value
    Navigation.onChangeHeader(value)
  }
  static onChangeHeader = (header: ComponentType) => {}

  static reset() {
    Navigation._current_layout = INITIAL_LAYOUT
  }
}

export default Navigation