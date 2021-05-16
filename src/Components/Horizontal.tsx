import React from 'react'
import { View, ViewStyle } from 'react-native'

export default ({children, style}:{children: any, style?: ViewStyle}) =>
  <View style={[{flexDirection: 'row'}, style]}>
    {children}
  </View>