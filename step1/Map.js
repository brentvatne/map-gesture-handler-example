import React from 'react';
import { Animated } from 'react-native';

export default class Map extends React.Component {
  render() {
    return <Animated.Image source={require('../assets/tokyo-train-map.jpg')} />;
  }
}
