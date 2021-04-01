import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Task } from '../Models'
import { colors, style } from '../Styling'
import TaskModal from './TaskModal'

const TaskView = (props: { task: Task }) => {
  const [modal_active, setModalActive] = useState(false)

  return (
    <TouchableOpacity onPress={() => setModalActive(true)}>
      <View style={css.container}>
        <View style={css.status}>

        </View>
        <View style={css.status_divider} />
        <Text style={css.title}>{props.task.title}</Text>
      </View>
      {modal_active && <TaskModal task={props.task} onClose={()=>setModalActive(false)} />}
    </TouchableOpacity>
  )
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.main,
    flexDirection: 'row',
  },
  status: {
    backgroundColor: colors.main,
    aspectRatio: 1,
  },
  status_divider: {
    width: style.border_width,
    backgroundColor: colors.main_dark,
  },
  title: {
    color: colors.light,
    fontSize: style.font_size_med,
    padding: style.padding,
    marginLeft: style.margin,
    marginBottom: style.font_size_med / 6,
  },
})

export default TaskView