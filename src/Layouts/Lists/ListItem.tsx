import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { AppText, ProfilePicture } from '../../Components'
import { TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { API } from '../../App'

export default (props: {list: TodoList, onPress: ()=>any}) => {
  const [members, setMembers] = useState<User[]>([])

  useEffect(() => {
    if (!members.length) props.list.member_ids.forEach( id =>
      API.getCachedUser(id).then(user =>
        setMembers(prev => [...prev, user])
      )
    )
  }, [])


  return (
    <TouchableOpacity style={css.container} onPress={props.onPress}>
      <AppText style={css.title}>{props.list.title}</AppText>
      <View style={css.members_container}>
        {members?.map(user =>
          <View style={css.member_icon}>
            <ProfilePicture user_id={user.id} size='small' />
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const css = StyleSheet.create({
  container: {
    padding: style.padding,
    backgroundColor: colors.main,
    marginTop: style.border_width,
    flexDirection: 'row',
  },
  title: {
    fontSize: style.font_size_big,
  },
  members_container: {
    marginLeft: 'auto',
    flexDirection: 'row',
  },
  member_icon: {
    marginLeft: style.padding,
  }
})