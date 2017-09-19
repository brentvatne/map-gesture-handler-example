import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const USE_NATIVE_DRIVER = false;

export default class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      panX: new Animated.Value(0),
      panY: new Animated.Value(0),
    };

    // Move the function into Animated.event
    this._handlePanGestureEvent = new Animated.event(
      [
        {
          nativeEvent: {
            translationX: this.state.panX,
            translationY: this.state.panY,
          },
        },
      ],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }

  render() {
    const { panX, panY } = this.state;

    return (
      <PanGestureHandler
        onHandlerStateChange={this._handlePanGestureStateChange}
        onGestureEvent={this._handlePanGestureEvent}>
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

  _handlePanGestureStateChange = e => {
    const { oldState } = e.nativeEvent;

    if (oldState === State.ACTIVE) {
      this.state.panX.extractOffset();
      this.state.panY.extractOffset();
    }
  };
}
