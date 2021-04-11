import React, { useEffect } from 'react';
import { BackHandler, LogBox, StyleSheet, View } from 'react-native'
import { Navigation } from './src/App';
import { CustomDrawer } from './src/Components';
import { colors } from './src/Styling';
import { useAsyncState } from './src/Utils';

const App = () => {
  const [layout_stack, getLayoutStack, setLayoutStack] = useAsyncState([Navigation.current_layout])
  console.log('state layouts: ', layout_stack)
  console.log('navigation layout: ', Navigation.current_layout)
  Navigation.onChangeLayout = layout => navigateTo(layout)
  const navigateTo = (layout: ()=>JSX.Element) => {
    setLayoutStack([...layout_stack, layout])
  }

  const onBack = () => {
    if (getLayoutStack().length < 2) {
      Navigation.reset()
      return false
    }
    const new_layout_stack = [...getLayoutStack()]
    new_layout_stack.pop()
    setLayoutStack(new_layout_stack)
      
    return true
  }

  useEffect(() => {
    return BackHandler.addEventListener('hardwareBackPress', onBack).remove
  }, [])

  const Layout = layout_stack[layout_stack.length-1]

  return (
    <View style={css.app}>
      <CustomDrawer>
        <Layout />
      </CustomDrawer>
    </View>
  )
}

const css = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.main_dark,
  }
})

export default App
