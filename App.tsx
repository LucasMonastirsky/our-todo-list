import React from 'react';
import { View, Text } from 'react-native'
import { TaskList } from './src/Components'
import { Task } from './src/Models'

const App = () => {
  const debug_tasks: Task[] = [
    new Task({title: 'Wash Dishes', creator_id: 'Laura'}),
    new Task({title: 'Buy Tofu', creator_id: 'Josh'}),
    new Task({title: 'Fill Hole in the Wall', creator_id: 'Laura'})
  ]

  return (
    <View>
      <TaskList tasks={debug_tasks} />
    </View>
  )
}

export default App
