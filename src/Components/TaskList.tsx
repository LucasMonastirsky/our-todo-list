import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Task } from '../Models'
import { colors, style } from '../Styling'

const TaskList = (props: { tasks: Task[] }) => {
  return (
    <View>
      {props.tasks.map((task, index) => (
        <View style={[css.task_container, index > 0 && css.task_divider]} key={task.id}>
          <View style={css.status}>
    
          </View>
          <View style={css.status_divider} />
          <Text style={css.title}>{task.title}</Text>
        </View>
      ))}
    </View>
  )
}

const css = StyleSheet.create({
  task_container: {
    backgroundColor: colors.main,
    flexDirection: 'row',
  },
  status: {
    backgroundColor: colors.main,
    aspectRatio: 1,
  },
  task_divider: {
    borderTopWidth: style.border_width,
    borderColor: colors.dark,
  },
  status_divider: {
    width: style.border_width,
    backgroundColor: colors.dark,
  },
  title: {
    color: colors.light,
    fontSize: style.font_size_med,
    padding: style.padding,
    marginLeft: style.margin,
    marginBottom: style.font_size_med / 6,
  },
})

export default TaskList