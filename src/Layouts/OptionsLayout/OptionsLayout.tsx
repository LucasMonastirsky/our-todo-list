import React from 'react'
import { StyleSheet, View } from 'react-native'
import { AppText, CustomDrawer } from '../../Components'
import { colors, style } from '../../Styling'

const OptionsLayout = () => {
  
  type props = {children: any}
  const Item = ({children}: props) => <View style={css.item}>{children}</View>
  const ItemTitle = ({children}: props) => <AppText style={css.item_title}>{children}</AppText>
  const ItemValue = ({children}: props) => <AppText style={css.item_value}>{children}</AppText>
  
  return (
    <CustomDrawer>
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
    </CustomDrawer>
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