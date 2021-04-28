import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { API } from '../../App'
import { AppButton, AppInputMin, AppModal, AppText, Loading } from '../../Components'
import { TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'

const ContactsModal = (props: { list: TodoList, onUserAdded: (id: string)=>any, close: (x: boolean)=>any } ) => {
  const [members, setMembers] = useState<User[]>()
  const [inviting, setInviting] = useState(false)
  const [invite_id, setInviteId] = useState('')

  useEffect(() => {
    props.list.member_ids.forEach(id => {
      API.getCachedUser(id).then(user => {
        setMembers(prev => [...prev ?? [], user])
      })
    })
  }, [])

  const invite = () => {
    API.addUserToList(invite_id, props.list)
    .then(()=>props.onUserAdded(invite_id))
  }

  const content = inviting
  ? <>
    <AppText style={css.title}>Invite Someone</AppText>
    <View style={css.separator} />
    <AppInputMin placeholder='User ID' onChangeText={setInviteId} />
    <AppButton label='Invite' onPress={invite} />
  </>
  : <>
    <AppText style={css.title}>Members</AppText>
    <View style={css.separator} />
    {members === undefined && <Loading />}
    {members?.map(user => (
      <View style={css.member_item}>
        <AppText>{user.nickname}</AppText>
        {props.list.owner_id === user.id && <AppText style={css.owner_label}>Owner</AppText>}
      </View>
    ))}
    {members !== undefined && <AppButton label='Invite Someone' onPress={()=>setInviting(true)} />}
  </>

  return (
    <AppModal close={props.close}>
      <View style={css.container}>
        {content}
      </View>
    </AppModal>
  )
}

const css = StyleSheet.create({
  container: {
    padding: style.padding,
    backgroundColor: colors.main_dark,
    borderRadius: style.border_radius_big,
    marginHorizontal: screen.width / 10,
  },
  title: {
    alignSelf: 'center',
    fontSize: style.font_size_big
  },
  separator: {
    borderRadius: style.border_radius_med,
    backgroundColor: colors.light,
    height: style.border_width,
    marginHorizontal: style.margin,
    marginVertical: style.padding,
  },
  member_item: {
    flexDirection: 'row',
  },
  owner_label: {
    marginLeft: 'auto',
    fontWeight: 'bold',
  }
})

export default ContactsModal