import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native'
import { API, Navigation } from '.';
import { AuthenticationLayout, ListsLayout } from '../Layouts';
import { colors } from '../Styling';
import { screen, useAsyncState } from '../Utils';
import { Layout } from './Navigation';

const App = () => {
  const [logged_in, setLoggedIn] = useState(false)
  const [layout_stack, setLayoutStack] = useState<Layout[]>([{view: ListsLayout}])

  useEffect(() => {
    Navigation.onChangeLayout = (new_layout) => {
      setLayoutStack(prev => [ ...prev, new_layout])
    }

    return BackHandler.addEventListener('hardwareBackPress', backHandler).remove
  }, [])

  const backHandler = () => {
    let length = -1
    setLayoutStack(previous => {
      length = previous.length
      previous.splice(previous.length - 1, 1)
      return [...previous]
    })
    return length > 1
  }

  return (
    <View style={css.app}>
      {!logged_in
      ? <AuthenticationLayout onLoggedIn={()=>setLoggedIn(true)} />
      : layout_stack.map((layout, index) => {
          if (index !== layout_stack.length - 1)
            return null // this can be used for transition animations
          const LayoutView = layout.view
          return <LayoutView {...layout.props} key={index} />
      })}
    </View>
  )
}

const css = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
    width: screen.width,
  },
  content: {
    flexDirection: 'row',
    height: '100%',
  },
  layout_container: {
    width: screen.width,
  },
  hidden_layout: {
    width: screen.width,
  }
})

export default App
