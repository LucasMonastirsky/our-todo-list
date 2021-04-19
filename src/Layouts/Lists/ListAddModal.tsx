import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import api from '../../App/api'
import { AppButton, AppInputMin, AppModal } from '../../Components'
import { TodoList } from '../../Models'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'

export default (props: {add: (list: TodoList)=>any, close: AppModal.Close}) => {
  const [list, setList] = useState(new TodoList({id: 'undefined', member_ids: []}))

  const addList = async () => {
    const user = await api.getCurrentUser()
    const final_list = {...list, member_ids: [user.id]}
    props.add(final_list)
    props.close(false)
  }

  return (
    <AppModal close={props.close}>
      <View style={css.container}>
        <AppInputMin defaultValue={list.title}
          onChangeText={title=>setList({...list, title})} />
        <AppInputMin defaultValue={list.description}
          placeholder='Add a description to the list'
          onChangeText={description=>setList({...list, description})} />
        <AppButton label='Add List' onPress={addList} style={css.done_button} />
      </View>
    </AppModal>
  )
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.main,
    marginHorizontal: screen.width / 10,
    padding: style.padding,
    borderRadius: style.border_radius_med,
  },
  done_button: {
    marginLeft: 'auto',
  },
})