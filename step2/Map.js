import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

export default class Map extends React.Component {
  state = {
    panX: new Animated.Value(0),
    panY: new Animated.Value(0),
  };

  render() {
    const { panX, panY } = this.state;

    return (
      <PanGestureHandler onGestureEvent={this._handlePanGestureEvent}>
        <View style={StyleSheet.absoluteFill}>
          <Animated.Image
            style={{
              transform: [{ translateX: panX }, { translateY: panY }],
            }}
            source={require('../assets/tokyo-train-map.jpg')}
          />
        </View>
      </PanGestureHandler>
    );
  }

  // Object {
  //   "handlerTag": 1,
  //   "state": 4,
  //   "target": 7,
  //   "translationX": -116.5,
  //   "translationY": 132,
  //   "velocityX": -437.05971438787714,
  //   "velocityY": 52.677425640992595,
  //   "x": 128.5,
  //   "y": 319,
  // }
  _handlePanGestureEvent = e => {
    console.log(e.nativeEvent);
    const { translationX, translationY } = e.nativeEvent;

    this.state.panX.setValue(translationX);
    this.state.panY.setValue(translationY);
  };
}
