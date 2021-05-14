import React, { useEffect, useState } from 'react'
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native'
import { AppText } from '../../Components'
import { TodoList } from '../../Models'
import { style } from '../../Styling'
import TaskView from './TaskView'

type PropTypes = {
  list: TodoList,
  goBack: any,
}

export default (props: PropTypes) => {
  const [scroll_enabled, setScrollEnabled] = useState(true)

  useEffect(() => {
    return BackHandler.addEventListener('hardwareBackPress', props.goBack).remove
  }, [])

  return (
    <View style={css.container}>
      {/* this needs optimization */}
      {Object.values(props.list.tasks).length < 1
      ? <View style={css.no_tasks_text_container}>
          <AppText style={css.no_tasks_text}>This list has no tasks</AppText>
          <AppText style={css.no_tasks_text}>Add a task by pressing the button at the bottom of the screen</AppText>
        </View>
      : <ScrollView scrollEnabled={scroll_enabled}>
          {Object.values(props.list.tasks).filter(x=>x.status !== 'Done').map((item, index)=>(
            <TaskView {...{
              key: item.id,
              task: item,
              index,
              setScrollEnabled,
              // setLists,
            }} />
          ))}
          {Object.values(props.list.tasks).filter(x=>x.status === 'Done').map((item, index)=>(
            <TaskView {...{
              key: item.id,
              task: item,
              index,
              setScrollEnabled,
              // setLists,
            }} />
          ))}
        </ScrollView>
      }
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    flex: 1,
  },
  no_tasks_text_container: {
    flex: 1,
    justifyContent: 'center',
  },
  no_tasks_text: {
    textAlign: 'center',
    marginBottom: style.padding,
  },
})