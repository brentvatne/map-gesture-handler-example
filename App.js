import React, { Component } from 'react';
import { Dimensions, StyleSheet, StatusBar, View } from 'react-native';
import { Asset, AppLoading, KeepAwake } from 'expo';

// Render a map
import Map from './step1/Map';

// Add PanGestureHandler
// import Map from './step2/Map';

// Update the position when the gesture ends
// import Map from './step3/Map';

// Move onGestureEvent into Animated.event
// import Map from './step4/Map';

// Add PinchGestureHandler
// import Map from './step5/Map';

// Add simultaneousHandlers and ids
// import Map from './step6/Map';

// Fix the zoom centering
// import Map from './step7/Map';

// Center the map on load
// import Map from './step8/Map';

// Add rotation
// import Map from './step9/Map';

// Add double tap for returning to center
// import Map from './step10/Map'

// Want to play with it more? Do these TODOs:
// TODO: Fix the rotation centering
// TODO: Decay on release pan
// TODO: Add a pin that you can tap
// TODO: Make the pin draggable

export default class App extends Component {
  state = {
    loaded: false,
  };

  render() {
    if (this.state.loaded) {
      return (
        <View style={styles.container}>
          <Map />
          <StatusBar hidden />
          <KeepAwake />
        </View>
      );
    } else {
      return (
        <AppLoading
          startAsync={this._loadMapAsync}
          onFinish={() => this.setState({ loaded: true })}
        />
      );
    }
  }

  _loadMapAsync = async () => {
    await Asset.fromModule(require('./assets/tokyo-train-map.jpg')).downloadAsync();
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
