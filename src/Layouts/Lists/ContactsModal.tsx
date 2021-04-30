import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { API } from '../../App'
import { AppButton, AppIcon, AppInputMin, AppModal, AppText, Loading } from '../../Components'
import { TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'

const ContactsModal = (props: { list: TodoList, onUserAdded: (id: string)=>any, onUserRemoved: (id: string)=>any, close: (x: boolean)=>any } ) => {
  const [members, setMembers] = useState<User[]>()
  const [inviting, setInviting] = useState(false)
  const [invite_id, setInviteId] = useState('')
  const [editting_user, setEdittingUser] = useState<User>()

  useEffect(() => {
    props.list.member_ids.forEach(id => {
      API.getCachedUser(id).then(user => {
        setMembers(prev => [...prev ?? [], user])
      })
    })
  }, [])

  const onRequestClose = () => {
    if (editting_user) {
      setEdittingUser(undefined)
      return true
    }
  }

  const invite = async () => {
    await API.addUserToList(invite_id, props.list)
    const new_user = await API.getCachedUser(invite_id)
    setMembers(old_members => [...old_members!, new_user])
    props.onUserAdded(invite_id)
    setInviting(false)
  }

  const removeUser = async () => {
    await API.removeUserFromList(editting_user!.id, props.list)
    
    setMembers(old_members => {
      const member_index = old_members!.indexOf(editting_user!)
      old_members!.splice(member_index, 1)
      return old_members
    })

    props.onUserRemoved(editting_user!.id)
    setEdittingUser(undefined)
  }

  const EditUser = ({user}: {user: User}) => {
    return <>
      <AppText style={css.title}>{user.nickname}</AppText>
      <View style={css.separator} />
      <View style={{flexDirection: 'row'}}>
        <AppButton label='Remove' color={colors.alert} onPress={removeUser} />
      </View>
    </>
  }

  const content = inviting
    ? <>
      <AppText style={css.title}>Invite Someone</AppText>
      <View style={css.separator} />
      <AppInputMin placeholder='User ID' onChangeText={setInviteId} />
      <AppButton label='Invite' onPress={invite} />
    </>
    : editting_user
    ? <EditUser user={editting_user} />
    : <>
      <AppText style={css.title}>Members</AppText>
      <View style={css.separator} />
      {members === undefined && <Loading />}
      {members?.map(user => (
        <View style={css.member_item} key={user.id}>
          <AppText style={css.member_name}>{user.nickname}</AppText>
          {props.list.owner_id === user.id
          ? <AppText style={css.owner_label}>Owner</AppText>
          : <AppIcon source={require('../../Media/Icons/options.png')} onPress={()=>setEdittingUser(user)} />}
        </View>
      ))}
      {members !== undefined && <AppButton label='Invite Someone' onPress={()=>setInviting(true)} />}
    </>

  return (
    <AppModal {...{onRequestClose}} close={props.close}>
      {content}
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
    paddingVertical: style.padding,
  },
  member_name: {
    marginRight: 'auto',
  },
  owner_label: {
    fontWeight: 'bold',
  }
})

export default ContactsModal