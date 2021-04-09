import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native'
import { Navigation } from './src/App';
import { ListLayout } from './src/Layouts';
import OptionsLayout from './src/Layouts/OptionsLayout/OptionsLayout';
import { colors } from './src/Styling';

const App = () => {
  const [current_layout, setCurrentLayout] = useState<Navigation.LayoutName>('Lists')
  Navigation.onChangeLayout = layout => setCurrentLayout(layout)

  const layout_map: {[index: string]: JSX.Element} = {
    'Lists': <ListLayout />,
    'Options': <OptionsLayout />
  }

  return (
    <View style={css.app}>
      {layout_map[current_layout]}
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
