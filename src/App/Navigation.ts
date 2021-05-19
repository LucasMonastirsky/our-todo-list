import { ComponentType } from "react"
import { ListsLayout } from "../Layouts"

export type LayoutProps = { active?: boolean } // LayoutViews have to use this
export type LayoutView = (props: LayoutProps & any) => JSX.Element
export type Layout = { view: LayoutView, props?: any }

const INITIAL_LAYOUT: Layout = { view: ListsLayout, props: {} }

class Navigation {
  private static _current_layout = INITIAL_LAYOUT
  static get current_layout() { return Navigation._current_layout }
  static onChangeLayout = (layout: Layout) => {}
  static goTo = (view: LayoutView, props?: any) => {
    const layout = {view, props}
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
