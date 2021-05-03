import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, TextInput, View } from 'react-native'
import { API } from '../../App'
import { AppButton, AppInputMin, AppModal, AppText, Loading } from '../../Components'
import { TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'

export default (props: {
  list: TodoList,
  editList: (list: Partial<TodoList>)=>any,
  onRemoveList: ()=>any,
  close: AppModal.Close
}) => {
  const [list_changes, setListChanges] = useState<Partial<TodoList>>({})
  const [delete_confirmation_active, setDeleteConfirmationActive] = useState(false)
  const { list } = props

  const save = async () => {
    if (Object.keys(list_changes).length <= 0)
      props.close(false)

    await API.editTodoList(props.list.id, list_changes)
    props.editList(list_changes)
    props.close(false)
  }

  const MemberItem = (props: {id: string}) => {
    const [user, setUser] = useState<User>()

    useEffect(() => {
      (async () => setUser(await API.getCachedUser(props.id)))()
    }, [])

    return (
      <AppText style={css.member_item}>{user?.nickname ?? user?.username ?? 'loading...'}</AppText>
    )
  }

  const DeleteConfirmation = () => {
    const [loading, setLoading] = useState(false)
  
    const confirm = async () => {
      setLoading(true)
      await API.deleteTodoList(props.list.id)
      setLoading(false)
      props.close(false)
      props.onRemoveList()
    }
  
    return (
      <AppModal close={props.close} clear>
        <AppText style={{textAlign: 'center'}}>Deleting {props.list.title}</AppText>
        <View style={css.divider} />
        {loading
        ? <View style={css.loading_container}><Loading /></View>
        : <>
          <AppText style={{textAlign: 'center'}}>Are you sure?</AppText>
          <View style={css.delete_confirmation_button_container}>
            <AppButton label='Confirm' color={colors.alert} onPress={confirm} />
            <AppButton label='Cancel' onPress={()=>props.close(false)} />
          </View>
        </>}
      </AppModal>
    )
  }

  return (
    <AppModal close={props.close}>
        {delete_confirmation_active
        ? <DeleteConfirmation />
        : <>
          <TextInput style={css.title} defaultValue={list.title}
            onChangeText={title=>setListChanges(changes => ({ ...changes, title }))} />
          <AppInputMin style={css.description}
            multiline
            defaultValue={list.description}
            placeholder='No description available'
            onChangeText={description=>setListChanges(changes => ({ ...changes, description }))} />
          <AppText style={css.members_title}>Members:</AppText>
          {list.member_ids.map(id => <MemberItem {...{id}} key={id} />)}
          <View style={css.button_container}>
            <AppButton label='Delete' color={colors.alert} onPress={()=>setDeleteConfirmationActive(true)} />
            <AppButton label='Done' onPress={save} />
          </View>
        </>}
    </AppModal>
  )
}

const css = StyleSheet.create({
  title: {
    fontSize: style.font_size_big,
    color: colors.light,
    textAlign: 'center',
    backgroundColor: colors.main,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    elevation: style.elevation_step,
  },
  description: {
    fontSize: style.font_size_small,
  },
  members_title: {
    backgroundColor: colors.main,
    padding: style.padding,
  },
  member_item: {
    padding: style.padding,
  },
  invite_button: {
  },
  button_container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: style.padding,
  },
  divider: {
    height: style.border_width,
    marginHorizontal: style.margin,
    marginTop: style.padding,
    backgroundColor: colors.light,
  },
  delete_confirmation_button_container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  loading_container: {
    marginTop: style.padding,
  },
})