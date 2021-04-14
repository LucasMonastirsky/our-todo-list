import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Navigation } from '../../App'
import { AppText } from '../../Components'
import { colors, style } from '../../Styling'
import { LayoutProps } from '../types'

const OptionsLayout = (props: LayoutProps) => {
  type props = {children: any}
  const Item = ({children}: props) => <View style={css.item}>{children}</View>
  const ItemTitle = ({children}: props) => <AppText style={css.item_title}>{children}</AppText>
  const ItemValue = ({children}: props) => <AppText style={css.item_value}>{children}</AppText>
  
  useEffect(() => {if (props.active) Navigation.header = ()=><AppText>debuggin</AppText>}, [props.active])

  return (
    <View style={css.container}>
      <Item>
        <ItemTitle>Example</ItemTitle>
        <ItemValue>Sample Value</ItemValue>
      </Item>
      <Item>
        <ItemTitle>Example</ItemTitle>
        <ItemValue>Sample Value</ItemValue>
      </Item>
      <Item>
        <ItemTitle>Example</ItemTitle>
        <ItemValue>Sample Value</ItemValue>
      </Item>
      <Item>
        <ItemTitle>Example</ItemTitle>
        <ItemValue>Sample Value</ItemValue>
      </Item>
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: style.padding,
    backgroundColor: colors.main,
    marginBottom: 1,
    flexDirection: 'row',
  },
  item_title: {
  },
  item_value: {
    color: colors.light_dark,
    marginLeft: 'auto',
  },
})

export default OptionsLayout