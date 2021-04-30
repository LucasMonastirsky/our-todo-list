import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
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
      <AppText>{user?.nickname ?? user?.username ?? 'loading...'}</AppText>
    )
  }

  const DeleteConfirmation = () => {
    const [loading, setLoading] = useState(false)
  
    const confirm = async () => {
      setLoading(true)
      await API.deleteTodoList(props.list.id)
      setLoading(false)
      props.onRemoveList()
      props.close(false)
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
          <AppInputMin style={css.title} defaultValue={list.title}
            onChangeText={title=>setListChanges(changes => ({ ...changes, title }))} />
          <Spacing />
          <AppInputMin style={css.description} defaultValue={list.description} multiline
            onChangeText={description=>setListChanges(changes => ({ ...changes, description }))} />
          <Spacing />
          <View style={{flexDirection: 'row'}}>
            <AppText style={css.members_title}>Members:</AppText>
          </View>
          {list.member_ids.map(id => <MemberItem {...{id}} key={id} />)}
          <View style={css.button_container}>
            <AppButton style={{marginLeft: 'auto'}} label='Delete' color={colors.alert} onPress={()=>setDeleteConfirmationActive(true)} />
            <AppButton style={css.done_button} label='Done' onPress={save} />
          </View>
        </>}
    </AppModal>
  )
}

const Spacing = () => <View style={css.spacing} />

const css = StyleSheet.create({
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
  invite_button: {
  },
  button_container: {
    flexDirection: 'row',
  },
  done_button: {
    marginLeft: style.margin,
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