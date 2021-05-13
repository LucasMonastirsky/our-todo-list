import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { API } from '../../App'
import { AppButton, AppIcon, AppInputMin, AppModal, AppText, Loading } from '../../Components'
import { TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { StateSetter } from '../../Types'
import { Dictionary, screen } from '../../Utils'

type PropTypes = {
  list: TodoList,
  setLists: StateSetter<Dictionary<TodoList>>,
  close: (x: boolean)=>any
}
const ContactsModal = (props: PropTypes) => {
  const [members, setMembers] = useState<User[]>()
  const [inviting, setInviting] = useState(false)
  const [editting_user, setEdittingUser] = useState<User>()

  useEffect(() => {
    console.log(props.list.member_ids)
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

  const invite = async (invite_id: string) => {
    await API.addUserToList(invite_id, props.list)
    const new_user = await API.getCachedUser(invite_id)
    setMembers(old_members => [...old_members!, new_user])
    props.setLists(previous_lists => {
      previous_lists.map[props.list.id].member_ids.push(new_user.id)
      return previous_lists
    })
    setInviting(false)
  }

  const removeUser = async () => {
    await API.removeUserFromList(editting_user!.id, props.list)
    
    setMembers(old_members => {
      const member_index = old_members!.indexOf(editting_user!)
      old_members!.splice(member_index, 1)
      return old_members
    })
    props.setLists(previous_lists => {
      const index = previous_lists.map[props.list.id].member_ids.indexOf(editting_user!.id)
      previous_lists.map[props.list.id].member_ids.splice(index, 1)
      return previous_lists
    })
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

  const InviteContact = (props: {id:string}) => {
    const [user, setUser] = useState<User>()

    useEffect(() => {
      API.getCachedUser(props.id).then(setUser)
    })

    return !user
    ? <Loading />
    : <>
      <TouchableOpacity style={css.member_item} onPress={()=>invite(props.id)}>
        <AppText style={css.member_name}>{user.nickname}</AppText>
        <AppIcon source={require('../../Media/Icons/plus.png')} onPress={()=>{}} />
      </TouchableOpacity>
    </>
  }
  console.log(API.user.contact_ids)
  const content = inviting
    ? <>
      <AppText style={css.title}>Invite a Contact</AppText>
      {API.user.contact_ids.map(id => <InviteContact {...{id}} />)}
    </>
    : editting_user
    ? <EditUser user={editting_user} />
    : <>
      <AppText style={css.title}>Members</AppText>
      {members === undefined && <Loading />}
      {members?.map(user => (
        <View style={css.member_item} key={user.id}>
          <AppText style={css.member_name}>{user.nickname}</AppText>
          {props.list.owner_id === user.id
          ? <AppText style={css.owner_label}>Owner</AppText>
          : <AppIcon source={require('../../Media/Icons/options.png')} onPress={()=>setEdittingUser(user)} />}
        </View>
      ))}
      {members !== undefined && <AppButton style={css.invite_button} label='Invite Someone' onPress={()=>setInviting(true)} />}
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
    textAlign: 'center',
    fontSize: style.font_size_big,
    backgroundColor: colors.main,
    borderTopLeftRadius: style.border_radius_big,
    borderTopRightRadius: style.border_radius_big,
    elevation: style.elevation_step,
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
    padding: style.padding,
  },
  member_name: {
    marginRight: 'auto',
  },
  owner_label: {
    fontWeight: 'bold',
  },
  invite_button: {
    margin: style.margin
  },
})

export default ContactsModal