import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const USE_NATIVE_DRIVER = false;

export default class Map extends React.Component {
  state = {
    panX: new Animated.Value(0),
    panY: new Animated.Value(0),
  };

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

  // State.UNDETERMINED - default and initial state
  // State.FAILED - handler failed recognition of the gesture
  // State.BEGAN - handler has initiated recognition but have not enough data to tell if it has recognized or not
  // State.CANCELLED - handler has been cancelled because of other handler (or a system) stealing the touch stream
  // State.ACTIVE - handler has recognized
  // State.END - gesture has completed
  _handlePanGestureStateChange = e => {
    const { state, velocityX, velocityY } = e.nativeEvent;

    if (state === State.END) {
      this.state.panX.extractOffset();
      this.state.panY.extractOffset();
    }
  };

  _handlePanGestureEvent = e => {
    const { translationX, translationY } = e.nativeEvent;

    this.state.panX.setValue(translationX);
    this.state.panY.setValue(translationY);
  };
}
