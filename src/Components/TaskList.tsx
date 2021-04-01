import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Task } from '../Models'
import { colors, style } from '../Styling'
import TaskView from './TaskView'

const TaskList = (props: { tasks: Task[] }) => {

  return (
    <View>
      {props.tasks.map((task, index) => (
        <View key={index}>
          {index > 0 && <View style={css.task_divider} />}
          <TaskView {...{task}} />
        </View>
      ))}
    </View>
  )
}

const css = StyleSheet.create({
  task_divider: {
    borderTopWidth: style.border_width,
    borderColor: colors.dark,
  },
})

export default TaskList