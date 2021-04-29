import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { API } from '../../App'
import { AppModal, AppText } from '../../Components'
import { User, Task } from '../../Models'
import { colors, style } from '../../Styling'
import { formatDate } from '../../Utils'

const TaskModal = (props: { task: Task, close: AppModal.Close }) => {
  const { task } = props
  const [creator, setCreator] = useState<User>()

  useEffect(() => {
    (async () => {
      setCreator(await API.getCachedUser(task.creator_id))
    })()
  }, [])

  return (
    <AppModal close={props.close}>
      <View style={css.title_container}>
        <AppText style={css.title}>{task.title}</AppText>
        <AppText style={css.status}>{task.status}</AppText>
      </View> 
      <Divider />
      {task.description !== '' && <>
        <AppText style={css.description}>{task.description}</AppText>
        <Divider />
      </>}
      <View style={css.created_container}>
        <AppText style={css.created_text}>
          Created by {creator?.username ?? 'loading...'} on {formatDate(task.creation_date)}
        </AppText>
      </View>
    </AppModal>
  )
}

const Divider = () => <View style={css.divider} />

const css = StyleSheet.create({
  title_container: {
    flexDirection: 'row',
  },
  title: {
    fontSize: style.font_size_big,
  },
  status: {
    fontSize: style.font_size_small,
    marginLeft: 'auto',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  description: {
    fontSize: style.font_size_small,
    marginVertical: style.padding,
  },
  divider: {
    backgroundColor: colors.light,
    height: 1,
    marginHorizontal: style.margin,
    marginVertical: style.padding,
  },
  created_container: {

  },
  created_text: {
    fontSize: style.font_size_small,
  },
})

export default TaskModal