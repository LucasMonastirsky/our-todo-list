import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native'
import { Navigation } from '.';
import { AuthenticationLayout } from '../Layouts';
import { colors } from '../Styling';
import { screen } from '../Utils';

const App = () => {
  const [current_layout, setCurrentLayout] = useState(AuthenticationLayout)

  useEffect(() => {
    Navigation.onChangeLayout = setCurrentLayout
  }, [])

  const Layout = current_layout.view
  return ( 
    <View style={css.app}>
      <Layout {...current_layout.props} />
    </View>
  )
}

const css = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
    width: screen.width,
  },
})

export default App
