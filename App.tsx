import React from 'react';
import { StyleSheet, View } from 'react-native'
import { ListLayout } from './src/Layouts';

const App = () => {
  return (
    <View style={css.app}>
      <ListLayout />
    </View>
  )
}

const css = StyleSheet.create({
  app: {
    flex: 1,
  }
})

export default App
