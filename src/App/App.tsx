import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native'
import { API, Navigation } from '.';
import { AuthenticationLayout } from '../Layouts';
import { colors } from '../Styling';
import { screen, useAsyncState } from '../Utils';

const App = () => {
  const [logged_in, setLoggedIn] = useState(false)
  const [layout_stack, getLayoutStack, setLayoutStack] = useAsyncState([Navigation.current_layout])

  useEffect(() => {
    Navigation.onChangeLayout = (new_layout) => {
      setLayoutStack((prev => [ ...prev, new_layout]))
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

  const signOut = async () => {
    await API.signOut()
    setLoggedIn(false)
  }

  const content = () => !logged_in
  ? <AuthenticationLayout onLoggedIn={()=>setLoggedIn(true)} />
  : <Navigation.current_layout />

  return (
    <View style={css.app}>
      {!logged_in
      ? <AuthenticationLayout onLoggedIn={()=>setLoggedIn(true)} />
      : layout_stack.map((Layout, index) => index === layout_stack.length - 1 ? <Layout active={true} /> : null)}
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
