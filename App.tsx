import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native'
import { Navigation } from './src/App';
import { ListLayout, ProfileLayout } from './src/Layouts';
import OptionsLayout from './src/Layouts/OptionsLayout/OptionsLayout';
import { colors } from './src/Styling';

const App = () => {
  const [layout_stack, setLayoutStack] = useState<Navigation.LayoutName[]>(['Lists'])

  Navigation.onChangeLayout = layout => navigateTo(layout)
  const navigateTo = (layout: Navigation.LayoutName) => {
    setLayoutStack([...layout_stack, layout])
  }

  const layout_map: {[index: string]: JSX.Element} = {
    'Lists': <ListLayout />,
    'Profile': <ProfileLayout />,
    'Options': <OptionsLayout />
  }

  useEffect(()=>{
    console.log(layout_stack)
  }, [layout_stack])

  const onBack = () => {
    setLayoutStack(value => {
      if (value.length < 2)
        return value
      const new_layout_stack = [...value]
      new_layout_stack.pop()
      return new_layout_stack
    })
    return true
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBack)
    return () => BackHandler.removeEventListener('hardwareBackPress', onBack)
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
