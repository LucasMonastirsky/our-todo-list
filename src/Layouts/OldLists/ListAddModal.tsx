import React, { useState } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { AppButton, AppInputMin, AppModal } from '../../Components'
import { TodoList } from '../../Models'
import { colors, style } from '../../Styling'
import { Dictionary, screen } from '../../Utils'
import { API } from '../../App'
import { StateSetter } from '../../Types'

export default (props: {setLists: StateSetter<Dictionary<TodoList>>, close: AppModal.Close}) => {
  const [list, setList] = useState({
    title: 'Untitled List',
    description: '',
    owner_id: API.user.id,
  })

  const addList = async () => {
    const final_list = await API.createTodoList(list)
    props.setLists(previous_lists => {
      previous_lists.map[final_list.id] = final_list
      return previous_lists
    })
    props.close(false)
  }

  return (
    <AppModal close={props.close}>
      <TextInput style={css.title_input} defaultValue={list.title}
        onChangeText={title=>setList({...list, title})} />
      <AppInputMin defaultValue={list.description}
        placeholder='Add a description to the list'
        onChangeText={description=>setList({...list, description})} />
      <AppButton label='Add List' onPress={addList} style={css.done_button} />
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
  title_input: {
    color: colors.light,
    textAlign: 'center',
    fontSize: style.font_size_big,
    backgroundColor: colors.main,
    borderTopLeftRadius: style.border_radius_big,
    borderTopRightRadius: style.border_radius_big,
  },
  done_button: {
    margin: style.padding,
  },
})