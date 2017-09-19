import React from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';

const USE_NATIVE_DRIVER = false;

export default class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      panX: new Animated.Value(0),
      panY: new Animated.Value(0),
      pinchScale: new Animated.Value(1),
      baseScale: new Animated.Value(1),
    };

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

    this._handlePinchGestureEvent = Animated.event(
      [{ nativeEvent: { scale: this.state.pinchScale } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );

    this._lastScale = 1;
  }

  render() {
    const { panX, panY, baseScale, pinchScale } = this.state;

    const scale = Animated.multiply(baseScale, pinchScale);

    return (
      <PanGestureHandler
        id="pan" /* !!!!! */
        simultaneousHandlers="pinch" /* !!!!! */
        onHandlerStateChange={this._handlePanGestureStateChange}
        onGestureEvent={this._handlePanGestureEvent}>
        <PinchGestureHandler
          id="pinch" /* !!!!! */
          simultaneousHandlers="pan" /* !!!!! */
          onHandlerStateChange={this._handlePinchGestureStateChange}
          onGestureEvent={this._handlePinchGestureEvent}>
          <View style={StyleSheet.absoluteFill}>
            <Animated.Image
              style={{
                transform: [
                  { translateX: panX },
                  { translateY: panY },
                  { scale },
                ],
              }}
              source={require('../assets/tokyo-train-map.jpg')}
            />
          </View>
        </PinchGestureHandler>
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

  _handlePinchGestureStateChange = e => {
    const { oldState, scale } = e.nativeEvent;

    if (oldState === State.ACTIVE) {
      this._lastScale *= scale;
      this.state.baseScale.setValue(this._lastScale);
      this.state.pinchScale.setValue(1);
    }
  };
}
