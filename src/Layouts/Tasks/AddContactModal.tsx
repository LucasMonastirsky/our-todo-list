import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { API } from '../../App'
import { AppModal, AppText, Loading, ProfilePicture } from '../../Components'
import { TodoList, User } from '../../Models'
import { style } from '../../Styling'
import { StateSetter } from '../../Types'

export default (props: {list: TodoList, setList: StateSetter<TodoList>, close: AppModal.Close}) => {
  const [users, setUsers] = useState<User[]>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (users === undefined) {
      const available_user_ids = API.user.contact_ids.filter(id =>
        !props.list.member_ids.includes(id))

      if (available_user_ids.length < 1)
        setUsers([])
      else available_user_ids.forEach(id => API.getCachedUser(id)
        .then(user => setUsers(prev => [...prev??[], user])))
    }
  }, [])

  const onSelect = async (user: User) => {
    setLoading(true)
    await API.addUserToList(user.id, props.list)
    props.setList(prev => {
      if (!prev.member_ids.includes(user.id))
        prev.member_ids.push(user.id)
      return {...prev}
    })
    setLoading(false)
    props.close(false)
  }

  return (
    <AppModal close={props.close}>
      {loading
      ? <Loading />
      : <>
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
      </>
      }
      
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