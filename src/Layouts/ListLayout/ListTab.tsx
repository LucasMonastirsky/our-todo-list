import React, { useState } from 'react'
import { View, FlatList, StyleSheet, Dimensions, Text } from 'react-native'
import { TodoList } from '../../Models'
import { colors, style } from '../../Styling'

const ListTab = (props: { lists: TodoList[], onSelect: (index: number)=>void, onPress?: ()=>void }) => {
  const [index, setIndex] = useState(0)

  const onScroll = (pos: number) => {
    const new_index = Math.round(pos / tab_size)
    if (new_index !== index) {
      setIndex(new_index)
      props.onSelect(new_index)
    }
  }

  const renderItem = ({item}: {item: any})=>(
    <View style={[css.item, {width: tab_size}]}>
      <Text style={css.item_text}>{item.title}</Text>
    </View>
  )

  return (
    <View style={css.container}>
      <FlatList
        data={props.lists}
        {...{renderItem}}
        ListHeaderComponent={()=><View style={{width: tab_margin}} />}
        ListFooterComponent={()=><View style={{width: tab_margin}} />}
        horizontal
        snapToInterval={tab_size}
        disableIntervalMomentum
        onScroll={({nativeEvent})=>{onScroll(nativeEvent.contentOffset.x)}}
        // might not work on iOS: https://stackoverflow.com/questions/29503252/get-current-scroll-position-of-scrollview-in-react-native
      />
    </View>
  )
}

const TAB_RATIO = 0.8 // multiplier of screen width
const screen_width = Dimensions.get('screen').width
const tab_size = screen_width * TAB_RATIO
const tab_margin = screen_width * ((1 - TAB_RATIO) / 2)

const css = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: colors.main,
    padding: style.padding,
    flexDirection: 'row',
  },
  item: {
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  item_text: {
    color: colors.light,
    fontSize: style.font_size_big,
    marginHorizontal: style.padding,
    textAlign: 'center',
  }
})

export default ListTab