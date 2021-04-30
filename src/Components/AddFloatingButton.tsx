import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { style, colors } from '../Styling'

const AddFloatingButton = ({onPress}: {onPress: ()=>any}) => {
  return (
    <View style={css.container}>
      <TouchableOpacity style={css.background} {...{onPress}}>
          <Image style={css.icon} source={require('../Media/Icons/plus.png')}/>
      </TouchableOpacity>
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    height: 75,
    width: 75,
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 1,
    padding: style.margin,
  },
  background: {
    backgroundColor: colors.main,
    flex: 1,
    borderRadius: 100,
    padding: '20%',
  },
  icon: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
})

export default AddFloatingButton