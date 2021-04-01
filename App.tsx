import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native'
import { TaskList } from './src/Components'
import TaskAddButton from './src/Components/TaskAddButton';
import { Task } from './src/Models'
import { colors } from './src/Styling';

const App = () => {
  const debug_tasks: Task[] = [
    new Task({title: 'Wash Dishes', creator_id: 'Laura', id: '0'}),
    new Task({title: 'Buy Tofu', creator_id: 'Josh', id: '1'}),
    new Task({title: 'Fill Hole in the Wall', creator_id: 'Laura', id: '2'}),
    new Task({title: 'Take Dog for a Walk', creator_id: 'Laura', id: '3'}),
    new Task({title: 'Develop App', creator_id: 'Josh', id: '4'}),
    new Task({title: 'I Ran out of Ideas', creator_id: 'Laura', id: '5'}),
  ]
  const [tasks, setTasks] = useState(debug_tasks)

  const addTask = () => {
    setTasks([...tasks, new Task({ id: `${tasks.length}`, creator_id: 'Josh' })])
  }

  return (
    <View style={css.container}>
      <TaskList tasks={tasks} />
      <TaskAddButton onTouch={addTask} />
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.main_dark,
    flex: 1,
  }
})

export default App
