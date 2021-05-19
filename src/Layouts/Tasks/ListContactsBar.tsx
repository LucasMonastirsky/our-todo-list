import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { ProfilePicture, AppText, Loading } from '../../Components'
import { TodoList, User } from '../../Models'
import { style, colors } from '../../Styling'
import { StateSetter } from '../../Types'
import AddContactModal from './AddContactModal'

type PropTypes = { members?: User[], list: TodoList, setList: StateSetter<TodoList> }
export default (props: PropTypes) => {
  const [extended, setExtended] = useState(false)
  const [modal_active, setModalActive] = useState(false)

  if (props.members === undefined)
    return <Loading />

  return (
    <TouchableOpacity onPress={()=>setExtended(true)}>
      {modal_active && <AddContactModal {...{list: props.list, setList: props.setList}} close={setModalActive} />}
      <View style={extended ? css.members_container_extended : css.members_container}>
        {props.members?.map(user => 
          <TouchableOpacity style={css.member_item} disabled={!extended}>
            <ProfilePicture user_id={user.id} size='small' />
            {extended &&
              <AppText style={css.member_name}>{user.nickname}</AppText>
            }
          </TouchableOpacity>
        )}
        {extended && <>
          <TouchableOpacity style={css.member_add_button} onPress={()=>setModalActive(true)}>
            <AppText style={css.member_add_text}>Add a contact...</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={css.members_close} onPress={()=>setExtended(false)}>
            <View style={css.members_close_icon} />
          </TouchableOpacity>
        </>
        }
      </View>
    </TouchableOpacity>
  )
}

const css = StyleSheet.create({
  members_container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  members_container_extended: {
  },
  member_item: {
    marginRight: style.padding,
    marginBottom: style.padding,
    flexDirection: 'row',
  },
  member_icon: {
    marginRight: style.margin,
  },
  member_name: {
    marginLeft: style.padding,
  },
  member_add_button: {
    padding: style.padding,
  },
  member_add_text: {

  },
  members_close: {
    marginTop: style.margin,
    marginBottom: -style.padding,
    padding: style.margin,
  },
  members_close_icon: {
    height: style.padding,
    width: style.margin * 3,
    alignSelf: 'center',
    borderRadius: style.border_radius_med,
    backgroundColor: colors.light,
  },
})