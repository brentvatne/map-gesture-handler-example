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

      // pinchScale receives the pinch values for an active gesture. The gesture
      // handler isn't aware of our concept of zooming in, it just recognizes a
      // pinch gesture and starts feeding scale values starting at 1 for each
      // new gesture.
      pinchScale: new Animated.Value(1),

      // baseScale accumulates the pinch values between pinch gestures to compensate
      // for the gesture handler itself not knowing about our concept of zoom
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

    // Object {
    //   "handlerTag": 2,
    //   "scale": 0.47360283283060517,
    //   "state": 4,
    //   "target": 5,
    //   "velocity": -0.03581611940202642,
    // }
    this._handlePinchGestureEvent = Animated.event(
      [{ nativeEvent: { scale: this.state.pinchScale } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );

    // Track the previous scale value so we don't have to it
    // from the baseValue when the gesture ends
    this._lastScale = 1;
  }

  render() {
    const { panX, panY, baseScale, pinchScale } = this.state;

    // The current scale is the baseScale multiplied by the pinchScale
    const scale = Animated.multiply(baseScale, pinchScale);

    return (
      <PanGestureHandler
        onHandlerStateChange={this._handlePanGestureStateChange}
        onGestureEvent={this._handlePanGestureEvent}>
        <PinchGestureHandler
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

  // Object {
  //   "handlerTag": 2,
  //   "oldState": 4,
  //   "scale": 1.7075571248805619,
  //   "state": 5,
  //   "target": 7,
  //   "velocity": 0.24870822872729997,
  // }
  _handlePinchGestureStateChange = e => {
    const { oldState, scale } = e.nativeEvent;
    console.log(e.nativeEvent);

    // When the gesture becomes inactive we update accumulator baseScale
    // and reset pinchScale so it's ready for another gesture
    if (oldState === State.ACTIVE) {
      this._lastScale *= scale;
      this.state.baseScale.setValue(this._lastScale);
      this.state.pinchScale.setValue(1);
    }
  };
}
