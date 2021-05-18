import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { API } from '../../App'
import { AppModal, AppText, Loading, ProfilePicture } from '../../Components'
import { TodoList, User } from '../../Models'
import { style } from '../../Styling'
import { StateSetter } from '../../Types'

export default (props: {list: TodoList, setList: StateSetter<TodoList>, close: AppModal.Close}) => {
  const [users, setUsers] = useState<User[]>()

  useEffect(() => {
    if (users === undefined) // TODO: this should wait for all promises
      API.user.contact_ids.forEach(id => {
        if (!props.list.member_ids.includes(id))
          API.getCachedUser(id).then(user =>
            setUsers(prev => [...prev??[], user]))
        else setUsers(prev => prev??[])
    })
  }, [])

  const onSelect = async (user: User) => { // TODO: do this properly
    await API.addUserToList(user.id, props.list)
    props.setList(prev => {
      const new_list = {...prev}
      new_list.member_ids.push(user.id)
      return new_list
    })
    props.close(false)
  }

  return (
    <AppModal close={props.close}>
      <View style={css.container}>
        { users === undefined && <Loading />}
        { users && users.length < 1 && <AppText style={css.no_contacts_text}>No contacts to add</AppText>}
        { users && users.length >= 1 &&
          <ScrollView>
            {users.map(user =>
              <TouchableOpacity style={css.user_item} onPress={()=>onSelect(user)}>
                <ProfilePicture user_id={user.id} size='medium' />
                <AppText style={css.user_name}>{user.nickname}</AppText>
              </TouchableOpacity>  
            )}
          </ScrollView>
        }
      </View>
    </AppModal>
  )
}

const css = StyleSheet.create({
  container: {
    padding: style.padding,
  },
  user_item: {
    flexDirection: 'row',
    padding: style.padding,
  },
  user_name: {
    marginLeft: style.padding,
  },
  no_contacts_text: {
    textAlign: 'center',
  },
})