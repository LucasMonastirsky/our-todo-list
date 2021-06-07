import { BackHandler } from "react-native"
import { ListsLayout } from "../Layouts"

export type LayoutProps = { active?: boolean } // LayoutViews have to use this
export type LayoutView = (props: LayoutProps & any) => JSX.Element
export type Layout = { view: LayoutView, props?: any, name: string }

const INITIAL_LAYOUT = ListsLayout

class Navigation {
  private static _current_layout = INITIAL_LAYOUT
  static get current_layout() { return {
    ...Navigation._current_layout,
    equals: (layout: Layout) => Navigation._current_layout.name === layout.name
    }
  }

  static onChangeLayout = (layout: Layout) => {}
  static goTo = (layout: Layout, props?: any) => {
    if (props)
      layout.props = props
    Navigation._current_layout = layout
    Navigation.onChangeLayout(layout)
  }

  static setBackHandler = (handler: Function) => {
    return BackHandler.addEventListener('hardwareBackPress', () => {
      handler()

      return true
    }).remove
  }

  static reset() {
    Navigation._current_layout = INITIAL_LAYOUT
  }
}

export default Navigation
