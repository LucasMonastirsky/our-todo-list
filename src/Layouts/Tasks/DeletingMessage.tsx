import React from "react"
import { StyleSheet, View } from "react-native"
import { AppText, Loading } from "../../Components"
import { style } from "../../Styling"

export default ({list_title}: {list_title: string}) => {
  return (
    <View style={css.container}>
      <AppText style={css.title}>Deleting {list_title}...</AppText>
      <Loading />
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: style.font_size_big,
  },
})