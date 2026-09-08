import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent, Text } from 'react-native';
import { colors } from '../theme';

interface Props {
  minimumValue: number;
  maximumValue: number;
  step: number;
  value: number;
  onValueChange: (v: number) => void;
  disabled?: boolean;
}

export function SimpleSlider({
  minimumValue,
  maximumValue,
  step,
  value,
  onValueChange,
  disabled,
}: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const fraction = (value - minimumValue) / (maximumValue - minimumValue);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (evt) => {
        updateValue(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        updateValue(evt.nativeEvent.locationX);
      },
    }),
  ).current;

  const updateValue = (locationX: number) => {
    if (trackWidth <= 0) return;
    const clamped = Math.max(0, Math.min(locationX, trackWidth));
    const raw = minimumValue + (clamped / trackWidth) * (maximumValue - minimumValue);
    const stepped = Math.round(raw / step) * step;
    const final = Math.max(minimumValue, Math.min(maximumValue, stepped));
    onValueChange(Math.round(final * 10) / 10);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      style={[styles.container, disabled && styles.disabled]}
      onLayout={onLayout}
      {...panResponder.panHandlers}
    >
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${fraction * 100}%` },
          ]}
        />
      </View>
      <View
        style={[
          styles.thumb,
          { left: `${fraction * 100}%` },
        ]}
      />
    </View>
  );
}

const THUMB_SIZE = 24;

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: THUMB_SIZE / 2,
  },
  disabled: {
    opacity: 0.4,
  },
  track: {
    height: 6,
    backgroundColor: colors.cardBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.moon,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.moon,
    marginLeft: -THUMB_SIZE / 2 + THUMB_SIZE / 2,
    top: (40 - THUMB_SIZE) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});
