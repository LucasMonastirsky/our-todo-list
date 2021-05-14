import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native'
import { API } from '.';
import { AuthenticationLayout, ListsLayout } from '../Layouts';
import { colors } from '../Styling';
import { screen } from '../Utils';

const App = () => {
  const [logged_in, setLoggedIn] = useState(false)

  const signOut = async () => {
    await API.signOut()
    setLoggedIn(false)
  }

  const content = () => {
    return !logged_in
    ? <AuthenticationLayout onLoggedIn={()=>setLoggedIn(true)} />
    : <ListsLayout />
  }

  return (
    <View style={css.app}>{content()}</View>
  )
}

const css = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
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
