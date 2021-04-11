import React, { useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native'
import { Navigation } from './src/App';
import { ListLayout, ProfileLayout } from './src/Layouts';
import OptionsLayout from './src/Layouts/OptionsLayout/OptionsLayout';
import { colors } from './src/Styling';
import { useAsyncState } from './src/Utils';

const App = () => {
  const [layout_stack, getLayoutStack, setLayoutStack] = useAsyncState<Navigation.LayoutName[]>(['Lists'])

  Navigation.onChangeLayout = layout => navigateTo(layout)
  const navigateTo = (layout: Navigation.LayoutName) => {
    setLayoutStack([...layout_stack, layout])
  }

  const layout_map: {[index: string]: JSX.Element} = {
    'Lists': <ListLayout />,
    'Profile': <ProfileLayout />,
    'Options': <OptionsLayout />
  }

  const onBack = () => {
    if (getLayoutStack().length < 2)
      return false
    const new_layout_stack = [...getLayoutStack()]
    new_layout_stack.pop()
    setLayoutStack(new_layout_stack)
      
    return true
  }

  useEffect(() => {
    return BackHandler.addEventListener('hardwareBackPress', onBack).remove
  }, [])

  return (
    <View style={css.app}>
      {layout_map[layout_stack[layout_stack.length-1]]}
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
