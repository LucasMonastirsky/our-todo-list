import React from 'react'
import { StyleSheet, View } from 'react-native'
import { AppInputMin, AppModal, AppText } from '../../Components'
import { TodoList } from '../../Models'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'

export default ({list, close}: {list: TodoList, close: ()=>any}) => {
  return (
    <AppModal {...{close}}>
      <View style={css.container}>
        <AppInputMin style={css.title} defaultValue={list.title} onChangeText={()=>{}} />
        <Spacing />
        <AppInputMin style={css.description} defaultValue={list.description} multiline onChangeText={()=>{}} />
        <Spacing />
        <AppText style={css.members_title}>Members:</AppText>
        {list.member_ids.map(id => <AppText>{id}</AppText>)}
      </View>
    </AppModal>
  )
}

const Spacing = () => <View style={css.spacing} />

const css = StyleSheet.create({
  container: {
    marginHorizontal: screen.width / 10,
    backgroundColor: colors.main,
    padding: style.padding,
    borderRadius: style.border_radius_med,
  },
  spacing: {
    height: style.padding,
  },
  title: {
    fontSize: style.font_size_big,
  },
  description: {
    fontSize: style.font_size_small,
  },
  members_title: {

  },
})