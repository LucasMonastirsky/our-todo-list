import React, { useState } from 'react'
import { View, FlatList, StyleSheet, Dimensions } from 'react-native'
import { AppText } from '../../Components'
import { TodoList } from '../../Models'
import { colors, style } from '../../Styling'

const ListTab = (props: { lists: TodoList[], onSelect: (index: number)=>void, onPress?: ()=>void }) => {
  const [selected_index, setIndex] = useState(0)
  const [item_widths, setItemWidths] = useState([0])
  const [item_offsets, setItemOffsets] = useState([0])

  const onScroll = (pos: number) => {
    let new_index = selected_index
    pos += 1 // this avoids bugs caused by rounding

    if (pos > item_offsets[selected_index])
      new_index++
    if (pos < item_offsets[selected_index-1])
      new_index--

    if (new_index !== selected_index) {
      setIndex(new_index)
      props.onSelect(new_index)
    }
  }

  const setItemWidth = (index: number, width: number) => {
    const new_item_widths = [...item_widths]
    new_item_widths[index] = width
    setItemWidths(new_item_widths)
  }

  const setItemOffset = (index: number, width: number) => {
    const new_item_offsets = [...item_offsets]
    new_item_offsets[index] = (new_item_offsets[index-1]??0) + width
    setItemOffsets(new_item_offsets)
    setItemWidth(index, width)
  }

  const renderItem = ({item, index}: {item: any, index: number})=>{
    return (
      <View style={css.item} onLayout={({nativeEvent})=>setItemOffset(index, nativeEvent.layout.width)}>
        <AppText style={[css.item_text, {color: selected_index === index ? colors.light : colors.light_dark}]}>
          {item.title}
        </AppText>
      </View>
  )}

  const calculateHeader = () => (Dimensions.get('window').width - item_offsets[0]) / 2
  const calculateFooter = () => (Dimensions.get('window').width - item_widths[item_widths.length-1]) / 2

  return (
    <View style={css.container}>
      <FlatList
        data={props.lists}
        {...{renderItem}}
        ListHeaderComponent={()=><View style={{width: calculateHeader()}} />}
        ListFooterComponent={()=><View style={{width: calculateFooter()}} />}
        snapToOffsets={[0, ...item_offsets]}
        snapToStart={false}
        snapToEnd={false}
        horizontal
        onScroll={({nativeEvent})=>{onScroll(nativeEvent.contentOffset.x)}}
        // might not work on iOS: https://stackoverflow.com/questions/29503252/get-current-scroll-position-of-scrollview-in-react-native
      />
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.main,
  },
  item: {
    justifyContent: 'center',
    paddingBottom: style.padding,
  },
  item_text: {
    fontSize: style.font_size_big,
    marginHorizontal: style.margin * 2,
  }
})

export default ListTab