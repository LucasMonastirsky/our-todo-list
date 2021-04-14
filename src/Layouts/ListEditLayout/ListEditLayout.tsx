import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TodoList } from '../../Models'
import { LayoutProps } from '../types'

const ListEditLayout = (props: LayoutProps & {list: TodoList}) => {
  return (
    <View>
      <Text>editting babyyy</Text>
    </View>
  )
}

const css = StyleSheet.create({
  container: {

  },
})