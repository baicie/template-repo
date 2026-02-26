import { Component, PropsWithChildren } from 'react'
import { View, Text } from '@tarojs/components'
import { add } from '@repo/utils'
import './index.scss'

export default class Index extends Component<PropsWithChildren> {
  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>
        <Text>Hello world!</Text>
        <Text>Shared Utils: 1 + 6 = {add(1, 6)}</Text>
      </View>
    )
  }
}
